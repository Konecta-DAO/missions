import React, { useCallback, useEffect, useState } from 'react';
import styles from './MissionModal.module.scss';
import { useNavigate } from 'react-router-dom';
import Kami1 from '../../../../../../public/assets/OC_Kami_Stage_1.png';
import Kami2 from '../../../../../../public/assets/OC_Kami_Stage_2.png';
import Kami3 from '../../../../../../public/assets/OC_Kami_Stage_3.png';
import Kami4 from '../../../../../../public/assets/OC_Kami_Claim_Button.png';
import missionFunctions from '../MissionFunctionsComponent.ts';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { Actor, HttpAgent } from '@dfinity/agent';
import { canisterId, idlFactory } from '../../../../../declarations/backend/index.js';
import { idlFactory as ocIdl, canisterId as canisterId2 } from '../../../../../declarations/ocKommunity/index.js';
import { Principal } from '@dfinity/principal';
import { checkMissionCompletion } from '../../missionUtils.ts';
import { isMobileOnly } from 'react-device-detect';
import { Usergeek } from 'usergeek-ic-js';
import TweetEmbed from './TweetEmbed.tsx';

type UserId = Principal;

type LookupMembersArgs = {
    user_ids: UserId[];
};

type CommunityMember = {
    user_id: UserId;
    date_added: bigint;
    role: { Owner?: null; Admin?: null; Member?: null };
    display_name?: string | null;
    referred_by?: UserId | null;
};

type LookupMembersResponse =
    | { Success: { members: CommunityMember[] } }
    | { PrivateCommunity: null };

enum Mission7State {
    Step1,
    Step2,
    Step3,
    Done,
}

interface Mission7ViewProps {
    mission: any;
    closeModal: () => void;
}


