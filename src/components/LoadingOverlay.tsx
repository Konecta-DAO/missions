import React from 'react';
import TimeCapsule from '../../public/assets/Time Capsule.svg';
import styles from './LoadingOverlay.module.scss';

interface LoadingOverlayProps {
    loadingPercentage: number | string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loadingPercentage }) => {
    const isNumber = typeof loadingPercentage === 'number';

    return (
        <div className={styles.LoadingOverlay}>
            <div className={styles.TimeCapsuleWrapper}>
                <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                {loadingPercentage !== undefined && (
                    <div className={styles.LoadingText}>
                        {loadingPercentage}
                        {isNumber && '%'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;