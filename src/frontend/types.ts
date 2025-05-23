import { UIInteractionType } from '../declarations/actions/actions.did.js';
import type { SerializedProjectDetails as BackendSerializedProjectDetails } from './../declarations/test_backend/test_backend.did.js'; // Adjust path

// Frontend-specific type that includes the canisterId
export interface SerializedProjectDetails extends BackendSerializedProjectDetails {
    canisterId: string; // The canister ID of the project
    activeMissionsCount?: number;
}

export interface ParameterBinding {
    'parameterName': string,
    'valueSource': ParameterValueSource,
}

// Frontend equivalent of Types.ParameterValueSource
export type ParameterValueSource =
    | { 'LiteralValue': string }
    | {
        'PreviousStepOutput': {
            'sourceStepId': bigint,
            'outputKeyPath': string,
        }
    }
    | {
        'UserSuppliedInput': {
            'inputKeyPath': string,
        }
    }
    | {
        'MissionContext': {
            'contextKey': string,
        }
    };

export interface ActionInstance {
    'instanceId': bigint,
    'actionDefinitionId': string,
    'parameterBindings': Array<ParameterBinding>,
    'uiInteraction': UIInteractionType,
}

export interface GroupOfActions {
    'groupId': bigint,
    'actions': Array<ActionInstance>,
    'completionLogic': GroupCompletionLogic,
}

export type ActionItem =
    | { 'SingleAction': ActionInstance }
    | { 'ActionGroup': GroupOfActions };

export interface ActionStep {
    'stepId': bigint,
    'description': [] | [string],
    'item': ActionItem,
}

export interface ActionFlow {
    'name': [] | [string],
    'steps': Array<ActionStep>,
    'completionLogic': FlowCompletionLogic,
}

export type FlowCompletionLogic =
    | { 'AllInOrder': null }
    | { 'AllAnyOrder': null };

export type GroupCompletionLogic =
    | { 'CompleteAny': null }
    | { 'CompleteAll': null };

export interface InputFieldHint {
    keyForUserInput: string; // The key this input will have in the user-provided JSON
    inputLabel: string;
    placeholder?: string[] | null; // Motoko ?Text becomes string[] | null | undefined
    // dataType: ParameterDataType; // This would come from ActionParameterDefinition,
    // For now, UI can default to 'text' or be enhanced later
    isRequired: boolean;
    // You could add 'inputTypeHint?: "text" | "number" | "textarea" | "password" | "url" | "email";'
    // if your ActionDefinition.parameterSchema.dataType can be mapped to this for better UI rendering.
}

export interface UIInputFields {
    keyForUserInput: string;
    inputLabel: string;
    isRequired: boolean;
    placeholder: [] | [string]; // Matches the Candid optional string type `opt text`
    // You can add other properties like 'dataType' here if needed later
}