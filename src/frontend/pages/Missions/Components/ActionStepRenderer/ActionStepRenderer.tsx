import React from 'react';
import styles from './ActionStepRenderer.module.scss'; // Create this SCSS file
import { ActionStep as ParsedActionStepType, UIInputFields } from '../../../../types.ts'; // Assuming ActionStep is your parsed type, UIInputFields for inputFields array
// You might need to import specific action definition types or parameter types if doing deep validation/rendering

interface ActionStepRendererProps {
    stepDefinition: ParsedActionStepType;
    userInput: Record<string, any>; // Current values of inputs for this step
    onUserInputChange: (key: string, value: any) => void;
    onSubmitStep: () => Promise<void>;
    isLoadingAction: boolean;
}

const ActionStepRenderer: React.FC<ActionStepRendererProps> = ({
    stepDefinition,
    userInput,
    onUserInputChange,
    onSubmitStep,
    isLoadingAction,
}) => {
    if (!stepDefinition || !stepDefinition.item) {
        return <p className={styles.errorMessage}>Error: Action step definition is missing or invalid.</p>;
    }

    const actionItem = stepDefinition.item;

    // Use a type guard to check for the 'ActionGroup' variant first.
    if ('ActionGroup' in actionItem) {
        return <p className={styles.errorMessage}>Error: Action groups not yet supported in this renderer.</p>;
    }

    // After the check above, TypeScript knows `actionItem` must have a `SingleAction` property.
    const singleAction = actionItem.SingleAction;

    if (!singleAction || !singleAction.uiInteraction) {
        return <p className={styles.errorMessage}>Error: Action UI interaction details are missing.</p>;
    }

    const uiInteraction = singleAction.uiInteraction;

    // Client-side validation (basic: check for required fields)
    let canSubmit = true;
    if (uiInteraction.hasOwnProperty('InputAndButton')) {
        const inputFields = (uiInteraction as { InputAndButton: { inputFields: UIInputFields[] } }).InputAndButton.inputFields;
        for (const field of inputFields) {
            if (field.isRequired && (userInput[field.keyForUserInput] === undefined || userInput[field.keyForUserInput] === '')) {
                canSubmit = false;
                break;
            }
            // Add more specific validation here based on field.dataType if available from ActionParameterDefinition
        }
    }

    const renderStepContent = () => {
        if (uiInteraction.hasOwnProperty('Informational')) {
            return (
                <div className={styles.informationalContent}>
                    {/* Display stepDefinition.description or other informational text */}
                    <p>{stepDefinition.description?.[0] || "Please review the information above."}</p>
                    {/* Informational steps might auto-proceed or have a simple "Continue" button */}
                    <button onClick={onSubmitStep} disabled={isLoadingAction} className={styles.actionButton}>
                        {isLoadingAction ? "Processing..." : "Continue"}
                    </button>
                </div>
            );
        }

        if (uiInteraction.hasOwnProperty('ButtonOnly')) {
            const buttonText = (uiInteraction as { ButtonOnly: { buttonText: string } }).ButtonOnly.buttonText;
            return (
                <button onClick={onSubmitStep} disabled={isLoadingAction} className={styles.actionButton}>
                    {isLoadingAction ? "Processing..." : buttonText}
                </button>
            );
        }

        if (uiInteraction.hasOwnProperty('InputAndButton')) {
            const { inputFields, buttonText } = (uiInteraction as { InputAndButton: { inputFields: UIInputFields[], buttonText: string } }).InputAndButton;
            return (
                <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmitStep(); }} className={styles.inputForm}>
                    {inputFields.map(field => (
                        <div key={field.keyForUserInput} className={styles.inputGroup}>
                            <label htmlFor={field.keyForUserInput}>{field.inputLabel}{field.isRequired && <span className={styles.requiredMarker}>*</span>}</label>
                            <input
                                type={field.keyForUserInput.toLowerCase().includes('url') ? 'url' : 'text'} // Simple type heuristic
                                id={field.keyForUserInput}
                                name={field.keyForUserInput}
                                value={userInput[field.keyForUserInput] || ''}
                                onChange={(e) => onUserInputChange(field.keyForUserInput, e.target.value)}
                                placeholder={field.placeholder?.[0] || ''}
                                required={field.isRequired}
                                aria-required={field.isRequired}
                            />
                            {/* Basic validation feedback (can be enhanced) */}
                            {field.isRequired && (userInput[field.keyForUserInput] === undefined || userInput[field.keyForUserInput] === '') &&
                                <small className={styles.validationError}>This field is required.</small>
                            }
                        </div>
                    ))}
                    <button type="submit" disabled={isLoadingAction || !canSubmit} className={styles.actionButton}>
                        {isLoadingAction ? "Processing..." : buttonText}
                    </button>
                </form>
            );
        }

        if (uiInteraction.hasOwnProperty('ExternalRedirect')) {
            return (
                <div className={styles.redirectContent}>
                    <p>{stepDefinition.description?.[0] || "You will be redirected to complete this step."}</p>
                    <button onClick={onSubmitStep} disabled={isLoadingAction} className={styles.actionButton}>
                        {isLoadingAction ? "Processing..." : "Proceed to External Site"}
                    </button>
                </div>
            );
        }

        if (uiInteraction.hasOwnProperty('NoUIRequired')) {
            return (
                <div className={styles.noUiContent}>
                    <p>{stepDefinition.description?.[0] || "This step is processed automatically."}</p>
                    {/* Typically, NoUIRequired might auto-trigger or just show info before a system action */}
                    <button onClick={onSubmitStep} disabled={isLoadingAction} className={styles.actionButton}>
                        {isLoadingAction ? "Processing..." : "Confirm Automatic Step"}
                    </button>
                </div>
            );
        }

        return <p className={styles.errorMessage}>Unsupported UI interaction type for this step.</p>;
    };

    return (
        <div className={styles.actionStepRendererContainer}>
            {/* You might want to display stepDefinition.description here if it's generic intro to the step */}
            {renderStepContent()}
        </div>
    );
};

export default ActionStepRenderer;