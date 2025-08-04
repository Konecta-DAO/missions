import React, { useState, useEffect } from 'react';
import styles from './MissionCard.module.scss'; // Assuming SCSS is co-located or adjust path
import { RewardType, SerializedMission, UserOverallMissionStatus } from '../../../../../declarations/test_backend/test_backend.did.js'; // Adjust path if needed
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
// We'll use constructRawIcpAssetUrl and formatTimeDiff passed as props from MissionGridComponent

// Define a more specific type for the props MissionCard will receive
interface MissionCardProps {
    missionId: bigint;
    mission: SerializedMission;
    projectCanisterId: string;
    userStatus: { // Derived in MissionGridComponent
        isCompleted: boolean;
        isInProgress: boolean;
        statusEnum?: UserOverallMissionStatus; // Optional: raw status enum from progress
    };
    arePrerequisitesMet: boolean; // Derived in MissionGridComponent
    timeStatus: { // Derived in MissionGridComponent
        isUpcoming: boolean;
        isExpired: boolean;
        startsInSeconds?: number;
        endsInSeconds?: number;
    };
    onCardClick: (missionId: bigint, projectCanisterId: string, missionName: string) => void;
    constructAssetUrl: (assetPath: string, canisterId: string) => string;
    formatTimeDiff: (diffInSeconds: number) => string;
}

