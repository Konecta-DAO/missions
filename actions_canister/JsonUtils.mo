import Json "mo:json";
import Result "mo:base/Result";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import TrieMap "mo:base/TrieMap";
import Option "mo:base/Option";
import Hash "mo:base/Hash";
import Types "Types";
import Helpers "Helpers";

module JsonUtils {
    public func extractJsonValueAtPath(jsonObj : Json.Json, path : Text) : ?Json.Json {
        return Json.get(jsonObj, path);
    };

    private func numberConversionErrorMessage(
        targetMotokoType : Text,
        attemptedJsonValue : Json.Json,
        specificDetail : Text,
    ) : Text {
        return "Type mismatch: Expected JSON value convertible to " # targetMotokoType #
        ". Got " # Json.stringify(attemptedJsonValue, null) # ". Detail: " # specificDetail;
    };

    // Helper to convert a Json.Json value to a specific Motoko type based on ParameterDataType
    public func deserializeJsonValueToMotokoType(
        jsonValue : Json.Json,
        targetDataType : Types.ParameterDataType,
    ) : Result.Result<Types.ParamValue, Text> {

        switch (targetDataType) {
            // --- Scalar Types ---
            case (#Text) {
                switch (jsonValue) {
                    case (#string(s)) { return #ok(#TextValue(s)) };
                    case _ {
                        return #err(numberConversionErrorMessage("Text", jsonValue, "Expected a JSON string."));
                    };
                };
            };
            case (#Bool) {
                switch (jsonValue) {
                    case (#bool(b)) { return #ok(#BoolValue(b)) };
                    case _ {
                        return #err(numberConversionErrorMessage("Bool", jsonValue, "Expected a JSON boolean."));
                    };
                };
            };
            case (#Principal) {
                switch (jsonValue) {
                    case (#string(s)) {
                        return #ok(#PrincipalValue(Principal.fromText(s)));
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Principal", jsonValue, "Expected a JSON string for Principal."));
                    };
                };
            };
            case (#JsonText) {
                // Stringify the provided Json.Json value
                return #ok(#TextValue(Json.stringify(jsonValue, null)));
            };

            // --- Numeric Scalar Types ---
            case (#Nat) {
                switch (jsonValue) {
                    case (#number(numVal)) {
                        switch (numVal) {
                            case (#int(i)) {
                                if (i >= 0) {
                                    return #ok(#NatValue(Int.abs(i)));
                                } else {
                                    return #err(numberConversionErrorMessage("Nat", jsonValue, "Value cannot be negative."));
                                };
                            };
                            case (#float(f)) {
                                if (f >= 0.0 and f == Float.trunc(f)) {
                                    // Check if float is within Motoko Int range for safe conversion to Nat
                                    if (f > 9_223_372_036_854_775_807.0) {
                                        // Max Int
                                        return #err(numberConversionErrorMessage("Nat", jsonValue, "Float value out of range for Motoko Int->Nat conversion."));
                                    };
                                    return #ok(#NatValue(Int.abs(Float.toInt(f))));
                                } else {
                                    return #err(numberConversionErrorMessage("Nat", jsonValue, "Float value must be a non-negative whole number."));
                                };
                            };
                        };
                    };
                    case (#string(s)) {
                        // Allow Nat from string
                        switch (Nat.fromText(s)) {
                            case (?n) { return #ok(#NatValue(n)) };
                            case null {
                                return #err(numberConversionErrorMessage("Nat", jsonValue, "Invalid Nat text format."));
                            };
                        };
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Nat", jsonValue, "Expected a JSON number or string."));
                    };
                };
            };
            case (#Int) {
                switch (jsonValue) {
                    case (#number(numVal)) {
                        switch (numVal) {
                            case (#int(i)) {
                                return #ok(#IntValue(i));
                            };
                            case (#float(f)) {
                                if (f == Float.trunc(f)) {
                                    return #ok(#IntValue(Float.toInt(f)));
                                } else {
                                    return #err(numberConversionErrorMessage("Int", jsonValue, "Float value must be a whole number."));
                                };
                            };
                        };
                    };
                    case (#string(s)) {
                        switch (Helpers.intFromText(s)) {
                            case (?i) { return #ok(#IntValue(i)) };
                            case null {
                                return #err(numberConversionErrorMessage("Int", jsonValue, "Invalid Int text format: '" # s # "'."));
                            };
                        };
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Int", jsonValue, "Expected a JSON number or string."));
                    };
                };
            };
            case (#Nat64) {
                // For Nat64, prefer string input for full precision.
                // JSON numbers (float64) lose precision for large integers.
                switch (jsonValue) {
                    case (#string(s)) {
                        switch (Nat.fromText(s)) {
                            case (?n) {
                                switch (Nat64.fromNat(n)) {
                                    case (n64) { return #ok(#Nat64Value(n64)) };
                                };
                            };
                            case null {
                                return #err(numberConversionErrorMessage("Nat64", jsonValue, "Invalid Nat64 text format."));
                            };
                        };
                    };
                    case (#number(numVal)) {
                        // Handle if provided as number, with precision caveats
                        switch (numVal) {
                            case (#int(i)) {
                                if (i >= 0) {
                                    return #ok(#Nat64Value(Nat64.fromNat(Int.abs(i))));
                                } else {
                                    return #err(numberConversionErrorMessage("Nat64", jsonValue, "Numeric value cannot be negative."));
                                };
                            };
                            case (#float(f)) {
                                if (f >= 0.0 and f == Float.trunc(f) and f <= 9007199254740991.0 /* Number.MAX_SAFE_INTEGER in JS */) {
                                    return #ok(#Nat64Value(Nat64.fromNat(Int.abs(Float.toInt(f)))));

                                } else {
                                    return #err(numberConversionErrorMessage("Nat64", jsonValue, "Float value must be a non-negative whole number within precise representable range for JSON numbers; use string for large Nat64."));
                                };
                            };
                        };
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Nat64", jsonValue, "Expected a JSON string (preferred) or number."));
                    };
                };
            };

            // --- Array Types ---
            case (#ArrayText) {
                switch (jsonValue) {
                    case (#array(elements)) {
                        var results : [Text] = [];
                        var idx = 0;
                        for (elem in elements.vals()) {
                            switch (elem) {
                                case (#string(s)) {
                                    results := Array.append(results, [s]);
                                };
                                case _ {
                                    return #err("Invalid element at index " # Nat.toText(idx) # " in ArrayText: expected JSON string, got " # Json.stringify(elem, null));
                                };
                            };
                            idx += 1;
                        };
                        return #ok(#ArrayText(results));
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Array<Text>", jsonValue, "Expected a JSON array."));
                    };
                };
            };
            case (#ArrayNat) {
                switch (jsonValue) {
                    case (#array(elements)) {
                        var results : [Nat] = [];
                        var idx = 0;
                        for (elem in elements.vals()) {
                            // Deserialize each element as Nat
                            let natRes = deserializeJsonValueToMotokoType(elem, #Nat);
                            switch (natRes) {
                                case (#ok(#NatValue(n))) {
                                    results := Array.append(results, [n]);
                                };
                                case (#ok(_)) {
                                    /* Should not happen if deserialize for #Nat is correct */
                                    return #err("Internal error: Unexpected ParamValue variant for Nat element at index " # Nat.toText(idx) # " in ArrayNat.");
                                };
                                case (#err(e)) {
                                    return #err("Invalid element at index " # Nat.toText(idx) # " in ArrayNat: " # e);
                                };
                            };
                            idx += 1;
                        };
                        return #ok(#ArrayNat(results));
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Array<Nat>", jsonValue, "Expected a JSON array."));
                    };
                };
            };
            case (#ArrayInt) {
                switch (jsonValue) {
                    case (#array(elements)) {
                        var results : [Int] = [];
                        var idx = 0;
                        for (elem in elements.vals()) {
                            let intRes = deserializeJsonValueToMotokoType(elem, #Int);
                            switch (intRes) {
                                case (#ok(#IntValue(i))) {
                                    results := Array.append(results, [i]);
                                };
                                case (#ok(_)) {
                                    return #err("Internal error: Unexpected ParamValue variant for Int element at index " # Nat.toText(idx) # " in ArrayInt.");
                                };
                                case (#err(e)) {
                                    return #err("Invalid element at index " # Nat.toText(idx) # " in ArrayInt: " # e);
                                };
                            };
                            idx += 1;
                        };
                        return #ok(#ArrayInt(results));
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Array<Int>", jsonValue, "Expected a JSON array."));
                    };
                };
            };
            case (#ArrayBool) {
                switch (jsonValue) {
                    case (#array(elements)) {
                        var results : [Bool] = [];
                        var idx = 0;
                        for (elem in elements.vals()) {
                            switch (elem) {
                                case (#bool(b)) {
                                    results := Array.append(results, [b]);
                                };
                                case _ {
                                    return #err("Invalid element at index " # Nat.toText(idx) # " in ArrayBool: expected JSON boolean, got " # Json.stringify(elem, null));
                                };
                            };
                            idx += 1;
                        };
                        return #ok(#ArrayBool(results));
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Array<Bool>", jsonValue, "Expected a JSON array."));
                    };
                };
            };
            case (#ArrayNat64) {
                switch (jsonValue) {
                    case (#array(elements)) {
                        var results : [Nat64] = [];
                        var idx = 0;
                        for (elem in elements.vals()) {
                            let nat64Res = deserializeJsonValueToMotokoType(elem, #Nat64);
                            switch (nat64Res) {
                                case (#ok(#Nat64Value(n64))) {
                                    results := Array.append(results, [n64]);
                                };
                                case (#ok(_)) {
                                    return #err("Internal error: Unexpected ParamValue variant for Nat64 element at index " # Nat.toText(idx) # " in ArrayNat64.");
                                };
                                case (#err(e)) {
                                    return #err("Invalid element at index " # Nat.toText(idx) # " in ArrayNat64: " # e);
                                };
                            };
                            idx += 1;
                        };
                        return #ok(#ArrayNat64(results));
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Array<Nat64>", jsonValue, "Expected a JSON array."));
                    };
                };
            };
            case (#ArrayPrincipal) {
                switch (jsonValue) {
                    case (#array(elements)) {
                        var results : [Principal] = [];
                        var idx = 0;
                        for (elem in elements.vals()) {
                            let prinRes = deserializeJsonValueToMotokoType(elem, #Principal);
                            switch (prinRes) {
                                case (#ok(#PrincipalValue(p))) {
                                    results := Array.append(results, [p]);
                                };
                                case (#ok(_)) {
                                    return #err("Internal error: Unexpected ParamValue variant for Principal element at index " # Nat.toText(idx) # " in ArrayPrincipal.");
                                };
                                case (#err(e)) {
                                    return #err("Invalid element at index " # Nat.toText(idx) # " in ArrayPrincipal: " # e);
                                };
                            };
                            idx += 1;
                        };
                        return #ok(#ArrayPrincipal(results));
                    };
                    case _ {
                        return #err(numberConversionErrorMessage("Array<Principal>", jsonValue, "Expected a JSON array."));
                    };
                };
            };

            // --- Optional Types ---
            // For each #Opt<Type>, we check for JSON null first.
            // If not null, we attempt to parse as the inner <Type>.
            case (#OptText) {
                switch (jsonValue) {
                    case (#null_) { return #ok(#OptText(null)) };
                    case (#string(s)) { return #ok(#OptText(?s)) };
                    case _ {
                        return #err(numberConversionErrorMessage("Option<Text>", jsonValue, "Expected JSON string or null."));
                    };
                };
            };
            case (#OptNat) {
                switch (jsonValue) {
                    case (#null_) { return #ok(#OptNat(null)) };
                    case _ {
                        // Attempt to parse as Nat
                        let natRes = deserializeJsonValueToMotokoType(jsonValue, #Nat);
                        switch (natRes) {
                            case (#ok(#NatValue(n))) { return #ok(#OptNat(?n)) };
                            case (#ok(_)) {
                                return #err("Internal error: Unexpected ParamValue variant for Nat in OptNat.");
                            };
                            case (#err(e)) {
                                return #err("Invalid value for OptNat: " # e);
                            };
                        };
                    };
                };
            };
            case (#OptInt) {
                switch (jsonValue) {
                    case (#null_) { return #ok(#OptInt(null)) };
                    case _ {
                        let intRes = deserializeJsonValueToMotokoType(jsonValue, #Int);
                        switch (intRes) {
                            case (#ok(#IntValue(i))) { return #ok(#OptInt(?i)) };
                            case (#ok(_)) {
                                return #err("Internal error: Unexpected ParamValue variant for Int in OptInt.");
                            };
                            case (#err(e)) {
                                return #err("Invalid value for OptInt: " # e);
                            };
                        };
                    };
                };
            };
            case (#OptBool) {
                switch (jsonValue) {
                    case (#null_) { return #ok(#OptBool(null)) };
                    case (#bool(b)) { return #ok(#OptBool(?b)) };
                    case _ {
                        return #err(numberConversionErrorMessage("Option<Bool>", jsonValue, "Expected JSON boolean or null."));
                    };
                };
            };
            case (#OptNat64) {
                switch (jsonValue) {
                    case (#null_) { return #ok(#OptNat64(null)) };
                    case _ {
                        let nat64Res = deserializeJsonValueToMotokoType(jsonValue, #Nat64);
                        switch (nat64Res) {
                            case (#ok(#Nat64Value(n64))) {
                                return #ok(#OptNat64(?n64));
                            };
                            case (#ok(_)) {
                                return #err("Internal error: Unexpected ParamValue variant for Nat64 in OptNat64.");
                            };
                            case (#err(e)) {
                                return #err("Invalid value for OptNat64: " # e);
                            };
                        };
                    };
                };
            };
            case (#OptPrincipal) {
                switch (jsonValue) {
                    case (#null_) { return #ok(#OptPrincipal(null)) };
                    case _ {
                        let prinRes = deserializeJsonValueToMotokoType(jsonValue, #Principal);
                        switch (prinRes) {
                            case (#ok(#PrincipalValue(p))) {
                                return #ok(#OptPrincipal(?p));
                            };
                            case (#ok(_)) {
                                return #err("Internal error: Unexpected ParamValue variant for Principal in OptPrincipal.");
                            };
                            case (#err(e)) {
                                return #err("Invalid value for OptPrincipal: " # e);
                            };
                        };
                    };
                };
            };
            // Fallback for any Types.ParameterDataType variant not explicitly handled above
            // This should ideally not be reached if all variants are covered.
            // To make the switch exhaustive, you might need to list all.
            // For example, if you added #OptJsonText to ParameterDataType, handle it here.
            // case (#SomeOtherType) { return #err("Deserialization for SomeOtherType not implemented."); };
        };
        // If the switch on targetDataType is not exhaustive, Motoko requires a final expression.
        // However, with all variants covered, this might not be strictly needed,
        // but as a safeguard or if new types are added without updating:
        // Depending on your Motoko version and compiler strictness, an exhaustive switch is best.
        // If the compiler doesn't see it as exhaustive (e.g., due to type aliases or complex types not fully listed)
        // you might need a final "catch-all", though it indicates an incomplete switch.
        // For now, assuming the cases above cover all defined variants of Types.ParameterDataType.
        // If there's a type like `#Array(#Text)` as a variant of ParameterDataType (which there isn't in your provided Types.mo),
        // then the initial assessment of the user's previous code having an #Array(elementType) pattern would be relevant.
        // But given ParameterDataType has explicit #ArrayText, #ArrayNat, etc., the above structure is correct.
    };

    private func getField(objJson : Json.Json, fieldName : Text) : Result.Result<Json.Json, Text> {
        switch (objJson) {
            case (#object_(entries)) {
                let fieldOpt = Array.find(entries, func(entry : (Text, Json.Json)) : Bool { entry.0 == fieldName });
                switch (fieldOpt) {
                    case (null) {
                        return #err("Field '" # fieldName # "' not found in object.");
                    };
                    case (?entry) { return #ok(entry.1) };
                };
            };
            case _ {
                return #err("Expected JSON object to get field '" # fieldName # "'");
            };
        };
    };

    private func _getFieldAsText(objJson : Json.Json, fieldName : Text) : Result.Result<Text, Text> {
        switch (getField(objJson, fieldName)) {
            case (#err(e)) { return #err(e) };
            case (#ok(jsonVal)) {
                switch (jsonVal) {
                    case (#string(s)) { return #ok(s) };
                    case _ {
                        return #err("Field '" # fieldName # "' is not a JSON string: " # Json.stringify(jsonVal, null));
                    };
                };
            };
        };
    };

    private func _getFieldAsBool(objJson : Json.Json, fieldName : Text) : Result.Result<Bool, Text> {
        switch (getField(objJson, fieldName)) {
            case (#err(e)) { return #err(e) };
            case (#ok(jsonVal)) {
                switch (jsonVal) {
                    case (#bool(b)) { return #ok(b) };
                    case _ {
                        return #err("Field '" # fieldName # "' is not a JSON boolean: " # Json.stringify(jsonVal, null));
                    };
                };
            };
        };
    };

    private func _getOptionalField<MotokoType>(
        objJson : Json.Json,
        fieldName : Text,
        deserializer : (Json.Json) -> Result.Result<MotokoType, Text>,
    ) : Result.Result<?MotokoType, Text> {
        switch (getField(objJson, fieldName)) {
            case (#err(e)) {
                // Field not found
                if (Text.contains(e, #text "not found")) {
                    // Check if it's a "not found" error
                    return #ok(null); // Field missing is OK for optional
                } else {
                    return #err(e); // Other error with getField
                };
            };
            case (#ok(jsonVal)) {
                switch (jsonVal) {
                    case (#null_) { return #ok(null) }; // Explicit JSON null
                    case _ {
                        // Field present and not null, try to deserialize
                        switch (deserializer(jsonVal)) {
                            case (#ok(val)) { return #ok(?val) };
                            case (#err(de)) {
                                return #err("Error in optional field '" # fieldName # "': " # de);
                            };
                        };
                    };
                };
            };
        };
    };

    private func deserializeParameterValueSourceFromJson(jsonVal : Json.Json) : Result.Result<Types.ParameterValueSource, Text> {
        // Assuming JSON like:
        // {"LiteralValue": "\"some_string\""}  OR {"LiteralValue": 123}
        // {"PreviousStepOutput": {"sourceStepId": 1, "outputKeyPath": "data.id"}}
        // {"UserSuppliedInput": {"inputKeyPath": "userInput.name"}}
        // {"MissionContext": {"contextKey": "missionId"}}
        switch (jsonVal) {
            case (#object_(entries)) {
                if (Array.size(entries) != 1) {
                    return #err("ParameterValueSource JSON should have exactly one key");
                };
                let (key, val) = entries[0];
                if (key == "LiteralValue") {
                    // val is Json.Json here, representing the literal. We need its string form IF ParameterValueSource.#LiteralValue stores Text (JSON string)
                    // If #LiteralValue stores the *parsed* Json.Json, then just pass 'val'.
                    // Your type is #LiteralValue : Text; (JSON representation of the literal value)
                    return #ok(#LiteralValue(Json.stringify(val, null)));
                } else if (key == "PreviousStepOutput") {
                    let sourceStepIdRes = Json.getAsNat(val, "sourceStepId");
                    let outputKeyPathRes = Json.getAsText(val, "outputKeyPath");
                    // ... (handle results and construct)
                    if (Result.isErr(sourceStepIdRes) or Result.isErr(outputKeyPathRes)) {
                        return #err("Invalid PreviousStepOutput structure");
                    };
                    let sourceStepId = switch (sourceStepIdRes) {
                        case (#ok(x)) { x };
                        case (#err(_e)) {
                            return #err("Invalid PreviousStepOutput structure");
                        };
                    };
                    let outputKeyPath = switch (outputKeyPathRes) {
                        case (#ok(y)) { y };
                        case (#err(_e)) {
                            return #err("Invalid PreviousStepOutput structure");
                        };
                    };
                    return #ok(#PreviousStepOutput({ sourceStepId = sourceStepId; outputKeyPath = outputKeyPath }));
                } else if (key == "UserSuppliedInput") {
                    // ...
                    let inputKeyPathRes = Json.getAsText(val, "inputKeyPath");
                    switch (inputKeyPathRes) {
                        case (#ok(value)) {
                            return #ok(#UserSuppliedInput({ inputKeyPath = value }));
                        };
                        case (#err(_e)) {
                            return #err("Invalid UserSuppliedInput structure");
                        };
                    };
                } else if (key == "MissionContext") {
                    // ...
                    let contextKeyRes = Json.getAsText(val, "contextKey");
                    switch (contextKeyRes) {
                        case (#ok(contextKey)) {
                            return #ok(#MissionContext({ contextKey = contextKey }));
                        };
                        case (#err(_e)) {
                            return #err("Invalid MissionContext structure");
                        };
                    };
                } else {
                    return #err("Unknown ParameterValueSource type: " # key);
                };
            };
            case _ {
                return #err("ParameterValueSource JSON must be an object");
            };
        };
    };

    private func deserializeParameterBindingFromJson(jsonVal : Json.Json) : Result.Result<Types.ParameterBinding, Text> {
        let nameRes = Json.getAsText(jsonVal, "parameterName");
        let valueSourceJsonRes = getField(jsonVal, "valueSource");

        if (Result.isErr(nameRes) or Result.isErr(valueSourceJsonRes)) {
            return #err("Missing fields for ParameterBinding");
        };
        let name = switch (nameRes) {
            case (#ok(n)) { n };
            case (#err(_e)) {
                return #err("Invalid MissionContext structure");
            };
        };
        let valueSourceJson = switch (valueSourceJsonRes) {
            case (#ok(v)) { v };
            case (#err(_e)) {
                return #err("Invalid MissionContext structure");
            };
        };

        switch (deserializeParameterValueSourceFromJson(valueSourceJson)) {
            case (#ok(vs)) {
                return #ok({ parameterName = name; valueSource = vs });
            };
            case (#err(e)) {
                return #err("Error in ParameterBinding.valueSource: " # e);
            };
        };
    };

    private func deserializeInputFieldsFromJson(inputFieldsArrayJson : Json.Json) : Result.Result<[{ keyForUserInput : Text; inputLabel : Text; placeholder : ?Text; isRequired : Bool }], Text> {
        switch (inputFieldsArrayJson) {
            case (#array(fieldJsons)) {
                var deserializedFields : [{
                    keyForUserInput : Text;
                    inputLabel : Text;
                    placeholder : ?Text;
                    isRequired : Bool;
                }] = [];
                for (fieldJson in fieldJsons.vals()) {
                    let keyRes = Json.getAsText(fieldJson, "keyForUserInput");
                    let labelRes = Json.getAsText(fieldJson, "inputLabel");
                    // Placeholder is optional
                    let placeholderRes = Json.getAsText(fieldJson, "placeholder");
                    let placeholder = switch (placeholderRes) {
                        case (#ok(p)) ?p;
                        case (#err(#pathNotFound)) null; // Optional field
                        case (#err(#typeMismatch)) return #err("InputField 'placeholder' is not text");
                    };
                    let requiredRes = Json.getAsBool(fieldJson, "isRequired");

                    if (Result.isErr(keyRes) or Result.isErr(labelRes) or Result.isErr(requiredRes)) {
                        return #err("Missing required fields in InputField (keyForUserInput, inputLabel, isRequired)");
                    };

                    let key = switch (keyRes) {
                        case (#ok(value)) value;
                        case (#err(_e)) Debug.trap("deserializeInputFieldsFromJson: Unreachable #err for keyRes.");
                    };
                    let inputLabel = switch (labelRes) {
                        case (#ok(value)) value;
                        case (#err(_e)) Debug.trap("deserializeInputFieldsFromJson: Unreachable #err for labelRes.");
                    };
                    let isRequired = switch (requiredRes) {
                        case (#ok(value)) value;
                        case (#err(_e)) Debug.trap("deserializeInputFieldsFromJson: Unreachable #err for requiredRes.");
                    };

                    deserializedFields := Array.append(deserializedFields, [{ keyForUserInput = key; inputLabel = inputLabel; placeholder = placeholder; isRequired = isRequired }]);
                };
                return #ok(deserializedFields);
            };
            case _ { return #err("InputFields must be a JSON array") };
        };
    };

    private func deserializeUIInteractionTypeFromJson(jsonVal : Json.Json) : Result.Result<Types.UIInteractionType, Text> {
        switch (jsonVal) {
            case (#object_(entries)) {
                if (Array.size(entries) != 1) {
                    return #err("UIInteractionType JSON must be an object with exactly one key representing the variant type (e.g. 'ButtonOnly')");
                };
                let (variantKey, variantValueJson) = entries[0];

                if (variantKey == "ButtonOnly") {
                    let buttonTextRes = Json.getAsText(variantValueJson, "buttonText");
                    switch (buttonTextRes) {
                        case (#ok(bt)) {
                            return #ok(#ButtonOnly({ buttonText = bt }));
                        };
                        case (#err(_e)) {
                            return #err("Error in ButtonOnly.buttonText");
                        }; // Assuming Json.formatGetAsError exists in your lib
                    };
                } else if (variantKey == "InputAndButton") {
                    let buttonTextRes = Json.getAsText(variantValueJson, "buttonText");
                    let inputFieldsJsonRes = getField(variantValueJson, "inputFields"); // Using your getField helper

                    if (Result.isErr(buttonTextRes) or Result.isErr(inputFieldsJsonRes)) {
                        return #err("Missing 'buttonText' or 'inputFields' in InputAndButton");
                    };

                    let buttonText = switch (buttonTextRes) {
                        case (#ok(value)) value;
                        case (#err(_e)) Debug.trap("deserializeUIInteractionTypeFromJson: Unreachable #err for buttonTextRes.");
                    };
                    let inputFieldsJson = switch (inputFieldsJsonRes) {
                        case (#ok(value)) value;
                        case (#err(_e)) Debug.trap("deserializeUIInteractionTypeFromJson: Unreachable #err for inputFieldsJsonRes.");
                    };

                    switch (deserializeInputFieldsFromJson(inputFieldsJson)) {
                        case (#ok(deserializedFields)) {
                            return #ok(#InputAndButton({ inputFields = deserializedFields; buttonText = buttonText }));
                        };
                        case (#err(e)) {
                            return #err("Error parsing inputFields for InputAndButton: " # e);
                        };
                    };
                } else if (variantKey == "Informational") {
                    // Expects {"Informational": null} or {"Informational": {}}
                    switch (variantValueJson) {
                        case (#null_) { return #ok(#Informational) };
                        case (#object_(objEntries)) {
                            if (Array.size(objEntries) == 0) {
                                return #ok(#Informational);
                            } else {
                                return #err("Informational variant expects null or an empty object as its value");
                            };
                        };
                        case _ {
                            return #err("Informational variant expects null or an empty object as its value");
                        };
                    };
                } else if (variantKey == "ExternalRedirect") {
                    // Expects {"ExternalRedirect": null} or {"ExternalRedirect": {}}
                    switch (variantValueJson) {
                        case (#null_) { return #ok(#ExternalRedirect) };
                        case (#object_(objEntries)) {
                            if (Array.size(objEntries) == 0) {
                                return #ok(#ExternalRedirect);
                            } else {
                                return #err("ExternalRedirect variant expects null or an empty object as its value");
                            };
                        };
                        case _ {
                            return #err("ExternalRedirect variant expects null or an empty object as its value");
                        };
                    };
                } else if (variantKey == "NoUIRequired") {
                    // Expects {"NoUIRequired": null} or {"NoUIRequired": {}}
                    switch (variantValueJson) {
                        case (#null_) { return #ok(#NoUIRequired) };
                        case (#object_(objEntries)) {
                            if (Array.size(objEntries) == 0) {
                                return #ok(#NoUIRequired);
                            } else {
                                return #err("NoUIRequired variant expects null or an empty object as its value");
                            };
                        };
                        case _ {
                            return #err("NoUIRequired variant expects null or an empty object as its value");
                        };
                    };
                } else {
                    return #err("Unknown UIInteractionType variant key in JSON: " # variantKey);
                };
            };
            case _ { return #err("UIInteractionType JSON must be an object") };
        };
    };

    private func deserializeActionInstanceFromJson(jsonVal : Json.Json) : Result.Result<Types.ActionInstance, Text> {
        let instanceIdRes = Json.getAsNat(jsonVal, "instanceId");
        let defIdRes = Json.getAsText(jsonVal, "actionDefinitionId");
        // uiInteraction & displayName are optional if not present in JSON
        let uiInteractionJsonOptRes = getField(jsonVal, "uiInteraction");

        let paramBindingsJsonRes = Json.getAsArray(jsonVal, "parameterBindings");

        if (Result.isErr(instanceIdRes) or Result.isErr(defIdRes) or Result.isErr(paramBindingsJsonRes)) {
            return #err("Missing required fields for ActionInstance");
        };
        let instanceId = switch (instanceIdRes) {
            case (#ok(val)) { val };
            case (#err(_e)) {
                return #err("Invalid ActionInstance: instanceId error");
            };
        };
        let actionDefinitionId = switch (defIdRes) {
            case (#ok(txt)) { txt };
            case (#err(_e)) {
                return #err("Invalid ActionInstance: actionDefinitionId error");
            };
        };
        let paramBindingsJsonArray = switch (paramBindingsJsonRes) {
            case (#ok(arr)) { arr };
            case (#err(_e)) {
                return #err("Missing required field 'parameterBindings'");
            };
        };
        var parameterBindings : [Types.ParameterBinding] = [];
        for (pbJson in paramBindingsJsonArray.vals()) {
            switch (deserializeParameterBindingFromJson(pbJson)) {
                case (#ok(pb)) {
                    parameterBindings := Array.append(parameterBindings, [pb]);
                };
                case (#err(e)) {
                    return #err("Error parsing parameter binding: " # e);
                };
            };
        };

        var uiInteraction : Types.UIInteractionType = #NoUIRequired; // Default if not provided or parsing fails softly
        switch (uiInteractionJsonOptRes) {
            case (#ok(uiJson)) {
                // Field "uiInteraction" was present
                switch (deserializeUIInteractionTypeFromJson(uiJson)) {
                    case (#ok(ui)) { uiInteraction := ui };
                    case (#err(e)) {
                        return #err("Failed to parse 'uiInteraction' object: " # e);
                    }; // Hard fail if field present but malformed
                };
            };
            case (#err(_e)) {};
        };

        return #ok({
            instanceId;
            actionDefinitionId;
            var parameterBindings;
            var uiInteraction;
        });
    };

    private func deserializeGroupCompletionLogicFromJson(jsonVal : Json.Json) : Result.Result<Types.GroupCompletionLogic, Text> {
        switch (jsonVal) {
            case (#object_(entries)) {
                if (Array.size(entries) != 1) {
                    return #err("GroupCompletionLogic JSON must be an object with exactly one key representing the variant type (e.g. 'CompleteAll')");
                };
                let (variantKey, variantValueJson) = entries[0];

                // Check if the value is null or an empty object, which is typical for tag-like variants
                let isValidTagValue = switch (variantValueJson) {
                    case (#null_) true;
                    case (#object_(objEntries)) (Array.size(objEntries) == 0);
                    case _ false;
                };
                if (not isValidTagValue) {
                    return #err("GroupCompletionLogic variant '" # variantKey # "' expects null or an empty object as its value.");
                };

                if (variantKey == "CompleteAny") {
                    return #ok(#CompleteAny);
                } else if (variantKey == "CompleteAll") {
                    return #ok(#CompleteAll);
                } else {
                    return #err("Unknown GroupCompletionLogic variant key in JSON: " # variantKey);
                };
            };
            case _ {
                return #err("GroupCompletionLogic JSON must be an object");
            };
        };
    };

    private func deserializeGroupOfActionsFromJson(jsonVal : Json.Json) : Result.Result<Types.GroupOfActions, Text> {
        let groupIdRes = Json.getAsNat(jsonVal, "groupId");
        let actionsJsonArrayRes = Json.getAsArray(jsonVal, "actions");
        let completionLogicJsonRes = getField(jsonVal, "completionLogic"); // Using your getField helper

        // Check required fields first
        if (Result.isErr(groupIdRes)) {
            // Assuming Json.formatGetAsError exists in your library or as a helper
            let errorMsg = "GroupOfActions missing or invalid 'groupId'";
            return #err(errorMsg);
        };
        if (Result.isErr(actionsJsonArrayRes)) {
            let errorMsg = "GroupOfActions missing or invalid 'actions' array";
            return #err(errorMsg);
        };
        if (Result.isErr(completionLogicJsonRes)) {
            return #err("GroupOfActions missing or invalid 'completionLogic' object");
        };

        let groupId = switch (groupIdRes) {
            case (#ok(value)) value;
            case (#err(_e)) Debug.trap("deserializeGroupOfActionsFromJson: Unreachable #err for groupIdRes.");
        };
        let actionsJsonArray = switch (actionsJsonArrayRes) {
            case (#ok(value)) value;
            case (#err(_e)) Debug.trap("deserializeGroupOfActionsFromJson: Unreachable #err for actionsJsonArrayRes.");
        };
        let completionLogicJson = switch (completionLogicJsonRes) {
            case (#ok(value)) value;
            case (#err(e)) Debug.trap("deserializeGroupOfActionsFromJson: Unreachable #err for completionLogicJsonRes. Error: " # e); // Error is Text
        };

        var deserializedActions : [Types.ActionInstance] = [];
        for (actionInstanceJson in actionsJsonArray.vals()) {
            switch (deserializeActionInstanceFromJson(actionInstanceJson)) {
                case (#ok(instance)) {
                    deserializedActions := Array.append(deserializedActions, [instance]);
                };
                case (#err(e)) {
                    return #err("Error parsing ActionInstance within GroupOfActions: " # e);
                };
            };
        };

        var completionLogic : Types.GroupCompletionLogic = #CompleteAll;
        switch (deserializeGroupCompletionLogicFromJson(completionLogicJson)) {
            case (#ok(cl)) {
                completionLogic := cl;
            };
            case (#err(e)) {
                return #err("Error parsing GroupOfActions 'completionLogic': " # e);
            };
        };

        return #ok({
            groupId = groupId;
            // These fields in Types.GroupOfActions are 'var'
            var actions = deserializedActions;
            var completionLogic = completionLogic;
        });
    };

    private func deserializeActionItemFromJson(jsonVal : Json.Json) : Result.Result<Types.ActionItem, Text> {
        // Assuming JSON like: {"SingleAction": {...action instance...}} or {"ActionGroup": {...group...}}
        switch (jsonVal) {
            case (#object_(entries)) {
                if (Array.size(entries) != 1) {
                    return #err("ActionItem JSON should have one key ('SingleAction' or 'ActionGroup') representing the variant type.");
                };
                let (variantKey, variantValueJson) = entries[0];

                if (variantKey == "SingleAction") {
                    switch (deserializeActionInstanceFromJson(variantValueJson)) {
                        case (#ok(instance)) {
                            return #ok(#SingleAction(instance));
                        };
                        case (#err(e)) {
                            return #err("Error deserializing SingleAction content: " # e);
                        };
                    };
                } else if (variantKey == "ActionGroup") {
                    switch (deserializeGroupOfActionsFromJson(variantValueJson)) {
                        case (#ok(group)) {
                            return #ok(#ActionGroup(group));
                        };
                        case (#err(e)) {
                            return #err("Error deserializing ActionGroup content: " # e);
                        };
                    };
                } else {
                    return #err("Unknown ActionItem variant key in JSON: " # variantKey);
                };
            };
            case _ { return #err("ActionItem JSON must be an object") };
        };
    };

    private func deserializeActionStepFromJson(stepJson : Json.Json) : Result.Result<Types.ActionStep, Text> {
        let stepIdRes = Json.getAsNat(stepJson, "stepId");
        let descriptionRes = Json.getAsText(stepJson, "description"); // Optional
        let itemJsonRes = getField(stepJson, "item");

        if (Result.isErr(stepIdRes) or Result.isErr(itemJsonRes)) {
            return #err("Missing fields for ActionStep");
        };

        let stepId = switch (stepIdRes) {
            case (#ok(val)) { val };
            case (#err(_e)) { return #err("Invalid step id") };
        };
        let description = switch (descriptionRes) {
            case (#ok(value)) { ?value };
            case (#err(_)) { null };
        };
        let itemJson = switch (itemJsonRes) {
            case (#ok(v)) { v };
            case (#err(msg)) {
                return #err("Error retrieving field 'item': " # msg);
            };
        };

        switch (deserializeActionItemFromJson(itemJson)) {
            case (#ok(item)) {
                return #ok({ stepId; var description; var item });
            };
            case (#err(e)) { return #err("Error in ActionStep.item: " # e) };
        };
    };

    public func deserializeActionFlowFromJson(flowJsonObj : Json.Json) : Result.Result<Types.ActionFlow, Text> {
        let nameRes = Json.getAsText(flowJsonObj, "name"); // Optional
        let stepsJsonArrayRes = Json.getAsArray(flowJsonObj, "steps");
        let completionLogicJsonRes = getField(flowJsonObj, "completionLogic"); // Expecting {"VariantName": null} or {"VariantName": data}

        if (Result.isErr(stepsJsonArrayRes) or Result.isErr(completionLogicJsonRes)) {
            return #err("Missing 'steps' or 'completionLogic' in ActionFlow JSON");
        };

        let name = switch (nameRes) {
            case (#ok(val)) { ?val };
            case (#err(_)) { null };
        };
        let stepsJsonArray = switch (stepsJsonArrayRes) {
            case (#ok(value)) { value };
            case (#err(_e)) {
                // This case should not be reached due to the error check above.
                Debug.trap("deserializeActionFlowFromJson: Unreachable #err for stepsJsonArrayRes.");
            };
        };

        let completionLogicJson = switch (completionLogicJsonRes) {
            case (#ok(value)) { value };
            case (#err(e)) {
                Debug.trap("deserializeActionFlowFromJson: Unreachable #err for completionLogicJsonRes. Error: " # e);
            };
        };

        var steps : [Types.ActionStep] = [];
        for (stepJson in stepsJsonArray.vals()) {
            switch (deserializeActionStepFromJson(stepJson)) {
                case (#ok(actionStep)) {
                    steps := Array.append(steps, [actionStep]);
                };
                case (#err(e)) {
                    return #err("Failed to parse action step: " # e);
                };
            };
        };

        // Deserialize completionLogic
        // Assuming JSON like {"AllInOrder": null} or {"AnyOfRootSteps": null}
        let completionLogic : Types.FlowCompletionLogic = switch (completionLogicJson) {
            case (#object_(entries)) {
                if (Array.size(entries) != 1) {
                    return #err("completionLogic JSON object should have one key");
                };
                let (key, _val) = entries[0]; // val should be Json.nullable()
                if (key == "AllInOrder") { #AllInOrder } else {
                    #AllAnyOrder;
                };
            };
            case _ {
                return #err("completionLogic JSON must be an object representing the variant");
            };
        };

        return #ok({ var name; var steps; var completionLogic });
    };

    public func deserializePreviousStepOutputs(
        jsonText : Text // This is the JSON string from ProjectCanister, e.g., '{"1": {"outputKey":"value"}, "2": {}}'
    ) : Result.Result<TrieMap.TrieMap<Nat, Json.Json>, Text> {
        // Returns Map<StepId, Parsed_ActionReturnedData_as_Json.Json>
        let mapResult : TrieMap.TrieMap<Nat, Json.Json> = TrieMap.TrieMap<Nat, Json.Json>(
            Nat.equal,
            func(n : Nat) : Hash.Hash {
                return Text.hash(Nat.toText(n));
            },
        );

        switch (Json.parse(jsonText)) {
            case (#err(e)) {
                return #err("Failed to parse outer previousStepOutputsJson: " # Json.errToText(e));
            };
            case (#ok(jsonObj)) {
                switch (jsonObj) {
                    case (#object_(fields)) {
                        for ((stepIdText, innerJsonValue) in fields.vals()) {
                            // stepIdText is the key (e.g., "1", "2")
                            // innerJsonValue is now directly the Json.Json representation
                            // of the previous step's output (e.g., {"outputKey":"value"})

                            let stepIdOpt = Nat.fromText(stepIdText);
                            if (Option.isNull(stepIdOpt)) {
                                return #err("Invalid stepId key in previousStepOutputs: '" # stepIdText # "' must be a Nat string.");
                            };
                            let stepId = Option.get(stepIdOpt, 0); // Or handle error more gracefully if 0 is not a valid default

                            // No second parse needed for innerJsonValue. It's already Json.Json.
                            mapResult.put(stepId, innerJsonValue);
                        };
                        return #ok(mapResult);
                    };
                    case _ {
                        return #err("previousStepOutputsJson did not parse to a JSON object (map). Got: " # Json.stringify(jsonObj, null));
                    };
                };
            };
        };
    };

    public func serializeTagToJson(variantTagText : Text) : Json.Json {
        return Json.obj([(variantTagText, Json.nullable())]);
    };

    public func serializeActionStatusOutcomeToJson(outcome : Types.ActionStatusOutcome) : Json.Json {
        // Uses the serializeTagToJson helper: public func serializeTagToJson(variantTagText : Text) : Json.Json
        switch (outcome) {
            case (#Success) { return serializeTagToJson("#Success") };
            case (#Failed) { return serializeTagToJson("#Failed") };
            case (#AlreadyDone) { return serializeTagToJson("#AlreadyDone") };
            case (#NotApplicable) {
                return serializeTagToJson("#NotApplicable");
            };
            case (#PendingVerification) {
                return serializeTagToJson("#PendingVerification");
            };
        };
    };

    private func serializeVoteOptionToJson(voteOption : Types.VoteOption) : Json.Json {
        switch (voteOption) {
            case (#Yes) { return Json.str("Yes") };
            case (#No) { return Json.str("No") };
            // case (#Abstain) { return Json.str("Abstain"); }; // If you add Abstain to VoteOption
        };
    };

    // --- Motoko Type to JSON Serialization Helpers ---

    public func serializeActionReturnedDataToJsonObj(data : Types.ActionReturnedData) : Result.Result<Json.Json, Text> {
        switch (data) {
            case (#ValidateCodeResult(res)) {
                var fields : [(Text, Json.Json)] = [
                    ("code", Json.str(res.code)),
                    ("isValid", Json.bool(res.isValid)),
                ];
                switch (res.message) {
                    case (?msg) {
                        fields := Array.append(fields, [("message", Json.str(msg))]);
                    };
                    case null {};
                };
                switch (res.attemptsRemaining) {
                    case (?attempts) {
                        fields := Array.append(fields, [("attemptsRemaining", Json.int(attempts))]);
                    }; // Corrected
                    case null {};
                };
                return #ok(Json.obj(fields));
            };
            case (#TwitterFollowResult(res)) {
                var followedAccsJson : [Json.Json] = [];
                for (acc in res.followedAccounts.vals()) {
                    var accFields : [(Text, Json.Json)] = [
                        ("account", Json.str(acc.account)),
                        ("status", serializeActionStatusOutcomeToJson(acc.status)),
                    ];
                    followedAccsJson := Array.append(followedAccsJson, [Json.obj(accFields)]);
                };
                return #ok(Json.obj([("followedAccounts", Json.arr(followedAccsJson))]));
            };
            case (#TweetRetweetResult(res)) {
                var retweetedTweetsJson : [Json.Json] = [];
                for (item in res.retweetedTweets.vals()) {
                    retweetedTweetsJson := Array.append(
                        retweetedTweetsJson,
                        [
                            Json.obj([
                                ("tweetId", Json.str(item.tweetId)),
                                ("status", serializeActionStatusOutcomeToJson(item.status)),
                            ])
                        ],
                    );
                };
                return #ok(Json.obj([("retweetedTweets", Json.arr(retweetedTweetsJson))]));
            };
            case (#VerifyTweetResult(res)) {
                var fields : [(Text, Json.Json)] = [
                    ("isVerified", Json.bool(res.isVerified)),
                    ("verificationStatus", serializeActionStatusOutcomeToJson(res.verificationStatus)),
                ];
                switch (res.foundTweetId) {
                    case (?id) {
                        fields := Array.append(fields, [("foundTweetId", Json.str(id))]);
                    };
                    case null {};
                };
                switch (res.foundTweetContent) {
                    case (?content) {
                        fields := Array.append(fields, [("foundTweetContent", Json.str(content))]);
                    };
                    case null {};
                };
                return #ok(Json.obj(fields));
            };
            case (#TweetLikeResult(res)) {
                var likedTweetsJson : [Json.Json] = [];
                for (item in res.likedTweets.vals()) {
                    likedTweetsJson := Array.append(
                        likedTweetsJson,
                        [
                            Json.obj([
                                ("tweetId", Json.str(item.tweetId)),
                                ("status", serializeActionStatusOutcomeToJson(item.status)),
                            ])
                        ],
                    );
                };
                return #ok(Json.obj([("likedTweets", Json.arr(likedTweetsJson))]));
            };
            case (#TwitterBioCheckResult(res)) {
                var fields : [(Text, Json.Json)] = [
                    ("accountChecked", Json.str(res.accountChecked)),
                    ("isVerified", Json.bool(res.isVerified)),
                    ("verificationStatus", serializeActionStatusOutcomeToJson(res.verificationStatus)),
                ];
                switch (res.bioContent) {
                    case (?content) {
                        fields := Array.append(fields, [("bioContent", Json.str(content))]);
                    };
                    case null {};
                };
                return #ok(Json.obj(fields));
            };
            case (#DiscordJoinServerResult(res)) {
                var fields : [(Text, Json.Json)] = [
                    ("serverId", Json.str(res.serverId)),
                    ("joinStatus", serializeActionStatusOutcomeToJson(res.joinStatus)),
                ];
                switch (res.serverName) {
                    case (?name) {
                        fields := Array.append(fields, [("serverName", Json.str(name))]);
                    };
                    case null {};
                };
                return #ok(Json.obj(fields));
            };
            case (#RedditJoinSubredditResult(res)) {
                var joinedSubredditsJson : [Json.Json] = [];
                for (item in res.joinedSubreddits.vals()) {
                    joinedSubredditsJson := Array.append(
                        joinedSubredditsJson,
                        [
                            Json.obj([
                                ("subredditName", Json.str(item.subredditName)),
                                ("status", serializeActionStatusOutcomeToJson(item.status)),
                            ])
                        ],
                    );
                };
                return #ok(Json.obj([("joinedSubreddits", Json.arr(joinedSubredditsJson))]));
            };
            case (#VoteOnProposalResult(res)) {
                var fields : [(Text, Json.Json)] = [
                    ("snsCanisterId", Json.str(Principal.toText(res.snsCanisterId))),
                    ("proposalId", Json.int(res.proposalId)), // Corrected
                    ("principalChecked", Json.str(Principal.toText(res.principalChecked))),
                    ("hasVoted", Json.bool(res.hasVoted)),
                    ("verificationStatus", serializeActionStatusOutcomeToJson(res.verificationStatus)),
                ];
                switch (res.voteCasted) {
                    case (?vote) {
                        fields := Array.append(fields, [("voteCasted", serializeVoteOptionToJson(vote))]);
                    };
                    case null {
                        fields := Array.append(fields, [("voteCasted", Json.nullable())]);
                    };
                };
                return #ok(Json.obj(fields));
            };
            case (#CreateProposalResult(res)) {
                var fields : [(Text, Json.Json)] = [
                    ("snsCanisterId", Json.str(Principal.toText(res.snsCanisterId))),
                    ("creationStatus", serializeActionStatusOutcomeToJson(res.creationStatus)),
                ];
                switch (res.newProposalId) {
                    case (?id) {
                        fields := Array.append(fields, [("newProposalId", Json.int(id))]);
                    }; // Corrected
                    case null {};
                };
                return #ok(Json.obj(fields));
            };
            case (#NuanceFollowResult(res)) {
                var followedUsersJson : [Json.Json] = [];
                for (item in res.followedNuanceUsers.vals()) {
                    followedUsersJson := Array.append(
                        followedUsersJson,
                        [
                            Json.obj([
                                ("username", Json.str(item.username)),
                                ("status", serializeActionStatusOutcomeToJson(item.status)),
                            ])
                        ],
                    );
                };
                return #ok(Json.obj([("followedNuanceUsers", Json.arr(followedUsersJson))]));
            };
            case (#NoData) {
                return #ok(Json.nullable());
            };
        };
        // This fallback should ideally not be reached if the switch is exhaustive.
        return #err("Internal error: serializeActionReturnedDataToJsonObj - Unmatched variant for data");
    };

    public func serializeExecuteActionResultToJsonObj(resultToSerialize : Types.ExecuteActionResult) : Result.Result<Json.Json, Text> {
        var fields : [(Text, Json.Json)] = [
            ("stepIdProcessed", Json.int(resultToSerialize.stepIdProcessed)),
            ("actionInstanceIdProcessed", Json.int(resultToSerialize.actionInstanceIdProcessed)),
            ("overallSuccess", Json.bool(resultToSerialize.overallSuccess)),
            ("executionStatus", Json.str(serializeActionStatusToString(resultToSerialize.executionStatus))),
            ("actionOutcome", Json.str(serializeActionOutcomeToString(resultToSerialize.actionOutcome))),
        ];

        if (Option.isSome(resultToSerialize.message)) {
            fields := Array.append(fields, [("message", Json.str(Option.get(resultToSerialize.message, "")))]);
        };

        switch (resultToSerialize.returnedDataJson) {
            case (?jsonText) {
                switch (Json.parse(jsonText)) {
                    case (#ok(parsedJson)) {
                        fields := Array.append(fields, [("returnedDataJson", parsedJson)]);
                    };
                    case (#err(_e)) {
                        fields := Array.append(fields, [("returnedDataJson", Json.nullable())]);
                    };
                };
            };
            case null {
                fields := Array.append(fields, [("returnedDataJson", Json.nullable())]);
            };
        };
        switch (resultToSerialize.nextStepIdToProcess) {
            case (?natVal) {
                fields := Array.append(fields, [("nextStepIdToProcess", Json.int(natVal))]);
            };
            case null {
                fields := Array.append(fields, [("nextStepIdToProcess", Json.nullable())]);
            };
        };

        switch (resultToSerialize.isFlowCompleted) {
            case (?boolVal) {
                fields := Array.append(fields, [("isFlowCompleted", Json.bool(boolVal))]);
            };
            case null {
                fields := Array.append(fields, [("isFlowCompleted", Json.nullable())]);
            };
        };
        return #ok(Json.obj(fields));
    };

    public func serializeActionStatusToString(status : Types.ActionStatus) : Text {
        switch (status) {
            case (#Ok) { "Ok" };
            case (#Error) { "Error" };
            case (#Pending) { "Pending" };
            case (#RequiresUserAction) { "RequiresUserAction" };
            case (#InvalidParameters) { "InvalidParameters" };
            case (#PreconditionNotMet) { "PreconditionNotMet" };
            case (#HandlerNotFound) { "HandlerNotFound" };
            case (#ApiError) { "ApiError" };
        };
    };

    public func serializeActionOutcomeToString(outcome : Types.ActionOutcome) : Text {
        switch (outcome) {
            case (#Success) { "Success" };
            case (#Failed) { "Failed" };
            case (#AlreadyDone) { "AlreadyDone" };
            case (#NotApplicable) { "NotApplicable" };
            case (#PendingVerification) { "PendingVerification" };
        };
    };
};
