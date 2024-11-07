import React, { useState } from 'react';
import styles from './HistoryModalMobile.module.scss';
import { convertSecondsToHMS, formatDate } from '../../../../../components/Utilities.tsx';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { SerializedProgress, SerializedUserStreak, SerializedMission, SerializedMissionRecord } from '../../../../../declarations/backend/backend.did.js';
import TopImage from '../../../../../../public/assets/HistoryKamiBanner.webp';
import { getGradientEndColor, getGradientStartColor } from '../../../../../utils/colorUtils.ts';

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

type AllEntry = MissionEntry | StreakEntry;

const HistoryModalMobile: React.FC<HistoryModalProps> = ({ closeModal }) => {
    const globalID = useGlobalID();
    const [isClosing, setIsClosing] = useState(false);

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    const renderProgress = () => {
        const userProgress = globalID.userProgress;
        const totalUserStreak = globalID.totalUserStreak; // Access the totalUserStreak

        const allEntries: AllEntry[] = [];

        // Process mission entries
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

        // Process streak entries
        if (totalUserStreak) {
            totalUserStreak.forEach(([timestamp, pointsEarned]) => {
                allEntries.push({
                    type: 'streak',
                    timestamp,
                    pointsEarned,
                });
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
                                <div className={styles.Row1}>
                                    <span className={styles.Title}>{formattedTitle}</span>
                                </div>
                                <div className={styles.Row2}>
                                    <div
                                        style={{
                                            background: `linear-gradient(135deg, ${getGradientStartColor(Number(mission.mode))}, ${getGradientEndColor(Number(mission.mode))})`,
                                        }}
                                        className={styles.PointsEarned}
                                    >
                                        +{convertSecondsToHMS(Number(record.pointsEarned))}
                                    </div>
                                    <span className={styles.Date}>{formatDate(record.timestamp)}</span>
                                </div>
                            </div>
                        );
                    } else if (entry.type === 'streak') {
                        const { timestamp, pointsEarned } = entry as StreakEntry;

                        return (
                            <div key={`streak-${timestamp}-${index}`} className={styles.ProgressEntry}>
                                <div className={styles.Row1}>
                                    <span className={styles.Title}>Claimed the Daily Streak</span>
                                </div>
                                <div className={styles.Row2}>
                                    <div
                                        style={{
                                            background: `linear-gradient(135deg, darkred, red)`,
                                        }}
                                        className={styles.PointsEarned}
                                    >
                                        +{convertSecondsToHMS(Number(pointsEarned))}
                                    </div>
                                    <span className={styles.Date}>{formatDate(timestamp)}</span>
                                </div>
                            </div>
                        );
                    } else {
                        return null; // Handle unexpected entry types
                    }
                })}
            </>
        );
    };

    return (
        <div className={styles.MobileModalOverlay}>
            <div className={`${styles.MobileModalContent} ${isClosing ? styles.hide : ''}`}>
                {/* Close Button (X) */}
                <button className={styles.CloseButton} onClick={handleCloseModal}>X</button>

                {/* Modal Title */}
                <div className={styles.ModalHeader}>
                    <h2 className={styles.ModalTitle}>Achievements</h2>
                </div>

                {/* Top Image */}
                <div className={styles.Achievements}>
                    <img src={TopImage} className={styles.TopImage} alt="Top Banner" />
                </div>

                {/* Progress List */}
                <div className={styles.ProgressList}>
                    {renderProgress()}
                </div>
            </div>
        </div>
    );
};

export default HistoryModalMobile;
