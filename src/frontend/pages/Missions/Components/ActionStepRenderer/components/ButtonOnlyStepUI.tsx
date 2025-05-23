import React from 'react';
import styles from './StepUI.module.scss';

interface ButtonOnlyStepUIProps {
    description?: string;
    buttonText: string;
    onSubmitStep: () => void;
    isLoadingAction: boolean;
}

const ButtonOnlyStepUI: React.FC<ButtonOnlyStepUIProps> = ({
    description,
    buttonText,
    onSubmitStep,
    isLoadingAction,
}) => {
    return (
        <div className={styles.stepContainer}>
            {description && <p className={styles.stepDescription}>{description}</p>}
            <div className={styles.buttonContainer}>
                <button
                    onClick={onSubmitStep}
                    className={styles.actionButton}
                    disabled={isLoadingAction}
                >
                    {isLoadingAction ? 'Processing...' : buttonText}
                </button>
            </div>
        </div>
    );
};

export default ButtonOnlyStepUI;
