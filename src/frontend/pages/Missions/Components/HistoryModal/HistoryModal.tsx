import React, { useMemo, useState } from 'react';
import styles from './HistoryModal.module.scss';
import { convertSecondsToHMS, formatDate } from '../../../../../components/Utilities.tsx';
import AchievementDesktop from '../../../../../../public/assets/Achievements_Desktop.webp';
import { getGradientEndColor, getGradientStartColor } from '../../../../../utils/colorUtils.ts';
import { ProjectData, useGlobalID } from '../../../../../hooks/globalID.tsx';
import { SerializedMission, SerializedMissionRecord, SerializedProgress, SerializedUserStreak } from '../../../../../declarations/backend/backend.did.js';

interface HistoryModalProps {
    closeModal: () => void;
}

interface AllEntryBase {
    timestamp: bigint;
    pointsEarned: bigint;
}

interface MissionEntry extends AllEntryBase {
    type: 'mission';
    missionId: bigint;
    mission: SerializedMission;
    record: SerializedMissionRecord;
    formattedTitle: string;
}

interface StreakEntry extends AllEntryBase {
    type: 'streak';
}

interface MapEntry extends AllEntryBase {
    type: 'map';
    canisterID: string;
}


type AllEntry = MissionEntry | StreakEntry | MapEntry;
const HistoryModal: React.FC<HistoryModalProps> = ({ closeModal }) => {
    const globalID = useGlobalID();
    const [isClosing, setIsClosing] = useState(false);

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    const constructTweetUrl = (tweetId: string) => `https://twitter.com/i/web/status/${tweetId}`;

    const projectsMap = useMemo(() => {
        const map = new Map<string, ProjectData>();
        globalID.projects.forEach(project => {
            map.set(project.id, project);
        });
        return map;
    }, [globalID.projects]);

    const renderProgress = () => {
        const userProgress = globalID.userProgress;
        const totalUserStreak = globalID.totalUserStreak;
        const userProgressMap = globalID.userProgressMap;

        const allEntries: AllEntry[] = [];

        // Flatten all progress entries into a single array
        if (userProgress) {
            userProgress.forEach((nestedEntry) => {
                nestedEntry.forEach((innerEntry: any) => {
                    if (Array.isArray(innerEntry) && innerEntry.length === 2) {
                        const missionId = innerEntry[0] as bigint;
                        const progress = innerEntry[1] as SerializedProgress;

                        const mission = globalID.missions.find(m => String(m.id) === String(missionId));
                        if (!mission) {
                            return;
                        }

                        const requiredMissionTitle = mission.title || '';
                        const formattedTitle = requiredMissionTitle.split(":")[1]?.trim() || '';

                        progress.completionHistory.forEach((record) => {
                            allEntries.push({
                                type: 'mission',
                                timestamp: record.timestamp,
                                pointsEarned: record.pointsEarned,
                                missionId,
                                mission,
                                record,
                                formattedTitle,
                            });
                        });
                    }
                });
            });
        }

        if (totalUserStreak) {
            totalUserStreak.forEach(([timestamp, pointsEarned]) => {
                allEntries.push({
                    type: 'streak',
                    timestamp,
                    pointsEarned,
                });
            });
        }

        function isProgressElementTuple(element: any): element is [bigint, SerializedProgress] {
            return Array.isArray(element) && element.length === 2 && typeof element[0] === 'bigint';
        }

        function isProgressElementNested(element: any): element is [[bigint, SerializedProgress]] {
            return Array.isArray(element) && element.length === 1 && Array.isArray(element[0]) && element[0].length === 2 && typeof element[0][0] === 'bigint';
        }


        // Process userProgressMap
        if (userProgressMap) {
            Object.entries(userProgressMap).forEach(([key, progressArray]) => {
                if (progressArray && Array.isArray(progressArray)) {
                    progressArray.forEach((progressElement, progressIndex) => {

                        let timestamp: bigint;
                        let progress: SerializedProgress;

                        if (isProgressElementTuple(progressElement)) {
                            // Case 1: Direct tuple
                            [timestamp, progress] = progressElement;
                        }
                        else if (isProgressElementNested(progressElement)) {
                            // Case 2: Nested tuple
                            [timestamp, progress] = progressElement[0] as [bigint, SerializedProgress];
                        }
                        else {
                            console.warn(`Unexpected structure for progressElement at key "${key}", progressIndex ${progressIndex}:`, progressElement);
                            return; // Skip this element
                        }

                        if (progress && Array.isArray(progress.completionHistory)) {
                            progress.completionHistory.forEach((record: SerializedMissionRecord) => {
                                allEntries.push({
                                    type: 'map',
                                    timestamp: record.timestamp,
                                    pointsEarned: record.pointsEarned,
                                    canisterID: key, // Associate with canisterID
                                });
                            });
                        } else {
                            console.warn(`Missing or invalid completionHistory in userProgressMap for key "${key}", progressIndex ${progressIndex}.`, progress);
                        }
                    });
                } else {
                    console.warn(`Invalid progressArray for key "${key}":`, progressArray);
                }
            });
        }


        // Sort the flat array by timestamp (most recent first)
        allEntries.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        // Render the sorted entries
        return (
            <>
                {allEntries.map((entry, index) => {
                    if (entry.type === 'mission') {
                        const { missionId, mission, record, formattedTitle } = entry as MissionEntry;

                        return (
                            <div key={`mission-${missionId}-${index}`} className={styles.ProgressEntry}>
                                <div className={styles.EntryContent}>
                                    <h3>{formatDate(record.timestamp)}</h3>
                                    <p>Completed the mission: {formattedTitle}</p>
                                    {record.tweetId && record.tweetId.length > 0 && (
                                        <a
                                            href={constructTweetUrl(record.tweetId[0] ?? '')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.TweetLink}
                                        >
                                            {Number(mission.id) === 5 ? "Retweeted Tweet" : "Tweet"}
                                        </a>
                                    )}
                                </div>
                                <div
                                    className={styles.RightSection}
                                    style={{
                                        background: `linear-gradient(135deg, ${getGradientStartColor(
                                            Number(mission.mode)
                                        )}, ${getGradientEndColor(Number(mission.mode))})`,
                                    }}
                                >
                                    <div className={styles.PointsEarned}>
                                        +{convertSecondsToHMS(Number(record.pointsEarned))}
                                    </div>
                                </div>
                            </div>
                        );
                    } else if (entry.type === 'streak') {
                        const { timestamp, pointsEarned } = entry as StreakEntry;

                        return (
                            <div key={`streak-${timestamp}-${index}`} className={styles.ProgressEntry}>
                                <div className={styles.EntryContent}>
                                    <h3>{formatDate(timestamp)}</h3>
                                    <p>Claimed the Daily Streak</p>
                                </div>
                                <div
                                    className={styles.RightSection}
                                    style={{
                                        background: `linear-gradient(135deg, darkred, red)`,
                                    }}
                                >
                                    <div className={styles.PointsEarned}>
                                        +{convertSecondsToHMS(Number(pointsEarned))}
                                    </div>
                                </div>
                            </div>
                        );
                    } else if (entry.type === 'map') {
                        const { timestamp, pointsEarned, canisterID } = entry as MapEntry;

                        // Retrieve the mission title from missionsMap using canisterID
                        const missions = globalID.missionsMap[canisterID];
                        const missionTitle = missions && missions.length > 0 ? missions[0].title : 'Unknown Mission';

                        // Retrieve the project name from projectsMap using canisterID
                        const project = projectsMap.get(canisterID);
                        const projectName = project ? project.name : 'Unknown Project';

                        return (
                            <div key={`map-${timestamp}-${index}`} className={styles.ProgressEntry}>
                                <div className={styles.EntryContent}>
                                    <h3>{formatDate(timestamp)}</h3>
                                    <p>Completed the Mission: {missionTitle} ({projectName})</p>
                                </div>
                                <div
                                    className={styles.RightSection}
                                    style={{
                                        background: `linear-gradient(135deg, #4CAF50, #81C784)`,
                                    }}
                                >
                                    <div className={styles.PointsEarned}>
                                        +{pointsEarned.toString()} points
                                    </div>
                                </div>
                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </>
        );
    };

    return (
        <div className={styles.ModalOverlay}>
            <div className={`${styles.ModalContent} ${isClosing ? styles.hide : ''}`}>
                <button className={styles.CloseButton} onClick={handleCloseModal}>X</button>
                <div className={styles.Achievements}>
                    <h2>Achievements</h2>
                </div>
                <div className={styles.LeftSection}>
                    {renderProgress()}
                </div>
                <div className={styles.RightHexContainer}>
                    <div className={styles.Hexagon}>
                        <img src={AchievementDesktop} className={styles.Kamimage} alt="Cool Kami Picture" />
                    </div>
                </div>

                <svg style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    zIndex: -1
                }}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: "#3A77EF", stopOpacity: 1 }} />
                            <stop offset="25%" style={{ stopColor: "#33CBDA", stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: "#3A77EF", stopOpacity: 1 }} />
                            <stop offset="75%" style={{ stopColor: "#33CBDA", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "#3A77EF", stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path d="M 5 0 L 5 91 L 86 91 L 95 73 L 95 0"
                        style={{
                            stroke: 'url(#blue-gradient)',
                            strokeWidth: 8,
                            strokeLinejoin: 'round',
                            transform: 'translateY(0.3%)',
                            fill: 'none',
                            vectorEffect: 'non-scaling-stroke'
                        }} />
                </svg>
            </div>
        </div>
    );
};

export default HistoryModal;
