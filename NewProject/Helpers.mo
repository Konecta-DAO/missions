import Result "mo:base/Result";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import NewTypes "NewTypes";
import Json "mo:json";

module Helpers {

    public func parseActionResult(jsonText : Text) : Result.Result<NewTypes.ActionResultFromActions, Text> {
        // 1) Parse into Json.Json
        switch (Json.parse(jsonText)) {
            case (#err(e)) {
                return #err("Invalid JSON from Actions service: " # Json.errToText(e));
            };
            case (#ok(root)) {
                // 2) success : Bool
                let success = switch (Json.getAsBool(root, "overallSuccess")) {
                    case (#ok(b)) b;
                    case (#err(_)) return #err("Missing or non-boolean 'overallSuccess' field");
                };

                // 3) status : ActionStatusFromBackend
                let statusText = switch (Json.getAsText(root, "executionStatus")) {
                    case (#ok(s)) s;
                    case (#err(_)) return #err("Missing or non-string 'executionStatus' field");
                };
                let status : NewTypes.ActionStatusFromBackend = switch (statusText) {
                    case "Ok" { #Ok };
                    case "Error" { #Error };
                    case "Pending" { #Pending };
                    case "RequiresUserAction" { #RequiresUserAction };
                    case "InvalidParameters" { #InvalidParameters };
                    case "PreconditionNotMet" { #PreconditionNotMet };
                    case "HandlerNotFound" { #Error };
                    case "ApiError" { #Error };
                    case (_) {
                        return #err("Unexpected executionStatus value from ActionsCanister: " # statusText);
                    };
                };

                // 4) message : ?Text
                let message : ?Text = switch (Json.getAsText(root, "message")) {
                    case (#ok(m)) ?m;
                    case (#err(_)) null;
                };

                // 5) returnedDataJson : ?Text (already stringified JSON from ActionsCanister)
                let returnedDataJson : ?Text = switch (Json.getAsText(root, "returnedDataJson")) {
                    case (#ok(s)) if (s == "null" or Text.size(s) == 0) { null } else {
                        ?s;
                    };
                    case (#err(_)) {
                        switch (Json.get(root, "returnedDataJson")) {
                            case (?#null_) null;
                            case _ null;
                        };
                    };
                };

                // 6) nextStepIdToProcess : ?Nat
                let nextStepIdToProcess : ?Nat = switch (Json.get(root, "nextStepIdToProcess")) {
                    case (?#number(numVal)) {
                        switch (numVal) {
                            case (#int(i)) if (i >= 0) { ?Int.abs(i) } else {
                                null;
                            };
                            case (#float(f)) if (f >= 0.0 and f == Float.trunc(f)) {
                                ?Int.abs(Float.toInt(f));
                            } else { null };
                        };
                    };
                    case (?#string(s)) { Nat.fromText(s) };
                    case _ { null };
                };

                // 7) isFlowCompleted : ?Bool
                let isFlowCompleted : ?Bool = switch (Json.getAsBool(root, "isFlowCompleted")) {
                    case (#ok(b)) ?b;
                    case (#err(_)) null;
                };

                return #ok({
                    success = success;
                    status = status;
                    message = message;
                    returnedDataJson = returnedDataJson;
                    nextStepIdToProcess = nextStepIdToProcess;
                    isFlowCompleted = isFlowCompleted;
                });
            };
        };
    };

    public func getFirstStepIdFromActionFlow(actionFlowJson : Text) : Result.Result<Nat, Text> {
        switch (Json.parse(actionFlowJson)) {
            case (#err(e)) {
                return #err("Failed to parse actionFlowJson: " # Json.errToText(e));
            };
            case (#ok(flowObj)) {
                switch (Json.get(flowObj, "steps")) {
                    case (null) {
                        return #err("Missing 'steps' array in actionFlowJson");
                    };
                    case (?(#array(stepsArray))) {
                        if (Array.size(stepsArray) == 0) {
                            return #err("'steps' array is empty in actionFlowJson");
                        };
                        let firstStepObj = stepsArray[0];
                        switch (Json.get(firstStepObj, "stepId")) {
                            case (null) {
                                return #err("First step in 'steps' array missing 'stepId'");
                            };
                            case (?(#number(numVal))) {
                                switch (numVal) {
                                    case (#int(i)) if (i >= 0) {
                                        return #ok(Int.abs(i));
                                    } else { return #err("stepId is negative") };
                                    case (#float(f)) if (f >= 0.0 and f == Float.trunc(f)) {
                                        return #ok(Int.abs(Float.toInt(f)));
                                    } else {
                                        return #err("stepId is not a whole number");
                                    };
                                };
                            };
                            case (?(#string(s))) {
                                // If sent as string
                                switch (Nat.fromText(s)) {
                                    case (?n) { return #ok(n) };
                                    case null {
                                        return #err("stepId string is not a valid Nat");
                                    };
                                };
                            };
                            case _ {
                                return #err("First step 'stepId' is not a number or string");
                            };
                        };
                    };
                    case _ {
                        return #err("'steps' field is not an array in actionFlowJson");
                    };
                };
            };
        };
    };

    public func generateAssetId(originalFileNameText : Text, assetContent : Blob) : Text {
        let timestamp = Int.toText(Time.now());
        // Sanitize and shorten originalFileNameText for use in URL
        // Remove non-alphanumeric (except dot for extension), replace spaces, lowercase
        var safeName = "";
        var dotSeen = false;
        for (c in originalFileNameText.chars()) {
            if (c >= 'a' and c <= 'z' or c >= 'A' and c <= 'Z' or c >= '0' and c <= '9') {
                safeName := safeName # Text.toLowercase(Text.fromChar(c));
            } else if (c == '.' and not dotSeen) {
                safeName := safeName # ".";
                dotSeen := true; // only allow one dot
            } else if (Text.size(safeName) < 30 and (c == '-' or c == '_')) {
                // limit size
                safeName := safeName # Text.fromChar(c);
            };
        };
        if (Text.size(safeName) == 0 or safeName == ".") {
            safeName := "asset";
        };
        // Using a hash of the content for better uniqueness if names collide
        let contentHash = Nat32.toText(Blob.hash(assetContent));
        return timestamp # "_" # contentHash # "_" # safeName;
    };
};
