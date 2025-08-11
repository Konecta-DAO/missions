import React, { useEffect, useState, useMemo } from 'react';
import styles from './MissionModal.module.scss';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { SerializedMission, SerializedUserMissionProgress, UserOverallMissionStatus } from '../../../../../declarations/test_backend/test_backend.did.js';
import { ActionFlow, ActionStep as ParsedActionStepType } from '../../../../types.ts';
import ActionStepRenderer from '../ActionStepRenderer/ActionStepRenderer.tsx';
import { constructRawIcpAssetUrl } from '../../../../../utils/utils.ts';
import Confetti from 'react-confetti';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../../../declarations/index/index.js';
import { IndexCanisterId } from '../../../../main.tsx';
import Timer from './Timer.tsx';

// parseActionFlow remains the same
const parseActionFlow = (jsonString: string): ActionFlow | null => {
    try {
        const parsed = JSON.parse(jsonString);
        if (parsed && Array.isArray(parsed.steps) && parsed.completionLogic) {
            return parsed as ActionFlow;
        }
        console.error("Parsed actionFlowJson is missing essential properties (steps, completionLogic).", parsed);
        return null;
    } catch (error) {
        console.error("Error parsing actionFlowJson:", error);
        return null;
    }
};

// Helper for reward display (similar to MissionCard, could be a shared util)
const getRewardDisplay = (rewardType: any, minAmount: bigint, maxAmountOpt?: bigint[]): string => {
    const minAmt = Number(minAmount);
    let displayAmount = minAmt.toLocaleString();
    if (maxAmountOpt && maxAmountOpt[0] && Number(maxAmountOpt[0]) > minAmt) {
        displayAmount = `${minAmt.toLocaleString()} - ${Number(maxAmountOpt[0]).toLocaleString()}`;
    }
    if (rewardType.hasOwnProperty('Points')) return `🪙 ${displayAmount} Points`;
    if (rewardType.hasOwnProperty('ICPToken')) return `💧 ${displayAmount} ICP`;
    if (rewardType.hasOwnProperty('TIME')) return `⏱️ ${displayAmount} TIME`;
    if (rewardType.hasOwnProperty('None')) return 'No direct reward';
    return `${displayAmount} Reward`;
};


interface MissionModalProps {
    mission: SerializedMission;
    missionId: bigint;
    projectCanisterId: string;
    closeModal: () => void;
}

