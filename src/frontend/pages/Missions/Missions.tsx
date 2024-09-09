import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { convertSecondsToHMS, formatTimeRemaining, isMissionAvailable } from '../../../components/Utilities';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent';
import { useEncryption } from '../../../components/EncryptionProvider';
import useIsMobile from '../../hooks/useIsMobile';
import KonectaLogo from '../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../public/assets/Time Capsule.svg';
import { getGradientStartColor, getGradientEndColor } from '../../../utils/colorUtils';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from "@dfinity/agent";
import useLoadingProgress from '../../../utils/useLoadingProgress';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId, backend } from '../../../declarations/backend';
import { SerializedMission, SerializedProgress, SerializedUser } from '../../../declarations/backend/backend.did';
import MissionModal from './MissionModal';
import KonectaInfoButton from '../../components/KonectaInfoButton/KonectaInfoButton';
import HelpButton from '../../components/HelpButton/HelpButton';
import HistoryButton from '../../components/HistoryButton/HistoryButton';
import HistoryModal from './HistoryModal';


const BASE_URL = "https://onpqf-diaaa-aaaag-qkeda-cai.raw.icp0.io";

const Missions: React.FC = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { decryptSession } = useEncryption();
    const [principalId, setPrincipalId] = useState<Principal | null>(null);
    const [timerText, setTimerText] = useState<string>('00:00:00');
    const [missions, setMissions] = useState<SerializedMission[]>([]);
    const [userProgress, setUserProgress] = useState<Array<[bigint, SerializedProgress]> | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const { missionId } = useParams();
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [hovering, setHovering] = useState<boolean>(false);
    const { loadingPercentage, loadingComplete } = useLoadingProgress();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<SerializedUser[] | null>(null);
    const [twitterhandle, setTwitterHandle] = useState<string | null>(null);
    const [decryptedSession, setDecryptedSession] = useState<boolean>(false);
    const [backendActor, setBackendActor] = useState<Actor | null>(null);


    useEffect(() => {
        if (!decryptedSession) {
            const session = decryptSession();
            if (session?.identity) {
                const userPrincipal = session.identity.getPrincipal();
                console.log('User principal:', userPrincipal.toText());
                setPrincipalId(userPrincipal);
                const agent = new HttpAgent({ identity: session.identity });

                const backendActor = Actor.createActor(backend_idlFactory, {
                    agent,
                    canisterId: backend_canisterId,
                });

                setBackendActor(backendActor);

                const fetchData = async () => {
                    try {
                        // Fetch twitterHandle
                        const user = await backendActor.getUser(userPrincipal) as SerializedUser[];

                        setUser(user);

                        if (user.length > 0) {
                            const twitterHandle = user[0]?.twitterhandle?.[0] || '';
                            setTwitterHandle(twitterHandle);
                        }
                        // Fetch total seconds for user
                        const totalSecondsResult = await backendActor.getTotalSecondsForUser(userPrincipal);
                        const totalSeconds = totalSecondsResult ? Number((totalSecondsResult as number[])[0]) : 0;
                        setTimerText(convertSecondsToHMS(totalSeconds));

                        // Fetch all missions
                        const missionsData = await backendActor.getAllMissions();
                        if (Array.isArray(missionsData)) {
                            setMissions(missionsData);
                        } else {
                            console.error("Error fetching missions: Invalid data format");
                        }

                        // Fetch user progress
                        backendActor.getUserProgress(userPrincipal)
                            .then((progressData) => {

                                if (Array.isArray(progressData)) {
                                    // Handle nested arrays within each progressData entry
                                    const validUserProgress: Array<[bigint, SerializedProgress]> = progressData.flatMap((entry) => {
                                        // Entry is expected to be a nested array: [ [missionId, progress], [missionId, progress] ]
                                        if (Array.isArray(entry)) {
                                            return entry.map((innerEntry) => {
                                                if (Array.isArray(innerEntry) && innerEntry.length === 2) {
                                                    const missionId = innerEntry[0];  // Extract missionId
                                                    const progress = innerEntry[1];   // Extract progress

                                                    if (typeof missionId === 'bigint' && typeof progress === 'object') {
                                                        return [missionId, progress];
                                                    }
                                                }
                                                return null;
                                            });
                                        }
                                    }).filter((item): item is [bigint, SerializedProgress] => item !== null); // Filter out invalid entries

                                    setUserProgress(validUserProgress);
                                } else {
                                    setUserProgress([]); // Set empty array if no progress is returned
                                }
                            })
                            .catch(() => {
                                setUserProgress([]); // Handle error by setting empty array
                                console.error("Error fetching user progress.");
                            });


                    } finally {
                        setLoading(false); // Set loading to false once all data is fetched
                        setDecryptedSession(true);
                    }
                };

                fetchData();
            } else {
                navigate('/');
            }
        }
    }, [decryptSession, navigate, decryptedSession]);

    // Handle mouse enter and leave events for the tooltip
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, content: string | null) => {
        if (content) {
            setHovering(true);

            const { clientX, clientY } = e;

            const tooltipWidth = 200;
            const tooltipHeight = 50;
            const buffer = 10;

            let top = clientY + 10;
            let left = clientX + 10;

            // Prevent tooltip from overflowing the right edge of the screen
            if (left + tooltipWidth > window.innerWidth) {
                left = window.innerWidth - tooltipWidth - buffer;
            }

            // Prevent tooltip from overflowing the bottom of the screen
            if (top + tooltipHeight > window.innerHeight) {
                top = window.innerHeight - tooltipHeight - buffer;
            }

            setTooltipPosition({ top, left });
            setTooltipContent(content);
        }
    };

    const handleMouseLeave = () => {
        setHovering(false);
        setTooltipPosition(null);
        setTooltipContent(null);
    };

    const toggleHistoryModal = () => {
        setShowHistoryModal(!showHistoryModal);
    };

    // Click handler for mission cards
    const handleCardClick = (missionId: string) => {
        console.log('Mission clicked:', missionId);
        navigate(`/Missions/${missionId}`);
    };

    // Close modal handler
    const closeModal = () => {
        navigate('/Missions');
    };

    if (!loadingComplete || loading) {
        return <LoadingOverlay loadingPercentage={loadingPercentage} />;
    }

    return (
        <>

            <div className={styles.MainDiv}>
                <div className={styles.CustomKonectaInfoButton}>
                    <KonectaInfoButton onClick={() => { }} />
                </div>
                <div className={styles.CustomHelpButton}>
                    <HelpButton onClick={() => { }} />
                </div>
                <div className={styles.CustomHistoryButton}>
                    <HistoryButton onClick={toggleHistoryModal} />
                </div>
            </div>

            {showHistoryModal && (
                <HistoryModal
                    principalId={principalId?.toString() || 'Unknown'}
                    missions={missions}
                    userProgress={userProgress}
                    closeModal={toggleHistoryModal}
                    twitterhandle={twitterhandle || ''}
                />
            )}

            <div className={styles.MissionsContainer}>

                <div className={styles.KonectaLogoWrapper}>
                    <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
                </div>

                {!isMobile ? (
                    <>
                        <div className={styles.TimeCapsuleWrapper}>
                            <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                            <div className={styles.TimerText}>{timerText}</div>
                        </div>
                        <div className={styles.OpenChatWrapper}>
                            <OpenChat />
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'none' }}>
                        <OpenChat />
                    </div>
                )}

                <div className={styles.MissionGrid}>

                    {missions.sort((a, b) => Number(a.id) - Number(b.id)).map((mission) => {
                        const missionId = BigInt(mission.id);

                        // Check if the current mission has been completed
                        const missionCompleted = userProgress?.some(([id]) => {
                            console.log('Checking userProgress for mission completion:', BigInt(id), '==', missionId);
                            return BigInt(id) === missionId;
                        }) ?? false;

                        let requiredMissionCompleted = true; // Assume no required mission or it's completed
                        let requiredMissionTitle = '';

                        // Check if there's a required previous mission
                        const requiredMissionId = mission.requiredPreviousMissionId?.[0]; // Safely get required previous mission ID if it exists

                        if (requiredMissionId !== undefined) {
                            console.log('Required mission ID:', requiredMissionId);
                            const requiredMissionBigInt = BigInt(requiredMissionId); // Convert to BigInt if defined
                            const requiredMission = missions.find(m => BigInt(m.id) === requiredMissionBigInt); // Find required mission
                            requiredMissionTitle = requiredMission?.title ?? ''; // Get the title of the required mission

                            // Check if the required mission is completed
                            requiredMissionCompleted = userProgress?.some(([id]) => {
                                return BigInt(id) === requiredMissionBigInt;
                            }) ?? false;
                        }

                        let isRecursiveMissionDarkened = false;
                        let countdownText = '';

                        if (mission.recursive && missionCompleted && BigInt(mission.endDate) !== BigInt(0)) {
                            isRecursiveMissionDarkened = true;
                            countdownText = `This Mission will reset at ${formatTimeRemaining(mission.endDate)}`;
                        }

                        const isAvailableMission = !missionCompleted && requiredMissionCompleted;

                        const displayTooltip = !requiredMissionCompleted && !missionCompleted;

                        const formattedRequiredTitle = requiredMissionTitle.split(":")[1]?.trim() ?? '';
                        const tooltipText = displayTooltip
                            ? `You Must Complete the "${formattedRequiredTitle}" Mission before being able to complete this one`
                            : null;

                        const missionClass = missionCompleted
                            ? styles.CompletedMission
                            : (!requiredMissionCompleted ? styles.IncompleteMission : styles.AvailableMission);
                        console.log('Missions to display:', missions);
                        return (
                            <div
                                key={mission.id.toString()}
                                className={`${styles.MissionCard} ${missionClass}`}
                                style={{ backgroundImage: `url(${BASE_URL}${mission.image})` }}
                                onClick={() => {
                                    if (missionCompleted || isAvailableMission) {
                                        handleCardClick(mission.id.toString());
                                    }
                                }}
                                onMouseMove={(e) => handleMouseEnter(e, tooltipText)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {/* Mission Icon */}
                                <img src={`${BASE_URL}${mission.iconUrl}`} alt="Mission Icon" className={styles.MissionIcon} />

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


                                {/* Darken Recursive Completed Missions */}
                                {isRecursiveMissionDarkened && (
                                    <div className={styles.RecursiveMissionOverlay}>
                                        {countdownText}
                                    </div>
                                )}

                                {/* Smaller Circle */}
                                {missionCompleted || (!missionCompleted && !requiredMissionCompleted) ? (
                                    <svg className={styles.SmallMissionCircle} viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id={`smallCircleGradient${mission.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor={getGradientStartColor(Number(mission.mode))} />
                                                <stop offset="100%" stopColor={getGradientEndColor(Number(mission.mode))} />
                                            </linearGradient>
                                        </defs>
                                        <circle cx="50" cy="50" r="50" fill={`url(#smallCircleGradient${mission.id})`} />
                                    </svg>
                                ) : null}

                                {/* Lock for Locked Missions */}
                                {!missionCompleted && !requiredMissionCompleted && (
                                    <svg className={styles.SmallWhiteCircle} viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                        <g id="BLUR_LOCKED" transform="scale(0.0667)">
                                            <g>
                                                <path fill="#FFFFFF" d="M1120.4,1048.3h-8.1C1084,944.9,1000.1,870,901.1,870H598.9c-99,0-182.9,74.9-211.2,178.3h-8.1 c-21,0-37.9,17-37.9,37.9v78.3c0,21,17,37.9,37.9,37.9h8.1c28.4,103.4,112.2,178.3,211.2,178.3h302.2c99,0,182.9-74.9,211.2-178.3 h8.1c21,0,37.9-17,37.9-37.9v-78.3C1158.4,1065.3,1141.4,1048.3,1120.4,1048.3z M901.1,1247.8H598.9 c-58.5,0-106.1-54.9-106.1-122.4c0-67.5,47.6-122.4,106.1-122.4h302.2c58.5,0,106.2,54.9,106.2,122.4S959.6,1247.8,901.1,1247.8z" />
                                                <path fill="#FFFFFF" d="M970.2,751.4V835c0,0.6,0,1.2,0,1.9h-63.8v-85.5c0-37.7-30.7-68.4-68.4-68.4h-53v153.9h-69.5V683H662 c-37.7,0-68.4,30.7-68.4,68.4v85.5h-63.8c0-0.6,0-1.2,0-1.9v-83.6c0-73.1,59.2-132.2,132.2-132.2h176 C911,619.2,970.2,678.4,970.2,751.4L970.2,751.4z" />
                                                <path fill="#FFFFFF" d="M805,1090.1c0,18.8-9.5,35.5-24,45.4v62.4c0,9.9-8,17.9-18,17.9h-26.2c-9.9,0-18-8-18-17.9v-62.4 c-14.5-9.9-24-26.5-24-45.4c0-30.4,24.6-55,55-55S805,1059.7,805,1090.1L805,1090.1z" />
                                            </g>
                                        </g>
                                    </svg>

                                )}

                                {/* Checkmark for Completed Missions */}
                                {missionCompleted && !isRecursiveMissionDarkened && (
                                    <svg className={styles.Checkmark} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                )}

                                {/* Gradient Line */}
                                <svg className={styles.MissionLine} viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id={`lineGradient${mission.id}`} x1="0%" y1="0%" x2="100%">
                                            <stop offset="0%" stopColor={getGradientStartColor(Number(mission.mode))} />
                                            <stop offset="100%" stopColor={getGradientEndColor(Number(mission.mode))} />
                                        </linearGradient>
                                    </defs>
                                    <path d="M 5 0 L 5 90 L 87 90 L 95 68 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" fill="none" />
                                </svg>

                                {/* Mission Title */}
                                <div className={styles.MissionTitleWrapper}>
                                    <div className={styles.MissionTitle}>
                                        {mission.title}
                                    </div>
                                </div>

                                {/* Tooltip */}
                                {hovering && tooltipPosition && tooltipContent && (
                                    <div
                                        className={styles.Tooltip}
                                        style={{
                                            top: tooltipPosition.top,
                                            left: tooltipPosition.left,
                                            position: 'fixed',
                                        }}
                                    >
                                        {tooltipContent}
                                    </div>
                                )}


                            </div>
                        );
                    })}

                    {hovering && tooltipPosition && tooltipContent && (
                        <div className={styles.Tooltip} style={{ top: tooltipPosition.top, left: tooltipPosition.left }}>
                            {tooltipContent}
                        </div>

                    )}
                    {/* Conditionally render MissionModal */}
                    {missionId && (
                        <MissionModal
                            missions={missions}
                            selectedMissionId={BigInt(missionId)}
                            userProgress={userProgress}
                            closeModal={closeModal}
                            loading={loadingComplete}
                            principalId={principalId}
                            backendActor={backendActor}
                            setDecryptedSession={setDecryptedSession}
                        />
                    )}
                </div>

            </div>
        </>
    );
};

export default Missions;
