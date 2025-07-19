import Text "mo:base/Text";
import Types "Types";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Json "mo:json";
import StableTrieMap "../StableTrieMap";
import Serialization "Serialization";
import Actions "Actions";
import JsonUtils "JsonUtils";

actor class Backend() {

    let _indexCanisterId : Text = "q3itu-vqaaa-aaaag-qngyq-cai";

    stable var adminIds : [Principal] = [Principal.fromText("re2jg-bjb6f-frlwq-342yn-bebk2-43ofq-3qwwq-cld3p-xiwxw-bry3n-aqe")];
    stable var actionDefinitions : StableTrieMap.StableTrieMap<Text, Types.ActionDefinition> = StableTrieMap.new<Text, Types.ActionDefinition>();

    public type ActionFilter = {
        platform : ?Types.PlatformType;
        tags : ?[Text]; // Allows filtering by one or more tags (e.g., all must match, or any)
    };

    public shared func getAllActionIds() : async [Text] {
        return Iter.toArray(StableTrieMap.keys(actionDefinitions));
    };

    public shared func initialize() {
        // This check ensures that we only populate the definitions on the first installation,
        // as the stable map will persist across upgrades.
        if (StableTrieMap.isEmpty(actionDefinitions)) {
            // --- Define Action: twitter_follow_v1 ---
            let twitterFollowDef : Types.ActionDefinition = {
                id = "twitter_follow_v1";
                var name = "Follow on Twitter";
                var descriptionTemplate = "Follow the account @{{accounts}} on Twitter.";
                platform = #Twitter;
                var version = 1;
                var defaultUIType = #ButtonOnly({ buttonText = "Verify Follow" });
                var parameterSchema = [{
                    name = "accounts";
                    dataType = #ArrayText;
                    isRequired = true;
                    var inputLabel = "Twitter Handle";
                    var helpText = ?"The Twitter account(s) to follow, without the '@'.";
                    var defaultValueJson = null;
                    var validationRegex = null;
                }];
                var outputSchemaJson = ?"{ \"followedAccounts\": [{ \"account\": \"string\", \"status\": \"#Success|#Failed|#AlreadyDone\" }] }";
                var executionHandler = "twitter_follow_handler_v1";
                var tags = ?["twitter", "social", "follow"];
            };
            // Correct syntax for StableTrieMap insertion
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, twitterFollowDef.id, twitterFollowDef);

            // --- Define Action: twitter_like_v1 ---
            let twitterLikeDef : Types.ActionDefinition = {
                id = "twitter_like_v1";
                var name = "Like a Tweet";
                var descriptionTemplate = "Like the tweet with ID {{tweetIds}}.";
                platform = #Twitter;
                var version = 1;
                var defaultUIType = #ButtonOnly({ buttonText = "Verify Like" });
                var parameterSchema = [{
                    name = "tweetIds";
                    dataType = #ArrayText;
                    isRequired = true;
                    var inputLabel = "Tweet ID";
                    var helpText = ?"The ID of the tweet to like.";
                    var defaultValueJson = null;
                    var validationRegex = null;
                }];
                var outputSchemaJson = ?"{ \"likedTweets\": [{ \"tweetId\": \"string\", \"status\": \"#Success|#Failed|#AlreadyDone\" }] }";
                var executionHandler = "twitter_like_handler_v1"; // Assumes a handler exists
                var tags = ?["twitter", "social", "like"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, twitterLikeDef.id, twitterLikeDef);

            // --- Define Action: discord_join_server_v1 ---
            let discordJoinDef : Types.ActionDefinition = {
                id = "discord_join_server_v1";
                var name = "Join Discord Server";
                var descriptionTemplate = "Join the Discord server.";
                platform = #Discord;
                var version = 1;
                var defaultUIType = #ButtonOnly({
                    buttonText = "Verify Membership";
                });
                var parameterSchema = [{
                    name = "serverIds";
                    dataType = #ArrayText;
                    isRequired = true;
                    var inputLabel = "Server ID";
                    var helpText = ?"The ID of the Discord server to join.";
                    var defaultValueJson = null;
                    var validationRegex = null;
                }];
                var outputSchemaJson = ?"{ \"serverId\": \"string\", \"serverName\": \"string\", \"joinStatus\": \"#Success|#Failed|#AlreadyDone\" }";
                var executionHandler = "discord_join_handler_v1"; // Assumes a handler exists
                var tags = ?["discord", "social", "community"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, discordJoinDef.id, discordJoinDef);

            // --- Define Action: sns_vote_proposal_v1 ---
            let snsVoteDef : Types.ActionDefinition = {
                id = "sns_vote_proposal_v1";
                var name = "Check SNS Proposal Vote";
                var descriptionTemplate = "Verify if user {{principalToCheck}} has voted on proposal #{{proposalId}} in the {{snsCanisterId}} SNS.";
                platform = #SNS;
                var version = 1;
                var defaultUIType = #ButtonOnly({ buttonText = "Verify Vote" });
                var parameterSchema = [
                    {
                        name = "snsCanisterId";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "SNS Canister ID";
                        var helpText = ?"The Principal ID of the SNS governance canister.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "proposalId";
                        dataType = #Nat;
                        isRequired = true;
                        var inputLabel = "Proposal ID";
                        var helpText = ?"The ID of the proposal to check the vote on.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "principalToCheck";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "User's Principal";
                        var helpText = ?"The Principal ID of the user whose vote should be checked.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                ];
                var outputSchemaJson = ?"{ \"snsCanisterId\": \"principal\", \"proposalId\": 1, \"principalChecked\": \"principal\", \"hasVoted\": true, \"voteCasted\": \"#Yes|#No|null\", \"verificationStatus\": \"#Success|#Failed\" }";
                var executionHandler = "sns_vote_handler_v1";
                var tags = ?["sns", "governance", "vote", "on-chain"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, snsVoteDef.id, snsVoteDef);

            // --- Define Action: validate_code_v1 ---
            let validateCodeDef : Types.ActionDefinition = {
                id = "validate_code_v1";
                var name = "Validate a Code";
                var descriptionTemplate = "Enter the secret code to complete this action.";
                platform = #CanisterEndpoint;
                var version = 1;
                var defaultUIType = #InputAndButton({
                    inputFields = [{
                        keyForUserInput = "codeToValidate";
                        inputLabel = "Secret Code";
                        placeholder = ?"Enter your code here";
                        isRequired = true;
                    }];
                    buttonText = "Validate Code";
                });
                var parameterSchema = [{
                    name = "codeListId";
                    dataType = #ArrayText;
                    isRequired = true;
                    var inputLabel = "Code List";
                    var helpText = ?"An array containing the code to be validated.";
                    var defaultValueJson = null;
                    var validationRegex = null;
                }];
                var outputSchemaJson = ?"{ \"code\": \"string\", \"isValid\": true, \"message\": \"string\", \"attemptsRemaining\": 1 }";
                var executionHandler = "validate_code_handler_v1";
                var tags = ?["utility", "code", "validation"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, validateCodeDef.id, validateCodeDef);

            // --- Define Action: validate_balance_token_v1 ---
            let validateMinToken : Types.ActionDefinition = {
                id = "validate_balance_token_v1";
                var name = "Validate an amount of an any token";
                var descriptionTemplate = "Using the user's principal, the token ID and an amount is validated if the user has at least that amount.";
                platform = #CanisterEndpoint;
                var version = 1;
                var defaultUIType = #NoUIRequired;
                var parameterSchema = [
                    {
                        name = "userUUID";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "user ID";
                        var helpText = ?"Text plane with user's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "tokenId";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "Text ID";
                        var helpText = ?"Text plane with Token's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "amount";
                        dataType = #Nat;
                        isRequired = true;
                        var inputLabel = "Amount of Tokens";
                        var helpText = ?"A number with the amount to validate";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                ];
                var outputSchemaJson = null;
                var executionHandler = "validate_balance_token_handler_v1";
                var tags = ?["token", "canister", "validation"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, validateMinToken.id, validateMinToken);

            // --- Define Action: validate_ownership_nft_v1 ---
            let validateOwnershipNFT : Types.ActionDefinition = {
                id = "validate_ownership_nft_v1";
                var name = "Validate ownership of an NFT";
                var descriptionTemplate = "The NFT to be requested in the mission is set and the user's ID is used to verify if they own any NFT of that type.";
                platform = #CanisterEndpoint;
                var version = 1;
                var defaultUIType = #NoUIRequired;
                var parameterSchema = [
                    {
                        name = "userUUID";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "user ID";
                        var helpText = ?"Text plane with user's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "nftId";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "NFT ID";
                        var helpText = ?"Text plane with NFT's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                ];
                var outputSchemaJson = null;
                var executionHandler = "validate_ownership_nft_handler_v1";
                var tags = ?["NFT", "canister", "validation"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, validateOwnershipNFT.id, validateOwnershipNFT);

            // --- Define Action: validate_generic_wallet_v1 ---
            let validateGenericWallet : Types.ActionDefinition = {
                id = "validate_generic_wallet_v1";
                var name = "Validate generic wallet";
                var descriptionTemplate = "Validate the creation of a wallet before a certain date";
                platform = #CanisterEndpoint;
                var version = 1;
                var defaultUIType = #NoUIRequired;
                var parameterSchema = [
                    {
                        name = "canisterId";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "canister ID";
                        var helpText = ?"Text plane with canister's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "userUUID";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "user ID";
                        var helpText = ?"Text plane with user's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "date";
                        dataType = #Nat;
                        isRequired = true;
                        var inputLabel = "creation date";
                        var helpText = ?"A number representing the date in nanoseconds";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "domain";
                        dataType = #Text;
                        isRequired = true;
                        var inputLabel = "name of the domain";
                        var helpText = ?"Text plane with name of the domain.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                ];
                var outputSchemaJson = null;
                var executionHandler = "validate_generic_wallet_handler_v1";
                var tags = ?["wallet", "canister", "validation"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, validateGenericWallet.id, validateGenericWallet);

            // --- Define Action: validate_generic_tansfer_v1 ---
            let validateGenericTransferOnWallet : Types.ActionDefinition = {
                id = "validate_generic_tansfer_v1";
                var name = "Validate generic transfer on wallet";
                var descriptionTemplate = "Validate the completion of a transfer in the generic wallet";
                platform = #CanisterEndpoint;
                var version = 1;
                var defaultUIType = #NoUIRequired;
                var parameterSchema = [
                    {
                        name = "canisterId";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "canister ID";
                        var helpText = ?"Text plane with canister's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "userUUID";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "user ID";
                        var helpText = ?"Text plane with user's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "date";
                        dataType = #Nat;
                        isRequired = true;
                        var inputLabel = "creation date";
                        var helpText = ?"A number representing the date in nanoseconds";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "amount";
                        dataType = #Nat;
                        isRequired = true;
                        var inputLabel = "transfer amount";
                        var helpText = ?"A number representing the transfer amount";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "domain";
                        dataType = #Text;
                        isRequired = true;
                        var inputLabel = "name of the domain";
                        var helpText = ?"Text plane with name of the domain.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                ];
                var outputSchemaJson = null;
                var executionHandler = "validate_generic_tansfer_handler_v1";
                var tags = ?["transfer", "canister", "validation", "wallet"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, validateGenericTransferOnWallet.id, validateGenericTransferOnWallet);
            
            // --- Define Action: validate_generic_track_referrals_v1 ---
            let validateGenericTrackReferrals : Types.ActionDefinition = {
                id = "validate_generic_track_referrals_v1";
                var name = "Validate referral tracking";
                var descriptionTemplate = "Generic validation of a user's referral tracking";
                platform = #CanisterEndpoint;
                var version = 1;
                var defaultUIType = #NoUIRequired;
                var parameterSchema = [
                    {
                        name = "canisterId";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "canister ID";
                        var helpText = ?"Text plane with canister's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "userUUID";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "user ID";
                        var helpText = ?"Text plane with user's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "domain";
                        dataType = #Text;
                        isRequired = true;
                        var inputLabel = "name of the domain";
                        var helpText = ?"Text plane with name of the domain.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                ];
                var outputSchemaJson = null;
                var executionHandler = "validate_generic_track_referrals_handler_v1";
                var tags = ?["Track", "canister", "validation"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, validateGenericTrackReferrals.id, validateGenericTrackReferrals);
            
            // --- Define Action: validate_generic_receipt_v1 ---
            let validateGenericReceiptOnWallet: Types.ActionDefinition = {
                id = "validate_generic_receipt_v1";
                var name = "Validate the receipt of money";
                var descriptionTemplate = "Validates the receipt of money in a wallet on a particular date";
                platform = #CanisterEndpoint;
                var version = 1;
                var defaultUIType = #NoUIRequired;
                var parameterSchema = [
                    {
                        name = "canisterId";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "canister ID";
                        var helpText = ?"Text plane with canister's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "userUUID";
                        dataType = #Principal;
                        isRequired = true;
                        var inputLabel = "user ID";
                        var helpText = ?"Text plane with user's ID.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "date";
                        dataType = #Nat;
                        isRequired = true;
                        var inputLabel = "creation date";
                        var helpText = ?"A number representing the date in nanoseconds";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "amount";
                        dataType = #Nat;
                        isRequired = true;
                        var inputLabel = "transfer amount";
                        var helpText = ?"A number representing the transfer amount";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                    {
                        name = "domain";
                        dataType = #Text;
                        isRequired = true;
                        var inputLabel = "name of the domain";
                        var helpText = ?"Text plane with name of the domain.";
                        var defaultValueJson = null;
                        var validationRegex = null;
                    },
                ];
                var outputSchemaJson = null;
                var executionHandler = "validate_generic_receipt_handler_v1";
                var tags = ?["Receipt", "canister", "validation"];
            };
            StableTrieMap.put(actionDefinitions, Text.equal, Text.hash, validateGenericReceiptOnWallet.id, validateGenericReceiptOnWallet);
        };
    };

    // Function to add an admin ID

    public shared (msg) func addAdminId(newAdminId : Principal) : async Result.Result<Null, Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Caller is not authorized.");
        };
        if (Array.find<Principal>(adminIds, func(id) { id == newAdminId }) != null) {
            return #err("Principal is already an admin.");
        };
        adminIds := Array.append<Principal>(adminIds, [newAdminId]);
        return #ok(null);
    };

    // Function to check if the principal is an admin

    private func isAdmin(principalId : Principal) : Bool {
        return Array.find<Principal>(
            adminIds,
            func(id) : Bool {
                id == principalId;
            },
        ) != null;
    };

    // Function to get all admin IDs

    public shared query (msg) func getAdminIds() : async [Principal] {
        if (isAdmin(msg.caller)) {
            return adminIds;
        };
        return [];
    };

    // Function to remove an admin ID

    public shared (msg) func removeAdminId(adminIdToRemove : Principal) : async Result.Result<Null, Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Caller is not authorized.");
        };
        if (Array.find<Principal>(adminIds, func(id) { id == adminIdToRemove }) == null) {
            return #err("Admin ID not found to remove.");
        };
        if (Array.size(adminIds) == 1 and adminIds[0] == adminIdToRemove) {
            return #err("Cannot remove the last admin.");
        };
        adminIds := Array.filter<Principal>(adminIds, func(id) : Bool { id != adminIdToRemove });
        return #ok(null);
    };

    public query func getActionDefinition(id : Text) : async ?Types.SerializedActionDefinition {
        switch (StableTrieMap.get<Text, Types.ActionDefinition>(actionDefinitions, Text.equal, Text.hash, id)) {
            case (?def) { return ?Serialization.serializeActionDefinition(def) };
            case null { return null };
        };
    };

    public query func listActionDefinitions(filter : ?ActionFilter) : async [Types.SerializedActionDefinition] {
        var collectedDefs : [Types.ActionDefinition] = [];
        for ((_id, def) in StableTrieMap.entries(actionDefinitions)) {
            var include = true;
            if (Option.isSome(filter)) {
                let f = switch (filter) {
                    case (?value) { value };
                    case null {
                        Debug.trap "filter is None, although Option.isSome was true";
                    };
                };

                // Platform filter
                switch (f.platform) {
                    case (?platformValue) {
                        if (def.platform != platformValue) {
                            include := false;
                        };
                    };
                    case null { () };
                };

                if (include and Option.isSome(f.tags)) {
                    let filterTags = Option.get(f.tags, []);
                    if (Array.size(filterTags) == 0) {} else {
                        let defTags = Option.get(def.tags, []);
                        let foundMatch = Array.find<Text>(
                            filterTags,
                            func(filterTag) {
                                Option.isSome(Array.find<Text>(defTags, func(defTag) { defTag == filterTag }));
                            },
                        );
                        if (Option.isNull(foundMatch)) {
                            include := false;
                        };
                    };
                };
            };

            if (include) {
                collectedDefs := Array.append(collectedDefs, [def]);
            };
        };
        let serializedResults = Array.map<Types.ActionDefinition, Types.SerializedActionDefinition>(
            collectedDefs,
            Serialization.serializeActionDefinition,
        );
        return serializedResults;
    };

    // --- ACTION EXECUTION ENGINE ---

    // Placeholder type for resolved parameters before constructing the specific ActionParameters variant
    // Key is parameterName (Text), Value is the deserialized Motoko value (Any).
    type ResolvedParamsMap = TrieMap.TrieMap<Text, Types.ParamValue>;

    private func buildConcreteActionParameters(
        actionDefId : Text,
        resolvedParams : TrieMap.TrieMap<Text, Types.ParamValue>, // ParamName -> Deserialized Motoko Value (as Any)
        actionDef : Types.ActionDefinition // Full action definition to access parameterSchema
    ) : Result.Result<Types.ActionParameters, Text> {

        // Helper to find a parameter's schema
        func findParamSchema(paramName : Text) : ?Types.ActionParameterDefinition {
            return Array.find(actionDef.parameterSchema, func(pd : Types.ActionParameterDefinition) : Bool { pd.name == paramName });
        };

        // Helper to get and cast a required parameter
        // Note: Motoko's generics are not like TypeScript/Java for getting type names easily for error messages.
        // We rely on the explicit type in the phénom cast.
        func getRequiredParam(paramNameText : Text) : Result.Result<Types.ParamValue, Text> {
            let paramSchemaOpt = findParamSchema(paramNameText);
            if (Option.isNull(paramSchemaOpt)) {
                return #err("Internal error: Parameter schema not found for '" # paramNameText # "' in action '" # actionDefId # "'.");
            };
            let paramSchema = switch (paramSchemaOpt) {
                case (?ps) { ps };
                case null {
                    // This case should not be reached if the Option.isNull check above is comprehensive
                    Debug.trap("Schema for param not found in ActionDef '" # actionDef.id # "'.");
                };
            };

            if (not paramSchema.isRequired) {
                // This helper is for required params. If called for an optional one, it's a logic error in the calling code.
                return #err("Internal logic error: getRequiredParam called for optional parameter '" # paramNameText # "'.");
            };

            let valueAnyOpt = resolvedParams.get(paramNameText);
            if (Option.isNull(valueAnyOpt)) {
                return #err("Missing required parameter '" # paramNameText # "' for action '" # actionDefId # "'.");
            };

            let valueAny = switch (valueAnyOpt) {
                case (?v) { v };
                case null {
                    Debug.trap("Unexpected null value in getOptionalParam for " # paramNameText);
                };
            };

            return #ok(valueAny);

        };

        // Helper to get and cast an optional parameter
        func getOptionalParam(paramNameText : Text) : Result.Result<?Types.ParamValue, Text> {
            let paramSchemaOpt = findParamSchema(paramNameText);
            if (Option.isNull(paramSchemaOpt)) {
                return #err("Internal error: Parameter schema not found for '" # paramNameText # "' in action '" # actionDefId # "'.");
            };
            let paramSchema = switch (paramSchemaOpt) {
                case (?ps) { ps };
                case null {
                    Debug.trap("Schema for param not found in ActionDef '" # actionDefId # "'.");
                };
            };

            if (paramSchema.isRequired) {
                return #err("Internal logic error: getOptionalParam called for required parameter '" # paramNameText # "'. Use getRequiredParam instead.");
            };

            let valueAnyOpt = resolvedParams.get(paramNameText);
            if (Option.isNull(valueAnyOpt)) {
                return #ok(null); // Parameter is optional and not provided, which is a valid state for ?ExpectedInnerType
            };
            let valueAny = switch (valueAnyOpt) {
                case (?v) { v };
                case null {
                    Debug.trap("Unexpected null value in getOptionalParam for " # paramNameText);
                };
            }; // valueAny is of type Any

            return #ok(?valueAny);

        };

        switch (actionDefId) {
            // ---- TWITTER ACTIONS ----
            case ("twitter_follow_v1") {
                // ... (existing correct logic for required params)
                switch (getRequiredParam("accounts")) {
                    case (#ok(rawParamValue)) {
                        switch (rawParamValue) {
                            case (#ArrayText(accountsArr)) {
                                if (Array.size(accountsArr) == 0) {
                                    return #err("Parameter 'accounts' for '" # actionDefId # "' cannot be an empty list.");
                                };
                                return #ok(#TwitterFollowParams({ var accounts = accountsArr }));
                            };
                            case (_) {
                                return #err("Parameter 'accounts' for '" # actionDefId # "' must be an array of Text.");
                            };
                        };
                    };
                    case (#err(e)) { return #err(e) };
                };
            };
            case ("twitter_retweet_v1") {
                // ... (existing correct logic for required params)
                switch (getRequiredParam("tweetIds")) {
                    case (#ok(rawParamValue)) {
                        switch (rawParamValue) {
                            case (#ArrayText(ids)) {
                                if (Array.size(ids) == 0) {
                                    return #err("Parameter 'tweetIds' for '" # actionDefId # "' cannot be an empty list.");
                                };
                                return #ok(#TweetRetweetParams({ var tweetIds = ids }));
                            };
                            case (_) {
                                return #err("Parameter 'tweetIds' for '" # actionDefId # "' must be an array of Text.");
                            };
                        };
                    };
                    case (#err(e)) { return #err(e) };
                };
            };
            case ("twitter_verify_tweet_v1") {
                var keywordsOpt : ?[Text] = null;
                var mentionsOpt : ?[Text] = null;
                var hashtagsOpt : ?[Text] = null;
                var cashtagsOpt : ?[Text] = null;
                var emojisOpt : ?[Text] = null;

                // Handle 'keywords'
                switch (getOptionalParam("keywords")) {
                    case (#ok(optParamValue)) {
                        // optParamValue is ?Types.ParamValue
                        switch (optParamValue) {
                            case (null) { keywordsOpt := null };
                            case (?(#ArrayText(arr))) { keywordsOpt := ?arr };
                            case (?_wrongType) {
                                return #err("Optional parameter 'keywords' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'keywords': " # e) };
                };

                // Handle 'mentions'
                switch (getOptionalParam("mentions")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { mentionsOpt := null };
                            case (?(#ArrayText(arr))) {
                                mentionsOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'mentions' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'mentions': " # e) };
                };

                // Handle 'hashtags'
                switch (getOptionalParam("hashtags")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { hashtagsOpt := null };
                            case (?(#ArrayText(arr))) {
                                hashtagsOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'hashtags' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'hashtags': " # e) };
                };

                // Handle 'cashtags'
                switch (getOptionalParam("cashtags")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { cashtagsOpt := null };
                            case (?(#ArrayText(arr))) {
                                cashtagsOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'cashtags' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'cashtags': " # e) };
                };

                // Handle 'emojis'
                switch (getOptionalParam("emojis")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { emojisOpt := null };
                            case (?(#ArrayText(arr))) {
                                emojisOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'emojis' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'emojis': " # e) };
                };

                if (keywordsOpt == null and mentionsOpt == null and hashtagsOpt == null and cashtagsOpt == null and emojisOpt == null) {
                    return #err("For '" # actionDefId # "', at least one of keywords, mentions, hashtags, cashtags, or emojis must be provided.");
                };

                return #ok(#VerifyTweetParams({ var keywords = keywordsOpt; var mentions = mentionsOpt; var hashtags = hashtagsOpt; var cashtags = cashtagsOpt; var emojis = emojisOpt }));
            };
            case ("twitter_like_v1") {
                // ... (existing correct logic for required params)
                switch (getRequiredParam("tweetIds")) {
                    case (#ok(rawParamValue)) {
                        switch (rawParamValue) {
                            case (#ArrayText(ids)) {
                                if (Array.size(ids) == 0) {
                                    return #err("Parameter 'tweetIds' for '" # actionDefId # "' cannot be an empty list.");
                                };
                                return #ok(#TweetLikeParams({ var tweetIds = ids }));
                            };
                            case (_) {
                                return #err("Parameter 'tweetIds' for '" # actionDefId # "' must be an array of Text.");
                            };
                        };
                    };
                    case (#err(e)) { return #err(e) };
                };
            };
            case ("twitter_bio_check_v1") {
                var keywordsOpt : ?[Text] = null;
                var mentionsOpt : ?[Text] = null;
                var hashtagsOpt : ?[Text] = null;
                var cashtagsOpt : ?[Text] = null;
                var emojisOpt : ?[Text] = null;

                // Handle 'keywords'
                switch (getOptionalParam("keywords")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { keywordsOpt := null };
                            case (?(#ArrayText(arr))) {
                                keywordsOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'keywords' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'keywords': " # e) };
                };

                // Handle 'mentions'
                switch (getOptionalParam("mentions")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { mentionsOpt := null };
                            case (?(#ArrayText(arr))) {
                                mentionsOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'mentions' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'mentions': " # e) };
                };

                // Handle 'hashtags'
                switch (getOptionalParam("hashtags")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { hashtagsOpt := null };
                            case (?(#ArrayText(arr))) {
                                hashtagsOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'hashtags' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'hashtags': " # e) };
                };

                // Handle 'cashtags'
                switch (getOptionalParam("cashtags")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { cashtagsOpt := null };
                            case (?(#ArrayText(arr))) {
                                cashtagsOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'cashtags' for '" # actionDefId # "' has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'cashtags': " # e) };
                };

                // Handle 'emojis'
                switch (getOptionalParam("emojis")) {
                    case (#ok(optParamValue)) {
                        switch (optParamValue) {
                            case (null) { emojisOpt := null };
                            case (?(#ArrayText(arr))) {
                                emojisOpt := ?arr;
                            };
                            case (?_wrongType) {
                                return #err("Optional parameter 'emojis' for " # actionDefId # " has incorrect type");
                            };
                        };
                    };
                    case (#err(e)) { return #err("Error for 'emojis': " # e) };
                };

                if (keywordsOpt == null and mentionsOpt == null and hashtagsOpt == null and cashtagsOpt == null and emojisOpt == null) {
                    return #err("For '" # actionDefId # "', at least one search criteria must be provided.");
                };
                return #ok(#TwitterBioCheckParams({ var keywords = keywordsOpt; var mentions = mentionsOpt; var hashtags = hashtagsOpt; var cashtags = cashtagsOpt; var emojis = emojisOpt }));
            };

            // ---- DISCORD ACTIONS ----
            case ("discord_join_server_v1") {
                // ... (existing correct logic for required params)
                switch (getRequiredParam("serverIds")) {
                    case (#ok(rawParamValue)) {
                        switch (rawParamValue) {
                            case (#ArrayText(ids)) {
                                if (Array.size(ids) == 0) {
                                    return #err("Parameter 'serverIds' for '" # actionDefId # "' cannot be an empty list.");
                                };
                                return #ok(#DiscordJoinServerParams({ var serverIds = ids }));
                            };
                            case (_) {
                                return #err("Parameter 'serverIds' for '" # actionDefId # "' must be an array of Text.");
                            };
                        };
                    };
                    case (#err(e)) { return #err(e) };
                };
            };

            // ---- REDDIT ACTIONS ----
            case ("reddit_join_subreddit_v1") {
                // ... (existing correct logic for required params)
                switch (getRequiredParam("subredditNames")) {
                    case (#ok(rawParamValue)) {
                        switch (rawParamValue) {
                            case (#ArrayText(names)) {
                                if (Array.size(names) == 0) {
                                    return #err("Parameter 'subredditNames' for '" # actionDefId # "' cannot be an empty list.");
                                };
                                return #ok(#RedditJoinSubredditParams({ var subredditNames = names }));
                            };
                            case (_) {
                                return #err("Parameter 'subredditNames' for '" # actionDefId # "' must be an array of Text.");
                            };
                        };
                    };
                    case (#err(e)) { return #err(e) };
                };
            };

            // ---- ON-CHAIN / SNS ----
            case ("sns_vote_proposal_v1") {
                var snsCanisterIdVal : Principal = Principal.fromText("aaaaa-aa");
                var proposalIdVal : Nat = 0;
                var principalToCheckVal : Principal = Principal.fromText("aaaaa-aa");

                switch (getRequiredParam("snsCanisterId")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) snsCanisterIdVal := p;
                            case _ return #err("Param 'snsCanisterId' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("proposalId")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#NatValue(n)) proposalIdVal := n;
                            case (#IntValue(i)) if (i >= 0) proposalIdVal := Int.abs(i) else return #err("proposalId negative");
                            case _ return #err("Param 'proposalId' not Nat");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("principalToCheck")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) principalToCheckVal := p;
                            case _ return #err("Param 'principalToCheck' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                return #ok(#VoteOnProposalParams({ var snsCanisterId = snsCanisterIdVal; var proposalId = proposalIdVal; var principalToCheck = principalToCheckVal }));
            };
            case ("sns_create_proposal_v1") {
                // ... (existing correct logic for required params)
                switch (getRequiredParam("snsCanisterId")) {
                    case (#ok(rawParamValue)) {
                        switch (rawParamValue) {
                            case (#PrincipalValue(id)) {
                                return #ok(#CreateProposalParams({ var snsCanisterId = id }));
                            };
                            case (_) {
                                return #err("Parameter 'snsCanisterId' for '" # actionDefId # "' must be a Principal.");
                            };
                        };
                    };
                    case (#err(e)) { return #err(e) };
                };
            };

            // ---- NUANCE ----
            case ("nuance_follow_v1") {
                // ... (existing correct logic for required params)
                switch (getRequiredParam("nuanceUsernames")) {
                    case (#ok(rawParamValue)) {
                        switch (rawParamValue) {
                            case (#ArrayText(names)) {
                                if (Array.size(names) == 0) {
                                    return #err("Parameter 'nuanceUsernames' for '" # actionDefId # "' cannot be an empty list.");
                                };
                                return #ok(#NuanceFollowParams({ var nuanceUsernames = names }));
                            };
                            case (_) {
                                return #err("Parameter 'nuanceUsernames' for '" # actionDefId # "' must be an array of Text.");
                            };
                        };
                    };
                    case (#err(e)) { return #err(e) };
                };
            };

            // ---- OTHER ----
            case ("validate_code_v1") {
                // ... (existing correct logic for required params)
                switch (getRequiredParam("codeListId")) {
                    case (#ok(rawParamValue)) {
                        switch (rawParamValue) {
                            case (#ArrayText(codes)) {
                                if (Array.size(codes) == 0) {
                                    return #err("Parameter 'codeListId' for '" # actionDefId # "' cannot be an empty list.");
                                };
                                return #ok(#ValidateCodeParams({ var codeListId = codes }));
                            };
                            case (_) {
                                return #err("Parameter 'codeListId' for '" # actionDefId # "' must be an array of Text.");
                            };
                        };
                    };
                    case (#err(e)) { return #err(e) };
                };
            };
            case ("validate_balance_token_v1") {
                var userUUID : Principal = Principal.fromText("aaaaa-aa");
                var tokenId : Principal = Principal.fromText("aaaaa-aa");
                var amount : Nat = 0;
                var subaccount : ?Blob = null;
                switch (getRequiredParam("userUUID")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) userUUID := p;
                            case _ return #err("Param 'userUUID' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("tokenId")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) tokenId := p;
                            case _ return #err("Param 'tokenId' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("amount")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#NatValue(p)) amount := p;
                            case (#IntValue(i)) if (i >= 0) amount := Int.abs(i) else return #err("amount negative");
                            case _ return #err("Param 'amount' not Nat");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                return #ok(#ValidateAmountTokenParams({ var userUUID = userUUID; var tokenId = tokenId; var amount = amount; var subaccount = subaccount }));
            };
            case ("validate_ownership_nft_v1") {
                var userUUID : Principal = Principal.fromText("aaaaa-aa");
                var nftId : Principal = Principal.fromText("aaaaa-aa");
                switch (getRequiredParam("userUUID")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) userUUID := p;
                            case _ return #err("Param 'userUUID' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("nftId")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) nftId := p;
                            case _ return #err("Param 'tokenId' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                return #ok(#ValidateOwnershipNFTParams({ var userUUID = userUUID; var nftId = nftId }));
            };
            case ("validate_generic_wallet_v1") {
                var canisterId : Principal = Principal.fromText("aaaaa-aa");
                var userUUID : Principal = Principal.fromText("aaaaa-aa");
                var date : Nat = 0;
                var domain : Text = "";
                switch (getRequiredParam("canisterId")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) canisterId := p;
                            case _ return #err("Param 'canisterId' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("userUUID")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) userUUID := p;
                            case _ return #err("Param 'userUUID' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("date")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#NatValue(p)) date := p;
                            case _ return #err("Param 'date' not Nat");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("domain")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#TextValue(p)) domain := p;
                            case _ return #err("Param 'domain' not Text");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                
                return #ok(#ValidateGenericWalletParams({ var canisterId = canisterId;var userUUID = userUUID;var date = date;var domain = domain}));
            };
            case ("validate_generic_tansfer_v1") {
                var canisterId : Principal = Principal.fromText("aaaaa-aa");
                var userUUID : Principal = Principal.fromText("aaaaa-aa");
                var date : Nat = 0;
                var amount : Nat = 0;
                var domain : Text = "";
                switch (getRequiredParam("canisterId")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) canisterId := p;
                            case _ return #err("Param 'canisterId' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("userUUID")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) userUUID := p;
                            case _ return #err("Param 'userUUID' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("date")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#NatValue(p)) date := p;
                            case _ return #err("Param 'date' not Nat");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("amount")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#NatValue(p)) amount := p;
                            case _ return #err("Param 'amount' not Nat");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("domain")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#TextValue(p)) domain := p;
                            case _ return #err("Param 'domain' not Text");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                
                return #ok(#ValidateGenericWalletParams({ var canisterId = canisterId;var userUUID = userUUID;var date = date;var domain = domain}));
            };
            case ("validate_generic_track_referrals_v1") {
                var canisterId : Principal = Principal.fromText("aaaaa-aa");
                var userUUID : Principal = Principal.fromText("aaaaa-aa");
                var date : Nat = 0;
                var domain : Text = "";
                switch (getRequiredParam("canisterId")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) canisterId := p;
                            case _ return #err("Param 'canisterId' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("userUUID")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) userUUID := p;
                            case _ return #err("Param 'userUUID' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("domain")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#TextValue(p)) domain := p;
                            case _ return #err("Param 'domain' not Text");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                
                return #ok(#ValidateGenericWalletParams({ var canisterId = canisterId;var userUUID = userUUID;var date = date;var domain = domain}));
            };
            case ("validate_generic_receipt_v1") {
                var canisterId : Principal = Principal.fromText("aaaaa-aa");
                var userUUID : Principal = Principal.fromText("aaaaa-aa");
                var date : Nat = 0;
                var amount : Nat = 0;
                var domain : Text = "";
                switch (getRequiredParam("canisterId")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) canisterId := p;
                            case _ return #err("Param 'canisterId' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("userUUID")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#PrincipalValue(p)) userUUID := p;
                            case _ return #err("Param 'userUUID' not Principal");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("date")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#NatValue(p)) date := p;
                            case _ return #err("Param 'date' not Nat");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("amount")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#NatValue(p)) amount := p;
                            case _ return #err("Param 'amount' not Nat");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                switch (getRequiredParam("domain")) {
                    case (#ok(val)) {
                        switch (val) {
                            case (#TextValue(p)) domain := p;
                            case _ return #err("Param 'domain' not Text");
                        };
                    };
                    case (#err(e)) return #err(e);
                };
                
                return #ok(#ValidateGenericWalletParams({ var canisterId = canisterId;var userUUID = userUUID;var date = date;var domain = domain}));
            };
            case (_) {
                if (Array.size(actionDef.parameterSchema) == 0) {
                    // Assuming #NoParams is a valid variant in Types.ActionParameters
                    return #ok(#NoParams);
                } else {
                    return #err("Parameter construction logic not implemented for action ID: '" # actionDefId # "'.");
                };
            };
        };
    };

    // Main execution function
    public shared (_msg) func executeActionStep(
        actionFlowJsonText : Text,
        currentStepIdToExecute : Nat,
        userInputJsonText : ?Text,
        missionContextJsonText : ?Text,
        previousStepOutputsJsonText : Text,
    ) : async Text {
        var finalActionInstanceId : Nat = 0;

        // Helper to serialize the final result record to JSON text
        func buildResultJson(resultRecord : Types.ExecuteActionResult) : Text {
            switch (JsonUtils.serializeExecuteActionResultToJsonObj(resultRecord)) {
                case (#ok(jsonObj)) {
                    return Json.stringify(jsonObj, null); // Primary, good path
                };
                case (#err(e)) {
                    // Fallback path, needs fixing
                    Debug.print("CRITICAL: Failed to serialize ExecuteActionResult: " # e);

                    // 1. Properly escape the error message 'e' for JSON string embedding
                    let safe_e_backslash_escaped = Text.replace(e, #text("\\"), "\\\\"); // Replace \ with \\
                    let safe_e_fully_escaped = Text.replace(safe_e_backslash_escaped, #text("\""), "\\\""); // Replace " with \"
                    // You might need to add more replacements for other JSON special characters like \n, \r, \t, \b, \f
                    // For example:
                    // let safe_e_newline_escaped = Text.replace(safe_e_fully_escaped, #text("\n"), "\\n");
                    // ... and so on for other characters.

                    // 2. Serialize status and outcome as strings, consistent with the main path
                    let executionStatusStr = JsonUtils.serializeActionStatusToString(resultRecord.executionStatus);
                    let actionOutcomeStr = JsonUtils.serializeActionOutcomeToString(resultRecord.actionOutcome);

                    // 3. Construct the JSON string carefully
                    var fields : [Text] = [];
                    fields := Array.append(fields, ["\"stepIdProcessed\":" # Nat.toText(resultRecord.stepIdProcessed)]);
                    fields := Array.append(fields, ["\"actionInstanceIdProcessed\":" # Nat.toText(resultRecord.actionInstanceIdProcessed)]);
                    fields := Array.append(fields, ["\"overallSuccess\":" # Bool.toText(resultRecord.overallSuccess)]);
                    fields := Array.append(fields, ["\"executionStatus\":\"" # executionStatusStr # "\""]);
                    fields := Array.append(fields, ["\"actionOutcome\":\"" # actionOutcomeStr # "\""]);
                    fields := Array.append(fields, ["\"message\":\"Internal error: Failed to serialize result. " # safe_e_fully_escaped # "\""]); // Use the escaped message
                    fields := Array.append(fields, ["\"returnedDataJson\":null"]);

                    switch (resultRecord.nextStepIdToProcess) {
                        case (?n) {
                            fields := Array.append(fields, ["\"nextStepIdToProcess\":" # Nat.toText(n)]);
                        };
                        case null {
                            fields := Array.append(fields, ["\"nextStepIdToProcess\":null"]);
                        };
                    };
                    switch (resultRecord.isFlowCompleted) {
                        case (?b) {
                            fields := Array.append(fields, ["\"isFlowCompleted\":" # Bool.toText(b)]);
                        };
                        case null {
                            fields := Array.append(fields, ["\"isFlowCompleted\":null"]);
                        };
                    };

                    return "{" # Text.join(",", Array.vals(fields)) # "}";
                };
            };
        };

        // Helper to build and stringify an error ExecuteActionResult
        func buildErrorReturn(execStatus_ : Types.ActionStatus, outcome_ : Types.ActionOutcome, errMsg_ : Text) : Text {
            let errorResultRecord : Types.ExecuteActionResult = {
                stepIdProcessed = currentStepIdToExecute;
                actionInstanceIdProcessed = finalActionInstanceId;
                overallSuccess = false;
                executionStatus = execStatus_;
                actionOutcome = outcome_;
                message = ?errMsg_;
                returnedDataJson = null;
                nextStepIdToProcess = null;
                isFlowCompleted = ?false;
            };
            return buildResultJson(errorResultRecord);
        };

        // --- 1. Deserialize ActionFlow, UserInput, MissionContext JSONs ---
        var actionFlow : Types.ActionFlow = {
            var completionLogic = #AllInOrder;
            var name = null;
            var steps = [];
        };
        switch (Json.parse(actionFlowJsonText)) {
            case (#ok(jsonVal)) {
                switch (JsonUtils.deserializeActionFlowFromJson(jsonVal)) {
                    case (#ok(flow)) { actionFlow := flow };
                    case (#err(e)) {
                        return buildErrorReturn(#Error, #Failed, "Cannot convert JSON to ActionFlow: " # e);
                    };
                };
            };
            case (#err(e)) {
                return buildErrorReturn(#Error, #Failed, "Failed to parse actionFlowJsonText: " # Json.errToText(e));
            };
        };
        Debug.print("Se consigue actionflow");
        var userInputJsonObj : ?Json.Json = null;
        if (Option.isSome(userInputJsonText)) {
            Debug.print(debug_show (userInputJsonText));
            let txt = Option.get(userInputJsonText, "");
            switch (Json.parse(txt)) {
                case (#ok(json)) {
                    Debug.print(debug_show (json));
                    userInputJsonObj := ?json;
                };
                case (#err(e)) {
                    return buildErrorReturn(#InvalidParameters, #Failed, "Failed to parse userInputJsonText: " # Json.errToText(e));
                };
            };
        };
        Debug.print("Se consigue userinput");
        var missionContextJsonObj : ?Json.Json = null;
        if (Option.isSome(missionContextJsonText)) {
            let txt = Option.get(missionContextJsonText, "");
            switch (Json.parse(txt)) {
                case (#ok(json)) { missionContextJsonObj := ?json };
                case (#err(e)) {
                    return buildErrorReturn(#Error, #Failed, "Failed to parse missionContextJsonText: " # Json.errToText(e));
                };
            };
        };
        Debug.print("Se consigue missioncontext");
        var previousStepOutputsMap : TrieMap.TrieMap<Nat, Json.Json> = TrieMap.TrieMap<Nat, Json.Json>(
            Nat.equal,
            func(n : Nat) : Hash.Hash {
                return Text.hash(Nat.toText(n));
            },
        );
        switch (JsonUtils.deserializePreviousStepOutputs(previousStepOutputsJsonText)) {
            case (#err(e)) {
                return buildErrorReturn(#Error, #Failed, "Invalid previousStepOutputsJson: " # e);
            };
            case (#ok(map)) { previousStepOutputsMap := map };
        };
        Debug.print("Se consigue el paso 1 totalmente");
        // --- 2. Find the current Types.ActionStep ---
        let currentActionStepOpt = Array.find<Types.ActionStep>(actionFlow.steps, func(s) { s.stepId == currentStepIdToExecute });
        if (Option.isNull(currentActionStepOpt)) {
            return buildErrorReturn(#InvalidParameters, #Failed, "Step ID " # Nat.toText(currentStepIdToExecute) # " not found in ActionFlow.");
        };
        let stepToExecute = Option.get(currentActionStepOpt, actionFlow.steps[0]);
        Debug.print("Se consigue paso 2");
        // --- 3. Get the Types.ActionInstance ---
        var actionInstanceToExecute : Types.ActionInstance = {
            actionDefinitionId = "";
            instanceId = 0;
            var parameterBindings = [];
            var uiInteraction = #NoUIRequired;
        };
        switch (stepToExecute.item) {
            case (#SingleAction(instance)) {
                actionInstanceToExecute := instance;
            };
            case (#ActionGroup(group)) {
                if (Array.size(group.actions) == 0) {
                    return buildErrorReturn(#InvalidParameters, #Failed, "ActionGroup for step " # Nat.toText(currentStepIdToExecute) # " is empty.");
                };
                actionInstanceToExecute := group.actions[0];
            };
        };
        finalActionInstanceId := actionInstanceToExecute.instanceId;
        Debug.print(debug_show (actionInstanceToExecute));
        Debug.print("Se consigue paso 3");
        // --- 4. Look up Types.ActionDefinition ---
        let actionDefOpt = StableTrieMap.get(actionDefinitions, Text.equal, Text.hash, actionInstanceToExecute.actionDefinitionId);
        if (Option.isNull(actionDefOpt)) {
            return buildErrorReturn(#HandlerNotFound, #Failed, "ActionDefinition not found: " # actionInstanceToExecute.actionDefinitionId);
        };
        let actionDef : Types.ActionDefinition = switch (actionDefOpt) {
            case (?def) def;
            case null {
                Debug.trap("Critical logic error: actionDefOpt was null after explicit null check and return.");
            };
        };
        Debug.print("Se consigue paso 4");
        // --- 5. Resolve all actionInstanceToExecute.parameterBindings ---
        var resolvedParamsCollector : TrieMap.TrieMap<Text, Types.ParamValue> = TrieMap.TrieMap<Text, Types.ParamValue>(Text.equal, Text.hash);
        var resolutionErrorMsg : ?Text = null;

        for (binding in actionInstanceToExecute.parameterBindings.vals()) {
            if (resolutionErrorMsg != null) { return "Error" };
            Debug.print("Se consigue pasar primer if");
            var resolvedJsonForParam : Json.Json = Json.str("");
            Debug.print(debug_show (binding));
            switch (binding.valueSource) {
                case (#LiteralValue(jsonStringValueToParse)) {
                    Debug.print("Se consigue el caso de uso correcto");
                    switch (Json.parse(jsonStringValueToParse)) {
                        case (#ok(jsonVal)) {
                            Debug.print("Se consigue primera seriaización");
                            Debug.print(debug_show (jsonVal));
                            resolvedJsonForParam := jsonVal;
                        };
                        case (#err(e)) {
                            Debug.print("Dio error?");
                            resolutionErrorMsg := ?("Param '" # binding.parameterName # "': Invalid LiteralValue JSON: " # Json.errToText(e));
                        };
                    };
                };
                case (#PreviousStepOutput(source)) {
                    switch (previousStepOutputsMap.get(source.sourceStepId)) {
                        case null {
                            resolutionErrorMsg := ?("Param '" # binding.parameterName # "': Output from sourceStepId " # Nat.toText(source.sourceStepId) # " not found.");
                        };
                        case (?stepOutputJsonObj) {
                            let valOpt = Json.get(stepOutputJsonObj, source.outputKeyPath);
                            if (valOpt == null) {
                                resolutionErrorMsg := ?("Param '" # binding.parameterName # "': Path '" # source.outputKeyPath # "' not found in output of step " # Nat.toText(source.sourceStepId));
                            } else {
                                resolvedJsonForParam := switch (valOpt) {
                                    case (?v) { v };
                                    case null {
                                        Debug.trap("Unexpected null value for parameter '" # binding.parameterName # "'.");
                                    };
                                };
                            };
                        };
                    };
                };
                case (#UserSuppliedInput(source)) {
                    Debug.print(debug_show ("Probando userSupplied"));
                    Debug.print(debug_show (source));
                    Debug.print(debug_show (userInputJsonObj));
                    if (userInputJsonObj == null) {
                        resolutionErrorMsg := ?("Param '" # binding.parameterName # "': UserSuppliedInput required ('" # source.inputKeyPath # "') but no user input JSON provided.");
                    } else {
                        let userInput = switch (userInputJsonObj) {
                            case (?obj) {
                                Debug.print(debug_show (obj));
                                obj;
                            };
                            case null { Debug.trap("userInputJsonObj is null") };
                        };
                        let valOpt = Json.get(userInput, source.inputKeyPath);
                        if (valOpt == null) {
                            resolutionErrorMsg := ?("Param '" # binding.parameterName # "': Path '" # source.inputKeyPath # "' not found in user supplied input JSON.");
                        } else {
                            resolvedJsonForParam := switch (valOpt) {
                                case (?v) {
                                    Debug.print(debug_show (v));
                                    v;
                                };
                                case null {
                                    Debug.trap("Unexpected null value for parameter '" # binding.parameterName # "'.");
                                };
                            };
                        };
                    };
                };
                case (#MissionContext(source)) {
                    if (missionContextJsonObj == null) {
                        resolutionErrorMsg := ?("Param '" # binding.parameterName # "': MissionContext required ('" # source.contextKey # "') but no mission context JSON provided.");
                    } else {
                        let missionContext = switch (missionContextJsonObj) {
                            case (?json) { json };
                            case null {
                                Debug.trap("Mission context JSON is missing.");
                            };
                        };
                        let valOpt = Json.get(missionContext, source.contextKey);
                        if (valOpt == null) {
                            resolutionErrorMsg := ?("Param '" # binding.parameterName # "': Key '" # source.contextKey # "' not found in mission context JSON.");
                        } else {
                            resolvedJsonForParam := switch (valOpt) {
                                case (?v) { v };
                                case null {
                                    Debug.trap("Unexpected null value for parameter '" # binding.parameterName # "'.");
                                };
                            };
                        };
                    };
                };
            };

            if (resolutionErrorMsg != null) {};
            Debug.print(debug_show (actionDef));
            var paramDefOpt = Array.find<Types.ActionParameterDefinition>(actionDef.parameterSchema, func(pd : Types.ActionParameterDefinition) : Bool { pd.name == binding.parameterName });
            if (Option.isNull(paramDefOpt)) {
                Debug.print("Error en el null");
                resolutionErrorMsg := ?("Schema for param '" # binding.parameterName # "' not found in ActionDef '" # actionDef.id # "'.");
            };
            let paramDef = switch (paramDefOpt) {
                case (?pd) { pd };
                case null {
                    Debug.print("error en paramdef");
                    resolutionErrorMsg := ?("Schema for param '" # binding.parameterName # "' not found in ActionDef '" # actionDef.id # "'.");
                    Debug.trap("Parameter schema not found in ActionDef '" # actionDef.id # "'.");
                };
            };
            Debug.print("Se llega un momento de deserializar");
            Debug.print(debug_show (resolvedJsonForParam));
            Debug.print(debug_show (paramDef));
            switch (JsonUtils.deserializeJsonValueToMotokoType(resolvedJsonForParam, paramDef.dataType)) {
                case (#err(errMsg)) {
                    Debug.print("Error al deserializar");
                    resolutionErrorMsg := ?("Param '" # binding.parameterName # "': " # errMsg);
                };
                case (#ok(motokoVal)) {
                    Debug.print("Deserialización exitosa");
                    resolvedParamsCollector.put(binding.parameterName, motokoVal);
                };
            };
        };
        if (resolutionErrorMsg != null) {
            return buildErrorReturn(#InvalidParameters, #Failed, "Parameter resolution failed: " # Option.get(resolutionErrorMsg, "Unknown error"));
        };
        Debug.print("Se consigue paso 5");
        // --- 6. Construct the concrete Types.ActionParameters variant ---
        var concreteActionParams : Types.ActionParameters = #NoParams;
        Debug.print(debug_show (actionDef.id));
        Debug.print(debug_show (Iter.toArray(resolvedParamsCollector.entries())));
        Debug.print(debug_show (actionDef));
        switch (buildConcreteActionParameters(actionDef.id, resolvedParamsCollector, actionDef)) {
            case (#ok(params)) { concreteActionParams := params };
            case (#err(e)) {
                return buildErrorReturn(#InvalidParameters, #Failed, "Failed to build concrete params: " # e);
            };
        };
        Debug.print("Se consigue paso 6");
        // --- 7. Call the specific execution handler ---
        type HandlerOk = {
            outcome : Types.ActionOutcome;
            returnedData : ?Types.ActionReturnedData;
            message : ?Text;
        };
        type HandlerErr = {
            status : Types.ActionStatus;
            outcome : Types.ActionOutcome;
            message : Text;
        };
        type HandlerResult = Result.Result<HandlerOk, HandlerErr>;

        var handlerOutcome : HandlerResult = #err({
            status = #HandlerNotFound;
            outcome = #Failed;
            message = "Default error: handler outcome not initialized.";
        });
        switch (actionDef.executionHandler) {
            case ("twitter_follow_handler_v1") {
                handlerOutcome := Actions.handleTwitterFollow(concreteActionParams);
            };
            case ("sns_vote_handler_v1") {
                handlerOutcome := await Actions.handleSnsVote(concreteActionParams);
            };
            case ("validate_code_handler_v1") {
                handlerOutcome := Actions.handleValidateCode(concreteActionParams);
            };
            case ("validate_balance_token_handler_v1") {
                handlerOutcome := await Actions.handleValidateBalanceToken(concreteActionParams);
            };
            case ("validate_ownership_nft_handler_v1") {
                handlerOutcome := await Actions.handleValidateOwnershipNFT(concreteActionParams);
            };
            case (_) {
                handlerOutcome := #err({
                    status = #HandlerNotFound;
                    outcome = #Failed;
                    message = "Execution handler '" # actionDef.executionHandler # "' not implemented.";
                });
            };
        };
        Debug.print("Se consigue paso 7");
        // --- 8. Assemble ExecuteActionResult, including next step and flow completion logic ---
        var finalResultRecord : Types.ExecuteActionResult = {
            stepIdProcessed = 0;
            actionInstanceIdProcessed = 0;
            overallSuccess = false;
            executionStatus = #Ok;
            actionOutcome = #Failed;
            message = null;
            returnedDataJson = null;
            nextStepIdToProcess = null;
            isFlowCompleted = null;
        };
        var determinedNextStepId : ?Nat = null;
        var determinedIsFlowCompleted : ?Bool = ?false;

        switch (handlerOutcome) {
            case (#ok(successData)) {
                let instanceSuccess = (successData.outcome == #Success or successData.outcome == #AlreadyDone);
                Debug.print(debug_show (instanceSuccess));
                if (instanceSuccess) {
                    let currentStepOpt = Array.find<Types.ActionStep>(actionFlow.steps, func(s) { s.stepId == currentStepIdToExecute });

                    if (Option.isSome(currentStepOpt)) {
                        switch (actionFlow.completionLogic) {
                            case (#AllInOrder) {
                                var currentStepIndexOpt : ?Nat = null;
                                var i : Nat = 0;
                                while (i < Array.size(actionFlow.steps)) {
                                    if (actionFlow.steps[i].stepId == currentStepIdToExecute) {
                                        currentStepIndexOpt := ?i;
                                    };
                                    i += 1;
                                };
                                if (Option.isSome(currentStepIndexOpt)) {
                                    let currentIndex = Option.get(currentStepIndexOpt, 0);
                                    if (currentIndex + 1 < Array.size(actionFlow.steps)) {
                                        determinedNextStepId := ?actionFlow.steps[currentIndex + 1].stepId;
                                        determinedIsFlowCompleted := ?false;
                                    } else {
                                        determinedNextStepId := null;
                                        determinedIsFlowCompleted := ?true;
                                    };
                                } else {
                                    Debug.print("Error: Could not find current step index for #AllInOrder logic. CurrentStepID: " # Nat.toText(currentStepIdToExecute));
                                    determinedIsFlowCompleted := ?false;
                                };
                            };
                            case (#AllAnyOrder) {
                                determinedNextStepId := null;

                                var allStepsInFlowAreDone = true;
                                for (flowStep in actionFlow.steps.vals()) {
                                    if ((flowStep.stepId != currentStepIdToExecute) and (Option.isNull(previousStepOutputsMap.get(flowStep.stepId)))) {
                                        allStepsInFlowAreDone := false;
                                    };
                                };
                                determinedIsFlowCompleted := ?allStepsInFlowAreDone;
                            };
                        };
                    } else {
                        determinedIsFlowCompleted := ?false;
                    };
                } else {
                    determinedNextStepId := null;
                    determinedIsFlowCompleted := ?false;
                };

                finalResultRecord := {
                    stepIdProcessed = currentStepIdToExecute;
                    actionInstanceIdProcessed = actionInstanceToExecute.instanceId;
                    overallSuccess = instanceSuccess;
                    executionStatus = #Ok;
                    actionOutcome = successData.outcome;
                    message = successData.message;
                    returnedDataJson = switch (successData.returnedData) {
                        case null null;
                        case (?data) {
                            switch (JsonUtils.serializeActionReturnedDataToJsonObj(data)) {
                                case (#ok(jsonObj)) ?Json.stringify(jsonObj, null);
                                case (#err(e)) {
                                    Debug.print("Error serializing returnedData: " # e);
                                    null;
                                };
                            };
                        };
                    };
                    nextStepIdToProcess = determinedNextStepId;
                    isFlowCompleted = determinedIsFlowCompleted;
                };
            };
            case (#err(errorData)) {
                finalResultRecord := {
                    stepIdProcessed = currentStepIdToExecute;
                    actionInstanceIdProcessed = actionInstanceToExecute.instanceId;
                    overallSuccess = false;
                    executionStatus = errorData.status;
                    actionOutcome = errorData.outcome;
                    message = ?errorData.message;
                    returnedDataJson = null;
                    nextStepIdToProcess = null;
                    isFlowCompleted = ?false;
                };
            };
        };
        Debug.print("Se consigue paso 8");
        // --- 9. Serialize finalResultRecord to JSON text and return it. ---
        return buildResultJson(finalResultRecord);
    };

    type Icrc28TrustedOriginsResponse = {
        trusted_origins : [Text];
    };

    public shared query func icrc28_trusted_origins() : async Icrc28TrustedOriginsResponse {
        let trusted_origins : [Text] = [
            "https://3qzqh-pqaaa-aaaag-qnheq-cai.icp0.io",
            "https://3qzqh-pqaaa-aaaag-qnheq-cai.raw.icp0.io",
            "https://3qzqh-pqaaa-aaaag-qnheq-cai.ic0.app",
            "https://3qzqh-pqaaa-aaaag-qnheq-cai.raw.ic0.app",
        ];

        return {
            trusted_origins;
        };
    };
};
