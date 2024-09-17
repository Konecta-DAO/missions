import React, { useState } from 'react';
import styles from './HistoryModalMobile.module.scss';
import { convertSecondsToHMS, formatDate } from '../../../../../components/Utilities.tsx';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { SerializedProgress } from '../../../../../declarations/backend_test/backend_test.did.js';
import TopImage from '../../../../../../public/assets/HistoryKamiBanner.png';
import { getGradientEndColor, getGradientStartColor } from '../../../../../utils/colorUtils.ts';

interface HistoryModalProps {
    closeModal: () => void;
}

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
        if (!userProgress) return <p>No Progress</p>;

        return (
            <>
                {userProgress?.map((nestedEntry, idx) => {
                    if (!Array.isArray(nestedEntry)) {
                        console.error("nestedEntry is not an array", nestedEntry);
                        return null;
                    }

                    return nestedEntry?.map((innerEntry: any, innerIdx: number) => {
                        if (Array.isArray(innerEntry) && innerEntry.length === 2) {
                            const missionId = innerEntry[0] as bigint;
                            const progress = innerEntry[1] as SerializedProgress;

                            const mission = globalID.missions.find(m => String(m.id) === String(missionId));
                            if (!mission) return null;

                            const formattedTitle = mission.title.split(":")[1]?.trim() || '';

                            return progress.completionHistory?.map((record, index) => (
                                <div key={`${missionId}-${index}`} className={styles.ProgressEntry}>
                                    <div className={styles.Row1}>
                                        <span className={styles.Title}>{formattedTitle}</span>
                                    </div>
                                    <div 
                                    className={styles.Row2}
                                    >
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
                            ));
                        } else {
                            console.error("Invalid structure in innerEntry", innerEntry);
                            return null;
                        }
                    });
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
