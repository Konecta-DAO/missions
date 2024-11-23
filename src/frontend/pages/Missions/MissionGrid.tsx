import styles from './Missions.module.scss';
import Mission from './Components/Mission/Mission.tsx';
import { useEffect, useState } from 'react';
import MissionModal from './Components/MissionModal/MissionModal.tsx';
import MissionModalDefault from './Components/MissionModal/MissionModalDefault.tsx';
import { useNavigate } from 'react-router-dom';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import MissionDefault from './Components/Mission/MissionDefault.tsx';
import KonectaLogo from '../../../../public/assets/Konecta Logo Icon.svg';

interface MissionGridProps {
    handleCardClick: (id: string) => void;
}

const MissionGridComponent: React.FC<MissionGridProps> = ({ handleCardClick }) => {
    const globalID = useGlobalID();

    const [selectedMission, setSelectedMission] = useState<{ mission: any; isDefault: boolean; key?: string } | null>(null);
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const navigate = useNavigate();

    const BASE_URL = process.env.DEV_IMG_CANISTER_ID;

    const handleMouseMove = (e: React.MouseEvent, content: string | null) => {
        const { clientX, clientY } = e;
        setTooltipContent(content);
        setTooltipPosition({ top: clientY + 10, left: clientX + 10 });
    };

    const handleMissionClick = (mission: any, isDefault: boolean, missionKey?: string) => {
        setSelectedMission({ mission, isDefault, key: missionKey });
        handleCardClick(`${missionKey}-${mission.id}`);
    };

    const handleMouseLeave = () => {
        setTooltipContent(null);
        setTooltipPosition(null);
    };

    const closeModal = () => {
        setSelectedMission(null);
        navigate('/Missions');
    }

    const missionsFromMap = Object.entries(globalID.missionsMap || {}).flatMap(([key, missionsArray]) =>
        missionsArray.map(mission => ({ ...mission, key }))
    );

    const toggleProjectSelection = (projectId: string | null) => {
        setSelectedProject(prev => (prev === projectId ? null : projectId));
    };

    return (
        <>

            <div className={styles.ButtonBar}>
                {/* Konecta */}
                <button
                    className={selectedProject === 'konecta' ? styles.ButtonActiveMission : styles.ButtonMission}
                    onClick={() => toggleProjectSelection('konecta')}
                >
                    <img src={KonectaLogo} alt="Konecta logo" className={styles.MissionIconB} />
                    Konecta
                </button>
                {/* Projects */}
                {globalID.projects.map((project) => (
                    <button
                        key={project.id}
                        className={selectedProject === project.id ? styles.ButtonActiveMission : styles.ButtonMission}
                        onClick={() => toggleProjectSelection(project.id)}
                    >
                        <img src={'https://' + BASE_URL + '.raw.icp0.io' + project.icon} className={styles.MissionIconB} />
                        {project.name}
                    </button>
                ))}
            </div>
            <div className={styles.MissionGrid}>

                {/* Missions Bar */}

                {/* Konecta Missions */}
                {(selectedProject === 'konecta' || selectedProject === null) && globalID.missions?.length > 0 && (
                    globalID.missions
                        .sort((a: any, b: any) => Number(a.id) - Number(b.id))
                        .map((mission: any) => (
                            <Mission
                                key={`konecta-${mission.id.toString()}`}
                                mission={mission}
                                handleCardClick={() => handleMissionClick(mission, false)} // isDefault is false
                                handleMouseMove={handleMouseMove}
                                handleMouseLeave={handleMouseLeave}
                            />
                        ))
                )}
                {/* Project Missions */}
                {selectedProject !== 'konecta' && missionsFromMap?.length > 0 && (
                    missionsFromMap
                        .filter((mission: any) => selectedProject === null || mission.key === selectedProject)
                        .sort((a: any, b: any) => Number(a.id) - Number(b.id))
                        .map((mission: any) => (
                            <MissionDefault
                                key={`${mission.key}-${mission.id.toString()}`}
                                mission={mission}
                                canisterId={mission.key}
                                handleCardClick={() => handleMissionClick(mission, true)}
                                handleMouseMove={handleMouseMove}
                                handleMouseLeave={handleMouseLeave}
                            />
                        ))
                )}
                {/* Tooltip */}
                {tooltipContent && tooltipPosition && (
                    <div className={styles.Tooltip} style={{ top: tooltipPosition.top, left: tooltipPosition.left }}>
                        {tooltipContent}
                    </div>
                )}
                {/* Mission Modals */}
                {selectedMission && selectedMission.mission?.id !== undefined && (
                    selectedMission.isDefault ? (
                        <MissionModalDefault
                            selectedMissionId={BigInt(selectedMission.mission.id)}
                            canisterId={selectedMission.key!}
                            closeModal={closeModal}
                        />
                    ) : (
                        <MissionModal
                            selectedMissionId={BigInt(selectedMission.mission.id)}
                            closeModal={closeModal}
                        />
                    )
                )}
            </div>
        </>
    );
};

export default MissionGridComponent; 