const Mission7View: React.FC<Mission7ViewProps> = ({
    mission,
    closeModal,

}) => {

    const globalID = useGlobalID();
    const navigate = useNavigate();
    const fetchData = useFetchData();
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('a');
    const [placestate, setPlacestate] = useState(false);
    const [rtsdone, setRtsdone] = useState(0);
    const [mission7State, setMission7State] = useState<Mission7State>(Mission7State.Step1);
    const [isLoaded, setIsLoaded] = useState(false);
    const [rtAvailable, setRtavailable] = useState(false);
    const [currentTimeNano, setCurrentTimeNano] = useState(() => {
        return BigInt(Date.now()) * 1_000_000n;
    });
    const [rtDate, setRtDate] = useState(0);

    useEffect(() => {
        const updateTime = () => {
            setCurrentTimeNano(BigInt(Date.now()) * 1_000_000n);
        };

        updateTime();

        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (currentTimeNano >= rtDate && rtDate != 0) {
            setRtavailable(false);
        }
    }, [currentTimeNano]);

    useEffect(() => {

        const startM7 = async () => {
            setIsLoaded(false);

            const agent2 = HttpAgent.createSync();
            const actor = Actor.createActor(idlFactory, {
                agent: globalID.agent!,
                canisterId,
            })

            const a = await actor.canUserDoMission(globalID.principalId, 7n);

            if (a) {

                const rtMission = globalID.missions.find(mission => mission.id === 5n);
                setRtDate(Number(rtMission?.endDate) ?? 0);
                if (rtMission && rtMission.endDate > currentTimeNano) {
                    setRtavailable(true);
                }

                let currentMissionState = mission7State;

                if (globalID.user && globalID.user[0]?.ocCompleted) {
                    currentMissionState = Mission7State.Step2;
                    setMission7State(currentMissionState);
                } else {
                    const actor2 = Actor.createActor(ocIdl, {
                        agent: agent2,
                        canisterId: canisterId2,
                    })

                    if (globalID.principalId && globalID.user && globalID.user[0]?.ocProfile && globalID.user[0].ocProfile.length > 0) {
                        const ocProfile: string = globalID.user[0].ocProfile[0]!;

                        const args: LookupMembersArgs = { user_ids: [Principal.fromText(ocProfile)] };

                        const response: LookupMembersResponse = await actor2.lookup_members(args) as LookupMembersResponse;

                        const isMember: boolean = 'Success' in response && response.Success.members.length > 0;

                        if (isMember) {
                            await actor.setOCMissionEnabled(globalID.principalId);
                            Usergeek.trackEvent("Mission 7 Part 1: Join");
                            currentMissionState = Mission7State.Step2;
                            setMission7State(currentMissionState);
                        }
                    }
                }

                if (currentMissionState === Mission7State.Step2) {
                    const mainRT = await actor.isFullOc(globalID.principalId);
                    if (Number(mainRT) >= 1) {
                        currentMissionState = Mission7State.Step3;
                        setMission7State(currentMissionState);
                    }
                }

                if (currentMissionState === Mission7State.Step3) {
                    const mainRT2 = await actor.isRecOc(globalID.principalId);
                    if (Number(mainRT2) >= 3) {                                   
                        currentMissionState = Mission7State.Done;
                        setMission7State(currentMissionState);
                    } else {
                        setRtsdone(Number(mainRT2));
                    }
                }
                setIsLoaded(true);
            } else {
                closeModal();
            };

        };
        startM7();
    }, [globalID.userProgress])

    // Rec Timer

    const mission5 = globalID.missions.find((mission) => mission.id === 5n);

    const endDateMs = Number(mission5?.endDate ?? 0) !== 0 ? Number(mission5?.endDate ?? 0) / 1_000_000 : 0;

    const completedRec = checkMissionCompletion(globalID.userProgress, mission5!)

    const [remainingTime, setRemainingTime] = useState<number>(0);

    // Effect for countdown timer
    useEffect(() => {
        if (endDateMs > 0) {
            const updateRemainingTime = () => {
                const now = Date.now();
                const diff = endDateMs - now;
                if (diff <= 0) {
                    setRemainingTime(0);
                } else {
                    setRemainingTime(Math.floor(diff / 1000));
                }
            };

            updateRemainingTime(); // Initial call

            const intervalId = setInterval(updateRemainingTime, 1000);

            return () => clearInterval(intervalId);
        }
    }, [endDateMs]);

    const formatRemainingTime = (seconds: number): string => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) {
            return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(
                2,
                '0'
            )}:${String(secs).padStart(2, '0')}`;
        } else if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(
                2,
                '0'
            )}`;
        } else if (minutes > 0) {
            return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        } else {
            return `0:${String(secs).padStart(2, '0')}`;
        }
    };



    const executeFunction = useCallback(async (functionName?: string) => {
        if (functionName && missionFunctions[functionName as keyof typeof missionFunctions]) {
            setLoading(true);
            try {
                await missionFunctions[functionName as keyof typeof missionFunctions](globalID, navigate, fetchData, setLoading, closeModal, mission.id, inputValue, setPlacestate, setPlacestate); //disconnect
            } catch (error) {
                console.error(`Error executing function: ${functionName}`, error);
            }
        } else {
            console.error(`Function ${functionName} not found`);
        }
    }, [closeModal]);

    // Function to render the timeline
    const renderTimeline = () => {
        const steps = [Mission7State.Step1, Mission7State.Step2, Mission7State.Step3];
        const currentStepIndex = mission7State <= Mission7State.Step3 ? mission7State : 2;
        const stepsToRender = steps.slice(0, currentStepIndex + 1);

        return (
            <div className={styles.timeline}>
                {stepsToRender.map((step, index) => {
                    const isCurrent = index === currentStepIndex;
                    const isPrevious = index < currentStepIndex;
                    return (
                        <div key={index} className={styles.timelineStep}>

                            {!isMobileOnly && (
                                <div className={styles.timelineNumber}>{`${index + 1}/3`}</div>
                            )}

                            <div
                                className={`${styles.timelineNode} ${isPrevious ? styles.previousNode : ''
                                    }`}
                            ></div>
                            {index < stepsToRender.length - 1 && (
                                <div
                                    className={`${styles.timelineLine} ${isPrevious ? styles.previousLine : ''
                                        }`}
                                ></div>
                            )}
                        </div>
                    );
                })}
                <div className={styles.timelineEndLine}></div>
            </div>
        );
    };


    const renderContent = () => {

        if (!isLoaded) {
            return (
                <div className={styles.Mission7Desc0}>
                    <p>
                        Loading...
                    </p>
                </div>
            )
        }
        switch (mission7State) {
            case Mission7State.Step1:
                return (
                    <>
                        <div className={styles.Mission7Desc}>
                            <p>
                                Your journey begins here: Log in on OpenChat (bottom-right) and join the Konecta revolution!
                            </p>
                            <div className={styles.Mission7Sub}>
                                <button onClick={closeModal} className={styles.Mission7Button}>
                                    Let's do it!
                                </button>
                            </div>

                        </div>


                        {renderTimeline()}
                        <svg className={styles.MissionLine7} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`lineGradient${mission.id}`} x1="0%" y1="0%" x2="100%">
                                    <stop offset="0%" stopColor={'#406DE9'} />
                                    <stop offset="100%" stopColor={'#34AADC'} />
                                </linearGradient>
                            </defs>
                            <path d="M 5 0 L 5 46 L 74 46 L 95 30 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
                        </svg>
                        <img src={Kami1} className={styles.Kami1} alt="Cool Kami Picture" />
                    </>
                );
            case Mission7State.Step2:
                return (
                    <>
                        <div className={styles.Mission7Desc}>
                            <p>
                                Your Second Step in this journey is to retweet the 2 given tweets. Just click on the button and you're ready to go!
                            </p>
                            <a
                                href="https://twitter.com/i/web/status/1838240418150146242"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', color: '#34AADC', cursor: 'pointer', fontWeight: '700', paddingRight: '2vh' }}
                            >
                                Tweet 1
                            </a>
                            <a
                                href="https://twitter.com/i/web/status/1841472564935176586"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', color: '#34AADC', cursor: 'pointer', fontWeight: '700', paddingRight: '2vh' }}
                            >
                                Tweet 2
                            </a>
                            <div className={styles.Mission7Sub}>

                                <button
                                    onClick={() => executeFunction('verMRT')}
                                    disabled={loading}
                                    className={`${styles.Mission7Button} ${loading ? styles.loadingButton : ''}`}
                                >
                                    <div className={styles.buttonContent}>
                                        {loading && <div className={styles.spinner} />}
                                        <span className={loading ? styles.loadingText : ''}>
                                            {loading ? 'Loading...' : 'Retweet them baby!'}
                                        </span>
                                    </div>
                                </button>
                            </div>

                        </div>


                        {renderTimeline()}
                        <svg className={styles.MissionLine7} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`lineGradient${mission.id}`} x1="0%" y1="0%" x2="100%">
                                    <stop offset="0%" stopColor={'#406DE9'} />
                                    <stop offset="100%" stopColor={'#34AADC'} />
                                </linearGradient>
                            </defs>
                            <path d="M 5 0 L 5 58 L 79 58 L 95 45 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
                        </svg>
                        <img src={Kami2} className={styles.Kami2} alt="Cool Kami Picture" />
                    </>
                );
            case Mission7State.Step3:

                const isButtonDisabled = completedRec;

                const buttonText = isButtonDisabled
                    ? `Will be available again in: ${formatRemainingTime(remainingTime)}`
                    : loading
                        ? 'Loading...'
                        : "Let's do it!";

                return (
                    <>
                        <div className={styles.Mission7Desc}>
                            <p>
                                Your Last Step in this journey is to complete the retweet recursive mission 3 times! It resets every 2 days, so keep it up!
                            </p>
                            <div className={styles.Mission7Sub}>
                                {rtAvailable ? (
                                    <>
                                        <TweetEmbed missionId={5} />
                                        <button
                                            onClick={() => executeFunction('verRT')}
                                            disabled={isButtonDisabled || loading}
                                            className={`${styles.Mission7Button} ${isButtonDisabled ? styles.greyedOutButton : ''} ${loading ? styles.loadingButton : ''}`}
                                        >
                                            <div className={styles.buttonContent}>
                                                {loading && <div className={styles.spinner} />}
                                                <span className={loading ? styles.loadingText : ''}>
                                                    {buttonText}
                                                </span>
                                            </div>
                                        </button>
                                        <span className={styles.completionText}>
                                            Times completed: {rtsdone}/3
                                        </span>
                                    </>
                                ) : (
                                    <p className={styles.resettingMessage}>
                                        This mission is resetting, please refresh the page in some minutes!
                                    </p>
                                )}
                            </div>
                        </div>
                        {renderTimeline()}
                        <svg className={styles.MissionLine7} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`lineGradient${mission.id}`} x1="0%" y1="0%" x2="100%">
                                    <stop offset="0%" stopColor={'#406DE9'} />
                                    <stop offset="100%" stopColor={'#34AADC'} />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 5 0 L 5 71 L 74 71 L 95 54 L 95 0"
                                stroke={`url(#lineGradient${mission.id})`}
                                strokeWidth="10"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                                fill="none"
                            />
                        </svg>
                        <img src={Kami3} className={styles.Kami3} alt="Cool Kami Picture" />
                    </>
                );
            case Mission7State.Done:
                return (
                    <>
                        <div className={styles.Mission7Desc2}>
                            <p>
                                Congratulations, you did it! Click on the button below to claim your points
                            </p>
                            <div className={styles.Mission7Sub2}>
                                <button onClick={() => executeFunction('ocMission')}
                                    disabled={loading}
                                    className={`${styles.Mission7Button2} ${loading ? styles.loadingButton : ''}`}>
                                    <div className={styles.buttonContent}>
                                        {loading && <div className={styles.spinner} />}
                                        <span className={loading ? styles.loadingText : ''}>
                                            {loading ? 'Loading...' : 'Claim'}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <svg className={styles.MissionLine7} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`lineGradient${mission.id}`} x1="0%" y1="0%" x2="100%">
                                    <stop offset="0%" stopColor={'#406DE9'} />
                                    <stop offset="100%" stopColor={'#34AADC'} />
                                </linearGradient>
                            </defs>
                            <path d="M 5 0 L 5 96 L 74 96 L 95 80 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
                        </svg>
                        <img src={Kami4} className={styles.Kami4} alt="Cool Kami Picture" />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div>
                <div className={styles.Mission7Content}>
                    <h2>Complete 3 tasks. Earn Seconds and CHIT</h2>
                </div>

                {renderContent()}
            </div>
        </>
    );
};

export default React.memo(Mission7View);