const MissionCard: React.FC<MissionCardProps> = ({
    mission,
    missionId,
    projectCanisterId,
    userStatus,
    arePrerequisitesMet,
    timeStatus,
    onCardClick,
    constructAssetUrl, // Use this utility
    formatTimeDiff,   // Use this utility
}) => {

    // 1. Determine Display Status Text, Card Classes, and CTA Text
    let displayStatusText = "Active";
    let cardClasses = [styles.missionCard]; // Base class
    let ctaText = "Start Mission";
    const isBackendMissionActive = mission.status.hasOwnProperty('Active');

    if (!arePrerequisitesMet) {
        displayStatusText = "Locked";
        cardClasses.push(styles.locked); // NEW SCSS class
        ctaText = "Locked";
    } else if (userStatus.isCompleted) {
        displayStatusText = "Completed";
        cardClasses.push(styles.userCompleted); // NEW SCSS class (distinct from overall mission 'completed' status)
        ctaText = "View Details";
    } else if (userStatus.isInProgress) {
        displayStatusText = "In Progress";
        cardClasses.push(styles.inProgress); // NEW SCSS class
        ctaText = "Continue";
    } else if (timeStatus.isUpcoming) {
        displayStatusText = `Starts in: ${formatTimeDiff(timeStatus.startsInSeconds || 0)}`;
        cardClasses.push(styles.upcoming); // NEW SCSS class
        ctaText = "View Details";
    } else if (timeStatus.isExpired) {
        displayStatusText = "Expired";
        cardClasses.push(styles.expired); // Use your existing .expired or a more specific one
        ctaText = "View Details";
    } else if (!isBackendMissionActive) { // If not Active (e.g., Draft, Paused by admin)
        if (mission.status.hasOwnProperty('Draft')) {
            displayStatusText = "Draft";
            cardClasses.push(styles.draft);
        } else if (mission.status.hasOwnProperty('Paused')) {
            displayStatusText = "Paused";
            cardClasses.push(styles.paused);
        } else if (mission.status.hasOwnProperty('Completed')) { // Overall mission FCFS completed
            displayStatusText = "Ended (Limit Reached)";
            cardClasses.push(styles.objectiveCompleted); // Differentiate from userCompleted
        }
        ctaText = "View Details";
    }
    // If it's 'Active' from backend and user hasn't interacted and prerequisites met, default text is already "Active" / "Start Mission"

    // 2. Prepare Asset URLs
    const missionIconUrl = mission.iconUrl?.[0]?.trim() && projectCanisterId
        ? constructAssetUrl(mission.iconUrl[0], projectCanisterId)
        : '/assets/KonectaIconPB.webp'; // Default icon

    const missionImageUrl = mission.imageUrl?.[0]?.trim() && projectCanisterId
        ? constructAssetUrl(mission.imageUrl[0], projectCanisterId)
        : '/assets/KBanner.webp'; // Default banner/background

    // 3. Prepare Reward Display
    const getRewardDisplay = (rewardType: RewardType, minAmount: bigint, maxAmountOpt?: bigint[]): string => {
        const minAmt = Number(minAmount);
        let displayAmount = minAmt.toLocaleString(); // Use toLocaleString for better number formatting

        if (maxAmountOpt && maxAmountOpt[0] && Number(maxAmountOpt[0]) > minAmt) {
            displayAmount = `${minAmt.toLocaleString()} - ${Number(maxAmountOpt[0]).toLocaleString()}`;
        }

        if (rewardType.hasOwnProperty('Points')) return `🪙 ${displayAmount} Points`;
        if (rewardType.hasOwnProperty('ICPToken')) return `💧 ${displayAmount} ICP`;
        if (rewardType.hasOwnProperty('TIME')) return `⏱️ ${displayAmount} TIME`; // Ensure you have a TIME icon
        if (rewardType.hasOwnProperty('None')) return 'No direct reward';
        return `${displayAmount} Reward`;
    };

    // 4. Click Handler
    const handleClick = () => {
        // Pass mission name for slug generation
        onCardClick(missionId, projectCanisterId, mission.name);
    };

    // 5. Description Snippet
    const descriptionSnippet = mission.description.substring(0, 80) + (mission.description.length > 80 ? '...' : '');

    const isInteractive = arePrerequisitesMet && !timeStatus.isExpired && !timeStatus.isUpcoming && isBackendMissionActive;

    // 6. Misc
    const { principalId } = useGlobalID();
    const { verifyUserIsAdmin } = useFetchData();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        verifyUserIsAdmin(projectCanisterId, principalId)
            .then((isAdmin) => {
                setIsAdmin(isAdmin);
            });
    }, []);

    return (
        <div
            className={cardClasses.join(' ')}
            onClick={isInteractive || userStatus.isCompleted || userStatus.isInProgress ? handleClick : undefined} // Allow click for in-progress/completed too
            style={missionImageUrl ? { backgroundImage: `url(${missionImageUrl})` } : {}}
            role={isInteractive || userStatus.isCompleted || userStatus.isInProgress ? "button" : "article"} // Role changes if not interactive
            tabIndex={isInteractive || userStatus.isCompleted || userStatus.isInProgress ? 0 : -1} // Not focusable if truly non-interactive
            aria-label={`Mission: ${mission.name}. Status: ${displayStatusText}. Reward: ${getRewardDisplay(mission.rewardType, mission.minRewardAmount, mission.maxRewardAmount)}.`}
            aria-disabled={!isInteractive && !userStatus.isCompleted && !userStatus.isInProgress}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && (isInteractive || userStatus.isCompleted || userStatus.isInProgress)) {
                    handleClick();
                }
            }}
        >
            <div className={styles.cardOverlay}> {/* Ensures text readability */}
                <div className={styles.header}>
                    <img src={missionIconUrl} alt="" className={styles.missionIcon} /> {/* Decorative, so alt="" is okay or mission.name + " icon" */}
                    <div className={styles.titleAndTags}>
                        <h3 className={styles.missionName}>{mission.name}</h3>
                        {mission.tags?.[0] && mission.tags[0].length > 0 && (
                            <div className={styles.tagsContainer}>
                                {mission.tags[0].slice(0, 2).map(tag => ( // Show max 2 tags
                                    <span key={tag} className={styles.tagPill}>{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    {mission.isRecursive && <span className={styles.recursiveIcon} title="Recursive Mission">🔄</span>}
                </div>

                <p className={styles.missionDescription}>{descriptionSnippet}</p>

                <div className={styles.footer}>
                    <span className={styles.rewardInfo}>
                        {getRewardDisplay(mission.rewardType, mission.minRewardAmount, mission.maxRewardAmount)}
                    </span>
                    <span className={`${styles.statusBadge} ${styles[displayStatusText.split(':')[0].toLowerCase().replace(/\s+/g, '') + 'Badge']}`}> {/* Generates class like .activeBadge, .lockedBadge */}
                        {displayStatusText}
                    </span>
                </div>
                {/* Display countdown for active missions with an end time */}
                {isBackendMissionActive && !timeStatus.isUpcoming && !timeStatus.isExpired && timeStatus.endsInSeconds !== undefined && (
                    <div className={styles.countdown}>
                        Ends in: {formatTimeDiff(timeStatus.endsInSeconds)}
                    </div>
                )}
                {/* Display "Completed by You" checkmark */}
                {userStatus.isCompleted && (
                    <div className={styles.userCompletedCheckmark} title="You've completed this mission!">✅</div>
                )}

                {/* Buttons */}
                {isAdmin ? (
                    <div className={styles.adminButtons}>
                        <button
                            className={styles.ctaButton}
                            onClick={(e) => { e.stopPropagation(); handleClick(); }} // Prevent card click if button handles it
                            disabled={!isInteractive && !userStatus.isCompleted && !userStatus.isInProgress} // Disable if locked, expired, upcoming unless completed/inProgress
                            aria-disabled={!isInteractive && !userStatus.isCompleted && !userStatus.isInProgress}
                        >
                            {ctaText}
                        </button>
                        <a href="https://3qzqh-pqaaa-aaaag-qnheq-cai.icp0.io/" target="_blank" rel="noopener noreferrer">
                            <button
                                className={styles.ctaButton}
                            >
                                Manage Mission
                            </button>
                        </a>
                    </div>
                ) : (
                    <button
                        className={styles.ctaButton}
                        onClick={(e) => { e.stopPropagation(); handleClick(); }} // Prevent card click if button handles it
                        disabled={!isInteractive && !userStatus.isCompleted && !userStatus.isInProgress} // Disable if locked, expired, upcoming unless completed/inProgress
                        aria-disabled={!isInteractive && !userStatus.isCompleted && !userStatus.isInProgress}
                    >
                        {ctaText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MissionCard;