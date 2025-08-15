import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProjectViewPage.module.scss'; // Uses the SCSS above
import { useGlobalID } from '../../hooks/globalID.tsx';
import useFetchData from '../../hooks/fetchData.tsx';
import { SerializedProjectDetails } from '../types.ts';
import { SerializedMission } from '../../declarations/test_backend/test_backend.did.js';
import MissionGridComponent, { ProcessedMissionData } from '../pages/Missions/Components/MissionGridComponent/MissionGridComponent.tsx';
import MissionModal from '../pages/Missions/Components/MissionModal/MissionModal.tsx';
import { constructRawIcpAssetUrl } from '../../utils/utils.ts';

const DEFAULT_PROJECT_BANNER_URL = '/assets/KBanner.webp';
const DEFAULT_PROJECT_ICON_URL = '/assets/KonectaIconPB.webp';

type TabKey = 'missions' | 'about' | 'community';

type StatusFilter = "all" | "available" | "inProgress" | "completedByUser";
type RewardFilter = "all" | "points" | "icp" | "time" | "none";
type DateFilter = "all" | "endingSoon" | "newest" | "startingSoon";
type SortOption = "default" | "rewardAsc" | "rewardDesc" | "expiryDate" | "priority";

const ProjectViewPage: React.FC = () => {
    const { projectCanisterId: projectCIdFromUrl, missionId: missionIdFromUrl } = useParams<{
        projectCanisterId?: string;
        projectSlug?: string;
        missionId?: string;
        missionSlug?: string;
    }>();
    const navigate = useNavigate();
    const {
        projects,
        missions: allProjectMissionsData,
        userProgress: globalUserProgress,
        setActiveProjectCanisterId,
        principalId,
    } = useGlobalID();
    const { fetchSingleProjectDetailsAndSet, fetchUserProgressForProjectAndSet, fetchMissionsForProjectAndSet } = useFetchData();

    const [currentProjectDetails, setCurrentProjectDetails] = useState<SerializedProjectDetails | null | undefined>(undefined);
    const [isLoadingProject, setIsLoadingProject] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<TabKey>('missions');

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [rewardFilter, setRewardFilter] = useState<RewardFilter>("all");
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>("2025-01-01");
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const [selectedMissionForModal, setSelectedMissionForModal] = useState<SerializedMission | null>(null);
    const [selectedMissionIdForModal, setSelectedMissionIdForModal] = useState<bigint | null>(null);
    const [isMissionModalOpen, setIsMissionModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (projectCIdFromUrl) {
            setActiveProjectCanisterId(projectCIdFromUrl);
            const existingProject = projects.find(p => p.canisterId === projectCIdFromUrl);

            if (existingProject) {
                setCurrentProjectDetails(existingProject);
                setIsLoadingProject(false);
            } else {
                setIsLoadingProject(true);
                fetchSingleProjectDetailsAndSet(projectCIdFromUrl)
                    .then(details => setCurrentProjectDetails(details || null))
                    .catch(() => setCurrentProjectDetails(null))
                    .finally(() => setIsLoadingProject(false));
            }
        } else {
            setCurrentProjectDetails(null);
            setIsLoadingProject(false);
        }
        // Clean up active project ID (optional, based on desired UX)
        // return () => {
        //     if (activeProjectCanisterId === projectCIdFromUrl) {
        //         // setActiveProjectCanisterId(null);
        //     }
        // };
    }, [projectCIdFromUrl, projects, setActiveProjectCanisterId, fetchSingleProjectDetailsAndSet]);

    useEffect(() => {
        if (currentProjectDetails?.canisterId) {
            // Check if missions for this project are already loaded to avoid redundant fetches
            if (!allProjectMissionsData.has(currentProjectDetails.canisterId)) {
                fetchMissionsForProjectAndSet(currentProjectDetails.canisterId);
            }
        }
    }, [currentProjectDetails, allProjectMissionsData, fetchMissionsForProjectAndSet]);

    useEffect(() => {
        if (currentProjectDetails?.canisterId && principalId) {
            // Check if progress is already loaded or needs fetching
            if (!globalUserProgress.has(currentProjectDetails.canisterId)) {
                fetchUserProgressForProjectAndSet(currentProjectDetails.canisterId, principalId);
            }
        }
    }, [currentProjectDetails, principalId, fetchUserProgressForProjectAndSet, globalUserProgress]);

    useEffect(() => {
        if (missionIdFromUrl && currentProjectDetails?.canisterId) {
            const missionsOfCurrentProject = allProjectMissionsData.get(currentProjectDetails.canisterId);
            if (missionsOfCurrentProject) {
                let foundMission: SerializedMission | undefined;
                let foundMissionIdKey: bigint | undefined;
                for (const [idKey, missionData] of missionsOfCurrentProject.entries()) {
                    if (idKey.toString() === missionIdFromUrl) {
                        foundMission = missionData;
                        foundMissionIdKey = idKey;
                        break;
                    }
                }
                if (foundMission && foundMissionIdKey !== undefined) {
                    setSelectedMissionForModal(foundMission);
                    setSelectedMissionIdForModal(foundMissionIdKey);
                    setIsMissionModalOpen(true);
                } else {
                    setIsMissionModalOpen(false);
                    setSelectedMissionForModal(null);
                    setSelectedMissionIdForModal(null);
                    // Optionally navigate to base project URL if mission ID is invalid
                    // const projectSlug = currentProjectDetails.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    // navigate(`/project/${currentProjectDetails.canisterId}/${projectSlug}`, { replace: true });
                }
            }
        } else if (!missionIdFromUrl && isMissionModalOpen) {
            setIsMissionModalOpen(false);
            setSelectedMissionForModal(null);
            setSelectedMissionIdForModal(null);
        }
    }, [missionIdFromUrl, currentProjectDetails, allProjectMissionsData, navigate, isMissionModalOpen]);

    const formatMilliseconds = (ms: bigint | number): number => {
        let milliseconds = ms.toString();
        return Number(milliseconds.slice(0, -6));
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const handleCloseMissionModal = () => {
        setIsMissionModalOpen(false);
        setSelectedMissionForModal(null);
        setSelectedMissionIdForModal(null);
        if (currentProjectDetails) {
            const projectSlug = currentProjectDetails.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            navigate(`/project/${currentProjectDetails.canisterId}/${projectSlug}`, { replace: true });
        }
    };

    const missionCount = useMemo(() => {
        if (currentProjectDetails?.canisterId) {
            return allProjectMissionsData.get(currentProjectDetails.canisterId)?.size || 0;
        }
        return 0;
    }, [allProjectMissionsData, currentProjectDetails]);


    const processedAndFilteredMissions: ProcessedMissionData[] = useMemo(() => {
        if (!currentProjectDetails?.canisterId) return [];

        const projectMissionsMap = allProjectMissionsData.get(currentProjectDetails.canisterId);
        if (!projectMissionsMap) return [];

        const projectUserProgressMap = globalUserProgress.get(currentProjectDetails.canisterId);
        const nowSeconds = Date.now() / 1000;

        let processedList: ProcessedMissionData[] = Array.from(projectMissionsMap.entries()).map(
            ([id, missionData]) => {
                const userMissionProgress = projectUserProgressMap?.get(id);
                let isCompleted = false;
                let isInProgress = false;
                if (userMissionProgress?.overallStatus) {
                    if (userMissionProgress.overallStatus.hasOwnProperty('CompletedSuccess')) isCompleted = true;
                    else if (
                        !userMissionProgress.overallStatus.hasOwnProperty('NotStarted') &&
                        !userMissionProgress.overallStatus.hasOwnProperty('Abandoned') &&
                        !userMissionProgress.overallStatus.hasOwnProperty('CompletedFailure')
                    ) isInProgress = true;
                }

                let arePrerequisitesMet = true;
                if (missionData.requiredPreviousMissionId?.[0]?.length! > 0) {
                    arePrerequisitesMet = missionData.requiredPreviousMissionId[0]!.every(reqIdNat => {
                        const reqId = BigInt(reqIdNat);
                        const prereqProg = projectUserProgressMap?.get(reqId);
                        return prereqProg?.overallStatus.hasOwnProperty('CompletedSuccess') || false;
                    });
                }

                const startTimeSeconds = Number(missionData.startTime) / 1e9;
                const endTimeSeconds = missionData.endTime?.[0] ? Number(missionData.endTime[0]) / 1e9 : null;
                const timeStatus = {
                    isUpcoming: startTimeSeconds > nowSeconds,
                    isExpired: endTimeSeconds !== null && endTimeSeconds < nowSeconds,
                    startsInSeconds: startTimeSeconds > nowSeconds ? startTimeSeconds - nowSeconds : undefined,
                    endsInSeconds: endTimeSeconds !== null && endTimeSeconds > nowSeconds ? endTimeSeconds - nowSeconds : undefined,
                };
                const isBackendActive = missionData.status.hasOwnProperty('Active');

                return {
                    id, data: missionData, userStatus: { isCompleted, isInProgress, statusEnum: userMissionProgress?.overallStatus },
                    arePrerequisitesMet, timeStatus, isBackendActive // Add isBackendActive for filtering
                };
            }
        );

        // Apply Filters
        processedList = processedList.filter(pm => {
            // Status Filter
            if (statusFilter !== "all") {
                if (statusFilter === "completedByUser" && !pm.userStatus.isCompleted) return false;
                if (statusFilter === "inProgress" && !pm.userStatus.isInProgress) return false;
                if (statusFilter === "available") {
                    if (pm.userStatus.isCompleted || pm.userStatus.isInProgress || !pm.arePrerequisitesMet || pm.timeStatus.isUpcoming || pm.timeStatus.isExpired) {
                        return false;
                    }
                }
            }

            // Reward Filter
            if (rewardFilter !== "all") {
                if (rewardFilter === "points" && !pm.data.rewardType.hasOwnProperty('Points')) return false;
                if (rewardFilter === "icp" && !pm.data.rewardType.hasOwnProperty('ICPToken')) return false;
                if (rewardFilter === "time" && !pm.data.rewardType.hasOwnProperty('TIME')) return false;
                if (rewardFilter === "none" && !pm.data.rewardType.hasOwnProperty('None')) return false;
            }

            if (dateFilter !== "all") {
                const sevenDaysInSeconds = 7 * 24 * 60 * 60;
                if (dateFilter === "endingSoon") {
                    if (!pm.timeStatus.endsInSeconds || pm.timeStatus.endsInSeconds > sevenDaysInSeconds || pm.timeStatus.isExpired) return false;
                }
                if (dateFilter === "startingSoon") {
                    if (!pm.timeStatus.startsInSeconds || pm.timeStatus.startsInSeconds > sevenDaysInSeconds || !pm.timeStatus.isUpcoming) return false;
                }
                // "newest" is primarily a sort, but if you want to filter for "added in last X days", you'd use pm.data.creationTime
                if (dateFilter === "newest") { // Example: missions created in the last 30 days
                    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
                    const creationTimeSeconds = Number(pm.data.creationTime) / 1e9; // Assuming creationTime is nanoseconds
                    if ((nowSeconds - creationTimeSeconds) > thirtyDaysInSeconds) return false;
                }
            }

            if (selectedTags.length > 0) {
                const missionTags = pm.data.tags?.[0] || [];
                // For multi-select, check if all selectedTags are present (AND logic)
                // const hasAllSelectedTags = selectedTags.every(selTag => missionTags.includes(selTag));
                // For single-select from dropdown (as in UI example):
                const hasSelectedTag = missionTags.includes(selectedTags[0]);
                if (!hasSelectedTag) return false;
            }

            const missionDateFilter = new Date(formatMilliseconds(pm.data.startTime));

            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);

            if (startDateObj > missionDateFilter || missionDateFilter > endDateObj) {
                return false;
            }

            return true;
        });

        // Apply Sorting
        processedList.sort((a, b) => {
            switch (sortOption) {
                case "rewardAsc":
                    return Number(a.data.minRewardAmount) - Number(b.data.minRewardAmount);
                case "rewardDesc":
                    return Number(b.data.minRewardAmount) - Number(a.data.minRewardAmount);
                case "expiryDate": {
                    const endTimeA = a.timeStatus.isExpired ? Infinity : (a.data.endTime?.[0] ? Number(a.data.endTime[0]) : Infinity);
                    const endTimeB = b.timeStatus.isExpired ? Infinity : (b.data.endTime?.[0] ? Number(b.data.endTime[0]) : Infinity);
                    // Missions ending sooner come first. Missions without end time go last.
                    return endTimeA - endTimeB;
                }
                case "priority": { // Explicit priority sort
                    const priorityA = a.data.priority?.[0] ? Number(a.data.priority[0]) : Infinity;
                    const priorityB = b.data.priority?.[0] ? Number(b.data.priority[0]) : Infinity;
                    if (priorityA !== priorityB) return priorityA - priorityB;
                    return Number(a.id) - Number(b.id); // Fallback to ID
                }
                case "default":
                default: {
                    const priorityA = a.data.priority?.[0] ? Number(a.data.priority[0]) : Infinity;
                    const priorityB = b.data.priority?.[0] ? Number(b.data.priority[0]) : Infinity;
                    if (priorityA !== priorityB) return priorityA - priorityB;
                    return Number(a.id) - Number(b.id);
                }
            }
        });

        return processedList;

    }, [currentProjectDetails, allProjectMissionsData, globalUserProgress, statusFilter, rewardFilter, dateFilter, selectedTags, sortOption, startDate, endDate]);

    const shortTagline = useMemo(
        () =>
            currentProjectDetails
                ? currentProjectDetails.description.substring(0, 120) + (currentProjectDetails.description.length > 120 ? '…' : '')
                : '',
        [currentProjectDetails]
    );

    const availableTags: string[] = useMemo(() => {
        if (!currentProjectDetails?.canisterId) return [];
        const projectMissionsMap = allProjectMissionsData.get(currentProjectDetails.canisterId);
        if (!projectMissionsMap) return [];

        const tagsSet = new Set<string>();
        projectMissionsMap.forEach(mission => {
            mission.tags?.[0]?.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    }, [currentProjectDetails, allProjectMissionsData]);

    if (isLoadingProject || currentProjectDetails === undefined) {
        return <div className={styles.loadingPage}>Loading project details...</div>;
    }

    if (!currentProjectDetails) {
        return (
            <div className={styles.notFoundPage}>
                <h2>Project Not Found</h2>
                <button onClick={() => navigate('/')}>Back to All Projects</button>
            </div>
        );
    }

    const { name, description, iconUrl, bannerUrl, aboutInfo, contactInfo, canisterId } = currentProjectDetails;

    const displayBannerUrl = bannerUrl && bannerUrl[0] && bannerUrl[0].trim() && canisterId
        ? constructRawIcpAssetUrl(bannerUrl[0], canisterId)
        : DEFAULT_PROJECT_BANNER_URL;

    const displayIconUrl = iconUrl && iconUrl[0] && iconUrl[0].trim() && canisterId
        ? constructRawIcpAssetUrl(iconUrl[0], canisterId)
        : DEFAULT_PROJECT_ICON_URL;


    const renderTabContent = () => {
        switch (activeTab) {
            case 'missions':
                return (
                    <div className={styles.missionsTabContent}> {/* New wrapper for filters + grid */}
                        <div className={styles.missionFilters}>
                            {/* Status Filter */}
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} aria-label="Filter missions by status">
                                <option value="all">All Statuses</option>
                                <option value="available">Available</option>
                                <option value="inProgress">In Progress</option>
                                <option value="completedByUser">Completed by Me</option>
                            </select>

                            {/* Reward Type Filter */}
                            <select value={rewardFilter} onChange={e => setRewardFilter(e.target.value as RewardFilter)} aria-label="Filter missions by reward type">
                                <option value="all">All Rewards</option>
                                <option value="points">Points</option>
                                <option value="icp">ICP</option>
                                <option value="time">TIME</option>
                                <option value="none">No Reward</option>
                            </select>

                            {/*  Date Filter */}
                            <select value={dateFilter} onChange={e => setDateFilter(e.target.value as DateFilter)} aria-label="Filter missions by date">
                                <option value="all">All Dates</option>
                                <option value="newest">Newest First</option>
                                <option value="endingSoon">Ending Soon</option>
                                <option value="startingSoon">Starting Soon</option>
                            </select>

                            {/* Tag Filter */}
                            <select value={selectedTags[0] || "all"} onChange={e => setSelectedTags(e.target.value === "all" ? [] : [e.target.value])} aria-label="Filter missions by tag">
                                <option value="all">All Tags</option>
                                {availableTags.map(tag => ( // availableTags needs to be generated
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>

                            {/* Sort Option */}
                            <select value={sortOption} onChange={e => setSortOption(e.target.value as SortOption)} aria-label="Sort missions">
                                <option value="default">Default Order (Priority)</option>
                                <option value="rewardAsc">Reward: Low to High</option>
                                <option value="rewardDesc">Reward: High to Low</option>
                            </select>

                            {/* Start Date Range Filter */}
                            <div className={styles.datepickerToggle}>
                                <label htmlFor="startDateInput" className={styles.datepickerToggleButton}>
                                    From:
                                </label>
                                <span className={styles.datepickerDisplay}>{startDate}</span>
                                <input
                                    className={styles.dateInput}
                                    required
                                    id="startDateInput"
                                    type="date"
                                    min="2025-01-01"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    aria-label="Filter missions by start date"
                                />
                            </div>
                            <div className={styles.datepickerToggle}>
                                <label htmlFor="endDateInput" className={styles.datepickerToggleButton}>
                                    To:
                                </label>
                                <span className={styles.datepickerDisplay}>{endDate}</span>
                                <input
                                    className={styles.dateInput}
                                    required
                                    id="endDateInput"
                                    type="date"
                                    min="2025-01-01"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    aria-label="Filter missions by end date"
                                />
                            </div>
                        </div>
                        <div className={styles.missionsGridWrapper}> {/* Existing wrapper for scroll */}
                            <MissionGridComponent
                                projectCanisterId={currentProjectDetails!.canisterId} // currentProjectDetails is confirmed not null here
                                missionsToDisplay={processedAndFilteredMissions}
                            />
                        </div>
                    </div>
                );
            case 'about':
                return (
                    // Use a generic scrollable wrapper for about content
                    <div className={styles.genericScrollableContent}>
                        <h2>About {name}</h2>
                        <p className={styles.descriptionFull}>{description}</p>
                        {aboutInfo && aboutInfo.length > 0 && <div className={styles.aboutInfo}><p>{aboutInfo[0]}</p></div>}
                    </div>
                );
            case 'community':
                return (
                    // Use a generic scrollable wrapper for community content
                    <div className={styles.genericScrollableContent}>
                        <h2>Community & Links</h2>
                        <ul className={styles.contactList}>
                            {contactInfo.websiteUrl && contactInfo.websiteUrl.length > 0 && <li><a href={contactInfo.websiteUrl[0]} target="_blank" rel="noopener noreferrer">Website</a></li>}
                            {contactInfo.xAccountUrl && contactInfo.xAccountUrl.length > 0 && <li><a href={contactInfo.xAccountUrl[0]} target="_blank" rel="noopener noreferrer">X (Twitter)</a></li>}
                            {contactInfo.discordInviteUrl && contactInfo.discordInviteUrl.length > 0 && <li><a href={contactInfo.discordInviteUrl[0]} target="_blank" rel="noopener noreferrer">Discord</a></li>}
                            {contactInfo.telegramGroupUrl && contactInfo.telegramGroupUrl.length > 0 && <li><a href={contactInfo.telegramGroupUrl[0]} target="_blank" rel="noopener noreferrer">Telegram</a></li>}
                            {contactInfo.openChatUrl && contactInfo.openChatUrl.length > 0 && <li><a href={contactInfo.openChatUrl[0]} target="_blank" rel="noopener noreferrer">OpenChat</a></li>}
                            {contactInfo.emailContact && contactInfo.emailContact.length > 0 && <li><a href={`mailto:${contactInfo.emailContact[0]}`}>Email Contact</a></li>}
                            {contactInfo.otherLinks && contactInfo.otherLinks.length > 0 && contactInfo.otherLinks[0]?.map(link => (
                                link[1] && <li key={link[0]}><a href={link[1]} target="_blank" rel="noopener noreferrer">{link[0]}</a></li>
                            ))}
                        </ul>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.missionsContainerEquivalent}>
            <button className={styles.backButton} onClick={() => navigate('/')}>&larr; All Projects</button>
            <div className={styles.heroSection}>
                <img src={displayBannerUrl} alt={`${name} Banner`} className={styles.heroBanner} />
                <div className={styles.heroOverlayContent}>
                    <img src={displayIconUrl} alt={`${name} Icon`} className={styles.heroIcon} />
                    <div className={styles.heroText}>
                        <h1 className={styles.heroProjectName}>{name}</h1>
                        <p className={styles.heroTagline}>{shortTagline}</p>
                    </div>
                </div>
            </div>

            <nav className={styles.tabBar}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'missions' ? styles.active : ''}`}
                    onClick={() => setActiveTab('missions')}
                >
                    Missions ({missionCount})
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'about' ? styles.active : ''}`}
                    onClick={() => setActiveTab('about')}
                >
                    About
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'community' ? styles.active : ''}`}
                    onClick={() => setActiveTab('community')}
                >
                    Community
                </button>
            </nav>

            {/* This 'main' element becomes the .missionsBody: fixed height (flex-grow) and no scrollbar */}
            <main className={styles.missionsBody}>
                {/* If you were to add side panels like the original .OpenChatWrapper or .NFIDWrapper, they would go here,
                    alongside the renderTabContent() output. E.g.:
                <div className={styles.openChatWrapper}> Your OpenChat Content </div>
                */}
                {renderTabContent()}
            </main>

            {isMissionModalOpen && selectedMissionForModal && selectedMissionIdForModal && currentProjectDetails && (
                <MissionModal
                    mission={selectedMissionForModal}
                    missionId={selectedMissionIdForModal}
                    projectCanisterId={currentProjectDetails.canisterId}
                    closeModal={handleCloseMissionModal}
                />
            )}
        </div>
    );
};

export default ProjectViewPage;