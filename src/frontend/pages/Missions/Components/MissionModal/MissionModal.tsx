import React, { useEffect, useState } from 'react';
import styles from './MissionModal.module.scss';
import { useNavigate } from 'react-router-dom';
import { getGradientStartColor, getGradientEndColor, rgbToRgba } from '../../../../../utils/colorUtils.ts';
import usePTWData from '../../../../../hooks/usePTWData.tsx';
import useTWtoRT from '../../../../../hooks/useTWtoRT.tsx';
import MissionFunctionsComponent from '../MissionFunctionsComponent.tsx';
import { FetchData } from '../../../../../hooks/fetchData.tsx';
import { canisterId } from '../../../../../declarations/backend/index.js';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { checkMissionCompletion, checkRequiredMissionCompletion } from '../../missionUtils.ts';
interface MissionModalProps {
    closeModal: () => void;
    selectedMissionId: bigint;
}

const BASE_URL = process.env.DFX_NETWORK === "local" ? process.env.DEV_IMG_CANISTER_ID : canisterId;

const MissionModal: React.FC<MissionModalProps> = ({ closeModal, selectedMissionId }) => {
    const globalID = useGlobalID();
    const navigate = useNavigate();
    const fetchData = FetchData();
    const [loading, setLoading] = useState(false);
    const missions = globalID.missions;
    const mission = missions ? missions?.find((m: { id: bigint; }) => m.id === selectedMissionId) : undefined;
    console.log("MissionModal mission", mission);
    useEffect(() => {
        if (!mission) {
            navigate('/Missions');
        }
    }, [mission, navigate]);

    if (!mission) return null;

    const missionId = BigInt(mission.id);

    const missionCompleted = checkMissionCompletion(globalID.userProgress, missionId);

    const { requiredMissionCompleted } = checkRequiredMissionCompletion(globalID, mission);

    // If mission is not available, navigate away
    useEffect(() => {
        if (!requiredMissionCompleted && !missionCompleted) {
            navigate('/Missions');
        }
    }, [requiredMissionCompleted, missionCompleted, navigate]);

    const gradientStartColor = getGradientStartColor(Number(mission.mode));
    const gradientEndColor = getGradientEndColor(Number(mission.mode));

    // Add a beforeunload event listener to warn the user about navigation while loading
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (loading) {
                e.preventDefault();
                e.returnValue = ''; // Show the default browser alert when trying to reload/close
            }
        };

        // Attach the event listener
        if (loading) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        } else {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }

        // Cleanup the event listener when the component unmounts or loading is false
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [loading]); // Run this effect when the loading state changes

    const executeFunction = async (functionName: string | undefined) => {
        if (functionName && MissionFunctionsComponent[functionName as keyof typeof MissionFunctionsComponent]) {
            setLoading(true);
            try {
                await MissionFunctionsComponent[functionName as keyof typeof MissionFunctionsComponent](globalID, navigate, fetchData);
            } catch (error) {
                console.error(`Error executing function: ${functionName}`, error);
            } finally {
                setLoading(false);
            }
        } else {
            console.error(`Function ${functionName} not found`);
        }
    };

    const renderButtons = () => {
        if (missionCompleted) {
            return <div className={styles.CompletedText}>Mission Completed!</div>;
        }

        const functionName1 = mission.functionName1?.[0];
        const functionName2 = mission.functionName2;

        const buttonGradientStyle = {
            backgroundImage: `linear-gradient(to right, ${gradientEndColor}, ${gradientStartColor})`,
        };

        const missionMode = Number(mission.mode);
        if (missionMode === 0) {
            return (
                <button onClick={() => executeFunction(functionName2)} style={buttonGradientStyle} disabled={loading}>
                    {loading ? 'Loading...' : mission.obj2}
                </button>
            );
        }

        if (missionMode === 1 || missionMode === 2 || missionMode === 3) {
            return (
                <>
                    {functionName1 && (
                        <button onClick={() => executeFunction(functionName1)} style={buttonGradientStyle} disabled={loading}>
                            {loading ? 'Loading...' : mission.obj1}
                        </button>
                    )}
                    {functionName2 && (
                        <button onClick={() => executeFunction(functionName2)} style={buttonGradientStyle} disabled={loading}>
                            {loading ? 'Loading...' : mission.obj2}
                        </button>
                    )}
                </>
            );
        }

        return null;
    };

    // Embed the tweet iframe

    const renderRecursiveMissionOverlay = () => {
        if (mission.recursive && missionCompleted && BigInt(mission.endDate) !== BigInt(0)) {
            const countdownText = `Mission resets at ${new Date(Number(mission.endDate)).toLocaleString()}`;
            return <div className={styles.RecursiveMissionOverlay}>{countdownText}</div>;
        }
        return null;
    };

    const renderTweetEmbed = () => {
        const { tweetId, loading: tweetLoading, error: tweetError } = useTWtoRT();

        if (!tweetId) return null;
        if (tweetError) return <div>Error loading tweet</div>;

        return (
            <div className={styles.TweetEmbedWrapper}>
                <blockquote className="twitter-tweet">
                    <a href={`https://twitter.com/i/web/status/${tweetId}`}></a>
                </blockquote>
                <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
            </div>
        );
    };

    // Render custom content for PTW (Particular to mission 4)
    const { renderPTWContent } = usePTWData(Number(selectedMissionId));

    // Disable background click while loading
    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (loading) return; // Do nothing if loading is true
        if ((e.target as HTMLElement).classList.contains(styles.ModalBackground)) {
            closeModal(); // Close modal only if clicked outside and not loading
        }
    };

    return (
        <div className={styles.ModalBackground} onClick={handleBackgroundClick}>
            <div className={styles.MissionModal}>

                {/* Mission Image */}
                <div className={styles.MissionImageWrapper}>
                    <img
                        src={`https://${BASE_URL}.raw.icp0.io${mission.image}`}
                        alt="Mission Image"
                        className={styles.MissionImage}
                    />
                    <div
                        className={styles.GradientOverlay}
                        style={{
                            background: `linear-gradient(${rgbToRgba(gradientStartColor, 30)} 0%, transparent 100%)`
                        }}
                    />
                </div>

                {/* Gradient Line */}
                <svg className={styles.MissionLine} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`lineGradient${mission.id}`} x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" stopColor={getGradientStartColor(Number(mission.mode))} />
                            <stop offset="100%" stopColor={getGradientEndColor(Number(mission.mode))} />
                        </linearGradient>
                    </defs>
                    <path d="M 5 0 L 5 96 L 74 96 L 95 80 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
                </svg>

                <div>
                    {/* Mission Title */}
                    <div className={styles.MissionTitleWrapper}>
                        <div className={styles.MissionTitle}>
                            {mission.title}
                        </div>
                    </div>
                    <div className={styles.MissionBadge}>
                        {/* Gradient Circle */}
                        <svg className={styles.MissionCircle} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`circleGradient${mission.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={getGradientStartColor(Number(mission.mode))} />
                                    <stop offset="100%" stopColor={getGradientEndColor(Number(mission.mode))} />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="50" fill={`url(#circleGradient${mission.id})`} />
                        </svg>
                        {/* Mission Icon */}
                        <img
                            src={`https://${BASE_URL}.raw.icp0.io${mission.iconUrl}`}
                            alt="Mission Icon"
                            className={styles.MissionIcon}
                        />
                    </div>
                </div>
                {/* Mission Content */}
                <div className={styles.MissionContent}>
                    <p>{mission.description}</p>
                    {Number(selectedMissionId) === 4 && renderPTWContent()}
                    {Number(selectedMissionId) === 5 && renderTweetEmbed()}
                </div>

                {renderRecursiveMissionOverlay()}

                <div className={styles.ButtonInputs}>
                    <div className={styles.MissionActions}>
                        {loading ? <div className={styles.LoadingBar}>Loading...</div> : renderButtons()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MissionModal;
