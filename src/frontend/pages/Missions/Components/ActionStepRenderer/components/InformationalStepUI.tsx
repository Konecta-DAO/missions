import React from 'react';
import styles from './StepUI.module.scss'; // A shared or specific SCSS file

interface InformationalStepUIProps {
    description?: string; // Already extracted [0] or handled as null
    onSubmitStep: () => void; // Called when "Continue" is clicked
    // isLoadingAction: boolean; // If the continue button should show loading (less common for pure info)
}

const InformationalStepUI: React.FC<InformationalStepUIProps> = ({
    description,
    onSubmitStep,
    // isLoadingAction
}) => {
    return (
        <div className={styles.stepContainer}>
            {description && <p className={styles.stepDescription}>{description}</p>}
            <div className={styles.buttonContainer}>
                <button
                    onClick={onSubmitStep}
                    className={styles.actionButton}
                // disabled={isLoadingAction}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default InformationalStepUI;
