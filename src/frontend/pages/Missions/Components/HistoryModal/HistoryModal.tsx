// src/pages/ProjectExplorerPage/Components/HistoryModal/HistoryModal.tsx (or your path)

import React, { useMemo, useState } from 'react';
import styles from './HistoryModal.module.scss';
import { formatDate } from '../../../../../components/Utilities.tsx'; // Assuming formatDate takes bigint or number
import AchievementDesktop from '../../../../../../public/assets/Achievements_Desktop.webp'; // Static asset
// getGradientStartColor, getGradientEndColor are not used in this adapted version unless for points display

import IcpIcon from '../../../../../../public/assets/icp_logo.svg';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { SerializedMission } from '../../../../../declarations/test_backend/test_backend.did.js';
// import DiggyGoldIcon from '../../../../../../public/assets/DiggyCoin.webp'; // If still needed for specific project rewards

interface HistoryModalProps {
    closeModal: () => void;
}

interface HistoryEntryData {
    key: string; // For React list
    type: 'missionCompletion' | 'streakClaim';
    timestamp: bigint; // Nanoseconds for sorting
    projectName?: string;
    projectIconUrl?: string | null; // Optional from SerializedProjectDetails
    missionName?: string;
    rewardTextDisplay: string; // Formatted text e.g., "Earned 100 Points"
}

// Helper to determine reward text (simplified for Phase 1)
const getRewardText = (mission: SerializedMission | undefined): string => {
    if (!mission) return "Reward info unavailable";

    const minAmt = Number(mission.minRewardAmount);
    let displayAmount = minAmt.toString();

    if (mission.maxRewardAmount && mission.maxRewardAmount.length > 0 && Number(mission.maxRewardAmount[0]) > minAmt) {
        displayAmount = `${minAmt} - ${Number(mission.maxRewardAmount[0])}`;
    }

    if (mission.rewardType.hasOwnProperty('Points')) return `Earned ${displayAmount} Points`;
    if (mission.rewardType.hasOwnProperty('ICPToken')) {
        // For ICRC1, the amount is in base units (e8s for ICP).
        // You might want to format this (e.g., divide by 10**8 for ICP).
        const icpAmount = (minAmt / (10 ** 8)).toFixed(4); // Example formatting for ICP
        let icpDisplayAmount = icpAmount;
        if (mission.maxRewardAmount && mission.maxRewardAmount.length > 0 && Number(mission.maxRewardAmount[0]) > minAmt) {
            const maxIcpAmount = (Number(mission.maxRewardAmount[0]) / (10 ** 8)).toFixed(4);
            icpDisplayAmount = `${icpAmount} - ${maxIcpAmount}`;
        }
        return `Earned ${icpDisplayAmount} ICP`;
    }
    if (mission.rewardType.hasOwnProperty('TIME')) return `Earned ${displayAmount} TIME`; // Assuming TIME is a direct Nat value
    if (mission.rewardType.hasOwnProperty('None')) return `Completed (No direct reward)`;
    return 'Reward processed';
};


