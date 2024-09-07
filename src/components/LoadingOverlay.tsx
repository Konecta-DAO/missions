import React from 'react';
import TimeCapsule from '../../public/assets/Time Capsule.svg'; // Adjust the path accordingly
import styles from './LoadingOverlay.module.scss'; // Add the appropriate path for the styles

interface LoadingOverlayProps {
    loadingPercentage: number; // Optional loading percentage
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loadingPercentage }) => {
    return (
        <div className={styles.LoadingOverlay}>
            <div className={styles.TimeCapsuleWrapper}>
                <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                {loadingPercentage !== undefined && (
                    <div className={styles.LoadingText}>{loadingPercentage}%</div>
                )}
            </div>  
        </div>
    );
};

export default LoadingOverlay;
