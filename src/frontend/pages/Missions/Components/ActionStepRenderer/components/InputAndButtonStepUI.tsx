import React from 'react';
import styles from './StepUI.module.scss';
import { InputFieldHint } from '../../../../../types.ts';

interface InputAndButtonStepUIProps {
    description?: string;
    inputFields: InputFieldHint[];
    buttonText: string;
    userInput: Record<string, any>; // Current values for inputs, e.g., { fieldKey1: "value" }
    onUserInputChange: (key: string, value: string | number | boolean) => void; // Callback to update parent's userInput state
    onSubmitStep: () => void;
    isLoadingAction: boolean;
}

const InputAndButtonStepUI: React.FC<InputAndButtonStepUIProps> = ({
    description,
    inputFields,
    buttonText,
    userInput,
    onUserInputChange,
    onSubmitStep,
    isLoadingAction,
}) => {
    const renderInputField = (field: InputFieldHint) => {
        // TODO: Expand this to handle different field.dataType hints (e.g., number, textarea, password)
        // For now, defaulting to 'text'.
        // const inputType = field.dataType === 'Nat' || field.dataType === 'Int' ? 'number' : 'text';
        const inputType = "text"; // Placeholder

        return (
            <div key={field.keyForUserInput} className={styles.inputGroup} >
                <label htmlFor={field.keyForUserInput} className={styles.inputLabel} >
                    {field.inputLabel} {field.isRequired && <span className={styles.requiredAsterisk}>* </span>}
                </label>
                < input
                    id={field.keyForUserInput}
                    name={field.keyForUserInput}
                    type={inputType} // Placeholder, enhance with dataType from ActionParameterDefinition later
                    value={userInput[field.keyForUserInput] || ''}
                    onChange={(e) => onUserInputChange(field.keyForUserInput, e.target.value)}
                    placeholder={field.placeholder?.[0] || undefined}
                    required={field.isRequired}
                    className={styles.inputField}
                    disabled={isLoadingAction}
                />
                {/* Add helpText if available: field.helpText?.[0] */}
            </div>
        );
    };

    return (
        <div className={styles.stepContainer} >
            {description && <p className={styles.stepDescription}> {description} </p>}
            <form onSubmit={(e) => { e.preventDefault(); onSubmitStep(); }} className={styles.inputForm} >
                {inputFields.map(renderInputField)}
                < div className={styles.buttonContainer} >
                    <button
                        type="submit"
                        className={styles.actionButton}
                        disabled={isLoadingAction}
                    >
                        {isLoadingAction ? 'Processing...' : buttonText}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputAndButtonStepUI;
