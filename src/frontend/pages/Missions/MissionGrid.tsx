import styles from './Missions.module.scss';
import { SerializedMission, SerializedProgress } from '../../../declarations/backend/backend.did.js';
import Mission from './Components/Mission/Mission.tsx';
import { useState } from 'react';
import MissionModal from './Components/MissionModal/MissionModal.tsx';
import { useNavigate } from 'react-router-dom';

interface MissionGridProps {
    globalID: {
        userProgress: Array<[bigint, SerializedProgress]> | null;
        missions: SerializedMission[];
    };
    handleCardClick: (id: string) => void;
}

const MissionGridComponent: React.FC<MissionGridProps> = ({ globalID, handleCardClick }) => {
    const [selectedMission, setSelectedMission] = useState<any | null>(null);
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const navigate = useNavigate();

    const handleMouseMove = (e: React.MouseEvent, content: string | null) => {
        const { clientX, clientY } = e;
        setTooltipContent(content);
        setTooltipPosition({ top: clientY + 10, left: clientX + 10 });
    };

    const handleMissionClick = (mission: any) => {
        setSelectedMission(mission);
        handleCardClick(mission.id);
    };

    const handleMouseLeave = () => {
        setTooltipContent(null);
        setTooltipPosition(null);
    };

    const closeModal = () => {
        setSelectedMission(null);
        navigate('/Missions');
    }

    return (
        <div className={styles.MissionGrid}>
            {globalID.missions.map((mission: any) => (
                <Mission
                    key={mission.id}
                    mission={mission}
                    globalID={globalID}
                    handleCardClick={() => handleMissionClick(mission)}
                    handleMouseMove={handleMouseMove}
                    handleMouseLeave={handleMouseLeave}
                />

            ))}
            {tooltipContent && tooltipPosition && (
                <div className={styles.Tooltip} style={{ top: tooltipPosition.top, left: tooltipPosition.left }}>
                    {tooltipContent}
                </div>
            )}

            {selectedMission && selectedMission.id && (
                <MissionModal
                    selectedMissionId={BigInt(selectedMission.id)}
                    closeModal={closeModal}
                    globalID={globalID}
                />

            )}
        </div>
    );
};

export default MissionGridComponent; 
