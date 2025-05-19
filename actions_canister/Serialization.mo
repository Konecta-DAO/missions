import Types "Types";
import Iter "mo:base/Iter";
module Serialization {

    public func serializeActionParameterDefinition(paramDef : Types.ActionParameterDefinition) : Types.SerializedActionParameterDefinition {
        {
            name = paramDef.name;
            dataType = paramDef.dataType;
            isRequired = paramDef.isRequired;
            inputLabel = paramDef.inputLabel;
            helpText = paramDef.helpText;
            defaultValueJson = paramDef.defaultValueJson;
            validationRegex = paramDef.validationRegex;
        };
    };

    public func deserializeActionParameterDefinition(serializedParamDef : Types.SerializedActionParameterDefinition) : Types.ActionParameterDefinition {
        {
            name = serializedParamDef.name;
            dataType = serializedParamDef.dataType;
            isRequired = serializedParamDef.isRequired;
            var inputLabel = serializedParamDef.inputLabel;
            var helpText = serializedParamDef.helpText;
            var defaultValueJson = serializedParamDef.defaultValueJson;
            var validationRegex = serializedParamDef.validationRegex;
        };
    };

    public func serializeActionDefinition(actionDef : Types.ActionDefinition) : Types.SerializedActionDefinition {
        {
            id = actionDef.id;
            name = actionDef.name;
            descriptionTemplate = actionDef.descriptionTemplate;
            platform = actionDef.platform;
            version = actionDef.version;
            defaultUIType = actionDef.defaultUIType;
            parameterSchema = Iter.toArray(
                Iter.map<Types.ActionParameterDefinition, Types.SerializedActionParameterDefinition>(
                    actionDef.parameterSchema.vals(),
                    serializeActionParameterDefinition,
                )
            );
            outputSchemaJson = actionDef.outputSchemaJson;
            executionHandler = actionDef.executionHandler;
            tags = actionDef.tags;
        };
    };

    public func deserializeActionDefinition(serializedActionDef : Types.SerializedActionDefinition) : Types.ActionDefinition {
        {
            id = serializedActionDef.id;
            var name = serializedActionDef.name;
            var descriptionTemplate = serializedActionDef.descriptionTemplate;
            platform = serializedActionDef.platform;
            var version = serializedActionDef.version;
            var defaultUIType = serializedActionDef.defaultUIType;
            var parameterSchema = Iter.toArray(
                Iter.map<Types.SerializedActionParameterDefinition, Types.ActionParameterDefinition>(
                    serializedActionDef.parameterSchema.vals(),
                    deserializeActionParameterDefinition,
                )
            );
            var outputSchemaJson = serializedActionDef.outputSchemaJson;
            var executionHandler = serializedActionDef.executionHandler;
            var tags = serializedActionDef.tags;
        };
    };
};
