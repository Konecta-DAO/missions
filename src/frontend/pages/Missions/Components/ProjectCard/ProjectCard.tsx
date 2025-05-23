import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProjectCard.module.scss';
import { SerializedProjectDetails } from '../../../../types.ts';
import { constructRawIcpAssetUrl } from '../../../../../utils/utils.ts';

const DEFAULT_BANNER_URL = '/assets/KBanner.webp';
const DEFAULT_ICON_URL = '/assets/KonectaIconPB.webp';

interface ProjectCardProps {
    projectDetails: SerializedProjectDetails;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ projectDetails }) => {
    const navigate = useNavigate();

    const {
        canisterId,
        name,
        description,
        iconUrl,
        bannerUrl,
        activeMissionsCount,
    } = projectDetails;

    const handleCardClick = () => {
        // Generate a simple slug from the project name for a nicer URL
        const projectSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        navigate(`/project/${canisterId}/${projectSlug}`);
    };

    const displayBannerUrl = bannerUrl && bannerUrl[0] && bannerUrl[0].trim() && canisterId
        ? constructRawIcpAssetUrl(bannerUrl[0], canisterId)
        : DEFAULT_BANNER_URL;

    const displayIconUrl = iconUrl && iconUrl[0] && iconUrl[0].trim() && canisterId
        ? constructRawIcpAssetUrl(iconUrl[0], canisterId)
        : DEFAULT_ICON_URL;

    // Simple description snippet
    const descriptionSnippet = description.substring(0, 80) + (description.length > 80 ? '...' : '');

    // Example: Placeholder for active mission count (this would need data passed down or fetched)
    // const activeMissionsCount = projectDetails.activeMissionsCount || 0;

    return (
        <div className={styles.projectCard} onClick={handleCardClick} role="link" tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}>
            <div className={styles.bannerArea}>
                <img src={displayBannerUrl} alt={`${name} banner`} className={styles.bannerImage} />
            </div>
            <div className={styles.contentArea}>
                <div className={styles.header}>
                    <img src={displayIconUrl} alt={`${name} icon`} className={styles.projectIcon} />
                    <h3 className={styles.projectName}>{name}</h3>
                </div>
                <p className={styles.projectDescription}>{descriptionSnippet}</p>
                <div className={styles.footer}>
                    {typeof activeMissionsCount === 'number' && (
                        <span className={styles.missionStats} aria-label={`${activeMissionsCount} active missions`}>
                            🚩 {activeMissionsCount} Active {activeMissionsCount === 1 ? 'Mission' : 'Missions'}
                        </span>
                    )}
                    <span className={styles.viewProjectLink}>View Project &rarr;</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;