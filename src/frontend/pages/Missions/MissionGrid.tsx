import styles from './Missions.module.scss';
import Mission from './Components/Mission/Mission.tsx';
import { useEffect, useMemo, useState } from 'react';
import MissionModal from './Components/MissionModal/MissionModal.tsx';
import MissionModalDefault from './Components/MissionModal/MissionModalDefault.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import MissionDefault from './Components/Mission/MissionDefault.tsx';
import KonectaLogo from '../../../../public/assets/Konecta Logo Icon.svg';
import { SerializedMission as KonectaSerializedMission } from '../../../declarations/backend/backend.did.js';
import { SerializedMission as ProjectSerializedMission } from '../../../declarations/dfinity_backend/dfinity_backend.did.js';
import { Principal } from '@dfinity/principal';

type AnyMission = KonectaSerializedMission | ProjectSerializedMission;

function isKonectaMission(
    mission: AnyMission
): mission is KonectaSerializedMission {
    return 'mintime' in mission && 'maxtime' in mission;
}

function isProjectMission(
    mission: AnyMission
): mission is ProjectSerializedMission {
    return 'points' in mission;
}

const MissionGridComponent: React.FC = () => {
    const globalID = useGlobalID();
    const { projectSlug, missionSlug } = useParams<{ projectSlug?: string; missionSlug?: string }>();
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);

    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const navigate = useNavigate();

    const BASE_URL = process.env.DEV_IMG_CANISTER_ID;

    useEffect(() => {
        if (projectSlug) {
            if (projectSlug.toLowerCase() === 'konecta') {
                setSelectedProject('konecta');
            } else {
                const project = globalID.projects.find(
                    (p) => p.name.toLowerCase() === projectSlug.toLowerCase()
                );
                if (project) {
                    setSelectedProject(project.name);
                } else {
                    setSelectedProject(null);
                }
            }
        } else {
            setSelectedProject(null);
        }
    }, [projectSlug, globalID.projects]);

    const project = useMemo(() => {
        if (!projectSlug) return null;
        if (projectSlug.toLowerCase() === 'konecta') {
            return 'konecta';
        } else {
            // see if there's a matching project by name
            return globalID.projects.find(
                (p) => p.name.toLowerCase() === projectSlug.toLowerCase()
            ) || null;
        }
    }, [projectSlug, globalID.projects]);

    const parsedMissionId = useMemo(() => {
        if (!missionSlug) return null;

        // e.g. "my-mission-title-123" => we get "123"
        const match = missionSlug.match(/-(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
    }, [missionSlug]);

    const openMission = useMemo(() => {
        if (parsedMissionId == null) return null;
        // If we're on Konecta or if `project` is the literal string 'konecta'
        if (project === 'konecta' || project == null) {
            return globalID.missions?.find((m) => Number(m.id) === parsedMissionId) || null;
        }

        // Otherwise we look up the project’s canister ID, etc.
        if (project && typeof project !== 'string') {
            // The user has a real project object from globalID.projects
            // We'll find the mission in the missionsMap
            const canisterId = project.id;
            const missionsForThisProject = globalID.missionsMap[canisterId] || [];
            return missionsForThisProject.find((m) => Number(m.id) === parsedMissionId) || null;
        }

        return null;
    }, [project, parsedMissionId, globalID]);

    const handleMouseMove = (e: React.MouseEvent, content: string | null) => {
        const { clientX, clientY } = e;
        setTooltipContent(content);
        setTooltipPosition({ top: clientY + 10, left: clientX + 10 });
    };

    const handleMissionClick = (mission: AnyMission, projectId: string) => {
        const shortSlug = mission.title.split(' ').slice(0, 3)
            .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
            .join('-')
            .toLowerCase();

        const routeSlug = `${shortSlug}-${mission.id.toString()}`;

        if (isKonectaMission(mission)) {
            navigate(`/konecta/${routeSlug}`);
        } else {
            const proj = globalID.projects.find((p) => p.id === projectId);
            if (proj) {
                navigate(`/${proj.name}/${routeSlug}`);
            } else {
                navigate('/');
            }
        }
    };

    const handleMouseLeave = () => {
        setTooltipContent(null);
        setTooltipPosition(null);
    };

    const closeModal = () => {
        if (selectedProject === 'konecta') {
            navigate('/konecta');
        } else if (selectedProject) {
            navigate(`/${selectedProject}`);
        } else {
            navigate('/');
        }
    };

    const handleProjectSelection = (projectId: string) => {
        if (selectedProject === projectId) {
            // Deselect the project and navigate to the home page
            setSelectedProject(null);
            navigate('/');
        } else {
            // Select the project and navigate to its route
            setSelectedProject(projectId);
            navigate(`/${projectId}`);
        }
    };

    const displayedMissions: Array<{ mission: AnyMission; projectId: string }> = useMemo(() => {
        if (selectedProject === 'konecta') {
            return globalID.missions?.map(m => ({ mission: m, projectId: 'konecta' })) ?? [];
        } else if (selectedProject) {
            const projectObj = globalID.projects.find(
                (p) => p.name.toLowerCase() === selectedProject.toLowerCase()
            );
            if (projectObj) {
                return (globalID.missionsMap[projectObj.id] ?? []).map(m => ({ mission: m, projectId: projectObj.id }));
            }
            return [];
        } else {
            const allProjectMissions = Object.entries(globalID.missionsMap).flatMap(([projId, missions]) =>
                missions.map(m => ({ mission: m, projectId: projId }))
            );
            const konectaMissions = globalID.missions?.map(m => ({ mission: m, projectId: 'konecta' })) ?? [];
            return [...konectaMissions, ...allProjectMissions];
        }
    }, [selectedProject, globalID.missions, globalID.missionsMap, globalID.projects]);

    return (
        <>
            <div className={styles.ButtonBar}>
                {/* Konecta */}
                <button
                    className={selectedProject === 'konecta' ? styles.ButtonActiveMission : styles.ButtonMission}
                    onClick={() => handleProjectSelection('konecta')}
                >
                    <img src={KonectaLogo} alt="Konecta logo" className={styles.MissionIconB} />
                    Konecta
                </button>
                {/* Projects */}
                {globalID.projects.map((proj) => {
                    const isOisy = proj.name === "OISY";
                    const isOisyWalletValid = globalID.oisyWallet instanceof Principal;
                    return (
                        <button
                            key={proj.id}
                            className={selectedProject === proj.name ? styles.ButtonActiveMission : styles.ButtonMission}
                            onClick={() => {
                                if (isOisy && !isOisyWalletValid) {
                                    return;
                                }
                                handleProjectSelection(proj.name);
                            }}
                            disabled={isOisy && !isOisyWalletValid}
                        >
                            <img src={'https://' + BASE_URL + '.raw.icp0.io' + proj.icon} className={styles.MissionIconB} />
                            {proj.name}
                        </button>
                    );
                })}
            </div>
            <div className={styles.MissionGrid}>

                {/* Missions Bar */}

                {/* Konecta Missions */}
                {displayedMissions.map(({ mission, projectId }) => {
                    if (isKonectaMission(mission)) {

                        // Renders a "Konecta" mission card
                        return (
                            <Mission
                                key={`kon-${mission.id.toString()}`}
                                mission={mission}
                                handleCardClick={() => handleMissionClick(mission, 'konecta')}
                                handleMouseMove={handleMouseMove}
                                handleMouseLeave={handleMouseLeave}
                            />
                        );
                    } else {
                        // Renders a "project" mission card
                        return (
                            <MissionDefault
                                key={`proj-${projectId}-${mission.id.toString()}`}
                                mission={mission}
                                canisterId={projectId}
                                handleCardClick={() => handleMissionClick(mission, projectId)}
                                handleMouseMove={handleMouseMove}
                                handleMouseLeave={handleMouseLeave}
                            />
                        );
                    }
                })}
                {/* Tooltip */}
                {tooltipContent && tooltipPosition && (
                    <div className={styles.Tooltip} style={{ top: tooltipPosition.top, left: tooltipPosition.left }}>
                        {tooltipContent}
                    </div>
                )}
                {/* Mission Modals */}
                {openMission && (
                    isKonectaMission(openMission) ? (
                        <MissionModal
                            selectedMissionId={BigInt(openMission.id)}
                            closeModal={closeModal}
                        />
                    ) : (
                        // Otherwise it's a Project mission
                        <MissionModalDefault
                            selectedMissionId={BigInt(openMission.id)}
                            canisterId={
                                project && typeof project !== 'string'
                                    ? project.id
                                    : ''
                            }
                            closeModal={closeModal}
                        />
                    )
                )}
            </div>
        </>
    );
};

export default MissionGridComponent; 