const MissionModal: React.FC<MissionModalProps> = ({
    mission,
    missionId,
    projectCanisterId,
    closeModal,
}) => {
    const { principalId, userProgress: globalUserProgress } = useGlobalID();
    const {
        executeBackendActionStep,
        fetchUserMissionProgressAndSet,
        startBackendMission,
        fetchUserGlobalProfileAndSet,
        cooldownRemainingForNewCompletion,
        checkUserCompletions,
        checkMissionCompletions
    } = useFetchData();

    const agent = HttpAgent.createSync();
    const actor = Actor.createActor(idlFactory, {
        agent: agent!,
        canisterId: IndexCanisterId,
    });

    const [parsedActionFlow, setParsedActionFlow] = useState<ActionFlow | null>(null);
    const [currentMissionUserProgress, setCurrentMissionUserProgress] = useState<SerializedUserMissionProgress | null>(null);
    const [currentStepId, setCurrentStepId] = useState<bigint | null>(null);
    const [currentStepDefinition, setCurrentStepDefinition] = useState<ParsedActionStepType | null>(null);
    const [userInputForCurrentStep, setUserInputForCurrentStep] = useState<Record<string, any>>({});
    const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [isStartingMission, setIsStartingMission] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [disabledStartAgain, setDisabledStartAgain] = useState(true);
    const [disabledCompletionLimit, setDisabledCompletionLimit] = useState(true);
    const [disabledUserCompletionLimit, setDisabledUserCompletionLimit] = useState(true);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    // 1. Parse ActionFlow when mission changes (existing - good)
    useEffect(() => {
        if (mission?.actionFlowJson) {
            const flow = parseActionFlow(mission.actionFlowJson);
            setParsedActionFlow(flow);
            if (!flow) {
                setFeedbackMessage({ type: 'error', text: "Error: Could not load mission steps." });
            }
        } else {
            setParsedActionFlow(null);
            setFeedbackMessage({ type: 'error', text: "Error: Mission data is incomplete." });
        }
    }, [mission]);

    // 2. Load or Initialize UserProgress (existing - good, minor tweaks for start)
    useEffect(() => {
        if (projectCanisterId && missionId !== null && principalId && parsedActionFlow) {
            const projectProgressMap = globalUserProgress.get(projectCanisterId);
            const missionProg = projectProgressMap?.get(missionId);

            if (missionProg) {
                setCurrentMissionUserProgress(missionProg); // Set local state from global state
                // Reset feedback if progress is loaded and not just "NotStarted"
                if (!missionProg.overallStatus.hasOwnProperty('NotStarted')) {
                    // Only clear feedback if it's not an error/info from a previous action on this same modal instance
                    if (feedbackMessage && feedbackMessage.text !== "Mission started!" && !feedbackMessage.text.startsWith("Error:")) {
                        // setFeedbackMessage(null); // Be careful not to clear fresh feedback too quickly
                    }
                }
            } else {
                fetchUserMissionProgressAndSet(projectCanisterId, missionId, principalId)
                    .then((fetchedProgress) => {
                        if (fetchedProgress) {
                            setCurrentMissionUserProgress(fetchedProgress);
                        } else if (parsedActionFlow?.steps.length > 0) {
                            const firstStepIdOpt = parsedActionFlow.steps[0]?.stepId;
                            setCurrentMissionUserProgress({
                                overallStatus: { NotStarted: null } as UserOverallMissionStatus,
                                stepStates: [],
                                currentStepId: firstStepIdOpt ? [firstStepIdOpt] : [],
                                flowOutputs: [],
                                completionTime: [],
                                claimedRewardTime: [],
                                lastActiveTime: BigInt(0)
                            });
                        }
                    }).catch(e => {
                        console.error("Error fetching initial mission progress in modal:", e);
                        setFeedbackMessage({ type: 'error', text: "Could not load mission progress." });
                    });
            }
        }
        // Ensure principalId is included if its change should re-trigger progress loading
    }, [projectCanisterId, missionId, principalId, globalUserProgress, parsedActionFlow, fetchUserMissionProgressAndSet]);

    // 3. Determine Current Step to Display (existing - good)
    useEffect(() => {
        if (parsedActionFlow && currentMissionUserProgress && !currentMissionUserProgress.overallStatus.hasOwnProperty('NotStarted')) {
            let activeStepId: bigint | null = null;
            if (currentMissionUserProgress.currentStepId && currentMissionUserProgress.currentStepId.length > 0) {
                activeStepId = currentMissionUserProgress.currentStepId[0]!;
            } else if (!currentMissionUserProgress.overallStatus.hasOwnProperty('CompletedSuccess') && !currentMissionUserProgress.overallStatus.hasOwnProperty('CompletedFailure')) {
                // If not completed and no currentStepId, default to first step if flow not completed
                activeStepId = parsedActionFlow.steps[0]?.stepId || null;
            }
            setCurrentStepId(activeStepId);

            if (activeStepId !== null) {
                const stepDef = parsedActionFlow.steps.find(s => s.stepId.toString() === activeStepId!.toString());
                setCurrentStepDefinition(stepDef || null);
                if (!stepDef) {
                    setFeedbackMessage({ type: 'error', text: `Error: Step ID ${activeStepId.toString()} not found in flow.` });
                }
            } else {
                setCurrentStepDefinition(null); // No active step if flow completed or no steps
            }
            setUserInputForCurrentStep({}); // Reset input when step changes
        } else if (currentMissionUserProgress?.overallStatus.hasOwnProperty('NotStarted')) {
            setCurrentStepId(null);
            setCurrentStepDefinition(null);
        }
    }, [parsedActionFlow, currentMissionUserProgress]);

    const handleUserInputChange = (key: string, value: any) => {
        setUserInputForCurrentStep(prev => ({ ...prev, [key]: value }));
    };

    const handleStartMission = async () => {
        if (!projectCanisterId || missionId === null || !principalId) return;
        setIsStartingMission(true);
        setFeedbackMessage({ type: 'info', text: "Starting mission..." });
        try {
            const startedProgress = await startBackendMission(projectCanisterId, missionId, principalId);
            if (startedProgress) {
                // The global state was updated by startBackendMission via setUserProgressForMission.
                // The useEffect listening to globalUserProgress will update currentMissionUserProgress.
                setFeedbackMessage({ type: 'success', text: "Mission started!" });
            } else {
                // This case might not be hit if startBackendMission throws on null/error
                setFeedbackMessage({ type: 'error', text: "Failed to start mission. Progress not returned." });
            }
        } catch (error: any) {
            setFeedbackMessage({ type: 'error', text: `Failed to start mission: ${error.message || error}` });
        }
        setIsStartingMission(false);
    };

    const handleSubmitStep = async () => {
        if (!projectCanisterId || !principalId || currentStepId === null || missionId === null) { /* ... */ return; }
        setIsLoadingAction(true);
        setFeedbackMessage(null); // Clear previous feedback
        const userInputJson = JSON.stringify(userInputForCurrentStep);

        try {


            
            const actionServiceResponse = await executeBackendActionStep(
                projectCanisterId,
                missionId,
                currentStepId,
                userInputJson,
                principalId
            );

            if (actionServiceResponse) {
                // Feedback based on the direct response of the action.
                setFeedbackMessage({
                    type: actionServiceResponse.success ? 'success' : 'info', // Corrected property
                    text: actionServiceResponse.message?.[0] || (actionServiceResponse.success ? "Step successful!" : "Step processed.") // Corrected property
                });

                // The globalUserProgress will be updated by fetchUserMissionProgressAndSet inside executeBackendActionStep.
                // The useEffect listening to globalUserProgress will then update currentMissionUserProgress and UI.

                // Check if the flow is completed based on the direct response, for immediate UI feedback
                // The definitive completion status will come from the re-fetched currentMissionUserProgress.
                if (actionServiceResponse.isFlowCompleted && actionServiceResponse.isFlowCompleted[0]) {
                    if (actionServiceResponse.success) { // Corrected property
                        /*
                        Here we will set the function to grant reward on completion.
                        */

                        // The re-fetched progress will soon confirm completion and update the UI.
                        // We set the message and trigger confetti optimistically for better UX.
                        try {
                            if (mission.rewardType.hasOwnProperty('Points')) await actor.addMissionPoints(principalId, Number(mission.maxRewardAmount) || Number(mission.minRewardAmount));
                            await fetchUserGlobalProfileAndSet(principalId);
                        } catch (error) {
                            console.error(`Error giving points: ${error}`);
                        }
                        setFeedbackMessage({ type: 'success', text: `Mission "${mission.name}" completed! ${actionServiceResponse.message?.[0] || ''}`.trim() });
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 5000); // Show confetti for 5 seconds
                    }
                }
            } else {
                // This case might not be hit if executeBackendActionStep throws
                setFeedbackMessage({ type: 'error', text: "No response from action execution." });
            }
        } catch (error: any) {
            setFeedbackMessage({ type: 'error', text: `Action failed: ${error.message || JSON.stringify(error)}` });
        }
        setIsLoadingAction(false);
    };

    const formatMilliseconds = (ms: bigint | number): number => {
        let milliseconds = ms.toString();
        return Number(milliseconds.slice(0, -6));
    };

    const formatDate = (timestamp: bigint | number): string => {
        const date = new Date(formatMilliseconds(timestamp));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    useEffect(() => {
        if (!projectCanisterId || !currentMissionUserProgress || !mission.isRecursive || !mission.recursiveTimeCooldown) return;
        if (!currentMissionUserProgress.completionTime[0]) return;
        if (!mission.recursiveTimeCooldown[0]) return;

        try {
            cooldownRemainingForNewCompletion(
                projectCanisterId,
                formatMilliseconds(currentMissionUserProgress.completionTime[0]) || 0,
                formatMilliseconds(mission.recursiveTimeCooldown[0]) || 0
            ).then((remaining) => {
                if (Number(remaining) === 0) setDisabledStartAgain(false);
                setCooldownRemaining(remaining);
            });
        } catch (error) {
            console.error("Error checking cooldown:", error);
            setCooldownRemaining(0); // Reset on error
        }
    }, [projectCanisterId, currentMissionUserProgress, mission.isRecursive, mission.recursiveTimeCooldown, cooldownRemainingForNewCompletion]);

    useEffect(() => {
        if (!projectCanisterId || !currentMissionUserProgress) return;

        const userLimit = mission.maxCompletionsPerUser[0] || 0;
        const missionLimit = mission.maxTotalCompletions[0] || 0;

        try {
            checkUserCompletions(projectCanisterId, missionId, principalId)
            .then((res) => {
                if (userLimit === 0) {
                    setDisabledUserCompletionLimit(false);
                } else if (res as number >= userLimit) {
                    setDisabledUserCompletionLimit(true);
                } else {
                    setDisabledUserCompletionLimit(false);
                }
                setLoadingInfo(false);
            });
        } catch (error) {
            console.error("Error checking completion:", error);
        }

        try {
            checkMissionCompletions(projectCanisterId, missionId)
            .then((res) => {
                if (missionLimit === 0) {
                    setDisabledCompletionLimit(false);
                } else if (res as number >= missionLimit) {
                    setDisabledCompletionLimit(true);
                } else {
                    setDisabledCompletionLimit(false);
                }
                setLoadingInfo(false);
            });
        } catch (error) {
            console.error("Error checking completion:", error);
        }
    }, [projectCanisterId, currentMissionUserProgress, missionId, principalId, mission.maxCompletionsPerUser, mission.maxTotalCompletions, checkUserCompletions, checkMissionCompletions]);

    const missionIconDisplayUrl = mission.iconUrl?.[0]?.trim() && projectCanisterId
        ? constructRawIcpAssetUrl(mission.iconUrl[0], projectCanisterId)
        : '/assets/KonectaIconPB.webp';

    const totalSteps = parsedActionFlow?.steps.length || 0;
    const currentStepIndex = useMemo(() => {
        if (!currentStepId || !parsedActionFlow?.steps) return -1;
        return parsedActionFlow.steps.findIndex(s => s.stepId.toString() === currentStepId.toString());
    }, [currentStepId, parsedActionFlow?.steps]);

    const progressPercentage = totalSteps > 0 && currentStepIndex !== -1 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;
    const isMissionStructurallyCompleted = currentMissionUserProgress?.overallStatus.hasOwnProperty('CompletedSuccess') || currentMissionUserProgress?.overallStatus.hasOwnProperty('CompletedFailure');


    if (!mission || !parsedActionFlow) { // Initial loading or error parsing flow
        return (
            <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                <div className={styles.modalContent}>
                    <button onClick={closeModal} className={styles.closeButton} aria-label="Close mission details">X</button>
                    <p>{feedbackMessage?.text || "Loading mission details..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
            <div className={styles.modalContent} role="dialog" aria-labelledby="missionModalTitle" aria-describedby="missionModalDescription">
                <button onClick={closeModal} className={styles.closeButton} aria-label="Close mission details">X</button>

                <div className={styles.missionHeader}>
                    <img src={missionIconDisplayUrl} alt="" className={styles.missionModalIcon} />
                    <h2 id="missionModalTitle">{mission.name}</h2>
                </div>
                <p id="missionModalDescription" className={styles.missionModalDescription}>{mission.description}</p>
                <div className={styles.missionRewardReminder}> {/* NEW: Reward Reminder */}
                    <strong>Reward:</strong> {getRewardDisplay(mission.rewardType, mission.minRewardAmount, mission.maxRewardAmount)}
                </div>
                <hr className={styles.separator} />

                {isLoadingAction && <p className={styles.loadingMessage}>Processing action...</p>}
                {isStartingMission && <p className={styles.loadingMessage}>Starting mission...</p>}
                {feedbackMessage && <p className={`${styles.feedbackMessage} ${styles[feedbackMessage.type]}`}>{feedbackMessage.text}</p>}

                {currentMissionUserProgress?.overallStatus.hasOwnProperty('NotStarted') ? (
                    <div className={styles.startMissionSection}>
                        <p>This mission is ready to begin!</p>
                        <button onClick={handleStartMission} disabled={isStartingMission} className={styles.ctaButton}>
                            {isStartingMission ? "Starting..." : "Start Mission"}
                        </button>
                    </div>
                ) : isMissionStructurallyCompleted ? (
                    <div className={styles.missionCompletionStatus}>
                        <h3>
                            {currentMissionUserProgress?.overallStatus.hasOwnProperty('CompletedSuccess')
                                ? `🎉 Mission Complete! 🎉`
                                : `🚫 Mission Attempt Ended.`}
                        </h3>
                        {mission.isRecursive ? (
                            <>
                                {currentMissionUserProgress?.completionTime[0]
                                ? (
                                    <>
                                        <p>{`Completion Time: ${formatDate(currentMissionUserProgress.completionTime[0])}`}</p>
                                        <Timer milliseconds={BigInt(cooldownRemaining)} />
                                    </>
                                ) : (
                                    <p>No completion time available</p>
                                )}
                                {(!disabledStartAgain && !disabledCompletionLimit && !disabledUserCompletionLimit)  ? (
                                    <button onClick={handleStartMission} disabled={isStartingMission} className={styles.actionButton}>
                                        Start Mission
                                    </button>
                                ) : (
                                    <button disabled={true} className={styles.actionButton}>
                                        {loadingInfo
                                        ? "Loading..."
                                        : "Completed or Not Available"}
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <p>
                                    {currentMissionUserProgress?.overallStatus.hasOwnProperty('CompletedSuccess')
                                        ? `You've successfully completed "${mission.name}". Well done!`
                                        : `This mission attempt has concluded. Check your progress or try again if available.`}
                                </p>
                                <p>
                                    {currentMissionUserProgress?.completionTime[0]
                                    ? `Completion Time: ${formatDate(currentMissionUserProgress.completionTime[0])}`
                                    : "No completion time available"}
                                </p>
                            </>
                        )}
                        {/* Optionally show outputs or claimed reward status */}
                    </div>
                ) : currentStepDefinition ? (
                    <>
                        <div className={styles.stepTracker}> {/* NEW: Step Tracking & Progress Bar */}
                            <span className={styles.stepText}>
                                Step {currentStepIndex + 1} of {totalSteps}: {currentStepDefinition.description?.[0] || 'Process current step'}
                            </span>
                            <div className={styles.progressBarContainer}>
                                <div className={styles.progressBarFill} style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                        <ActionStepRenderer
                            stepDefinition={currentStepDefinition}
                            userInput={userInputForCurrentStep}
                            onUserInputChange={handleUserInputChange}
                            onSubmitStep={handleSubmitStep}
                            isLoadingAction={isLoadingAction}
                        />
                    </>
                ) : (
                    <p className={styles.loadingMessage}>Loading current step or mission flow has ended...</p>
                )}
            </div>
        </div>
    );
};

export default MissionModal;