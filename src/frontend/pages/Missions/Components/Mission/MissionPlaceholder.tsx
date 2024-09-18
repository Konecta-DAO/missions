import React, { useEffect } from 'react';
import styles from '../../Missions.module.scss';
import { getGradientEndColor, getGradientStartColor } from '../../../../../utils/colorUtils.ts';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo Icon.svg';
import KamiPH from '../../../../../../public/assets/KamiCard.jpg';
const MissionPlaceholder: React.FC = () => {

    return (
        <div
            className={`${styles.MissionCardPH} 1`}
            style={{ backgroundImage: `url(${KamiPH})` }}
        >
            <div>
                {/* Mission Title */}
                <div className={styles.MissionTitleWrapper}>
                    <div className={styles.MissionTitle}>
                        Mission
                    </div>
                </div>
                <div className={styles.MissionBadge}>
                    {/* Gradient Circle */}
                    <svg className={styles.MissionCircle} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`circleGradient0`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={getGradientStartColor(0)} />
                                <stop offset="100%" stopColor={getGradientEndColor(0)} />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="50" fill={`url(#circleGradient0)`} />
                    </svg>
                    {/* Mission Icon */}
                    <img
                        src={KonectaLogo}
                        alt="Mission Icon"
                        className={styles.MissionIcon2}
                    />
                </div>
            </div>


            {/* Gradient Line */}
            <svg className={styles.MissionLine} viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`lineGradient0`} x1="0%" y1="0%" x2="100%">
                        <stop offset="0%" stopColor={getGradientStartColor(0)} />
                        <stop offset="100%" stopColor={getGradientEndColor(0)} />
                    </linearGradient>
                </defs>
                <path d="M 5 0 L 5 90 L 87 90 L 95 68 L 95 0" stroke={`url(#lineGradient0)`} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
            </svg>

        </div>
    );
};

export default MissionPlaceholder;
