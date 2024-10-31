import styles from './Missions.module.scss';
import Mission from './Components/Mission/Mission.tsx';
import MissionNfid from './Components/Mission/MissionNfid.tsx';
import { useState } from 'react';
import MissionModal from './Components/MissionModal/MissionModal.tsx';
import MissionModalNfid from './Components/MissionModal/MissionModalNfid.tsx';
import { useNavigate } from 'react-router-dom';
import { useGlobalID } from '../../../hooks/globalID.tsx';

interface MissionGridProps {
    handleCardClick: (id: string) => void;
}

const MissionGridComponent: React.FC<MissionGridProps> = ({ handleCardClick }) => {
    const globalID = useGlobalID();
    const [selectedMission, setSelectedMission] = useState<any | null>(null);
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const navigate = useNavigate();

    const isNfid = globalID.nfid === true;

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

    const missionsToDisplay = isNfid ? globalID.missionsnfid : globalID.missions;

    const MissionComponent = isNfid ? MissionNfid : Mission;
    const MissionModalComponent = isNfid ? MissionModalNfid : MissionModal;

    return (
        <div className={styles.MissionGrid}>
            {missionsToDisplay
                ?.sort((a: any, b: any) => Number(a.id) - Number(b.id))
                .map((mission: any) => (
                    <MissionComponent
                        key={mission.id}
                        mission={mission}
                        handleCardClick={() => handleMissionClick(mission)}
                        handleMouseMove={handleMouseMove}
                        handleMouseLeave={handleMouseLeave}
                    />
                ))
            }
            {tooltipContent && tooltipPosition && (
                <div className={styles.Tooltip} style={{ top: tooltipPosition.top, left: tooltipPosition.left }}>
                    {tooltipContent}
                </div>
            )}

            {selectedMission && selectedMission?.id !== undefined && (
                <MissionModalComponent
                    selectedMissionId={BigInt(selectedMission.id)}
                    closeModal={closeModal}
                />
            )}
        </div>
    );
};

export default MissionGridComponent; 
