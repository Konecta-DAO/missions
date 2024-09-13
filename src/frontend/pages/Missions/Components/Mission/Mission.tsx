import React, { useEffect } from 'react';
import styles from '../../Missions.module.scss';
import { checkMissionCompletion, checkRequiredMissionCompletion, checkRecursiveMission } from '../../missionUtils.ts';
import { getGradientEndColor, getGradientStartColor } from '../../../../../utils/colorUtils.ts';
import { canisterId } from '../../../../../declarations/backend/index.js';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';

const Mission: React.FC<{
    mission: any,
    handleCardClick: (id: string) => void,
    handleMouseMove: (e: React.MouseEvent, content: string | null) => void,
    handleMouseLeave: () => void,

}> = ({ mission, handleCardClick, handleMouseMove, handleMouseLeave }) => {
    const globalID = useGlobalID();
    const BASE_URL = process.env.DFX_NETWORK === "local" ? process.env.DEV_IMG_CANISTER_ID : canisterId;
    const missionId = BigInt(mission.id);

    // Check if the current mission is completed
    const missionCompleted = checkMissionCompletion(globalID.userProgress, missionId);

    // Check if required previous mission is completed
    const { requiredMissionCompleted, requiredMissionTitle } = checkRequiredMissionCompletion(globalID, mission);

    // Check recursive mission logic
    const { isRecursiveMissionDarkened, countdownText } = checkRecursiveMission(mission, missionCompleted);

    // Determine mission availability and tooltip text
    const isAvailableMission = !missionCompleted && requiredMissionCompleted;
    const displayTooltip = !requiredMissionCompleted && !missionCompleted;
    const formattedRequiredTitle = requiredMissionTitle.split(":")[1]?.trim() ?? '';
    const tooltipText = displayTooltip
        ? `You Must Complete the "${formattedRequiredTitle}" Mission before being able to complete this one`
        : null;

    useEffect(() => {
        if (window.location.pathname === `/Missions/${mission.id}` && (missionCompleted || isAvailableMission)) {
            handleCardClick(mission.id.toString());
        }
    }, [mission.id]);

    // CSS class for mission status
    const missionClass = missionCompleted ? styles.CompletedMission : requiredMissionCompleted ? styles.AvailableMission : styles.IncompleteMission;

    return (
        <div
            className={`${styles.MissionCard} ${missionClass}`}
            style={{ backgroundImage: `url(https://${BASE_URL}.raw.icp0.io${mission.image})` }}
            onClick={() => {
                if (missionCompleted || isAvailableMission) {
                    handleCardClick(mission.id.toString());
                }
            }}

            onMouseMove={(e) => handleMouseMove(e, tooltipText)}
            onMouseLeave={handleMouseLeave}

        >
            
            {/* Mission Icon */}
            <img
                src={`https://${BASE_URL}.raw.icp0.io${mission.iconUrl}`}
                alt="Mission Icon"
                className={styles.MissionIcon}
            />
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
            {(missionCompleted || (!missionCompleted && !requiredMissionCompleted)) && (
                <svg className={styles.SmallMissionCircle} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`smallCircleGradient${mission.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={getGradientStartColor(Number(mission.mode))} />
                            <stop offset="100%" stopColor={getGradientEndColor(Number(mission.mode))} />
                        </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="50" fill={`url(#smallCircleGradient${mission.id})`} />
                </svg>
            )}


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
                <path d="M 5 0 L 5 90 L 87 90 L 95 68 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
            </svg>

            {/* Mission Title */}
            <div className={styles.MissionTitleWrapper}>
                <div className={styles.MissionTitle}>
                    {mission.title}
                </div>
            </div>

            {/* Darken Recursive Missions and Display Countdown */}
            {isRecursiveMissionDarkened && <div className={styles.RecursiveMissionOverlay}>{countdownText}</div>}


        </div>
    );
};

export default Mission;