const HistoryModal: React.FC<HistoryModalProps> = ({ closeModal }) => {
    const {
        userProgress,       // New: Map<string, Map<Nat, SerializedUserMissionProgress>>
        projects,           // New: SerializedProjectDetails[] (includes canisterId)
        missions: allProjectMissions, // New: Map<string, Map<Nat, SerializedMission>>
        totalUserStreak,    // Old streak data - TODO: Update type and handling if this feature is kept
    } = useGlobalID();

    const [isClosing, setIsClosing] = useState(false);

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500); // Animation duration
    };

    // const constructTweetUrl = (tweetId: string) => `https://twitter.com/i/web/status/${tweetId}`; // Keep if tweet IDs are part of flowOutputs

    const BASE_ASSET_URL = process.env.REACT_APP_ASSETS_CANISTER_ID ? // Example for assets
        `https://${process.env.REACT_APP_ASSETS_CANISTER_ID}.raw.icp0.io` : '';


    const processedHistoryEntries = useMemo((): HistoryEntryData[] => {
        const allEntries: HistoryEntryData[] = [];

        // 1. Process Mission Completions from new userProgress structure
        if (userProgress) {
            userProgress.forEach((projectMissionsProgress, projectCanisterId) => {
                const projectDetails = projects.find(p => p.canisterId === projectCanisterId);
                const projectName = projectDetails ? projectDetails.name : `Project (${projectCanisterId.substring(0, 5)}...)`;
                const projectIconUrl = projectDetails?.iconUrl && projectDetails.iconUrl.length > 0 ? projectDetails.iconUrl[0] : null;

                const missionsForThisProject = allProjectMissions.get(projectCanisterId);

                projectMissionsProgress.forEach((missionProg, missionId) => {
                    // Check for actual completion based on status and completionTime
                    if (missionProg.overallStatus.hasOwnProperty('CompletedSuccess') &&
                        missionProg.completionTime && missionProg.completionTime.length > 0) {

                        const completionTs = BigInt(missionProg.completionTime[0]!); // Assuming Int from candid is bigint or number
                        const missionDetails = missionsForThisProject?.get(missionId);
                        const missionName = missionDetails ? missionDetails.name : `Mission ID ${missionId.toString()}`;
                        const rewardText = getRewardText(missionDetails);

                        allEntries.push({
                            key: `mission-${projectCanisterId}-${missionId.toString()}-${completionTs.toString()}`,
                            type: 'missionCompletion',
                            timestamp: completionTs,
                            projectName,
                            projectIconUrl,
                            missionName,
                            rewardTextDisplay: rewardText,
                        });
                    }
                });
            });
        }

        // 2. TODO: Process Streak Claims (if global streaks are kept and totalUserStreak is populated correctly)
        // This part needs to be adapted based on the new type and source of totalUserStreak
        // For example, if totalUserStreak becomes an array of { timestamp: bigint, pointsEarned: bigint, type: 'streak' }
        if (totalUserStreak && Array.isArray(totalUserStreak)) { // Assuming totalUserStreak is now an array like [{timestamp: bigint, points: bigint}]
            totalUserStreak.forEach((streakRecord: any, index: number) => { // Replace 'any' with actual new streak record type
                if (streakRecord.timestamp && streakRecord.pointsEarned) { // Basic check
                    allEntries.push({
                        key: `streak-${streakRecord.timestamp.toString()}-${index}`,
                        type: 'streakClaim',
                        timestamp: BigInt(streakRecord.timestamp), // Ensure it's bigint
                        rewardTextDisplay: `Claimed Daily Streak: +${streakRecord.pointsEarned.toString()} TIME/Points`, // Adjust text
                        // projectName and missionName would be undefined/null for streaks
                    });
                }
            });
        }

        // 3. Sort all entries by timestamp (most recent first)
        allEntries.sort((a, b) => {
            if (a.timestamp < b.timestamp) return 1;
            if (a.timestamp > b.timestamp) return -1;
            return 0;
        });

        return allEntries;

    }, [userProgress, projects, allProjectMissions, totalUserStreak]);


    const renderHistoryList = () => {
        if (processedHistoryEntries.length === 0) {
            return <p className={styles.NoHistory}>No history yet. Complete some missions!</p>;
        }

        return processedHistoryEntries.map((entry) => {
            // Use existing styles, but populate with new data structure
            return (
                <div key={entry.key} className={styles.ProgressEntry}>
                    <div className={styles.EntryContent}>
                        <h3>{formatDate(entry.timestamp)}</h3>
                        {entry.type === 'missionCompletion' && (
                            <p style={{ display: 'flex', alignItems: 'center' }}>
                                {entry.projectIconUrl &&
                                    <img
                                        src={entry.projectIconUrl.startsWith('http') ? entry.projectIconUrl : `${BASE_ASSET_URL}${entry.projectIconUrl}`}
                                        alt={`${entry.projectName} icon`}
                                        className={styles.ProjectIcon} // Use existing style
                                    />
                                }
                                Completed: <strong>{entry.missionName}</strong> ({entry.projectName})
                            </p>
                        )}
                        {entry.type === 'streakClaim' && (
                            <p>Claimed Daily Streak</p>
                        )}
                        <p className={styles.RewardText}>{entry.rewardTextDisplay}</p>
                        {/* Add TweetLink logic here if 'flowOutputs' for a mission contains a tweetId */}
                    </div>
                    <div
                        className={styles.RightSection}
                        // The gradient logic for points might be harder to replicate if mission.mode isn't directly available
                        // For Phase 1, we can use a generic style or a simplified one
                        style={{ background: 'linear-gradient(135deg, #555, #333)' }}
                    >
                        <div className={styles.PointsEarned}>
                            {/* This used to show points. Now it's part of rewardTextDisplay */}
                            {entry.type === 'missionCompletion' ? 'MISSION' : 'STREAK'}
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className={styles.ModalOverlay} onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
            <div className={`${styles.ModalContent} ${isClosing ? styles.hide : ''}`}>
                <button className={styles.CloseButton} onClick={handleCloseModal}>X</button>
                <div className={styles.Achievements}> {/* This title seems fixed */}
                    <h2>Achievements</h2>
                </div>
                <div className={styles.LeftSection}>
                    {renderHistoryList()}
                </div>
                <div className={styles.RightHexContainer}>
                    <div className={styles.Hexagon}>
                        <img src={AchievementDesktop} className={styles.Kamimage} alt="Achievements Visual" />
                    </div>
                </div>
                {/* The decorative SVG border - kept as is */}
                <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: -1 }}
                    viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="history-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: "#3A77EF", stopOpacity: 1 }} />
                            <stop offset="25%" style={{ stopColor: "#33CBDA", stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: "#3A77EF", stopOpacity: 1 }} />
                            <stop offset="75%" style={{ stopColor: "#33CBDA", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "#3A77EF", stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path d="M 5 0 L 5 91 L 86 91 L 95 73 L 95 0"
                        style={{
                            stroke: 'url(#history-blue-gradient)', strokeWidth: 8, strokeLinejoin: 'round',
                            transform: 'translateY(0.3%)', fill: 'none', vectorEffect: 'non-scaling-stroke'
                        }} />
                </svg>
            </div>
        </div>
    );
};

export default HistoryModal;