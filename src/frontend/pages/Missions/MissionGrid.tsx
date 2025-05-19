import styles from './Missions.module.scss';
import Mission from './Components/Mission/Mission.tsx';
import { useEffect, useMemo, useState } from 'react';
import MissionModal from './Components/MissionModal/MissionModal.tsx';
import MissionModalDefault from './Components/MissionModal/MissionModalDefault.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import MissionDefault from './Components/Mission/MissionDefault.tsx';
import KonectaLogo from '../../../../public/assets/Konecta Logo Icon.svg';
import { SerializedMissionV2 as KonectaSerializedMission } from '../../../declarations/backend/backend.did.js';
import { SerializedMissionV2 as ProjectSerializedMission } from '../../../declarations/dfinity_backend/dfinity_backend.did.js';
import AccessOisyModal from './Components/AccessOisyModal/AccessOisyModal.tsx';

type AnyMission = KonectaSerializedMission | ProjectSerializedMission;

function isKonectaMission(
    mission: AnyMission
): mission is KonectaSerializedMission {
    return 'mintime' in mission && 'maxtime' in mission;
}

const ICTOOLKIT_PROJECT_NAME_LOWERCASE = 'ictoolkit';

const MissionGridComponent: React.FC = () => {
    const globalID = useGlobalID();
    const { projectSlug, missionSlug } = useParams<{ projectSlug?: string; missionSlug?: string }>();
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const [isOisyModalOpen, setIsOisyModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const navigate = useNavigate();

    const BASE_URL = process.env.DEV_IMG_CANISTER_ID;

    const filteredGlobalProjects = useMemo(() => {
        return globalID.projects.filter(
            p => p.name.toLowerCase() !== ICTOOLKIT_PROJECT_NAME_LOWERCASE
        );
    }, [globalID.projects]);

    const isOisyWalletValid = useMemo(() => globalID.walletLinkInfos.some(
        (info) =>
            info.walletType === 'Oisy' &&
            info.linkedPrincipal !== undefined &&
            info.linkedPrincipal.trim() !== ''
    ), [globalID.walletLinkInfos]);

    const project = useMemo(() => {
        if (!projectSlug) return null;
        const lowerCaseSlug = projectSlug.toLowerCase();

        if (lowerCaseSlug === ICTOOLKIT_PROJECT_NAME_LOWERCASE) { // Explicitly handle ICToolkit slug
            return null;
        }
        if (lowerCaseSlug === 'konecta') {
            return 'konecta';
        }
        // Find project in the filtered list
        return filteredGlobalProjects.find(
            (p) => p.name.toLowerCase() === lowerCaseSlug
        ) || null;
    }, [projectSlug, filteredGlobalProjects]);

    useEffect(() => {
        if (projectSlug) {
            const lowerCaseSlug = projectSlug.toLowerCase();

            if (lowerCaseSlug === ICTOOLKIT_PROJECT_NAME_LOWERCASE) {
                setSelectedProject(null);
                navigate('/'); // Redirect if ICToolkit slug is directly accessed
                return;
            }

            if (project === 'konecta') {
                setSelectedProject('konecta');
            } else if (project && typeof project === 'object') { // Project is a valid object from filteredGlobalProjects
                if (project.name.toLowerCase() === 'oisy') {
                    if (globalID.principalId != null && !isOisyWalletValid) {
                        setSelectedProject(null);
                        navigate('/'); // Oisy wallet invalid, redirect
                        return;
                    }
                }
                setSelectedProject(project.name);
            } else { // projectSlug exists, but `project` is null (e.g., invalid slug)
                setSelectedProject(null);
                navigate('/'); // Redirect for other invalid slugs
            }
        } else { // No projectSlug (e.g., root path)
            setSelectedProject(null);
        }
    }, [projectSlug, project, globalID.principalId, isOisyWalletValid, navigate]);

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

    const handleMissionClick = (mission: AnyMission, projectIdOrKonecta: string) => {
        const shortSlug = mission.title.split(' ').slice(0, 3)
            .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
            .join('-')
            .toLowerCase();
        const routeSlug = `${shortSlug}-${mission.id.toString()}`;

        if (isKonectaMission(mission) || projectIdOrKonecta === 'konecta') {
            navigate(`/konecta/${routeSlug}`);
        } else { // It's a project mission, projectIdOrKonecta is the project ID
            const projectObject = filteredGlobalProjects.find((p) => p.id === projectIdOrKonecta);
            if (projectObject) { // Found in filtered list, so it's not ICToolkit
                navigate(`/${projectObject.name}/${routeSlug}`);
            } else {
                // Fallback if project ID from mission isn't in filtered list (data inconsistency)
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

    const handleProjectSelection = (projectId: string | null) => {
        if (projectId === null) {
            setSelectedProject(null);
            navigate('/');
            return;
        } else if (selectedProject === projectId) {
            setSelectedProject(null);
            navigate('/');
        } else {
            setSelectedProject(projectId);
            navigate(`/${projectId}`);
        }
    };


    const openOisyModal = () => setIsOisyModalOpen(true);
    const closeOisyModal = () => setIsOisyModalOpen(false);

    const sortedProjects = useMemo(() => {
        const projectsToDisplay = [...filteredGlobalProjects]; // Use the filtered list
        const oisyProjectIndex = projectsToDisplay.findIndex(p => p.name.toLowerCase() === 'oisy');
        if (oisyProjectIndex > -1) { // Check if Oisy project exists
            const [oisyProject] = projectsToDisplay.splice(oisyProjectIndex, 1);
            return [oisyProject, ...projectsToDisplay];
        }
        return projectsToDisplay; // Return (potentially modified) list if Oisy wasn't found or already first
    }, [filteredGlobalProjects]);

    const displayedMissions: Array<{ mission: AnyMission; projectId: string }> = useMemo(() => {
        let missionsToSort: Array<{ mission: AnyMission; projectId: string }> = [];

        if (selectedProject === 'konecta') {
            missionsToSort = globalID.missions?.map(m => ({ mission: m, projectId: 'konecta' })) ?? [];
            missionsToSort.sort((a, b) => Number(a.mission.id) - Number(b.mission.id));
        } else if (selectedProject) { // A specific project is selected (and it's not ICToolkit)
            const projectObj = filteredGlobalProjects.find( // Find from the filtered list
                (p) => p.name.toLowerCase() === selectedProject.toLowerCase()
            );
            missionsToSort = projectObj
                ? (globalID.missionsMap[projectObj.id] ?? []).map(m => ({ mission: m, projectId: projectObj.id }))
                : [];
            missionsToSort.sort((a, b) => Number(a.mission.id) - Number(b.mission.id));
        } else { // "All" projects selected (selectedProject is null)
            const konectaMissionItems = globalID.missions?.map(m => ({ mission: m, projectId: 'konecta' })) ?? [];

            const allProjectMissionItems = Object.entries(globalID.missionsMap).flatMap(([projId, projectMissionsList]) => {
                // Check against original globalID.projects to identify ICToolkit by its ID for filtering
                const projectDetails = globalID.projects.find(p => p.id === projId);
                if (projectDetails && projectDetails.name.toLowerCase() === ICTOOLKIT_PROJECT_NAME_LOWERCASE) {
                    return []; // Exclude missions from ICToolkit
                }
                return projectMissionsList.map(m => ({ mission: m, projectId: projId }));
            });

            missionsToSort = [...konectaMissionItems, ...allProjectMissionItems];

            missionsToSort.sort((itemA, itemB) => {
                const aIsKonecta = itemA.projectId === 'konecta';
                const bIsKonecta = itemB.projectId === 'konecta';

                if (aIsKonecta && !bIsKonecta) return -1;
                if (!aIsKonecta && bIsKonecta) return 1;

                if (!aIsKonecta && !bIsKonecta) { // Both are non-Konecta project missions
                    // These lookups are on the original globalID.projects to get names for sorting.
                    // Missions from ICToolkit are already filtered out of missionsToSort.
                    const projectA_details = globalID.projects.find(p => p.id === itemA.projectId);
                    const projectB_details = globalID.projects.find(p => p.id === itemB.projectId);

                    // Fallback name 'zzzz' ensures undefined projects sort last if any slip through,
                    // though ICToolkit missions themselves are already excluded.
                    const projectAName = projectA_details ? projectA_details.name.toLowerCase() : 'zzzz';
                    const projectBName = projectB_details ? projectB_details.name.toLowerCase() : 'zzzz';

                    const aIsOisy = projectAName === 'oisy';
                    const bIsOisy = projectBName === 'oisy';

                    if (aIsOisy && !bIsOisy) return -1;
                    if (!aIsOisy && bIsOisy) return 1;

                    if (projectAName < projectBName) return -1;
                    if (projectAName > projectBName) return 1;
                }
                return Number(itemA.mission.id) - Number(itemB.mission.id); // Final sort by mission ID
            });
        }
        return missionsToSort;
    }, [selectedProject, globalID.missions, globalID.missionsMap, globalID.projects, filteredGlobalProjects]);

    return (
        <>
            <div className={styles.ButtonBar}>
                {isOisyModalOpen && <AccessOisyModal closeModal={closeOisyModal} />}
                {/* All Button */}
                <button
                    className={selectedProject === null ? styles.ButtonActiveMission : styles.ButtonMission}
                    onClick={() => handleProjectSelection(null)}
                >
                    All
                </button>
                {/* Konecta */}
                <button
                    className={selectedProject === 'konecta' ? styles.ButtonActiveMission : styles.ButtonMission}
                    onClick={() => handleProjectSelection('konecta')}
                >
                    <img src={KonectaLogo} alt="Konecta logo" className={styles.MissionIconB} />
                    Konecta
                </button>
                {/* Projects */}
                {sortedProjects.map((proj) => {
                    const isOisy = proj.name === "OISY";

                    return (
                        <button
                            key={proj.id}
                            className={`
                                ${selectedProject === proj.name ? styles.ButtonActiveMission : styles.ButtonMission}
                                ${isOisy && !isOisyWalletValid ? styles.ButtonOisyInvalid : ''}
                              `}
                            onClick={() => {
                                if (isOisy && !isOisyWalletValid) {
                                    openOisyModal();
                                } else {
                                    handleProjectSelection(proj.name);
                                }
                            }}
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
