import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Float "mo:base/Float";
import Nat32 "mo:base/Nat32";
import Json "mo:json";

import NewTypes "NewTypes";
import HTTPTypes "HTTPTypes";
import StableTrieMap "../StableTrieMap";
import Serialization "Serialization";
import Helpers "Helpers";
import AnalyticsTypes "AnalyticsTypes";

persistent actor class ProjectBackend() {

    // --- CONFIGURATION ---
    private transient var indexCanisterId : Text = "q3itu-vqaaa-aaaag-qngyq-cai";
    private transient var actionsCanisterIdText : Text = "3c7h6-daaaa-aaaag-qnhhq-cai";
    private transient var web2PrincipalId : Text = "stg2p-p2rin-7mwfy-nct57-llsvt-h7ftf-f3edr-rmqc2-khb2e-c5efd-iae";
    private transient let MAX_ASSET_SIZE_BYTES : Nat = 1024 * 1024 * 2;

    // --- STATE VARIABLES ---

    stable var adminPermissions : StableTrieMap.StableTrieMap<Principal, NewTypes.Permissions> = StableTrieMap.new<Principal, NewTypes.Permissions>();

    stable var projectInfo : NewTypes.ProjectDetails = {
        var name = "Placeholder Project";
        var isVisible = false;
        var iconUrl = null;
        var bannerUrl = null;
        var description = "This is a placeholder project description.";
        var aboutInfo = null;
        var contactInfo = {
            var xAccountUrl = null;
            var telegramGroupUrl = null;
            var discordInviteUrl = null;
            var openChatUrl = null;
            var websiteUrl = null;
            var emailContact = null;
            var otherLinks = null;
        };
        var lastUpdated = 0;
        var updatedBy = Principal.fromText("aaaaa-aa");
    };

    stable var missions : StableTrieMap.StableTrieMap<Nat, NewTypes.Mission> = StableTrieMap.new<Nat, NewTypes.Mission>();
    // userUUID (Text) -> Mission ID (Nat) -> ActionInstance ID (Nat) -> UserActionState
    stable var userProgress : StableTrieMap.StableTrieMap<Text, StableTrieMap.StableTrieMap<Nat, NewTypes.UserMissionProgress>> = StableTrieMap.new<Text, StableTrieMap.StableTrieMap<Nat, NewTypes.UserMissionProgress>>();
    stable var missionAssets : StableTrieMap.StableTrieMap<Text, Blob> = StableTrieMap.new<Text, Blob>();

    system func postupgrade() {
        // This block runs on install and upgrade.
        // We only want to set initial admins if the map is currently empty (e.g., on fresh install).
        if (StableTrieMap.isEmpty(adminPermissions)) {
            // 1. Super Admin with full permissions
            let superAdminPrincipalText = "c2c6j-722ky-pnurz-sfhtg-p36de-3kjkr-sukce-mihdx-avf5m-k2zmh-3qe";
            switch (Principal.fromText(superAdminPrincipalText)) {
                case ((saPrincipal)) {
                    let fullPermissions : NewTypes.Permissions = {
                        var addAdmin = true;
                        var removeAdmin = true;
                        var editAdmin = true;
                        var viewAdmins = true;
                        var editProjectInfo = true;
                        var createMission = true;
                        var editMissionInfo = true;
                        var editMissionFlow = true;
                        var updateMissionStatus = true;
                        var viewAnyUserProgress = true;
                        var resetUserProgress = true;
                        var adjustUserProgress = true;
                    };
                    StableTrieMap.put(adminPermissions, Principal.equal, Principal.hash, saPrincipal, fullPermissions);
                    Debug.print("Super admin (" # superAdminPrincipalText # ") initialized with full permissions.");
                };
            };

            // 2. web2PrincipalId with adjustUserProgress permission
            // web2PrincipalId is already defined as an actor variable
            switch (Principal.fromText(web2PrincipalId)) {
                case ((w2Principal)) {
                    let web2Permissions : NewTypes.Permissions = {
                        var addAdmin = false;
                        var removeAdmin = false;
                        var editAdmin = false;
                        var viewAdmins = false;
                        var editProjectInfo = false;
                        var createMission = false;
                        var editMissionInfo = false;
                        var editMissionFlow = false;
                        var updateMissionStatus = false;
                        var viewAnyUserProgress = false;
                        var resetUserProgress = false;
                        var adjustUserProgress = true;
                    };
                    StableTrieMap.put(adminPermissions, Principal.equal, Principal.hash, w2Principal, web2Permissions);
                    Debug.print("web2PrincipalId (" # web2PrincipalId # ") initialized with adjustUserProgress permission.");
                };
            };
        } else {
            Debug.print("Admin permissions map already populated. Skipping default admin initialization.");
        };
    };

    // --- ADMIN FUNCTIONS ---

    private func hasPermission(adminId : Principal, permissionToCheck : NewTypes.PermissionKey) : Bool {
        switch (StableTrieMap.get(adminPermissions, Principal.equal, Principal.hash, adminId)) {
            case null {
                return false;
            };
            case (?userPermissions) {
                switch (permissionToCheck) {
                    // Admin Management
                    case (#CanAddAdmin) { return userPermissions.addAdmin };
                    case (#CanRemoveAdmin) {
                        return userPermissions.removeAdmin;
                    };
                    case (#CanEditAdminPermissions) {
                        return userPermissions.editAdmin;
                    };
                    case (#CanViewAdmins) { return userPermissions.viewAdmins };

                    // Project Info
                    case (#CanEditProjectInfo) {
                        return userPermissions.editProjectInfo;
                    };

                    // Missions
                    case (#CanCreateMission) {
                        return userPermissions.createMission;
                    };
                    case (#CanEditMissionInfo) {
                        return userPermissions.editMissionInfo;
                    };
                    case (#CanEditMissionFlow) {
                        return userPermissions.editMissionFlow;
                    };
                    case (#CanUpdateMissionStatus) {
                        return userPermissions.updateMissionStatus;
                    };

                    // User Progress
                    case (#CanViewAnyUserProgress) {
                        return userPermissions.viewAnyUserProgress;
                    };
                    case (#CanResetUserProgress) {
                        return userPermissions.resetUserProgress;
                    };
                    case (#CanAdjustUserProgress) {
                        return userPermissions.adjustUserProgress;
                    };
                };
            };
        };
    };

    private func isLastAdminWithSpecificPermission(adminToCheck : Principal, permissionFieldGetter : (NewTypes.Permissions) -> Bool) : Bool {
        var othersWithThisPermission : Nat = 0;
        for ((p, perms) in StableTrieMap.entries(adminPermissions)) {
            if (p != adminToCheck) {
                // Only check other admins
                if (permissionFieldGetter(perms)) {
                    othersWithThisPermission += 1;
                };
            };
        };
        return othersWithThisPermission == 0;
    };

    public shared (msg) func addAdminWithPermissions(newAdminPrincipal : Principal, permissionsToGrant : NewTypes.SerializedPermissions) : async Result.Result<Null, Text> {
        if (not hasPermission(msg.caller, #CanAddAdmin)) {
            return #err("Caller does not have permission to add admins.");
        };
        if (StableTrieMap.containsKey(adminPermissions, Principal.equal, Principal.hash, newAdminPrincipal)) {
            return #err("Principal is already an admin.");
        };
        StableTrieMap.put(adminPermissions, Principal.equal, Principal.hash, newAdminPrincipal, Serialization.deserializePermissions(permissionsToGrant));
        return #ok(null);
    };

    public shared (msg) func updateAdminPermissions(adminPrincipalToEdit : Principal, newPermissionsInput : NewTypes.SerializedPermissions) : async Result.Result<Null, Text> {

        if (not hasPermission(msg.caller, #CanEditAdminPermissions)) {
            return #err("Caller does not have permission to edit admin permissions.");
        };

        let currentPermissionsOpt = StableTrieMap.get(adminPermissions, Principal.equal, Principal.hash, adminPrincipalToEdit);
        if (Option.isNull(currentPermissionsOpt)) {
            return #err("Admin ID not found to update.");
        };

        let currentPermissions : NewTypes.Permissions = switch (currentPermissionsOpt) {
            case (?perms) { perms };
            case null {
                Debug.trap("Unreachable: currentPermissionsOpt was null after check.");
            };
        };

        let newPermissionsToApply : NewTypes.Permissions = Serialization.deserializePermissions(newPermissionsInput);

        // Safeguards: Apply if an admin is editing their own permissions
        if (msg.caller == adminPrincipalToEdit) {
            // Safeguard 3.1: Prevent removing own 'editAdmin' permission if last one
            if (currentPermissions.editAdmin == true and newPermissionsToApply.editAdmin == false) {
                if (isLastAdminWithSpecificPermission(msg.caller, func(p : NewTypes.Permissions) : Bool { p.editAdmin })) {
                    return #err("Cannot remove your own 'editAdmin' permission as you are the last admin with it.");
                };
            };

            // Safeguard 3.2: Prevent removing own 'addAdmin' permission if last one
            if (currentPermissions.addAdmin == true and newPermissionsToApply.addAdmin == false) {
                if (isLastAdminWithSpecificPermission(msg.caller, func(p : NewTypes.Permissions) : Bool { p.addAdmin })) {
                    return #err("Cannot remove your own 'addAdmin' permission as you are the last admin with it.");
                };
            };

            // Safeguard 3.3: Prevent removing own 'removeAdmin' permission if last one
            if (currentPermissions.removeAdmin == true and newPermissionsToApply.removeAdmin == false) {
                if (isLastAdminWithSpecificPermission(msg.caller, func(p : NewTypes.Permissions) : Bool { p.removeAdmin })) {
                    return #err("Cannot remove your own 'removeAdmin' permission as you are the last admin with it.");
                };
            };
        };

        StableTrieMap.put(adminPermissions, Principal.equal, Principal.hash, adminPrincipalToEdit, newPermissionsToApply);
        return #ok(null);
    };

    public shared (msg) func removeAdmin(adminPrincipalToRemove : Principal) : async Result.Result<Null, Text> {
        if (not hasPermission(msg.caller, #CanRemoveAdmin)) {
            return #err("Caller does not have permission to remove admins.");
        };

        if (StableTrieMap.size(adminPermissions) == 1 and msg.caller == adminPrincipalToRemove) {
            return #err("Cannot remove the last admin if it's yourself.");
        };

        if (Option.isNull(StableTrieMap.remove(adminPermissions, Principal.equal, Principal.hash, adminPrincipalToRemove))) {
            return #err("Admin ID not found.");
        };
        return #ok(null);
    };

    public shared query (msg) func getAdminsWithPermissions() : async Result.Result<[(Principal, NewTypes.SerializedPermissions)], Text> {
        if (not hasPermission(msg.caller, #CanViewAdmins)) {
            Debug.trap("Caller does not have permission to view admins.");
        };

        var result : [(Principal, NewTypes.SerializedPermissions)] = [];
        for ((p, perms) in StableTrieMap.entries(adminPermissions)) {
            result := Array.append(result, [(p, Serialization.serializePermissions(perms))]);
        };
        return #ok(result);
    };

    public shared query (msg) func getMyAdminPermissions() : async ?NewTypes.SerializedPermissions {
        let callerPrincipal = msg.caller;
        switch (StableTrieMap.get(adminPermissions, Principal.equal, Principal.hash, callerPrincipal)) {
            case null {
                return null;
            };
            case (?myPermissions) {
                return ?Serialization.serializePermissions(myPermissions);
            };
        };
    };

    // --- PROJECT INFO MANAGEMENT (Admin only) ---

    private func storeProjectAsset(originalFileName : Text, assetContent : Blob) : Result.Result<Text, Text> {
        if (Int.abs(Array.size(Blob.toArray(assetContent))) > MAX_ASSET_SIZE_BYTES) {
            return #err("Asset content exceeds maximum allowed size of " # Nat.toText(MAX_ASSET_SIZE_BYTES) # " bytes.");
        };

        let uniqueFileNameComponent = Helpers.generateAssetId(originalFileName, assetContent);
        let assetPath = "/project_assets/" # uniqueFileNameComponent; // Standardized path prefix

        // Store in the missionAssets map (or a dedicated projectBrandingAssets map)
        StableTrieMap.put<Text, Blob>(missionAssets, Text.equal, Text.hash, assetPath, assetContent);

        return #ok(assetPath);
    };

    public shared (msg) func setProjectDetails(
        name : Text,
        isVisible : Bool,
        iconInput : ?NewTypes.ImageUploadInput,
        bannerInput : ?NewTypes.ImageUploadInput,
        description : Text,
        aboutInfo : ?Text,
        contactXAccountUrl : ?Text,
        contactTelegramGroupUrl : ?Text,
        contactDiscordInviteUrl : ?Text,
        contactOpenChatUrl : ?Text,
        contactWebsiteUrl : ?Text,
        contactEmail : ?Text,
        contactOtherLinks : ?[(Text, Text)],
    ) : async Result.Result<Null, Text> {
        if (not hasPermission(msg.caller, #CanEditProjectInfo)) {
            return #err("Caller does not have permission to edit project info (#CanEditProjectInfo).");
        };

        let currentTime = Time.now();

        var finalIconUrl : ?Text = null;
        switch (iconInput) {
            case (null) { /* finalIconUrl remains null */ };
            case (?input) {
                switch (input) {
                    case (#Url(urlText)) {
                        finalIconUrl := ?urlText;
                    };
                    case (#Asset(asset)) {
                        // If there was a previous URL and it was an asset path, consider deleting it (optional)
                        // For now, we'll just overwrite. A more robust solution might delete orphaned assets.
                        switch (storeProjectAsset(asset.originalFileName, asset.content)) {
                            case (#ok(path)) {
                                finalIconUrl := ?path;
                            };
                            case (#err(errMsg)) {
                                return #err("Failed to store icon asset: " # errMsg);
                            };
                        };
                    };
                };
            };
        };

        var finalBannerUrl : ?Text = null;
        switch (bannerInput) {
            case (null) { /* finalBannerUrl remains null */ };
            case (?input) {
                switch (input) {
                    case (#Url(urlText)) {
                        finalBannerUrl := ?urlText;
                    };
                    case (#Asset(asset)) {
                        switch (storeProjectAsset(asset.originalFileName, asset.content)) {
                            case (#ok(path)) {
                                finalBannerUrl := ?path;
                            };
                            case (#err(errMsg)) {
                                return #err("Failed to store banner asset: " # errMsg);
                            };
                        };
                    };
                };
            };
        };

        let newContactInfo : NewTypes.ProjectContactInfo = {
            var xAccountUrl = contactXAccountUrl;
            var telegramGroupUrl = contactTelegramGroupUrl;
            var discordInviteUrl = contactDiscordInviteUrl;
            var openChatUrl = contactOpenChatUrl;
            var websiteUrl = contactWebsiteUrl;
            var emailContact = contactEmail;
            var otherLinks = contactOtherLinks;
        };

        let newDetails : NewTypes.ProjectDetails = {
            var name = name;
            var isVisible = isVisible;
            var iconUrl = finalIconUrl;
            var bannerUrl = finalBannerUrl;
            var description = description;
            var aboutInfo = aboutInfo;
            var contactInfo = newContactInfo;
            var lastUpdated = currentTime;
            var updatedBy = msg.caller;
        };

        projectInfo := newDetails;
        // Debug.print("Project details updated by " # Principal.toText(msg.caller) # " at " # Int.toText(currentTime));
        return #ok(null);
    };

    public query func getProjectDetails() : async NewTypes.SerializedProjectDetails {
        return Serialization.serializeProjectDetails(projectInfo);
    };

    public shared func addDefaultPlaceholderMission() : async Result.Result<Nat, Text> {
        let placeholderMissionId : Nat = 0; // Using a fixed ID for "the" default placeholder mission.

        let currentTime = Time.now();
        // Use the canister's own principal as the creator for this system-added mission.
        let selfPrincipal = Principal.fromText("aaaaa-aa");

        // Define a simple ActionFlow JSON for the placeholder mission.
        // This example includes one informational step.
        // The `actionType` (e.g., "Simple.Informational") and its expected `parameters`
        // should be something your `actionsCanisterIdText` canister understands.
        let placeholderActionFlowJson : Text = "{" #
        "\"name\": \"Welcome Mission Flow\"," # // Optional: name for the ActionFlow itself
        "\"steps\": [" # // Array of ActionStep objects
        "{" #
        "\"stepId\": 0," # // Nat: Unique ID for this step in the flow
        "\"description\": \"Welcome to your first mission! Please review this message to continue.\"," # // Optional: Text description for the step
        "\"item\": {" # // ActionItem variant
        "\"SingleAction\": {" # // #SingleAction variant, containing an ActionInstance
        "\"instanceId\": 0," # // Nat: Unique ID for this action instance within the step
        // IMPORTANT: "System.Informational.v1" must be a valid ActionDefinition ID
        // registered in your ActionsCanister. This definition should ideally:
        // 1. Have an empty 'parameterSchema'.
        // 2. Have a 'executionHandler' that simply returns success.
        // 3. Have 'defaultUIType' as #Informational or similar.
        "\"actionDefinitionId\": \"System.Informational.v1\"," #
        "\"parameterBindings\": []," # // Empty array as this action likely takes no parameters
        "\"uiInteraction\": {" # // UIInteractionType variant
        "\"Informational\": null" # // Represents #Informational. The 'null' value is for variants without associated data.
        "}" #
        "}" #
        "}" #
        "}" #
        "]," #
        "\"completionLogic\": {" # // FlowCompletionLogic variant
        "\"AllInOrder\": null" # // Represents #AllInOrder. Assumes steps must be done in order.
        "}" #
        "}";

        let placeholderMission : NewTypes.Mission = {
            var name = "My First Mission: A Guided Tour";
            var description = "Welcome aboard! This introductory mission is designed to familiarize you with how missions work. Complete this easy step to earn your first reward and learn the ropes.";
            var actionFlowJson = placeholderActionFlowJson;
            var minRewardAmount = 100 : Nat; // Example: 100 points
            var maxRewardAmount = null; // Fixed reward, so no max different from min
            var rewardType = #Points; // Rewarding with points
            var startTime = currentTime; // Mission starts immediately
            var endTime = null; // No specific end date, always available (or set a future date)
            // Example for 1 year duration: ?(currentTime + (365 * 24 * 60 * 60 * 1_000_000_000));
            var status = #Active; // Set to active so users can see and start it
            creator = selfPrincipal; // The canister itself is the creator
            var imageUrl = ?("https://images.unsplash.com/photo-1580130379629-3349c09d53dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"); // Placeholder image URL
            var iconUrl = ?("https://www.iconarchive.com/download/i80654/custom-icon-design/mono-general-1/flag.ico"); // Placeholder icon URL
            var tags = ?(["Introduction", "Tutorial", "BeginnerFriendly", "FirstMission"]);
            var requiredPreviousMissionId = null; // No prerequisites
            var requiredMissionLogic = null;
            var isRecursive = false; // Not a recurring mission
            var recursiveTimeCooldown = null;
            var maxCompletionsPerUser = ?(1 : Nat); // User can complete this mission only once
            var maxTotalCompletions = null; // No overall limit on how many users can complete it
            var currentTotalCompletions = 0 : Nat; // No completions initially
            var usersWhoCompletedCount = StableTrieMap.new<Text, Nat>(); // Initialize empty map
            creationTime = currentTime;
            var updates = [(currentTime, selfPrincipal)]; // Record the creation event
            var priority = ?(0 : Nat); // High priority (e.g., 0 for highest, 1 for next, etc.)
        };

        // Add the newly defined mission to the main missions map.
        StableTrieMap.put<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, placeholderMissionId, placeholderMission);

        Debug.print("Default Placeholder Mission with ID " # Nat.toText(placeholderMissionId) # " has been successfully added.");
        return #ok(placeholderMissionId);
    };

    public shared func addSecondPlaceholderMission() : async Result.Result<Nat, Text> {
        let placeholderMissionId : Nat = 1; // Mission ID for this second placeholder

        if (StableTrieMap.containsKey(missions, Nat.equal, Hash.hash, placeholderMissionId)) {
            Debug.print("Placeholder mission with ID " # Nat.toText(placeholderMissionId) # " already exists. No action taken.");
            return #err("Placeholder mission with ID " # Nat.toText(placeholderMissionId) # " already exists.");
        };

        let currentTime = Time.now();
        let selfPrincipal = Principal.fromText("aaaaa-aa");

        // ActionFlow for a "Secret Code Challenge"
        // This uses the "validate_code_v1" actionDefinitionId, which should map to your handleValidateCode handler.
        // The user will be prompted to enter a code.
        let secretCodeActionFlowJson : Text = "{" #
        "\"name\": \"Secret Code Challenge Flow\"," #
        "\"steps\": [" #
        "{" #
        "\"stepId\": 0," # // Single step for this mission
        "\"description\": \"Have you found the secret code? Enter it below to unlock a special reward!\"," #
        "\"item\": {" #
        "\"SingleAction\": {" #
        "\"instanceId\": 0," #
        "\"actionDefinitionId\": \"validate_code_v1\"," # // Assumes this ActionDefinition exists and uses handleValidateCode
        "\"parameterBindings\": [" # // Defines how the 'codeListId' parameter for 'validate_code_v1' is filled
        "{" #
        "\"parameterName\": \"codeListId\"," # // Must match a parameter name in the 'validate_code_v1' ActionDefinition's schema
        "\"valueSource\": {" #
        "\"UserSuppliedInput\": {" #
        // The ProjectBackend's executeActionStep will pass `userInputJsonText`.
        // This `inputKeyPath` expects that `userInputJsonText` will be a JSON string like:
        // '{"user_entered_codes": ["THE_CODE_FROM_INPUT_FIELD"]}'
        // The frontend, when calling ProjectBackend's executeActionStep,
        // needs to construct this JSON based on user input.
        "\"inputKeyPath\": \"user_entered_codes\"" #
        "}" #
        "}" #
        "}" #
        "]," #
        "\"uiInteraction\": {" # // UI hint for the frontend
        "\"InputAndButton\": {" #
        "\"inputFields\": [" #
        "{" #
        // 'keyForUserInput' is a hint for the UI field name, not directly the JSON path.
        // The UI will use this field to get the value, then construct the `userInputJsonText`
        // to match the `inputKeyPath` expectation.
        "\"keyForUserInput\": \"secret_code_input_field\"," #
        "\"inputLabel\": \"Your Secret Code:\"," #
        "\"placeholder\": \"e.g., EPICQUEST42\"," #
        "\"isRequired\": true" #
        "}" #
        "]," #
        "\"buttonText\": \"Submit Code\"" #
        "}" #
        "}" #
        "}" #
        "}" #
        "}" #
        "]," #
        "\"completionLogic\": {" #
        "\"AllInOrder\": null" #
        "}" #
        "}";

        let secondPlaceholderMission : NewTypes.Mission = {
            var name = "Secret Code Challenge";
            var description = "Unlock hidden treasures! Enter the special code shared in our latest community announcement to claim your exclusive reward.";
            var actionFlowJson = secretCodeActionFlowJson;
            var minRewardAmount = 250 : Nat;
            var maxRewardAmount = null;
            var rewardType = #Points;
            var startTime = currentTime;
            var endTime = ?(currentTime + (14 * 24 * 60 * 60 * 1_000_000_000)); // Active for 14 days
            var status = #Active;
            creator = selfPrincipal;
            var imageUrl = ?("https://images.unsplash.com/photo-1580702357365-83ea992770a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"); // Different placeholder image
            var iconUrl = ?("https://www.iconarchive.com/download/i90985/icons8/windows-8/Security-Key.ico"); // Different placeholder icon
            var tags = ?(["Challenge", "Secret Code", "Community", "LimitedTime"]);
            var requiredPreviousMissionId = null;
            var requiredMissionLogic = null;
            var isRecursive = false;
            var recursiveTimeCooldown = null;
            var maxCompletionsPerUser = ?(1 : Nat);
            var maxTotalCompletions = ?(500 : Nat); // Limited number of total completions
            var currentTotalCompletions = 0 : Nat;
            var usersWhoCompletedCount = StableTrieMap.new<Text, Nat>();
            creationTime = currentTime;
            var updates = [(currentTime, selfPrincipal)];
            var priority = ?(1 : Nat); // Slightly lower priority than the very first mission
        };

        StableTrieMap.put<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, placeholderMissionId, secondPlaceholderMission);

        Debug.print("Second Placeholder Mission (Secret Code Challenge) with ID " # Nat.toText(placeholderMissionId) # " has been successfully added.");
        return #ok(placeholderMissionId);
    };

    public shared (msg) func generateAnalyticsSeed() : async Result.Result<Null, Text> {

        type SerializedGlobalUser = {
            bio : ?Text;
            categories : ?[Text];
            nft721 : ?[Principal];
            timezone : ?Text;
            firstname : ?Text;
            country : ?Text;
            username : ?Text;
            telegramUser : ?Text;
            ocProfile : ?Text;
            email : ?Text;
            discordUser : ?Text;
            creationTime : Int;
            nuanceUser : ?Text;
            twitterhandle : ?Text;
            pfpProgress : Text;
            twitterid : ?Nat;
            nnsPrincipal : ?Principal;
            icrc1tokens : ?[Principal];
            profilepic : ?Text;
            coverphoto : ?Text;
            lastname : ?Text;
            deducedPoints : Nat;
        };

        let indexActor = actor (indexCanisterId) : actor {
            getAllUsers : shared query () -> async [(Text, SerializedGlobalUser)];
        };

        let now = Time.now();
        // Duration of one day in nanoseconds
        let DAY_NS : Int = 86400_000_000_000;

        let allUsers : [(Text, SerializedGlobalUser)] = await indexActor.getAllUsers();

        for ((uuid, _) in allUsers.vals()) {
            // Determine a pseudo-random assignment via hash
            let h : Nat32 = Text.hash(uuid);
            let choice = Nat32.rem(h, 3); // 0: mission0, 1: mission1, 2: both

            // Initialize or retrieve user's mission map
            var userMissionsMap = Option.get(
                StableTrieMap.get(userProgress, Text.equal, Text.hash, uuid),
                StableTrieMap.new<Nat, NewTypes.UserMissionProgress>(),
            );

            // Helper to create a progress entry
            func makeProgressRecord(
                missionId : Nat,
                for_uuid_hash : Nat32, // Using the Nat32 hash passed in
                overall_status_param : NewTypes.UserOverallMissionStatus,
            ) : NewTypes.UserMissionProgress {
                // Use missionId and uuid_hash for more varied, yet deterministic, timestamps per mission per user
                let combined_hash = Hash.hash(Nat32.toNat(for_uuid_hash) + missionId); // Ensure Nat32 for hash input if needed, or just add Nats then hash.
                // Nat32.fromNat might trap if missionId is too large.
                // A simpler way for combined_hash might be:
                // let combined_hash = Hash.hash(for_uuid_hash) + Hash.hash(missionId); // if direct arithmetic on Nat32 is not what you want for randomness source

                let daysAgo = Nat32.rem(combined_hash, 90); // 0-89 days
                let offset = Int.mul(Int.abs(Nat32.toNat(daysAgo)), DAY_NS); // DAY_NS = 86_400_000_000_000

                // Calculate baseActiveTime relative to 'now' (which is from the outer scope)
                let baseActiveTime = Int.sub(now, offset);
                let lastActive = if (baseActiveTime > now) { now } else {
                    baseActiveTime;
                };

                var stepStatesMap = StableTrieMap.new<Nat, NewTypes.UserActionStepState>();
                var currentStepIdOpt : ?Nat = null;
                var completionTimeOpt : ?Int = null;
                var flowOutputsMap = StableTrieMap.new<Nat, Text>();
                var claimedRewardTimeOpt : ?Int = null;

                let step_zero : Nat = 0;

                if (overall_status_param == #CompletedSuccess) {
                    let completion_offset_ns = Int.abs(Nat32.toNat(Nat32.rem(combined_hash, 300))) * 1_000_000_000; // 0-300s
                    let potential_completion_time = lastActive + completion_offset_ns;
                    completionTimeOpt := ?(if (potential_completion_time > now) { now } else { potential_completion_time });

                    let step0VerifiedState : NewTypes.UserActionStepState = {
                        var status = #Verified;
                        var attempts = 1;
                        var lastAttemptTime = ?lastActive;
                        var lastMessageFromAction = ?("Mock: Verified by seed");
                    };
                    StableTrieMap.put(stepStatesMap, Nat.equal, Hash.hash, step_zero, step0VerifiedState);
                    currentStepIdOpt := null;

                    if (missionId == 1) {
                        StableTrieMap.put(flowOutputsMap, Nat.equal, Hash.hash, step_zero, "{\"mock_output\": \"seeded_success_code\"}");
                    };
                    if (Nat32.rem(combined_hash, 2) == 0) {
                        // 50% chance to claim reward
                        let claim_offset_ns = DAY_NS / 24; // ~1hr
                        let potential_claim_time = Option.get(completionTimeOpt, lastActive) + claim_offset_ns;
                        claimedRewardTimeOpt := ?(if (potential_claim_time > now) { now } else { potential_claim_time });
                    }

                } else if (overall_status_param == #InProgress) {
                    currentStepIdOpt := ?step_zero;
                    // Determine step status before creating the record
                    let actual_step_status = if (missionId == 1 and Nat32.rem(combined_hash, 3) == 0) {
                        #RequiresUserInput;
                    } else {
                        #InProgress;
                    };
                    let step0InProgressState : NewTypes.UserActionStepState = {
                        var status = actual_step_status;
                        var attempts = 0;
                        var lastAttemptTime = null;
                        var lastMessageFromAction = if (actual_step_status == #RequiresUserInput) {
                            ?"Mock: Input needed";
                        } else { null };
                    };
                    StableTrieMap.put(stepStatesMap, Nat.equal, Hash.hash, step_zero, step0InProgressState);

                } else if (overall_status_param == #CompletedFailure) {
                    let failure_offset_ns = Int.abs(Nat32.toNat(Nat32.rem(combined_hash, 120))) * 1_000_000_000; // 0-120s
                    let potential_failure_time = lastActive + failure_offset_ns;
                    completionTimeOpt := ?(if (potential_failure_time > now) { now } else { potential_failure_time });

                    let step0FailedState : NewTypes.UserActionStepState = {
                        var status = #FailedVerification;
                        var attempts = 1 + Nat32.toNat(Nat32.rem(combined_hash, 3)); // 1-3 attempts
                        var lastAttemptTime = ?lastActive;
                        var lastMessageFromAction = ?("Mock: Failed by seed");
                    };
                    StableTrieMap.put(stepStatesMap, Nat.equal, Hash.hash, step_zero, step0FailedState);
                    currentStepIdOpt := ?step_zero;
                };

                return {
                    var overallStatus = overall_status_param;
                    var stepStates = stepStatesMap;
                    var currentStepId = currentStepIdOpt;
                    var flowOutputs = flowOutputsMap;
                    var completionTime = completionTimeOpt;
                    var claimedRewardTime = claimedRewardTimeOpt;
                    var lastActiveTime = lastActive;
                };
            };

            // Assign for mission 0
            if (choice == 0 or choice == 2) {
                let status0 = if (Nat32.rem(h, 2) == 0) #CompletedSuccess else #InProgress;
                // ***** CORRECTED CALL *****
                let progress0 = makeProgressRecord(0, h, status0);
                StableTrieMap.put(userMissionsMap, Nat.equal, Hash.hash, 0, progress0);

                if (status0 == #CompletedSuccess) {
                    switch (StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, 0)) {
                        case (?m0) {
                            // m0 is now your mission 0 record
                            m0.currentTotalCompletions += 1;
                            let newCount = Option.get(
                                StableTrieMap.get(m0.usersWhoCompletedCount, Text.equal, Text.hash, uuid),
                                0,
                            ) + 1;
                            StableTrieMap.put(
                                m0.usersWhoCompletedCount,
                                Text.equal,
                                Text.hash,
                                uuid,
                                newCount,
                            );
                            StableTrieMap.put(missions, Nat.equal, Hash.hash, 0, m0);
                        };
                        case null {
                            Debug.print("CRITICAL: Mission 0 not found during update.");
                        };
                    };
                };
            };

            // Assign for mission 1
            if (choice == 1 or choice == 2) {
                let status1 = if (Nat32.rem(h, 5) < 3) #CompletedSuccess else #InProgress;
                // ***** CORRECTED CALL *****
                let progress1 = makeProgressRecord(1, h, status1);
                StableTrieMap.put(userMissionsMap, Nat.equal, Hash.hash, 1, progress1);

                if (status1 == #CompletedSuccess) {
                    switch (StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, 1)) {
                        case (?m1) {
                            m1.currentTotalCompletions += 1;
                            let newCount = Option.get(
                                StableTrieMap.get(m1.usersWhoCompletedCount, Text.equal, Text.hash, uuid),
                                0,
                            ) + 1;
                            StableTrieMap.put(
                                m1.usersWhoCompletedCount,
                                Text.equal,
                                Text.hash,
                                uuid,
                                newCount,
                            );
                            StableTrieMap.put(missions, Nat.equal, Hash.hash, 1, m1);
                        };
                        case null {
                            Debug.print("CRITICAL: Mission 1 not found during update.");
                        };
                    };
                };
            };

            // Persist user progress
            StableTrieMap.put(userProgress, Text.equal, Text.hash, uuid, userMissionsMap);
        };
        return #ok(null);
    };

    // --- MISSION MANAGEMENT ---
    public shared (msg) func addOrUpdateMission(
        missionId : Nat,
        name : Text,
        description : Text,
        actionFlowRepresentation : Text, // JSON string
        rewardAmount : Nat,
        maxRewardAmount : ?Nat,
        rewardType : NewTypes.RewardType,
        startTime : Int,
        endTime : ?Int,
        iconInput : ?NewTypes.ImageUploadInput, // Changed parameter
        imageInput : ?NewTypes.ImageUploadInput, // Changed parameter
        tags : ?[Text],
        requiredPreviousMissionId : ?[Nat],
        requiredMissionLogic : ?{ #All; #Any },
        isRecursive : Bool,
        recursiveTimeCooldown : ?Int,
        maxCompletionsPerUser : ?Nat,
        maxTotalCompletions : ?Nat,
        initialStatus : NewTypes.MissionStatus,
        priority : ?Nat,
    ) : async Result.Result<Null, Text> {
        let currentTime = Time.now();
        let existingMissionOpt = StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId);

        // --- Step 1: Process image/icon inputs to get final URLs ---
        // Helper function to process an image/icon input against an optional existing URL
        func processImageInput(inputOpt : ?NewTypes.ImageUploadInput, existingUrlOpt : ?Text) : Result.Result<?Text, Text> {
            // If there's an input, it overwrites the existing URL. Otherwise, the existing URL is kept.
            switch (inputOpt) {
                case null { return #ok(existingUrlOpt) }; // No new input, so we keep the existing URL
                case (?input) {
                    switch (input) {
                        case (#Url(urlText)) {
                            return #ok(?urlText); // Input is a URL, return it
                        };
                        case (#Asset(asset)) {
                            // Input is an asset, store it and return the resulting path
                            switch (storeProjectAsset(asset.originalFileName, asset.content)) {
                                case (#ok(path)) { return #ok(?path) };
                                case (#err(errMsg)) {
                                    return #err("Failed to store asset: " # errMsg);
                                };
                            };
                        };
                    };
                };
            };
        };

        // Safely get existing URLs using a switch for type safety
        let existingIconUrl = switch (existingMissionOpt) {
            case (?m) m.iconUrl;
            case null null;
        };
        let existingImageUrl = switch (existingMissionOpt) {
            case (?m) m.imageUrl;
            case null null;
        };

        // Process inputs to get final URLs, returning early if asset storage fails
        let finalIconUrl = switch (processImageInput(iconInput, existingIconUrl)) {
            case (#ok(url)) url;
            case (#err(e)) { return #err("Icon processing failed: " # e) };
        };
        let finalImageUrl = switch (processImageInput(imageInput, existingImageUrl)) {
            case (#ok(url)) url;
            case (#err(e)) { return #err("Image processing failed: " # e) };
        };

        // --- Step 2: Perform permission checks ---
        switch (existingMissionOpt) {
            case null {
                // CREATING a new mission: Check for #CanCreateMission permission
                if (not hasPermission(msg.caller, #CanCreateMission)) {
                    return #err("Caller does not have permission to create missions (#CanCreateMission).");
                };
            };
            case (?existingMission) {
                // UPDATING an existing mission: Check for edit permissions based on what changed
                var requiresEditInfo = existingMission.name != name or existingMission.description != description or existingMission.minRewardAmount != rewardAmount or existingMission.maxRewardAmount != maxRewardAmount or existingMission.rewardType != rewardType or existingMission.startTime != startTime or existingMission.endTime != endTime or existingMission.iconUrl != finalIconUrl or existingMission.imageUrl != finalImageUrl or existingMission.tags != tags or existingMission.requiredPreviousMissionId != requiredPreviousMissionId or existingMission.requiredMissionLogic != requiredMissionLogic or existingMission.isRecursive != isRecursive or existingMission.recursiveTimeCooldown != recursiveTimeCooldown or existingMission.maxCompletionsPerUser != maxCompletionsPerUser or existingMission.maxTotalCompletions != maxTotalCompletions or existingMission.status != initialStatus or existingMission.priority != priority;

                let requiresEditFlow = existingMission.actionFlowJson != actionFlowRepresentation;

                if (requiresEditInfo and not hasPermission(msg.caller, #CanEditMissionInfo)) {
                    return #err("Caller does not have permission to edit mission info (#CanEditMissionInfo).");
                };
                if (requiresEditFlow and not hasPermission(msg.caller, #CanEditMissionFlow)) {
                    return #err("Caller does not have permission to edit mission flow (#CanEditMissionFlow).");
                };
                if (not requiresEditInfo and not requiresEditFlow) {
                    // If nothing changed, return early, but first check if they have *any* edit permission to even make the call
                    if (not hasPermission(msg.caller, #CanEditMissionInfo) and not hasPermission(msg.caller, #CanEditMissionFlow)) {
                        return #err("Caller lacks permissions to edit this mission.");
                    };
                };
            };
        };

        // --- Step 3: Determine other final mission fields ---
        let (creationTimeForEntry, creatorForEntry, currentTotalCompletionsForEntry, usersWhoCompletedCountForEntry, updatesForEntry) = switch (existingMissionOpt) {
            case null {
                // For new missions
                (currentTime, msg.caller, 0, StableTrieMap.new<Text, Nat>(), [(currentTime, msg.caller)]);
            };
            case (?m) {
                // For existing missions, preserve original data and add an update record
                (m.creationTime, m.creator, m.currentTotalCompletions, m.usersWhoCompletedCount, Array.append(m.updates, [(currentTime, msg.caller)]));
            };
        };

        // --- Step 4: Construct and store the final mission object ---
        let missionToStore : NewTypes.Mission = {
            var name = name;
            var description = description;
            var actionFlowJson = actionFlowRepresentation;
            var minRewardAmount = rewardAmount;
            var maxRewardAmount = maxRewardAmount;
            var rewardType = rewardType;
            var startTime = startTime;
            var endTime = endTime;
            var status = initialStatus;
            creator = creatorForEntry;
            var imageUrl = finalImageUrl;
            var iconUrl = finalIconUrl;
            var tags = tags;
            var requiredPreviousMissionId = requiredPreviousMissionId;
            var requiredMissionLogic = requiredMissionLogic;
            var isRecursive = isRecursive;
            var recursiveTimeCooldown = recursiveTimeCooldown;
            var maxCompletionsPerUser = maxCompletionsPerUser;
            var maxTotalCompletions = maxTotalCompletions;
            var currentTotalCompletions = currentTotalCompletionsForEntry;
            var usersWhoCompletedCount = usersWhoCompletedCountForEntry;
            creationTime = creationTimeForEntry;
            var updates = updatesForEntry;
            var priority = priority;
        };
        StableTrieMap.put<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId, missionToStore);

        return #ok(null);
    };

    public shared (msg) func updateMissionStatus(missionId : Nat, newStatus : NewTypes.MissionStatus) : async Result.Result<Null, Text> {
        if (not hasPermission(msg.caller, #CanUpdateMissionStatus)) {
            return #err("Caller does not have permission to update mission status (#CanUpdateMissionStatus).");
        };
        switch (StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId)) {
            case (null) { return #err("Mission not found.") };
            case (?mission) {
                var updatedMission = mission;
                updatedMission.status := newStatus;
                updatedMission.updates := Array.append(updatedMission.updates, [(Time.now(), msg.caller)]);
                StableTrieMap.put<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId, updatedMission);
                return #ok(null);
            };
        };
    };

    public shared query (msg) func getMission(missionId : Nat) : async ?NewTypes.SerializedMission {
        switch (StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId)) {
            case null { return null };
            case (?mission) {
                let isAnAdmin = StableTrieMap.containsKey(adminPermissions, Principal.equal, Principal.hash, msg.caller);
                if (isAnAdmin or mission.status == #Active) {
                    return ?Serialization.serializeMission(mission);
                } else {
                    return null;
                };
            };
        };
    };

    public shared query (msg) func getAllMissions() : async [(Nat, NewTypes.SerializedMission)] {
        var allMissions : [(Nat, NewTypes.SerializedMission)] = [];
        let isAnAdmin = StableTrieMap.containsKey(adminPermissions, Principal.equal, Principal.hash, msg.caller);

        for ((id, mission) in StableTrieMap.entries(missions)) {
            let shouldShow = if (isAnAdmin) {
                // Admins see all
                true;
            } else {
                // Public sees only active
                mission.status == #Active;
            };
            if (shouldShow) {
                allMissions := Array.append(allMissions, [(id, Serialization.serializeMission(mission))]);
            };
        };
        return allMissions;
    };

    // --- USER PROGRESS QUERYING ---
    public shared composite query (msg) func getUserMissionProgress(principal : Principal, missionId : Nat) : async ?NewTypes.SerializedUserMissionProgress {

        if (principal != msg.caller and (not hasPermission(msg.caller, #CanViewAnyUserProgress))) {
            return null;
        };

        let indexActor = actor (indexCanisterId) : actor {
            getUUID : query (Principal) -> async Text;
        };
        let userUUID = await indexActor.getUUID(principal);

        switch (
            StableTrieMap.get<Text, StableTrieMap.StableTrieMap<Nat, NewTypes.UserMissionProgress>>(
                userProgress,
                Text.equal,
                Text.hash,
                userUUID,
            )
        ) {
            case null { return null };
            case (?userMissionsMap) {
                switch (StableTrieMap.get<Nat, NewTypes.UserMissionProgress>(userMissionsMap, Nat.equal, Hash.hash, missionId)) {
                    case null { return null };
                    case (?missionProgressObject) {
                        return ?Serialization.serializeUserMissionProgress(missionProgressObject);
                    };
                };
            };
        };
    };

    public shared composite query (msg) func getUserActionStepState(principal : Principal, missionId : Nat, stepId : Nat) : async ?NewTypes.SerializedUserActionStepState {

        if (principal != msg.caller and (not hasPermission(msg.caller, #CanViewAnyUserProgress))) {
            return null;
        };

        let indexActor = actor (indexCanisterId) : actor {
            getUUID : query (Principal) -> async Text;
        };
        let userUUID = await indexActor.getUUID(principal);

        switch (
            StableTrieMap.get<Text, StableTrieMap.StableTrieMap<Nat, NewTypes.UserMissionProgress>>(
                userProgress,
                Text.equal,
                Text.hash,
                userUUID,
            )
        ) {
            case null { return null };
            case (?userMissionsMap) {
                switch (StableTrieMap.get<Nat, NewTypes.UserMissionProgress>(userMissionsMap, Nat.equal, Hash.hash, missionId)) {
                    case null { return null };
                    case (?missionProgressObject) {
                        switch (StableTrieMap.get<Nat, NewTypes.UserActionStepState>(missionProgressObject.stepStates, Nat.equal, Hash.hash, stepId)) {
                            case null { return null };
                            case (?actionStepState) {
                                return ?Serialization.serializeUserActionStepState(actionStepState);
                            };
                        };
                    };
                };
            };
        };
    };

    public shared composite query (msg) func getUserMissionStepStates(principal : Principal, missionId : Nat) : async ?[(Nat, NewTypes.SerializedUserActionStepState)] {

        if (principal != msg.caller and (not hasPermission(msg.caller, #CanViewAnyUserProgress))) {
            return null;
        };

        let indexActor = actor (indexCanisterId) : actor {
            getUUID : query (Principal) -> async Text;
        };
        let userUUID = await indexActor.getUUID(principal);

        switch (
            StableTrieMap.get<Text, StableTrieMap.StableTrieMap<Nat, NewTypes.UserMissionProgress>>(
                userProgress,
                Text.equal,
                Text.hash,
                userUUID,
            )
        ) {
            case null { return null };
            case (?userMissionsMap) {
                switch (StableTrieMap.get<Nat, NewTypes.UserMissionProgress>(userMissionsMap, Nat.equal, Hash.hash, missionId)) {
                    case null { return null };
                    case (?missionProgressObject) {
                        var serializedStepStates : [(Nat, NewTypes.SerializedUserActionStepState)] = [];
                        for ((stepId, stepState) in StableTrieMap.entries(missionProgressObject.stepStates)) {
                            serializedStepStates := Array.append(serializedStepStates, [(stepId, Serialization.serializeUserActionStepState(stepState))]);
                        };
                        return ?serializedStepStates;
                    };
                };
            };
        };
    };

    public shared composite query (msg) func getAllUserMissionsProgress(principal : Principal) : async ?[(Nat, NewTypes.SerializedUserMissionProgress)] {

        if (principal != msg.caller and (not hasPermission(msg.caller, #CanViewAnyUserProgress))) {
            return null;
        };

        let indexActor = actor (indexCanisterId) : actor {
            getUUID : query (Principal) -> async Text;
        };
        let userUUID = await indexActor.getUUID(principal);

        switch (
            StableTrieMap.get<Text, StableTrieMap.StableTrieMap<Nat, NewTypes.UserMissionProgress>>(
                userProgress,
                Text.equal,
                Text.hash,
                userUUID,
            )
        ) {
            case null { return null };
            case (?userMissionsMap) {
                var allSerializedProgress : [(Nat, NewTypes.SerializedUserMissionProgress)] = [];
                for ((missionId, missionProg) in StableTrieMap.entries(userMissionsMap)) {
                    allSerializedProgress := Array.append(allSerializedProgress, [(missionId, Serialization.serializeUserMissionProgress(missionProg))]);
                };
                return ?allSerializedProgress;
            };
        };
    };

    public composite query (msg) func getMissionCompletionStatusForUser(principal : Principal, missionId : Nat) : async Bool {

        if (principal != msg.caller and (not hasPermission(msg.caller, #CanViewAnyUserProgress))) {
            return false;
        };

        let indexActor = actor (indexCanisterId) : actor {
            getUUID : query (Principal) -> async Text;
        };
        let userUUID = await indexActor.getUUID(principal);

        switch (StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId)) {
            case null { return false };
            case (?m) {
                return Option.get(StableTrieMap.get<Text, Nat>(m.usersWhoCompletedCount, Text.equal, Text.hash, userUUID), 0) > 0;
            };
        };
    };

    private func getMissionCompletionsCountForUser(userUUID : Text, missionId : Nat) : Nat {
        switch (StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId)) {
            case null { return 0 };
            case (?m) {
                return Option.get(StableTrieMap.get<Text, Nat>(m.usersWhoCompletedCount, Text.equal, Text.hash, userUUID), 0);
            };
        };
    };

    // --- MISSION ASSET MANAGEMENT ---
    public shared (msg) func uploadMissionAsset(assetId : Text, assetContent : Blob) : async Result.Result<Text, Text> {
        if (not (hasPermission(msg.caller, #CanEditMissionInfo) or hasPermission(msg.caller, #CanCreateMission) or not (hasPermission(msg.caller, #CanEditProjectInfo)))) {
            return #err("Caller does not have permission to upload mission assets (requires #CanEditMissionInfo or #CanCreateMission) or #CanEditProjectInfo.");
        };
        if (Text.size(assetId) == 0) {
            return #err("Asset ID cannot be empty.");
        };
        if (Array.size(Blob.toArray(assetContent)) > MAX_ASSET_SIZE_BYTES) {
            return #err("Asset content exceeds maximum allowed size of " # Nat.toText(MAX_ASSET_SIZE_BYTES) # " bytes.");
        };
        StableTrieMap.put<Text, Blob>(missionAssets, Text.equal, Text.hash, assetId, assetContent);
        return #ok(assetId);
    };

    public shared (msg) func startMission(missionId : Nat) : async Result.Result<NewTypes.SerializedUserMissionProgress, Text> {

        if (Principal.isAnonymous(msg.caller)) {
            Debug.trap("Anonymous Principal");
        };

        let principal = msg.caller;
        let indexActor = actor (indexCanisterId) : actor {
            getUUID : query (Principal) -> async Text;
        };
        let userUUID = await indexActor.getUUID(principal);

        let missionOpt = StableTrieMap.get(missions, Nat.equal, Hash.hash, missionId);
        let mission : NewTypes.Mission = switch (missionOpt) {
            case null { return #err("Mission not found.") };
            case (?m) m;
        };

        // 1. Mission Status Checks
        if (mission.status != #Active and mission.status != #Draft) {
            if (mission.status == #Draft and mission.startTime > Time.now()) {} else {
                return #err("Mission is not currently active or upcoming.");
            };
        };
        if (mission.status == #Expired) { return #err("Mission has expired.") };
        if (mission.status == #Completed) {
            return #err("Mission has already reached its total completion limit.");
        };

        // 2. Time Limits Check
        let currentTime = Time.now();
        if (mission.startTime > currentTime and mission.status != #Draft) {
            return #err("Mission has not started yet.");
        };
        switch (mission.endTime) {
            case (?endTimeVal) {
                if (currentTime > endTimeVal) {
                    if (mission.status != #Expired) {
                        var mutMission = mission;
                        mutMission.status := #Expired;
                        StableTrieMap.put(missions, Nat.equal, Hash.hash, missionId, mutMission);
                    };
                    return #err("Mission has ended.");
                };
            };
            case null {};
        };

        // 3. Prerequisites Check
        switch (mission.requiredPreviousMissionId) {
            case (?reqIds) {
                if (Array.size(reqIds) > 0) {
                    var allMet = true;
                    var anyMet = false;
                    for (reqMissionId in reqIds.vals()) {
                        if (getMissionCompletionsCountForUser(userUUID, reqMissionId) > 0) {
                            anyMet := true;
                        } else {
                            allMet := false;
                        };
                    };
                    let logic = Option.get(mission.requiredMissionLogic, #All);
                    if (logic == #All and not allMet) {
                        return #err("All prerequisite missions not completed.");
                    };
                    if (logic == #Any and not anyMet) {
                        return #err("At least one prerequisite mission must be completed.");
                    };
                };
            };
            case null {};
        };

        var userMissionsMap = Option.get(
            StableTrieMap.get(userProgress, Text.equal, Text.hash, userUUID),
            StableTrieMap.new<Nat, NewTypes.UserMissionProgress>(),
        );
        var existingProgressOpt = StableTrieMap.get(userMissionsMap, Nat.equal, Hash.hash, missionId);

        // 4. Max Completions Per User & Recursive Logic
        let userCompletionCount = getMissionCompletionsCountForUser(userUUID, missionId);
        if (Option.isSome(mission.maxCompletionsPerUser)) {
            let maxPerUser = Option.get(mission.maxCompletionsPerUser, 1);
            if (userCompletionCount >= maxPerUser) {
                if (mission.isRecursive) {
                    switch (existingProgressOpt) {
                        case (?prog) {
                            switch (prog.completionTime) {
                                case (?compTime) {
                                    if (Option.isSome(mission.recursiveTimeCooldown)) {
                                        let cooldown = Option.get(mission.recursiveTimeCooldown, 0);
                                        if (currentTime < compTime + cooldown) {
                                            return #err("Mission is on recursive cooldown for you.");
                                        };
                                    } else {};
                                };
                                case null {};
                            };
                        };
                        case null {};
                    };
                } else {
                    return #err("You have already reached the maximum completions for this mission.");
                };
            };
        };

        // 5. Total Mission Completions
        if (Option.isSome(mission.maxTotalCompletions)) {
            if (mission.currentTotalCompletions >= Option.get(mission.maxTotalCompletions, 0)) {
                if (mission.status != #Completed) {
                    var mutMission = mission;
                    mutMission.status := #Completed;
                    StableTrieMap.put(missions, Nat.equal, Hash.hash, missionId, mutMission);
                };
                return #err("Mission has reached its total completion limit.");
            };
        };

        // 6. Initialize or Reset UserMissionProgress
        let firstStepIdRes = Helpers.getFirstStepIdFromActionFlow(mission.actionFlowJson);
        let firstStepId : ?Nat = switch (firstStepIdRes) {
            case (#ok(id)) ?id;
            case (#err(e)) {
                Debug.print("Warning: Could not determine first step for mission " # Nat.toText(missionId) # ": " # e);
                null;
            };
        };

        let newProgress : NewTypes.UserMissionProgress = {
            var overallStatus = #InProgress;
            var stepStates = StableTrieMap.new<Nat, NewTypes.UserActionStepState>();
            var currentStepId = firstStepId;
            var flowOutputs = StableTrieMap.new<Nat, Text>();
            var completionTime = null;
            var claimedRewardTime = null;
            var lastActiveTime = currentTime;
        };

        if (Option.isSome(existingProgressOpt)) {
            let prog = Option.get(existingProgressOpt, newProgress);
            if (
                prog.overallStatus == #CompletedSuccess and mission.isRecursive or prog.overallStatus == #Abandoned or
                prog.overallStatus == #CompletedFailure
            ) {
                StableTrieMap.put(userMissionsMap, Nat.equal, Hash.hash, missionId, newProgress);
                StableTrieMap.put(userProgress, Text.equal, Text.hash, userUUID, userMissionsMap);
                return #ok(Serialization.serializeUserMissionProgress(newProgress));
            } else if (prog.overallStatus == #InProgress) {
                return #ok(Serialization.serializeUserMissionProgress(prog)); // Already in progress
            } else {
                return #err("Cannot restart mission in its current state");
            };
        } else {
            // First time starting this mission for this user
            StableTrieMap.put(userMissionsMap, Nat.equal, Hash.hash, missionId, newProgress);
            StableTrieMap.put(userProgress, Text.equal, Text.hash, userUUID, userMissionsMap);
            return #ok(Serialization.serializeUserMissionProgress(newProgress));
        };
    };

    public shared (msg) func executeActionStep(
        missionId : Nat,
        stepIdToExecute : Nat,
        userInputJsonText : Text,
        principal : Principal,
    ) : async Result.Result<NewTypes.ActionResultFromActions, Text> {

        if (principal != msg.caller or Principal.isAnonymous(msg.caller)) {
            return #err("Caller does not match the principal for action execution.");
        };

        // 1. Get User UUID
        let indexActor = actor (indexCanisterId) : actor {
            getUUID : query (Principal) -> async Text;
        };
        let userUUID = await indexActor.getUUID(principal);
        // 2. Retrieve Mission
        let missionOpt = StableTrieMap.get(missions, Nat.equal, Hash.hash, missionId);
        let mission : NewTypes.Mission = switch (missionOpt) {
            case null {
                return #err("Mission not found.");
            };
            case (?m) m;
        };

        if (mission.status != #Active) {
            return #err("Mission is not currently active.");
        };
        switch (mission.endTime) {
            case (?endTimeVal) {
                if (Time.now() > endTimeVal) {
                    mission.status := #Expired;
                    StableTrieMap.put(missions, Nat.equal, Hash.hash, missionId, mission);
                    return #err("Mission has ended.");
                };
            };
            case null {};
        };

        // 3. Retrieve UserMissionProgress
        let userMissionsMapOpt = StableTrieMap.get(userProgress, Text.equal, Text.hash, userUUID);
        if (Option.isNull(userMissionsMapOpt)) {
            return #err("User has no progress for any mission. Please start the mission first.");
        };
        let userMissionsMap = Option.get(userMissionsMapOpt, StableTrieMap.new<Nat, NewTypes.UserMissionProgress>());

        var missionProgressOpt = StableTrieMap.get(userMissionsMap, Nat.equal, Hash.hash, missionId);
        if (Option.isNull(missionProgressOpt)) {
            return #err("Mission not started by the user. Please start the mission first.");
        };
        let defaultProgress : NewTypes.UserMissionProgress = {
            var overallStatus = #NotStarted;
            var stepStates = StableTrieMap.new<Nat, NewTypes.UserActionStepState>();
            var currentStepId = null;
            var flowOutputs = StableTrieMap.new<Nat, Text>();
            var completionTime = null;
            var claimedRewardTime = null;
            var lastActiveTime = 0;
        };
        var missionProgress = Option.get(missionProgressOpt, defaultProgress);

        if (mission.status != #Active) {
            return #err("Mission is not currently active.");
        };
        if (missionProgress.overallStatus == #CompletedSuccess or missionProgress.overallStatus == #CompletedFailure) {
            return #err("Mission already completed or failed for this user.");
        };

        // 4. Prepare data for ActionsCanister call
        let actionFlowJsonText = mission.actionFlowJson;
        let missionContextJsonText = ?("{\"missionId\":" # Nat.toText(missionId) # ", \"userUUID\":\"" # userUUID # "\", \"userPrincipal\":\"" # Principal.toText(principal) # "\"}");

        var fieldsForPreviousOutputs : [(Text, Json.Json)] = [];
        for ((stepId, dataJsonText) in StableTrieMap.entries(missionProgress.flowOutputs)) {
            switch (Json.parse(dataJsonText)) {
                case (#ok(parsedInnerJson)) {
                    fieldsForPreviousOutputs := Array.append(fieldsForPreviousOutputs, [(Nat.toText(stepId), parsedInnerJson)]);
                };
                case (#err(parseError)) {
                    fieldsForPreviousOutputs := Array.append(fieldsForPreviousOutputs, [(Nat.toText(stepId), Json.str(dataJsonText))]);
                };
            };
        };
        let previousStepOutputsObj = Json.obj(fieldsForPreviousOutputs);
        let previousStepOutputsJsonText = Json.stringify(previousStepOutputsObj, null);

        // 5. Call ActionsCanister
        let actionsCanister = actor (actionsCanisterIdText) : actor {
            executeActionStep : (Text, Nat, ?Text, ?Text, Text) -> async Text;
        };
        var actionServiceResponseJson : Text = "";
        try {
            actionServiceResponseJson := await actionsCanister.executeActionStep(
                actionFlowJsonText,
                stepIdToExecute,
                ?userInputJsonText,
                missionContextJsonText,
                previousStepOutputsJsonText,
            );
        } catch (_e) {
            var stepState = Option.get(
                StableTrieMap.get(missionProgress.stepStates, Nat.equal, Hash.hash, stepIdToExecute),
                (
                    {
                        var status = #NotStarted;
                        var attempts = 0;
                        var lastAttemptTime = null;
                        var lastMessageFromAction = null;
                    } : NewTypes.UserActionStepState
                ),
            );
            stepState.attempts += 1;
            stepState.lastAttemptTime := ?Time.now();
            stepState.status := #FailedVerification;
            stepState.lastMessageFromAction := ?"Failed to communicate with Actions Service.";
            StableTrieMap.put(missionProgress.stepStates, Nat.equal, Hash.hash, stepIdToExecute, stepState);
            missionProgress.lastActiveTime := Time.now();
            StableTrieMap.put(userMissionsMap, Nat.equal, Hash.hash, missionId, missionProgress);
            StableTrieMap.put(userProgress, Text.equal, Text.hash, userUUID, userMissionsMap);

            return #err("Action service call failed");
        };

        // 6. Parse response from ActionsCanister
        let parsedActionResult : NewTypes.ActionResultFromActions = switch (Helpers.parseActionResult(actionServiceResponseJson)) {
            case (#ok(res)) res;
            case (#err(parseErr)) {
                var stepState = Option.get(
                    StableTrieMap.get(missionProgress.stepStates, Nat.equal, Hash.hash, stepIdToExecute),
                    (
                        {
                            var status = #NotStarted;
                            var attempts = 0;
                            var lastAttemptTime = null;
                            var lastMessageFromAction = null;
                        } : NewTypes.UserActionStepState
                    ),
                );
                stepState.attempts += 1;
                stepState.lastAttemptTime := ?Time.now();
                stepState.status := #FailedVerification;
                stepState.lastMessageFromAction := ?"Invalid response from Actions Service.";
                StableTrieMap.put(missionProgress.stepStates, Nat.equal, Hash.hash, stepIdToExecute, stepState);
                missionProgress.lastActiveTime := Time.now();
                StableTrieMap.put(userMissionsMap, Nat.equal, Hash.hash, missionId, missionProgress);
                StableTrieMap.put(userProgress, Text.equal, Text.hash, userUUID, userMissionsMap);

                return #err("Failed to parse action service response: " # parseErr);
            };
        };

        // 7. Basic User Progress Update
        let processedStepId = stepIdToExecute;

        let defaultStepState : NewTypes.UserActionStepState = {
            var status = #NotStarted;
            var attempts = 0;
            var lastAttemptTime = null;
            var lastMessageFromAction = null;
        };
        var stepState = Option.get(
            StableTrieMap.get(missionProgress.stepStates, Nat.equal, Hash.hash, processedStepId),
            defaultStepState,
        );

        stepState.attempts += 1;
        stepState.lastAttemptTime := ?Time.now();
        stepState.lastMessageFromAction := parsedActionResult.message;

        if (parsedActionResult.success) {
            // This 'success' is based on ActionOutcome (#Success or #AlreadyDone)
            stepState.status := #Verified;
            // Store returned data if any
            switch (parsedActionResult.returnedDataJson) {
                case (?dataJson) {
                    StableTrieMap.put(missionProgress.flowOutputs, Nat.equal, Hash.hash, processedStepId, dataJson);
                };
                case null {};
            };
        } else {
            // Action was not successful (e.g. Failed, PendingVerification, etc. from ActionOutcome)
            // or there was an issue with action execution (ActionStatus from ActionsCanister)
            switch (parsedActionResult.status) {
                case (#Ok) {
                    stepState.status := #Attempted;
                };
                case (#Error) { stepState.status := #FailedVerification };
                case (#Pending) { stepState.status := #InProgress };
                case (#RequiresUserAction) {
                    stepState.status := #RequiresUserInput;
                };
                case (#InvalidParameters) {
                    stepState.status := #FailedVerification;
                };
                case (#PreconditionNotMet) {
                    stepState.status := #FailedVerification;
                };
            };
        };

        StableTrieMap.put(missionProgress.stepStates, Nat.equal, Hash.hash, processedStepId, stepState);
        missionProgress.lastActiveTime := Time.now();

        missionProgress.currentStepId := parsedActionResult.nextStepIdToProcess;

        // 2. Update missionProgress.overallStatus
        let flowCompletedByActionService = Option.get(parsedActionResult.isFlowCompleted, false);

        if (flowCompletedByActionService) {
            if (parsedActionResult.success) {
                // Action successful and flow completed
                missionProgress.overallStatus := #CompletedSuccess;
                missionProgress.completionTime := ?Time.now();

                // 3. If mission completed successfully, update Mission counts and status

                var currentUserCompletionCount = Option.get(
                    StableTrieMap.get<Text, Nat>(mission.usersWhoCompletedCount, Text.equal, Text.hash, userUUID),
                    0,
                );
                currentUserCompletionCount += 1;
                StableTrieMap.put<Text, Nat>(mission.usersWhoCompletedCount, Text.equal, Text.hash, userUUID, currentUserCompletionCount);

                mission.currentTotalCompletions += 1;

                switch (mission.maxTotalCompletions) {
                    case (?maxTotal) {
                        if (mission.currentTotalCompletions >= maxTotal) {
                            mission.status := #Completed;
                        };
                    };
                    case null {};
                };
                StableTrieMap.put<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId, mission);

            } else {
                // Flow completed, but the last action was not successful
                missionProgress.overallStatus := #CompletedFailure;
                missionProgress.completionTime := ?Time.now();
            };
        } else {
            // Flow is not completed yet
            if (parsedActionResult.success) {
                missionProgress.overallStatus := #InProgress;
            } else {
                missionProgress.overallStatus := #InProgress;
            };
        };

        StableTrieMap.put(userMissionsMap, Nat.equal, Hash.hash, missionId, missionProgress);
        StableTrieMap.put(userProgress, Text.equal, Text.hash, userUUID, userMissionsMap);

        return #ok(parsedActionResult);
    };

    // Analytics Function 1: High-level overview of the project
    public shared query (msg) func get_analytics_overview() : async AnalyticsTypes.ProjectGlobalAnalytics {

        if (not hasPermission(msg.caller, #CanViewAnyUserProgress)) {
            return {
                active_missions = 0;
                completed_overall_missions = 0;
                draft_missions = 0;
                expired_missions = 0;
                paused_missions = 0;
                project_lifetime_completions = 0;
                project_lifetime_starts_approx = 0;
                project_name = projectInfo.name;
                total_missions = 0;
                unique_users_interacted = 0;
            };
        };

        var active_missions_count : Nat = 0;
        var expired_missions_count : Nat = 0;
        var completed_overall_missions_count : Nat = 0;
        var draft_missions_count : Nat = 0;
        var paused_missions_count : Nat = 0;
        var project_lifetime_completions_sum : Nat = 0;

        for ((_id, m) in StableTrieMap.entries(missions)) {
            project_lifetime_completions_sum += m.currentTotalCompletions;
            switch (m.status) {
                case (#Active) { active_missions_count += 1 };
                case (#Expired) { expired_missions_count += 1 };
                case (#Completed) { completed_overall_missions_count += 1 };
                case (#Draft) { draft_missions_count += 1 };
                case (#Paused) { paused_missions_count += 1 };
            };
        };

        var project_lifetime_starts_approx_sum : Nat = 0;
        for ((_uuid, missionMap) in StableTrieMap.entries(userProgress)) {
            project_lifetime_starts_approx_sum += StableTrieMap.size(missionMap);
        };

        return {
            project_name = projectInfo.name;
            total_missions = StableTrieMap.size(missions);
            active_missions = active_missions_count;
            expired_missions = expired_missions_count;
            completed_overall_missions = completed_overall_missions_count;
            draft_missions = draft_missions_count;
            paused_missions = paused_missions_count;
            unique_users_interacted = StableTrieMap.size(userProgress);
            project_lifetime_completions = project_lifetime_completions_sum;
            project_lifetime_starts_approx = project_lifetime_starts_approx_sum;
        };
    };

    // Analytics Function 2: Summary for each mission
    public shared query (msg) func get_all_missions_analytics() : async [AnalyticsTypes.MissionAnalyticsSummary] {

        if (not hasPermission(msg.caller, #CanViewAnyUserProgress)) {
            return [];
        };

        var mission_summaries : [AnalyticsTypes.MissionAnalyticsSummary] = [];
        for ((id, mission) in StableTrieMap.entries(missions)) {
            var estimated_starts_for_mission : Nat = 0;
            for ((_uuid, missionsProgressMap) in StableTrieMap.entries(userProgress)) {
                if (StableTrieMap.containsKey(missionsProgressMap, Nat.equal, Hash.hash, id)) {
                    estimated_starts_for_mission += 1;
                };
            };

            let summary : AnalyticsTypes.MissionAnalyticsSummary = {
                mission_id = id;
                name = mission.name;
                status = mission.status;
                total_completions = mission.currentTotalCompletions;
                unique_completers = StableTrieMap.size(mission.usersWhoCompletedCount);
                estimated_starts = estimated_starts_for_mission;
                creation_time = mission.creationTime;
                mission_start_time = mission.startTime;
                mission_end_time = mission.endTime;
                tags = mission.tags;
            };
            mission_summaries := Array.append(mission_summaries, [summary]);
        };
        return mission_summaries;
    };

    // Analytics Function 3: Detailed progress for all users
    // This is the heaviest query.
    // It provides data for DAU/WAU/MAU, new users, lifecycle, retention, funnel (partially), time-to-complete.
    public shared query (msg) func get_all_user_analytics_records() : async [AnalyticsTypes.UserAnalyticsRecord] {

        if (not hasPermission(msg.caller, #CanViewAnyUserProgress)) {
            return [];
        };

        var all_user_records : [AnalyticsTypes.UserAnalyticsRecord] = [];

        for ((user_uuid, user_missions_map) in StableTrieMap.entries(userProgress)) {
            var user_progress_entries_for_analytics : [AnalyticsTypes.UserMissionProgressAnalyticsRecord] = [];
            var earliest_activity_time_for_user : ?Int = null;
            var latest_activity_time_for_user : ?Int = null;
            var user_total_completed_missions_count : Nat = 0;

            for ((mission_id, progress) in StableTrieMap.entries(user_missions_map)) {
                // Update user's earliest and latest activity times
                if (Option.isNull(earliest_activity_time_for_user) or progress.lastActiveTime < Option.get(earliest_activity_time_for_user, Time.now())) {
                    earliest_activity_time_for_user := ?progress.lastActiveTime;
                };
                if (Option.isNull(latest_activity_time_for_user) or progress.lastActiveTime > Option.get(latest_activity_time_for_user, 0)) {
                    latest_activity_time_for_user := ?progress.lastActiveTime;
                };

                if (progress.overallStatus == #CompletedSuccess) {
                    user_total_completed_missions_count += 1; // Counts successful attempts recorded in userProgress
                };

                var completions_by_user_this_mission : Nat = 0;
                switch (StableTrieMap.get(missions, Nat.equal, Hash.hash, mission_id)) {
                    case (?m) {
                        completions_by_user_this_mission := Option.get(
                            StableTrieMap.get(m.usersWhoCompletedCount, Text.equal, Text.hash, user_uuid),
                            0,
                        );
                    };
                    case null {}; // Mission might have been deleted, or inconsistent data
                };

                let record : AnalyticsTypes.UserMissionProgressAnalyticsRecord = {
                    mission_id = mission_id;
                    last_active_time = progress.lastActiveTime;
                    completion_time = progress.completionTime;
                    overall_status = progress.overallStatus;
                    completions_by_this_user_for_this_mission = completions_by_user_this_mission;
                };
                user_progress_entries_for_analytics := Array.append(user_progress_entries_for_analytics, [record]);
            };

            // Ensure earliest_activity_time_for_user and latest_activity_time_for_user are not null
            // Provide default if user somehow has no progress entries with timestamps (should not happen)
            let final_earliest_time = Option.get(earliest_activity_time_for_user, 0);
            let final_latest_time = Option.get(latest_activity_time_for_user, 0);

            let user_record : AnalyticsTypes.UserAnalyticsRecord = {
                user_uuid = user_uuid;
                first_seen_time_approx = final_earliest_time;
                last_seen_time = final_latest_time;
                missions_attempted_count = StableTrieMap.size(user_missions_map);
                missions_completed_count = user_total_completed_missions_count; // Note: This counts UserMissionProgress statuses, not unique missions completed from mission.usersWhoCompletedCount
                progress_entries = user_progress_entries_for_analytics;
            };
            all_user_records := Array.append(all_user_records, [user_record]);
        };
        return all_user_records;
    };

    // Helper to get step states for a specific user mission progress, if needed for funnel drill-down
    // This is more of a utility if the above `get_all_user_analytics_records` becomes too large
    // or you want to defer loading step details.
    public shared query (msg) func get_user_mission_step_states_for_analytics(user_uuid : Text, mission_id : Nat) : async ?[(Nat, NewTypes.UserActionStepStatus, Nat)] {
        // Add permission check: either owner or admin with #CanViewAnyUserProgress
        if (not hasPermission(msg.caller, #CanViewAnyUserProgress)) {
            return null;
        };

        switch (StableTrieMap.get(userProgress, Text.equal, Text.hash, user_uuid)) {
            case null { return null };
            case (?user_missions_map) {
                switch (StableTrieMap.get(user_missions_map, Nat.equal, Hash.hash, mission_id)) {
                    case null { return null };
                    case (?progress) {
                        var step_summary : [(Nat, NewTypes.UserActionStepStatus, Nat)] = [];
                        for ((stepId, stepState) in StableTrieMap.entries(progress.stepStates)) {
                            step_summary := Array.append(step_summary, [(stepId, stepState.status, stepState.attempts)]);
                        };
                        return ?step_summary;
                    };
                };
            };
        };
    };

    public shared query func get_aggregated_mission_funnel(missionId : Nat) : async Result.Result<[AnalyticsTypes.AggregatedFunnelStep], Text> {
        // 1. Retrieve the Mission
        let missionOpt = StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId);
        let mission : NewTypes.Mission = switch (missionOpt) {
            case null {
                return #err("Mission not found with ID: " # Nat.toText(missionId));
            };
            case (?m) m;
        };

        // 2. Parse actionFlowJson to get step definitions
        // Helper type for ordered step definitions
        type ActionStepDefinition = { id : Nat; name : ?Text; order : Nat }; // order is 0-indexed
        var definedSteps : [ActionStepDefinition] = [];

        switch (Json.parse(mission.actionFlowJson)) {
            case (#err(e)) {
                Debug.print("Error parsing actionFlowJson for mission " # Nat.toText(missionId) # ": " # Json.errToText(e));
                return #err("Failed to parse mission.actionFlowJson: " # Json.errToText(e));
            };
            case (#ok(flowObj)) {
                switch (Json.get(flowObj, "steps")) {
                    case null {
                        return #err("Missing 'steps' array in actionFlowJson for mission " # Nat.toText(missionId));
                    };
                    case (?(#array(stepsArray))) {
                        if (Array.size(stepsArray) == 0) {
                            return #ok([]); // No steps, empty funnel
                        };
                        var orderCounter : Nat = 0;
                        for (stepObj in stepsArray.vals()) {
                            let stepIdOpt : ?Nat = switch (Json.get(stepObj, "stepId")) {
                                case (?(#number(numVal))) {
                                    switch (numVal) {
                                        case (#int(i)) if (i >= 0) {
                                            ?Int.abs(i);
                                        } else { null };
                                        case (#float(f)) if (f >= 0.0 and f == Float.trunc(f)) {
                                            ?Int.abs(Float.toInt(f));
                                        } else { null };
                                    };
                                };
                                case (?(#string(s))) { Nat.fromText(s) }; // Allow stepId as string
                                case _ { null };
                            };
                            // Assuming a 'name' field might exist in the step definition in actionFlowJson
                            let stepNameOpt : ?Text = switch (Json.get(stepObj, "name")) {
                                case (?(#string(s))) { ?s };
                                case null { null };
                            };

                            switch (stepIdOpt) {
                                case (?stepId) {
                                    definedSteps := Array.append(definedSteps, [{ id = stepId; name = stepNameOpt; order = orderCounter }]);
                                    orderCounter += 1;
                                };
                                case null {
                                    Debug.print("Warning: Invalid or missing stepId in actionFlowJson for mission " # Nat.toText(missionId) # " at order " # Nat.toText(orderCounter));
                                    // Potentially skip this step or return an error if strict parsing is required
                                };
                            };
                        };
                        if (Array.size(definedSteps) == 0 and Array.size(stepsArray) > 0) {
                            return #err("No valid stepIds found in actionFlowJson steps for mission " # Nat.toText(missionId));
                        };
                    };
                    case _ {
                        return #err("'steps' field is not an array in actionFlowJson for mission " # Nat.toText(missionId));
                    };
                };
            };
        };

        if (Array.size(definedSteps) == 0) {
            return #ok([]); // No steps defined or parsed correctly
        };

        // 3. Initialize counters for each defined step using their order as index
        // This assumes 'definedSteps' is now ordered correctly by 'order' field (0 to N-1)
        type StepCounts = { var users_completed : Nat }; // users_reached will be derived later
        var stepCompletionCounters : [var StepCounts] = Array.init<StepCounts>(Array.size(definedSteps), { var users_completed = 0 });

        var totalUsersWhoAttemptedMission : Nat = 0;

        // 4. Iterate through userProgress
        for ((_userUUID, userMissionsMap) in StableTrieMap.entries(userProgress)) {
            switch (StableTrieMap.get<Nat, NewTypes.UserMissionProgress>(userMissionsMap, Nat.equal, Hash.hash, missionId)) {
                case null {}; // User hasn't interacted with this mission
                case (?currentUserMissionProgress) {
                    totalUsersWhoAttemptedMission += 1;

                    var idx = 0;
                    while (idx < Array.size(definedSteps)) {
                        let currentDefinedStep = definedSteps[idx];
                        switch (
                            StableTrieMap.get<Nat, NewTypes.UserActionStepState>(
                                currentUserMissionProgress.stepStates,
                                Nat.equal,
                                Hash.hash,
                                currentDefinedStep.id,
                            )
                        ) {
                            case null {}; // User didn't reach or complete this step
                            case (?actionStepState) {
                                if (actionStepState.status == #Verified) {
                                    stepCompletionCounters[currentDefinedStep.order].users_completed += 1;
                                };
                            };
                        };
                        idx += 1;
                    };
                };
            };
        };

        // 5. Construct the result array, calculating users_reached_step sequentially
        var result : [AnalyticsTypes.AggregatedFunnelStep] = [];
        var usersReachedPreviousStep : Nat = totalUsersWhoAttemptedMission; // Initial count for the first step

        var idx : Nat = 0;
        while (idx < Array.size(definedSteps)) {
            let defStep = definedSteps[idx];
            let completedCountForThisStep = stepCompletionCounters[defStep.order].users_completed;

            result := Array.append(result, [{ step_id = defStep.id; step_name = defStep.name; users_reached_step = usersReachedPreviousStep; users_completed_step = completedCountForThisStep }]);

            // For the next step, users_reached is the number of users who completed the current step
            usersReachedPreviousStep := completedCountForThisStep;
            idx += 1;
        };
        return #ok(result);
    };

    public shared composite query (msg) func getBatchPrimaryAccounts(userUUIDs : [Text]) : async [(Text, ?Principal, ?Text)] {

        if (not hasPermission(msg.caller, #CanViewAnyUserProgress)) {
            return [];
        };

        let indexActor = actor (indexCanisterId) : actor {
            getBatchPrimaryAccounts : shared query [Text] -> async [(Text, ?Principal, ?Text)];
        };
        let accounts = await indexActor.getBatchPrimaryAccounts(userUUIDs);
        return accounts;
    };

    public shared composite query (msg) func getBatchGlobalUsers(userUUIDs : [Text]) : async [(Text, ?NewTypes.SerializedGlobalUser)] {
        if (not hasPermission(msg.caller, #CanViewAnyUserProgress)) {
            return [];
        };

        let indexActor = actor (indexCanisterId) : actor {
            getBatchGlobalUsers : shared query [Text] -> async [(Text, ?NewTypes.SerializedGlobalUser)];
        };

        let globalUsers = await indexActor.getBatchGlobalUsers(userUUIDs);
        return globalUsers;
    };

    public shared composite query (msg) func get_user_all_linked_accounts(user_uuid : Text) : async [(Text, Principal)] {
        if (not hasPermission(msg.caller, #CanViewAnyUserProgress)) {
            return [];
        };

        try {
            let indexActor = actor (indexCanisterId) : actor {
                getLinkedAccountsForUUID : query (Text) -> async [(Text, Principal)];
            };
            let linkedAccounts = await indexActor.getLinkedAccountsForUUID(user_uuid);
            return linkedAccounts;
        } catch (_e) {
            return [];
        };
    };

    public shared query func icrc28_trusted_origins() : async NewTypes.Icrc28TrustedOriginsResponse {
        let trusted_origins : [Text] = [
            "https://dlas6-raaaa-aaaag-qm75a-cai.icp0.io",
            "https://dlas6-raaaa-aaaag-qm75a-cai.raw.icp0.io",
            "https://dlas6-raaaa-aaaag-qm75a-cai.ic0.app",
            "https://dlas6-raaaa-aaaag-qm75a-cai.raw.ic0.app",
            "https://dlas6-raaaa-aaaag-qm75a-cai.icp0.icp-api.io",
            "https://dlas6-raaaa-aaaag-qm75a-cai.icp-api.io",
            "https://pre.konecta.one",
            "https://adminpre.konecta.one",
            "https://konecta.one",
            "https://apcy6-tiaaa-aaaag-qkfda-cai.icp0.io",
            "https://okowr-oqaaa-aaaag-qkedq-cai.icp0.io",
            "https://5bxlt-ryaaa-aaaag-qkhea-cai.icp0.io",
            "https://y7mum-taaaa-aaaag-qklxq-cai.icp0.io",
            "https://apcy6-tiaaa-aaaag-qkfda-cai.raw.icp0.io",
            "https://okowr-oqaaa-aaaag-qkedq-cai.raw.icp0.io",
            "https://5bxlt-ryaaa-aaaag-qkhea-cai.raw.icp0.io",
            "https://y7mum-taaaa-aaaag-qklxq-cai.raw.icp0.io",
            "https://apcy6-tiaaa-aaaag-qkfda-cai.ic0.app",
            "https://okowr-oqaaa-aaaag-qkedq-cai.ic0.app",
            "https://5bxlt-ryaaa-aaaag-qkhea-cai.ic0.app",
            "https://y7mum-taaaa-aaaag-qklxq-cai.ic0.app",
            "https://apcy6-tiaaa-aaaag-qkfda-cai.raw.ic0.app",
            "https://okowr-oqaaa-aaaag-qkedq-cai.raw.ic0.app",
            "https://5bxlt-ryaaa-aaaag-qkhea-cai.raw.ic0.app",
            "https://y7mum-taaaa-aaaag-qklxq-cai.raw.ic0.app",
            "https://3qzqh-pqaaa-aaaag-qnheq-cai.icp0.io",
            "https://3qzqh-pqaaa-aaaag-qnheq-cai.raw.icp0.io",
            "https://3qzqh-pqaaa-aaaag-qnheq-cai.ic0.app",
            "https://3qzqh-pqaaa-aaaag-qnheq-cai.raw.ic0.app",
        ];

        return {
            trusted_origins;
        };
    };

    public query func http_request(req : HTTPTypes.HttpRequest) : async HTTPTypes.HttpResponse {

        let path = req.url; // e.g., "/project_assets/timestamp_hash_icon.png"

        Debug.print("http_request received for path: " # path);

        if (Text.startsWith(path, #text "/project_assets/") or Text.startsWith(path, #text "/mission_assets/")) {
            switch (StableTrieMap.get(missionAssets, Text.equal, Text.hash, path)) {
                case (?fileBlob) {
                    let partsIter = Text.split(path, #char '.');
                    let parts = Iter.toArray(partsIter);
                    var extension = "";
                    if (Array.size(parts) > 1) {
                        extension := Text.toLowercase(parts[Array.size(parts) - 1]);
                    };

                    let contentType = switch (extension) {
                        case "png" { "image/png" };
                        case "jpg" { "image/jpeg" };
                        case "jpeg" { "image/jpeg" };
                        case "gif" { "image/gif" };
                        case "svg" { "image/svg+xml" };
                        case "webp" { "image/webp" };
                        case _ { "application/octet-stream" };
                    };

                    Debug.print("Serving asset: " # path # " with contentType: " # contentType);

                    return {
                        status_code = 200;
                        headers = [
                            ("Content-Type", contentType),
                            ("Cache-Control", "public, max-age=604800"),
                        ];
                        body = fileBlob;
                    };
                };
                case null {
                    Debug.print("Asset not found: " # path);
                    return {
                        status_code = 404;
                        headers = [("Content-Type", "text/plain")];
                        body = Text.encodeUtf8("File not found: " # path);
                    };
                };
            };
        } else {
            Debug.print("Path not recognized for asset serving: " # path);
            return {
                status_code = 404;
                headers = [("Content-Type", "text/plain")];
                body = Text.encodeUtf8("Resource not found.");
            };
        };
    };
};
