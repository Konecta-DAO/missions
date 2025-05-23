import React, { useEffect, useState, useMemo } from 'react';
import styles from './ProjectExplorerPage.module.scss';
import LoadingOverlay from '../../../../components/LoadingOverlay.tsx';
import { useGlobalID } from '../../../../hooks/globalID.tsx';
import useFetchData from '../../../../hooks/fetchData.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import { isMobileOnly, isTablet } from 'react-device-detect';
import { useMediaQuery } from 'react-responsive';
import TermsModal from '../Components/TermsModal/TermsModal.tsx';
import useLoadingProgress from '../../../../utils/useLoadingProgress.ts';
import ProjectCard from '../Components/ProjectCard/ProjectCard.tsx';
import { useNavigate } from 'react-router-dom';
import { SerializedMission } from '../../../../declarations/test_backend/test_backend.did.js';
import { SerializedProjectDetails } from '../../../types.ts';
// TopBar and its modals are now handled by MainLayout.tsx

type ProjectSortOption = "default" | "nameAsc" | "nameDesc" | "recentlyUpdated";
type ProjectFilterOption = "all" | "hasActiveMissions";

// Define a new type for the augmented project object
type AugmentedProject = SerializedProjectDetails & {
    activeMissionsCount: number;
};


const ProjectExplorerPage: React.FC = () => {
    const {
        principalId,
        projects,
        isLoadingProjects,
        missions: allProjectsMissionsData,
    } = useGlobalID();
    const navigate = useNavigate();
    const { identity, user } = useIdentityKit();
    const { fetchInitialPlatformData } = useFetchData();

    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
    const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });

    // Terms and Conditions state remains local to this page if it's specific here
    const [hasUserAcceptedTerms, setHasUserAcceptedTerms] = useState(true);
    const [isTermsModalVisible, setIsTermsModalVisible] = useState<boolean>(false);

    // State for Search, Filter, and Sort functionality
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeFilter, setActiveFilter] = useState<ProjectFilterOption>("all");
    const [activeSort, setActiveSort] = useState<ProjectSortOption>("default");

    const handleAcceptTerms = async () => {
        console.log("Terms accepted (placeholder)");
        setHasUserAcceptedTerms(true);
        setIsTermsModalVisible(false);
    };

    useEffect(() => {
        // Placeholder logic for checking/showing terms
        // Example: if (!userProfile?.termsAccepted) setIsTermsModalVisible(true);
    }, [/* userProfile */]);

    useEffect(() => {
        if (principalId && identity && user && user.principal.toText() !== '2vxsx-fae') {
            fetchInitialPlatformData(principalId);
        } else if (!identity || !user || user.principal.toText() === '2vxsx-fae') {
            navigate('/konnect');
        }
    }, [principalId, identity, user, fetchInitialPlatformData, navigate]);

    const getActiveMissionsCountForProject = (projectCanisterId: string): number => {
        const projectMissionsMap = allProjectsMissionsData.get(projectCanisterId);
        if (!projectMissionsMap) {
            return 0; // No missions loaded for this project yet
        }
        let activeCount = 0;
        projectMissionsMap.forEach((mission: SerializedMission) => {
            if (mission.status.hasOwnProperty('Active')) {
                const nowSeconds = Date.now() / 1000;
                const startTimeSeconds = Number(mission.startTime) / 1e9;
                const endTimeSeconds = mission.endTime?.[0] ? Number(mission.endTime[0]) / 1e9 : null;
                const isUpcoming = startTimeSeconds > nowSeconds;
                const isExpired = endTimeSeconds !== null && endTimeSeconds < nowSeconds;

                if (!isUpcoming && !isExpired) {
                    activeCount++;
                }
            }
        });
        return activeCount;
    };

    // Step 1: Augment projects with active mission count.
    const allProjects = useMemo<AugmentedProject[]>(() => {
        return projects.map(p => ({
            ...p,
            activeMissionsCount: getActiveMissionsCountForProject(p.canisterId),
        }));
    }, [projects, allProjectsMissionsData]);


    // Step 3: Implement Client-Side Filtering and Sorting Logic
    const displayedProjects = useMemo(() => {
        let filtered = [...allProjects]; // Start with a copy of all projects

        // 1. Apply Search Query
        if (searchQuery.trim() !== "") {
            const lowerSearchQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(lowerSearchQuery) ||
                project.description.toLowerCase().includes(lowerSearchQuery)
            );
        }

        // 2. Apply Filters
        if (activeFilter === "hasActiveMissions") {
            filtered = filtered.filter(project =>
                project.activeMissionsCount !== undefined && project.activeMissionsCount > 0
            );
        }
        // Add more filter logic here if you introduce other filter options

        // 3. Apply Sorting
        switch (activeSort) {
            case "nameAsc":
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "nameDesc":
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "recentlyUpdated":
                // Assumes 'lastUpdated' is a BigInt (nanoseconds) from the backend
                filtered.sort((a, b) => Number(b.lastUpdated - a.lastUpdated));
                break;
            case "default":
            default:
                // Keep original order or sort by canisterId as a stable default
                filtered.sort((a, b) => a.canisterId.localeCompare(b.canisterId));
                break;
        }

        return filtered;
    }, [allProjects, searchQuery, activeFilter, activeSort]);


    const { loadingPercentage: timedLoadingPercentage } = useLoadingProgress({ totalTime: 1000 });

    const renderContent = () => {
        if (isMobileOnly && isLandscape) {
            return (
                <div className={styles.MobileMessage}>
                    <p>Please rotate your device to portrait mode.</p>
                </div>
            );
        }

        const isMobileOrTabletPortrait = (isMobileOnly && isPortrait) || (isTablet && isPortrait);

        return (
            <div className={styles.pageContainer}>
                <div className={styles.projectsDisplayArea}>
                    <h1>Explore Projects</h1>

                    {/* Step 2: Create UI Elements for Search, Filter, and Sort */}
                    <div className={styles.controlsContainer}>
                        <div className={styles.searchBar}>
                            <input
                                type="text"
                                placeholder="Search projects by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search projects"
                            />
                        </div>
                        <div className={styles.filterSortControls}>
                            <select
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value as ProjectFilterOption)}
                                aria-label="Filter projects"
                                className={styles.filterSelect}
                            >
                                <option value="all">All Projects</option>
                                <option value="hasActiveMissions">Has Active Missions</option>
                                {/* Add other filter options here, e.g., by category if you add that data */}
                            </select>
                            <select
                                value={activeSort}
                                onChange={(e) => setActiveSort(e.target.value as ProjectSortOption)}
                                aria-label="Sort projects"
                                className={styles.sortSelect}
                            >
                                <option value="default">Default Order</option>
                                <option value="nameAsc">Name (A-Z)</option>
                                <option value="nameDesc">Name (Z-A)</option>
                                <option value="recentlyUpdated">Recently Updated</option>
                            </select>
                        </div>
                    </div>


                    {/* Step 4: Update the Rendering Logic */}
                    <div className={styles.projectGrid}>
                        {displayedProjects.map(project => {
                            // The activeMissionsCount is already part of the `project` object
                            return (
                                <ProjectCard
                                    key={project.canisterId}
                                    projectDetails={project} // Pass the whole augmented project object
                                />
                            );
                        })}
                    </div>

                    {/* Step 4: Update the empty state message too */}
                    {!displayedProjects.length && !isLoadingProjects && (
                        <p className={styles.NoProjectsMessage}>
                            {searchQuery || activeFilter !== "all"
                                ? "No projects match your current search/filter criteria."
                                : "No projects available to display."}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {isLoadingProjects && (
                <div className={styles.loadingOverlayWrapper}>
                    <LoadingOverlay loadingPercentage={timedLoadingPercentage} />
                </div>
            )}

            <TermsModal isVisible={isTermsModalVisible} onAccept={handleAcceptTerms} />

            {!isLoadingProjects && renderContent()}
        </>
    );
};

export default ProjectExplorerPage;