// src/frontend/pages/UserDashboardPage/UserDashboardPage.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserDashboardPage.module.scss';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { SerializedMission, SerializedUserMissionProgress } from '../../../../../declarations/test_backend/test_backend.did.js';
import { constructRawIcpAssetUrl } from '../../../../../utils/utils.ts';
// You might want a simpler MissionListItem component here

interface DashboardMissionItem {
    missionId: bigint;
    missionData: SerializedMission;
    projectCanisterId: string;
    projectName: string;
    progressData?: SerializedUserMissionProgress; // Optional, for completed items might just need completion time
    completedTimestamp?: number; // Milliseconds
}

const UserDashboardPage: React.FC = () => {
    const {
        principalId,
        userGlobalProfile,
        projects,
        missions: allProjectsMissionsData,
        userProgress: globalUserProgress,
    } = useGlobalID();
    const navigate = useNavigate();

    const userPoints = userGlobalProfile?.deducedPoints ? Number(userGlobalProfile.deducedPoints) : 0;

    const { inProgressMissions, recentlyCompletedMissions } = useMemo(() => {
        const inProgress: DashboardMissionItem[] = [];
        const completed: DashboardMissionItem[] = [];

        if (!principalId) return { inProgressMissions: [], recentlyCompletedMissions: [] };

        globalUserProgress.forEach((projectMissionsProgress, projectCid) => {
            const projectInfo = projects.find(p => p.canisterId === projectCid);
            const missionsForThisProject = allProjectsMissionsData.get(projectCid);

            if (!projectInfo || !missionsForThisProject) return;

            projectMissionsProgress.forEach((progress, missionId) => {
                const missionData = missionsForThisProject.get(missionId);
                if (!missionData) return;

                const dashboardItemBase = {
                    missionId,
                    missionData,
                    projectCanisterId: projectCid,
                    projectName: projectInfo.name,
                    progressData: progress,
                };

                if (progress.overallStatus.hasOwnProperty('InProgress')) {
                    inProgress.push(dashboardItemBase);
                } else if (progress.overallStatus.hasOwnProperty('CompletedSuccess') && progress.completionTime?.[0]) {
                    completed.push({
                        ...dashboardItemBase,
                        completedTimestamp: Number(progress.completionTime[0]) / 1_000_000 // Convert ns to ms
                    });
                }
            });
        });

        // Sort completed missions by completion time, newest first
        completed.sort((a, b) => (b.completedTimestamp || 0) - (a.completedTimestamp || 0));

        return {
            inProgressMissions: inProgress,
            recentlyCompletedMissions: completed.slice(0, 10), // Show last 10 completed
        };
    }, [principalId, projects, allProjectsMissionsData, globalUserProgress]);

    const handleMissionClick = (projectCanisterId: string, missionId: bigint, missionName: string) => {
        const missionSlug = missionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'mission';
        const projectSlug = projects.find(p => p.canisterId === projectCanisterId)?.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'project';
        navigate(`/project/${projectCanisterId}/${projectSlug}/mission/${missionId.toString()}/${missionSlug}`);
    };

    if (!principalId) {
        // Or a more user-friendly "Please log in to see your dashboard"
        navigate('/konnect'); // Redirect if not logged in
        return null;
    }

    return (
        <div className={styles.dashboardPage}>
            <header className={styles.dashboardHeader}>
                <h1>My Progress</h1>
                <div className={styles.pointsDisplay} aria-label={`Total points: ${userPoints.toLocaleString()}`}>
                    🌟 {userPoints.toLocaleString()} Points
                </div>
            </header>

            <section className={styles.dashboardSection}>
                <h2>In Progress Missions ({inProgressMissions.length})</h2>
                {inProgressMissions.length > 0 ? (
                    <ul className={styles.missionList}>
                        {inProgressMissions.map(item => (
                            <li key={`${item.projectCanisterId}-${item.missionId.toString()}`} className={styles.missionListItem}
                                onClick={() => handleMissionClick(item.projectCanisterId, item.missionId, item.missionData.name)}
                                role="button" tabIndex={0}
                                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMissionClick(item.projectCanisterId, item.missionId, item.missionData.name); }}
                                aria-label={`Continue mission: ${item.missionData.name} from project ${item.projectName}`}
                            >
                                <img src={item.missionData.iconUrl?.[0] ? constructRawIcpAssetUrl(item.missionData.iconUrl[0], item.projectCanisterId) : '/assets/KonectaIconPB.webp'} alt="" className={styles.missionItemIcon} />
                                <div className={styles.missionItemInfo}>
                                    <span className={styles.missionItemName}>{item.missionData.name}</span>
                                    <span className={styles.missionItemProject}>Project: {item.projectName}</span>
                                </div>
                                <span className={styles.missionItemAction}>&rarr;</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No missions currently in progress. Explore some projects and start a new quest!</p>
                )}
            </section>

            <section className={styles.dashboardSection}>
                <h2>Recently Completed Missions ({recentlyCompletedMissions.length})</h2>
                {recentlyCompletedMissions.length > 0 ? (
                    <ul className={styles.missionList}>
                        {recentlyCompletedMissions.map(item => (
                            <li key={`${item.projectCanisterId}-${item.missionId.toString()}`} className={styles.missionListItemCompleted}
                                onClick={() => handleMissionClick(item.projectCanisterId, item.missionId, item.missionData.name)}
                                role="button" tabIndex={0}
                                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMissionClick(item.projectCanisterId, item.missionId, item.missionData.name); }}
                                aria-label={`View details for completed mission: ${item.missionData.name} from project ${item.projectName}`}
                            >
                                <img src={item.missionData.iconUrl?.[0] ? constructRawIcpAssetUrl(item.missionData.iconUrl[0], item.projectCanisterId) : '/assets/KonectaIconPB.webp'} alt="" className={styles.missionItemIcon} />
                                <div className={styles.missionItemInfo}>
                                    <span className={styles.missionItemName}>{item.missionData.name}</span>
                                    <span className={styles.missionItemProject}>Project: {item.projectName}</span>
                                    {item.completedTimestamp && <span className={styles.missionItemDate}>Completed: {new Date(item.completedTimestamp).toLocaleDateString()}</span>}
                                </div>
                                <span className={styles.missionItemAction}>View &rarr;</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You haven't completed any missions recently. Time to achieve something new!</p>
                )}
            </section>
        </div>
    );
};

export default UserDashboardPage;