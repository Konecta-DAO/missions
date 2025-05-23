/* import React, { useEffect, useMemo, useState } from 'react';
import styles from '../../Missions.module.scss';
import { useLocation } from 'react-router-dom';
import { checkMissionCompletionDefault, checkRequiredMissionCompletionDefault } from '../../missionUtils.ts';
import { getGradientEndColor, getGradientStartColor } from '../../../../../utils/colorUtils.ts';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import type { SerializedMissionV2 } from '../../../../../declarations/oisy_backend/oisy_backend.did.js';
import IcpIcon from '../../../../../../public/assets/icp_logo.svg';
import DiggyGoldIcon from '../../../../../../public/assets/DiggyCoin.webp';


interface MissionProps {
    mission: SerializedMissionV2;
    handleCardClick: () => void;
    handleMouseMove: (e: React.MouseEvent, content: string | null) => void;
    handleMouseLeave: () => void;
    canisterId: string;
}

const MissionDefault: React.FC<MissionProps> = ({ mission, handleCardClick, handleMouseMove, handleMouseLeave, canisterId }) => {
    // Hooks are called unconditionally at the top level
    const location = useLocation();
    const globalID = useGlobalID();
    const BASE_URL = process.env.DEV_IMG_CANISTER_ID;

    const oisyProject = globalID.projects.find(
        (proj) => proj.name === 'OISY'
    );

    const diggyProject = globalID.projects.find(
        (proj) => proj.name === 'DIGGY'
    )

    const icToolkitProject = globalID.projects.find(
        (proj) => proj.name.toLowerCase() === 'ictoolkit'
    );

    const isOisyProject = oisyProject && oisyProject.id === canisterId;
    const isDiggyProject = diggyProject && diggyProject.id === canisterId;
    const isICToolkitProject = !!(icToolkitProject && icToolkitProject.id === canisterId);
    const isICToolkitMission7 = isICToolkitProject && mission.id === 7n;

    const isOisyWalletValid = useMemo(() => globalID.walletLinkInfos.some(
        (info) =>
            info.walletType === 'Oisy' &&
            info.linkedPrincipal !== undefined &&
            info.linkedPrincipal.trim() !== ''
    ), [globalID.walletLinkInfos]);

    // State to track remaining time in seconds
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [mission6CooldownTime, setMission6CooldownTime] = useState<number | null>(null);
    // Convert endDate from nanoseconds to milliseconds
    const endDateMs = Number(mission.endDate) !== 0 ? Number(mission.endDate) / 1_000_000 : 0;

    // Check mission statuses
    const missionCompleted = checkMissionCompletionDefault(
        globalID.userProgressMap,
        canisterId,
        mission
    );
    const { requiredMissionCompleted, requiredMissionTitle } =
        checkRequiredMissionCompletionDefault(globalID, canisterId, mission);

    const isMissionLocked =
        !requiredMissionCompleted ||
        (isOisyProject && !isOisyWalletValid);

    // Determine mission availability and tooltip text
    const isAvailableMission = !missionCompleted && requiredMissionCompleted && !isMissionLocked;



    let tooltipText: string | null = null;

    if (!requiredMissionCompleted && !missionCompleted) {
        tooltipText = `You Must Complete the "${requiredMissionTitle}" Mission before being able to complete this one.`;
    } else if (isOisyProject && !isOisyWalletValid) {
        tooltipText = 'You need to connect an Oisy Wallet to do this Mission!';
    }

    // Determine if the mission is recursive and completed
    const isRecursiveCompleted = mission.recursive && missionCompleted;

    // Define the countdown label based on mission.recursive
    const countdownLabel = mission.recursive
        ? 'This Mission will reset in'
        : 'This Mission ends in';

    let finalGradientStartColor: string;
    let finalGradientEndColor: string;

    if (isICToolkitProject) {
        finalGradientStartColor = '#651fff';
        finalGradientEndColor = '#b388ff';
    } else {
        finalGradientStartColor = getGradientStartColor(Number(mission.mode));
        finalGradientEndColor = getGradientEndColor(Number(mission.mode));
    }

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined = undefined;

        // Check if it's the specific mission (e.g., ID 6), is recursive, and is marked as completed.
        if (mission.id === 6n && mission.recursive && missionCompleted) {
            const progressListNested = globalID.userProgressMap?.[canisterId];
            let latestCompletionTimestamp: bigint | null = null;

            if (progressListNested) {
                progressListNested.forEach((progressList: any[] | null) => {
                    progressList?.forEach((entry: any[] | null) => {
                        if (Array.isArray(entry) && entry.length === 2) {
                            const [progressId, progressData] = entry;
                            if (progressId?.toString() === mission.id.toString() && progressData && Array.isArray(progressData.completionHistory)) {
                                progressData.completionHistory.forEach((record: any) => {
                                    if (record && record.timestamp != null) {
                                        try {
                                            const currentTimestamp = BigInt(record.timestamp);
                                            if (latestCompletionTimestamp === null || currentTimestamp > latestCompletionTimestamp) {
                                                latestCompletionTimestamp = currentTimestamp;
                                            }
                                        } catch (e) {
                                            console.error("Error converting timestamp to BigInt:", record.timestamp, e);
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            }

            if (latestCompletionTimestamp !== null) {
                const lastCompletionTimeMs = Number(latestCompletionTimestamp / 1_000_000n); // Nanoseconds to milliseconds
                const cooldownDurationMs = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
                const cooldownEndTimeMs = lastCompletionTimeMs + cooldownDurationMs;

                const updateCooldown = () => {
                    const nowMs = Date.now();
                    const diffSeconds = Math.floor((cooldownEndTimeMs - nowMs) / 1000);

                    if (diffSeconds <= 0) {
                        setMission6CooldownTime(null); // Cooldown finished
                        if (intervalId) clearInterval(intervalId);
                        // After cooldown, the mission should appear available.
                        // `missionCompleted` might still be true from the last cycle.
                        // `isRecursiveCompleted` would also be true.
                        // This leads to `styles.IncompleteMission` class, making it look available.
                    } else {
                        setMission6CooldownTime(diffSeconds);
                    }
                };

                updateCooldown(); // Initial call
                intervalId = setInterval(updateCooldown, 1000);
            } else {
                // No completion history found for this recursive mission, or timestamp issue
                setMission6CooldownTime(null);
            }
        } else {
            // Not mission 6, or not recursive, or not completed in the current check
            setMission6CooldownTime(null);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [mission.id, mission.recursive, missionCompleted, globalID.userProgressMap, canisterId]);

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

    // Effect for handling card click based on URL path
    useEffect(() => {
        if (location.pathname === `/Missions/${mission.id}` && (missionCompleted || isAvailableMission)) {
            // Prevent calling handleCardClick if already on the desired path
            handleCardClick();
        }
    }, [location.pathname]);

    // Early return if mission has ended or time hasn't started
    if (endDateMs > 0 && (remainingTime === null || remainingTime <= 0) && !(mission.id === 6n && mission6CooldownTime !== null && mission6CooldownTime > 0)) {
        return null;
    }

    let missionClass = styles.IncompleteMission;
    if (isRecursiveCompleted || (mission.id === 6n && mission6CooldownTime !== null)) {
        missionClass = styles.IncompleteMission; // Makes it look available or waiting
    } else if (missionCompleted) {
        missionClass = styles.CompletedMission;
    } else if (isAvailableMission) {
        missionClass = styles.AvailableMission;
    }

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

    return (
        <div
            className={`${styles.MissionCard} ${missionClass}`}
            style={{
                backgroundImage: `url(https://${BASE_URL}.raw.icp0.io${mission.image})`,
            }}
            onClick={() => {
                if (missionCompleted || isAvailableMission || (mission.id === 6n && mission6CooldownTime !== null)) {
                    handleCardClick();
                }
            }}
            onMouseMove={(e) => handleMouseMove(e, tooltipText)}
            onMouseLeave={handleMouseLeave}
        >
            <div>
               
                <div className={styles.MissionTitleWrapper}>
                    <div className={styles.MissionTitle}>{mission.title}</div>
                </div>
                <div className={styles.MissionBadge}>
                    
                    <svg
                        className={styles.MissionCircle}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient
                                id={`circleGradient${mission.id}`}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={finalGradientStartColor}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={finalGradientEndColor}
                                />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="50"
                            cy="50"
                            r="50"
                            fill={`url(#circleGradient${mission.id})`}
                        />
                    </svg>
                    
                    <img
                        src={`https://${BASE_URL}.raw.icp0.io${mission.iconUrl}`}
                        alt="Mission Icon"
                        className={styles.MissionIcon}
                    />
                </div>
            </div>

  
            {(missionCompleted || !requiredMissionCompleted || isMissionLocked) && !(mission.id === 6n && mission6CooldownTime !== null) && (
                <svg
                    className={styles.SmallMissionCircle}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient
                            id={`smallCircleGradient${mission.id}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor={finalGradientStartColor}
                            />
                            <stop
                                offset="100%"
                                stopColor={finalGradientEndColor}
                            />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="50"
                        cy="50"
                        r="50"
                        fill={`url(#smallCircleGradient${mission.id})`}
                    />
                </svg>
            )}

            
            {!missionCompleted && isMissionLocked && (
                <svg
                    className={styles.SmallWhiteCircle}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                    <g id="BLUR_LOCKED" transform="scale(0.0667)">
                        <g>
                            <path
                                fill="#FFFFFF"
                                d="M1120.4,1048.3h-8.1C1084,944.9,1000.1,870,901.1,870H598.9c-99,0-182.9,74.9-211.2,178.3h-8.1c-21,0-37.9,17-37.9,37.9v78.3c0,21,17,37.9,37.9,37.9h8.1c28.4,103.4,112.2,178.3,211.2,178.3h302.2c99,0,182.9-74.9,211.2-178.3h8.1c21,0,37.9-17,37.9-37.9v-78.3C1158.4,1065.3,1141.4,1048.3,1120.4,1048.3z M901.1,1247.8H598.9c-58.5,0-106.1-54.9-106.1-122.4c0-67.5,47.6-122.4,106.1-122.4h302.2c58.5,0,106.2,54.9,106.2,122.4S959.6,1247.8,901.1,1247.8z"
                            />
                            <path
                                fill="#FFFFFF"
                                d="M970.2,751.4V835c0,0.6,0,1.2,0,1.9h-63.8v-85.5c0-37.7-30.7-68.4-68.4-68.4h-53v153.9h-69.5V683H662c-37.7,0-68.4,30.7-68.4,68.4v85.5h-63.8c0-0.6,0-1.2,0-1.9v-83.6c0-73.1,59.2-132.2,132.2-132.2h176C911,619.2,970.2,678.4,970.2,751.4L970.2,751.4z"
                            />
                            <path
                                fill="#FFFFFF"
                                d="M805,1090.1c0,18.8-9.5,35.5-24,45.4v62.4c0,9.9-8,17.9-18,17.9h-26.2c-9.9,0-18-8-18-17.9v-62.4c-14.5-9.9-24-26.5-24-45.4c0-30.4,24.6-55,55-55S805,1059.7,805,1090.1L805,1090.1z"
                            />
                        </g>
                    </g>
                </svg>
            )}

            
            {missionCompleted && !isRecursiveCompleted && !(mission.id === 6n && mission6CooldownTime !== null) && (
                <svg
                    className={styles.Checkmark}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M5 13l4 4L19 7" />
                </svg>
            )}

            
            <svg
                className={styles.MissionLine}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient
                        id={`lineGradient${mission.id}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop
                            offset="0%"
                            stopColor={finalGradientStartColor}
                        />
                        <stop
                            offset="100%"
                            stopColor={finalGradientEndColor}
                        />
                    </linearGradient>
                </defs>
                <path
                    d="M 5 0 L 5 90 L 87 90 L 95 68 L 95 0"
                    stroke={`url(#lineGradient${mission.id})`}
                    strokeWidth="6"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    fill="none"
                />
            </svg>

            
            {missionCompleted && isICToolkitProject && mission.id === 6n && mission6CooldownTime === null ? (
                <div className={styles.MissionUnavailableText}>
                    Mission complete! Keep voting for more points.
                </div>
            ) : isRecursiveCompleted ? (
                <div className={styles.MissionUnavailableText}>
                    Mission will be available again when the timer ends
                </div>
            ) : null}

            
            <div className={styles.TimeDisplay}>
                {isDiggyProject ? (
                    <div className={styles.IcpDisplay}>
                        <img
                            src={DiggyGoldIcon}
                            alt="Gold Icon"
                            className={styles.IcpIcon}
                        />
                        {(Number(mission.points))} GOLD
                    </div>
                ) : mission.token ? (
                    <div className={styles.IcpDisplay}>
                        <img
                            src={IcpIcon}
                            alt="ICP Icon"
                            className={styles.IcpIcon}
                        />
                        {(Number(mission.points) / 10 ** 8)} ICP
                    </div>
                ) : (
                    `${Number(mission.points)} points`
                )}
            </div>


            
            {mission.id === 6n && mission6CooldownTime !== null && mission6CooldownTime > 0 ? (
                <div className={styles.CountdownDisplay}>
                    Resets in: {formatRemainingTime(mission6CooldownTime)}
                </div>
            ) : (endDateMs > 0 && remainingTime !== null && remainingTime > 0 && mission.recursive) ? (
                // Show general mission.endDate timer only if not overridden by Mission 6 cooldown
                <div className={styles.CountdownDisplay}>
                    {countdownLabel}: {formatRemainingTime(remainingTime)}
                </div>
            ) : null}
        </div>
    );
};

export default MissionDefault; */