import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { convertSecondsToHMS } from '../../../components/Utilities';
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
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from '../../../declarations/backend';
import { SerializedMission, SerializedProgress } from '../../../declarations/backend/backend.did';
import MissionModal from './MissionModal';  // Import the modal

const BASE_URL = "https://onpqf-diaaa-aaaag-qkeda-cai.raw.icp0.io";

const Missions: React.FC = () => {

    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { decryptSession } = useEncryption();
    const [principalId, setPrincipalId] = useState<Principal | null>(null);
    const [timerText, setTimerText] = useState<string>('00:00:00');
    const [missions, setMissions] = useState<SerializedMission[]>([]);
    const [userProgress, setUserProgress] = useState<Array<[bigint, SerializedProgress]> | null>(null);
    const { missionId } = useParams();
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [hovering, setHovering] = useState<boolean>(false);
    const { loadingPercentage, loadingComplete } = useLoadingProgress();
    const [loading, setLoading] = useState(false);

    const agent = new HttpAgent();
    const backendActor = Actor.createActor(backend_idlFactory, {
        agent,
        canisterId: backend_canisterId,
    });

    useEffect(() => {
        const session = decryptSession();
        if (session?.principalId) {
            const userPrincipal = session.principalId;
            setPrincipalId(userPrincipal);

            // Call the backend function getTotalSecondsForUser
            backendActor.getTotalSecondsForUser(userPrincipal)
                .then((result: unknown) => {
                    const typedResult = result as [bigint] | null;
                    if (typedResult && typedResult.length > 0) {
                        const totalSeconds = Number(typedResult[0]);
                        setTimerText(convertSecondsToHMS(totalSeconds));
                    } else {
                        setTimerText('00:00:00');
                    }
                })
                .catch(error => {
                    console.error("Error fetching total seconds:", error);
                });

            // Fetch all missions after getting total seconds
            backendActor.getAllMissions()
                .then((missionsData: SerializedMission[] | unknown) => {
                    if (Array.isArray(missionsData)) {
                        setMissions(missionsData);
                    } else {
                        console.error("Error fetching missions: Invalid data format");
                    }
                })
                .catch(error => {
                    console.error("Error fetching missions:", error);
                });

            // Fetch user progress
            backendActor.getUserProgress(userPrincipal)
                .then((progressData) => {
                    if (Array.isArray(progressData)) {
                        const validUserProgress: Array<[bigint, SerializedProgress]> = progressData
                            .map((entry) => {
                                if (Array.isArray(entry) && entry.length === 1) {
                                    const [innerEntry] = entry;
                                    const [missionId, progress] = innerEntry;

                                    if (typeof missionId === 'bigint' && typeof progress === 'object') {
                                        return [missionId, progress];
                                    }
                                }
                                return null;
                            })
                            .filter((item): item is [bigint, SerializedProgress] => item !== null);

                        setUserProgress(validUserProgress);
                    } else {
                        setUserProgress([]);  // Set empty array if no progress is returned
                    }
                })
                .catch(() => {
                    setUserProgress([]);  // Handle error by setting empty array
                })
                .finally(() => setLoading(false));

        } else {
            navigate('/');
        }
    }, [decryptSession, navigate]);

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

    // Click handler for mission cards
    const handleCardClick = (missionId: string, shouldDarken: boolean) => {
        if (!shouldDarken) {
            navigate(`/Missions/${missionId}`);
        }
    };

    // Close modal handler
    const closeModal = () => {
        navigate('/Missions');
    };


    if (!loadingComplete) {
        return <LoadingOverlay loadingPercentage={loadingPercentage} />;
    }

    return (
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
                <OpenChat />
            )}

            <div className={styles.MissionGrid}>
                {missions.map((mission) => {
                    const missionId = BigInt(mission.id);
                    const missionCompleted = userProgress?.some(([id]) => id === missionId) ?? false;

                    let requiredMissionCompleted = true;
                    let requiredMissionTitle = '';

                    if (Array.isArray(mission.requiredPreviousMissionId) && mission.requiredPreviousMissionId.length > 0) {
                        const requiredMissionId = mission.requiredPreviousMissionId[0];
                        const requiredMission = missions.find(m => BigInt(m.id) === requiredMissionId);
                        requiredMissionTitle = requiredMission?.title ?? '';
                        requiredMissionCompleted = userProgress?.some(([id]) => id === requiredMissionId) ?? false;
                    }

                    const shouldDarken = !missionCompleted && !requiredMissionCompleted;
                    const formattedRequiredTitle = requiredMissionTitle.split(":")[1]?.trim() ?? '';

                    const tooltipText = shouldDarken
                        ? `You Must Complete the "${formattedRequiredTitle}" Mission before being able to complete this one`
                        : null;

                    return (
                        <div
                            key={mission.id.toString()}
                            className={`${styles.MissionCard} ${missionCompleted ? styles.CompletedMission : ''} ${shouldDarken ? styles.IncompleteMission : ''}`}
                            style={{ backgroundImage: `url(${BASE_URL}${mission.image})` }}
                            onClick={() => handleCardClick(mission.id.toString(), shouldDarken)} // Prevent click if mission is locked
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

                            {/* Smaller Circle */}
                            {missionCompleted || (!missionCompleted && shouldDarken) ? (
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

                            {/* White Circle for Incomplete Missions */}
                            {!missionCompleted && shouldDarken && (
                                <svg className={styles.SmallWhiteCircle} viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <circle cx="50" cy="50" r="50" fill="#ffffff" />
                                </svg>
                            )}

                            {/* Checkmark for Completed Missions */}
                            {missionCompleted && (
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
                    />
                )}
            </div>

        </div>
    );
};

export default Missions;
