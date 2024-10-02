import React, { useState } from 'react';
import styles from './HistoryModal.module.scss';
import { convertSecondsToHMS, formatDate } from '../../../../../components/Utilities.tsx';
import AchievementDesktop from '../../../../../../public/assets/Achievements_Desktop.png';
import { getGradientEndColor, getGradientStartColor } from '../../../../../utils/colorUtils.ts';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { SerializedMission, SerializedMissionRecord, SerializedProgress } from '../../../../../declarations/backend/backend.did.js';

interface HistoryModalProps {
    closeModal: () => void;
}

interface AllEntry {
    missionId: bigint;
    mission: SerializedMission;
    record: SerializedMissionRecord;
    formattedTitle: string;
}

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

    const renderProgress = () => {
        const userProgress = globalID.userProgress;
        if (!userProgress) return <p>No Progress</p>;

        const allEntries: AllEntry[] = [];

        // Flatten all progress entries into a single array
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
                            missionId,
                            mission,
                            record,
                            formattedTitle,
                        });
                    });
                }
            });
        });

        // Sort the flat array by timestamp (most recent first)
        allEntries.sort((a, b) => Number(b.record.timestamp) - Number(a.record.timestamp));

        // Render the sorted entries
        return (
            <>
                {allEntries.map((entry, index) => {
                    const { missionId, mission, record, formattedTitle } = entry;

                    return (
                        <div key={`${missionId}-${index}`} className={styles.ProgressEntry}>
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
