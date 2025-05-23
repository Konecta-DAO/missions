import React, { useMemo } from 'react'; // Removed useEffect as it's no longer fetching its own list
import styles from './MissionGridComponent.module.scss';
import { useNavigate } from 'react-router-dom';
import MissionCard from '../MissionCard/MissionCard.tsx';
import { SerializedMission, UserOverallMissionStatus } from '../../../../../declarations/test_backend/test_backend.did.js';
import { constructRawIcpAssetUrl } from '../../../../../utils/utils.ts';

export const formatTimeDifference = (diffInSeconds: number): string => {
    if (diffInSeconds < 0) diffInSeconds = 0;

    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return "<1m";
};
export interface ProcessedMissionData {
    id: bigint;
    data: SerializedMission;
    userStatus: {
        isCompleted: boolean;
        isInProgress: boolean;
        statusEnum?: UserOverallMissionStatus;
    };
    arePrerequisitesMet: boolean;
    timeStatus: {
        isUpcoming: boolean;
        isExpired: boolean;
        startsInSeconds?: number;
        endsInSeconds?: number;
    };
}

interface MissionGridComponentProps {
    projectCanisterId: string | null;
    missionsToDisplay: ProcessedMissionData[]; // MODIFIED: Now accepts the processed list
    // onMissionCardClick is now handled directly by ProjectViewPage or passed through MissionGridComponent
}

const MissionGridComponent: React.FC<MissionGridComponentProps> = ({
    projectCanisterId,
    missionsToDisplay // Use this prop
}) => {
    const navigate = useNavigate();

    const handleMissionCardClick = (missionId: bigint, projId: string, missionName: string) => {
        const missionNameSlug = missionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'mission';
        navigate(`/project/${projId}/mission/${missionId.toString()}/${missionNameSlug}`);
    };

    if (!projectCanisterId) { // Should ideally not happen if ProjectViewPage manages this
        return <div className={styles.loadingMissions}>Project context is missing.</div>;
    }

    if (!missionsToDisplay || missionsToDisplay.length === 0) {
        return <div className={styles.noMissions}>No missions match your criteria or are available.</div>;
    }

    return (
        <div className={styles.missionGrid}>
            {missionsToDisplay.map(({ id, data, userStatus, arePrerequisitesMet, timeStatus }) => (
                <MissionCard
                    key={id.toString()}
                    missionId={id}
                    mission={data}
                    projectCanisterId={projectCanisterId} // Ensured not null by parent check
                    userStatus={userStatus}
                    arePrerequisitesMet={arePrerequisitesMet}
                    timeStatus={timeStatus}
                    onCardClick={handleMissionCardClick} // Pass the click handler
                    constructAssetUrl={constructRawIcpAssetUrl}
                    formatTimeDiff={formatTimeDifference}
                />
            ))}
        </div>
    );
};

export default MissionGridComponent;

// Create MissionGridComponent.utils.ts for helpers like formatTimeDifference
// if they are specific to this component's needs or shared by its children.
// export const formatTimeDifference = (diffInSeconds: number): string => { ... };