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
import Json "mo:json";

import NewTypes "NewTypes";
import StableTrieMap "../StableTrieMap";
import Serialization "Serialization";
import Helpers "Helpers";

actor class ProjectBackend() {

    // --- CONFIGURATION ---
    private var indexCanisterId : Text = "q3itu-vqaaa-aaaag-qngyq-cai";
    private var actionsCanisterIdText : Text = "3c7h6-daaaa-aaaag-qnhhq-cai";
    private var web2PrincipalId : Text = "stg2p-p2rin-7mwfy-nct57-llsvt-h7ftf-f3edr-rmqc2-khb2e-c5efd-iae";
    private let MAX_ASSET_SIZE_BYTES : Nat = 1024 * 1024 * 2;

    // --- STATE VARIABLES ---
    stable var adminIds : [Principal] = [];

    stable var projectInfo : ?NewTypes.ProjectDetails = null;

    stable var missions : StableTrieMap.StableTrieMap<Nat, NewTypes.Mission> = StableTrieMap.new<Nat, NewTypes.Mission>();
    // userUUID (Text) -> Mission ID (Nat) -> ActionInstance ID (Nat) -> UserActionState
    stable var userProgress : StableTrieMap.StableTrieMap<Text, StableTrieMap.StableTrieMap<Nat, NewTypes.UserMissionProgress>> = StableTrieMap.new<Text, StableTrieMap.StableTrieMap<Nat, NewTypes.UserMissionProgress>>();
    stable var missionAssets : StableTrieMap.StableTrieMap<Text, Blob> = StableTrieMap.new<Text, Blob>();

    // --- PRIVATE HELPERS ---
    private func isAdmin(caller : Principal) : Bool {
        return Option.isSome(Array.find<Principal>(adminIds, func(admin) { admin == caller }));
    };

    // --- ADMIN FUNCTIONS ---
    public shared (msg) func addAdmin(newAdminId : Principal) : async Result.Result<Null, Text> {
        if (not isAdmin(msg.caller)) {
            return Debug.trap("Caller is not an admin.");
        };
        if (Option.isSome(Array.find<Principal>(adminIds, func(id : Principal) : Bool { id == newAdminId }))) {
            return #err("Principal is already an admin.");
        };
        adminIds := Array.append(adminIds, [newAdminId]);
        return #ok(null);
    };

    public shared (msg) func removeAdmin(adminIdToRemove : Principal) : async Result.Result<Null, Text> {
        if (not isAdmin(msg.caller)) {
            return Debug.trap("Caller is not an admin.");
        };
        if (msg.caller == adminIdToRemove and Array.size(adminIds) == 1) {
            return #err("Cannot remove the last admin.");
        };
        let newAdmins = Array.filter<Principal>(adminIds, func(id) { id != adminIdToRemove });
        if (Array.size(newAdmins) == Array.size(adminIds)) {
            return #err("Admin ID not found.");
        };
        adminIds := newAdmins;
        return #ok(null);
    };

    public query func getAdmins() : async [Principal] {
        return adminIds;
    };

    // --- PROJECT INFO MANAGEMENT (Admin only) ---

    public shared (msg) func setProjectDetails(
        name : Text,
        iconUrl : ?Text,
        bannerUrl : ?Text,
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
        if (not isAdmin(msg.caller)) {
            return Debug.trap("Caller is not an admin. Only admins can set project details.");
        };

        let currentTime = Time.now();

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
            var iconUrl = iconUrl;
            var bannerUrl = bannerUrl;
            var description = description;
            var aboutInfo = aboutInfo;
            var contactInfo = newContactInfo;
            var lastUpdated = currentTime;
            var updatedBy = msg.caller;
        };

        projectInfo := ?newDetails;
        // Debug.print("Project details updated by " # Principal.toText(msg.caller) # " at " # Int.toText(currentTime));
        return #ok(null);
    };

    // ADDED: Function to get project details (publicly queryable)
    public query func getProjectDetails() : async ?NewTypes.SerializedProjectDetails {
        switch (projectInfo) {
            case null { return null };
            case (?details) {
                return ?Serialization.serializeProjectDetails(details);
            };
        };
    };

    // --- MISSION MANAGEMENT (by Admins) ---
    public shared (msg) func addOrUpdateMission(
        missionId : Nat,
        name : Text,
        description : Text,
        actionFlowRepresentation : Text, // JSON string
        rewardAmount : Nat,
        maxRewardAmount : ?Nat, // Optionally set maxRewardAmount too
        rewardType : NewTypes.RewardType,
        startTime : Int,
        endTime : ?Int,
        iconUrl : ?Text,
        imageUrl : ?Text, // Added imageUrl based on Mission type
        tags : ?[Text],
        requiredPreviousMissionId : ?[Nat],
        requiredMissionLogic : ?{ #All; #Any }, // Added based on Mission type
        isRecursive : Bool,
        recursiveTimeCooldown : ?Int, // Added based on Mission type
        maxCompletionsPerUser : ?Nat,
        maxTotalCompletions : ?Nat,
        initialStatus : NewTypes.MissionStatus, // e.g. #Draft or #Active
        priority : ?Nat // Added based on Mission type
    ) : async Result.Result<Null, Text> {
        if (not isAdmin(msg.caller)) {
            return Debug.trap("Caller is not an admin.");
        };

        let currentTime = Time.now();
        let missionEntry = StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId);

        let (creationTimeForEntry, creatorForEntry, currentTotalCompletionsForEntry, usersWhoCompletedCountForEntry, updatesForEntry) = switch (missionEntry) {
            case null {
                (currentTime, msg.caller, 0, StableTrieMap.new<Text, Nat>(), [(currentTime, msg.caller)]);
            };
            case (?m) {
                (m.creationTime, m.creator, m.currentTotalCompletions, m.usersWhoCompletedCount, Array.append(m.updates, [(currentTime, msg.caller)]));
            };
        };

        let newMission : NewTypes.Mission = {
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
            var imageUrl = imageUrl;
            var iconUrl = iconUrl;
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
        StableTrieMap.put<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId, newMission);
        return #ok(null);
    };

    public shared (msg) func updateMissionStatus(missionId : Nat, newStatus : NewTypes.MissionStatus) : async Result.Result<Null, Text> {
        if (not isAdmin(msg.caller)) {
            return Debug.trap("Caller is not an admin.");
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
                if (isAdmin(msg.caller) or mission.status == #Active) {
                    return ?Serialization.serializeMission(mission);
                } else {
                    return null;
                };
            };
        };
    };

    public shared query (msg) func getAllMissions() : async [(Nat, NewTypes.SerializedMission)] {
        // This returns all missions; for public view, filter by status (e.g., only Active).
        var allMissions : [(Nat, NewTypes.SerializedMission)] = [];
        for ((id, mission) in StableTrieMap.entries(missions)) {
            let shouldShow = if (isAdmin(msg.caller)) {
                true;
            } else {
                mission.status == #Active;
            };
            if (shouldShow) {
                allMissions := Array.append(allMissions, [(id, Serialization.serializeMission(mission))]);
            };
        };
        return allMissions;
    };

    // --- USER PROGRESS QUERYING ---
    public shared composite query func getUserMissionProgress(principal : Principal, missionId : Nat) : async ?NewTypes.SerializedUserMissionProgress {
        let userUUIDResult = await getUUID(principal);
        let userUUID : Text = switch (userUUIDResult) {
            case (#ok(uuid)) uuid;
            case (#err(_e)) {
                return null;
            };
        };

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

    public shared composite query func getUserActionStepState(principal : Principal, missionId : Nat, stepId : Nat) : async ?NewTypes.SerializedUserActionStepState {
        let userUUIDResult = await getUUID(principal);
        let userUUID : Text = switch (userUUIDResult) {
            case (#ok(uuid)) uuid;
            case (#err(_e)) {
                return null;
            };
        };

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

    public shared composite query func getUserMissionStepStates(principal : Principal, missionId : Nat) : async ?[(Nat, NewTypes.SerializedUserActionStepState)] {
        let userUUIDResult = await getUUID(principal);
        let userUUID : Text = switch (userUUIDResult) {
            case (#ok(uuid)) uuid;
            case (#err(_e)) {
                return null;
            };
        };

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

    public shared composite query func getAllUserMissionsProgress(principal : Principal) : async ?[(Nat, NewTypes.SerializedUserMissionProgress)] {
        let userUUIDResult = await getUUID(principal);
        let userUUID : Text = switch (userUUIDResult) {
            case (#ok(uuid)) uuid;
            case (#err(_e)) {
                return null;
            };
        };

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

    public query func getMissionCompletionStatusForUser(userUUID : Text, missionId : Nat) : async Bool {
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

    public query func getMissionCompletionsForUser(userUUID : Text, missionId : Nat) : async Nat {
        switch (StableTrieMap.get<Nat, NewTypes.Mission>(missions, Nat.equal, Hash.hash, missionId)) {
            case null { return 0 };
            case (?m) {
                return Option.get(StableTrieMap.get<Text, Nat>(m.usersWhoCompletedCount, Text.equal, Text.hash, userUUID), 0);
            };
        };
    };

    // --- MISSION ASSET MANAGEMENT (by Admins) ---
    public shared (msg) func uploadMissionAsset(assetId : Text, assetContent : Blob) : async Result.Result<Text, Text> {
        if (not isAdmin(msg.caller)) {
            return Debug.trap("Caller is not an admin.");
        };
        if (Text.size(assetId) == 0) {
            return #err("Asset ID cannot be empty.");
        };
        if (Array.size(Blob.toArray(assetContent)) > MAX_ASSET_SIZE_BYTES) {
            return #err("Asset content exceeds maximum allowed size of " # Nat.toText(MAX_ASSET_SIZE_BYTES) # " bytes.");
        };
        // TODO: Content type validation if needed (e.g., inspecting magic bytes, though complex in Motoko)
        // For now, we'll assume assetId might hint at type (e.g., "image.png") for client-side use.
        StableTrieMap.put<Text, Blob>(missionAssets, Text.equal, Text.hash, assetId, assetContent);
        return #ok(assetId); // Or a full URL
    };

    public shared composite query func getUUID(principal : Principal) : async Result.Result<Text, Text> {
        try {
            let indexActor = actor (indexCanisterId) : actor {
                getUUID : query (Principal) -> async Text;
            };
            let uuid = await indexActor.getUUID(principal);
            return #ok(uuid);
        } catch (_e) {
            return #err("Failed to get UUID from index canister");
        };
    };

    public shared (msg) func startMission(missionId : Nat) : async Result.Result<NewTypes.SerializedUserMissionProgress, Text> {
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

        if (principal != msg.caller) {
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
};
