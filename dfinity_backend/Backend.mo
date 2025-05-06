import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Types "Types";
import Serialization "Serialization";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Vector "mo:vector";
import Blob "mo:base/Blob";
import Int "mo:base/Int";
import Hash "mo:base/Hash";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import Nat8 "mo:base/Nat8";
import Random "mo:base/Random";
import Char "mo:base/Char";
import Option "mo:base/Option";
import Debug "mo:base/Debug";

actor class Backend() {

  let indexCanisterId : Text = "tui2b-giaaa-aaaag-qnbpq-cai";

  private var globalUserProgress : TrieMap.TrieMap<Text, Types.UserMissions> = TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);

  // Stable storage for serialized data

  stable var serializedGlobalUserProgress : [(Text, [(Nat, Types.SerializedProgress)])] = [];

  stable var mission2Text : Text = "";

  public shared query (msg) func getMission2Text() : async Text {
    if (not Principal.isAnonymous(msg.caller)) {
      return mission2Text;
    };
    return "";
  };

  public shared (msg) func mergeAccounts(canonicalUUID : Text, mergingUUID : Text) : async Text {

    if (msg.caller == Principal.fromText(indexCanisterId)) {

      // 4. Merge globalglobalUserProgress (UserMissions = TrieMap<Nat, Progress>)
      var mergedglobalUserProgress : TrieMap.TrieMap<Nat, Types.Progress> = switch (globalUserProgress.get(canonicalUUID)) {
        case (?mp) { mp };
        case null { TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash) };
      };

      switch (globalUserProgress.get(mergingUUID)) {
        case (?mergingProgressMap) {
          for ((missionId, mergingProgress) in mergingProgressMap.entries()) {
            switch (mergedglobalUserProgress.get(missionId)) {
              case null {
                // Mission not present for canonical; add it.
                mergedglobalUserProgress.put(missionId, mergingProgress);
              };
              case (?canonProgress) {
                // Merge usedCodes (union: true if either is true)
                let mergedUsedCodes = canonProgress.usedCodes;
                for ((code, used) in mergingProgress.usedCodes.entries()) {
                  switch (mergedUsedCodes.get(code)) {
                    case null { mergedUsedCodes.put(code, used) };
                    case (?curr) { mergedUsedCodes.put(code, curr or used) };
                  };
                };
                // Merge completionHistory:
                let canonHistory = canonProgress.completionHistory;
                let mergingHistory = mergingProgress.completionHistory;
                // If at least one mission record has a tweetId, merge all records.
                let hasTweetId = Option.isSome(Array.find(canonHistory, func(r : Types.MissionRecord) : Bool { r.tweetId != null })) or Option.isSome(Array.find(mergingHistory, func(r : Types.MissionRecord) : Bool { r.tweetId != null }));
                let mergedHistory = if (hasTweetId) {
                  Array.append(canonHistory, mergingHistory);
                } else {
                  // Otherwise, choose the history whose total points is higher.
                  let sumCanon = Array.foldLeft<Types.MissionRecord, Nat>(canonHistory, 0, func(acc : Nat, r : Types.MissionRecord) : Nat { acc + r.pointsEarned });
                  let sumMerging = Array.foldLeft<Types.MissionRecord, Nat>(mergingHistory, 0, func(acc : Nat, r : Types.MissionRecord) : Nat { acc + r.pointsEarned });
                  if (sumCanon >= sumMerging) { canonHistory } else {
                    mergingHistory;
                  };
                };
                let mergedProgressRecord : Types.Progress = {
                  var completionHistory = mergedHistory;
                  var usedCodes = mergedUsedCodes;
                };
                mergedglobalUserProgress.put(missionId, mergedProgressRecord);
              };
            };
          };
        };
        case null {};
      };
      globalUserProgress.put(canonicalUUID, mergedglobalUserProgress);
      globalUserProgress.delete(mergingUUID);

      return "Success";
    };
    "";
  };

  stable var adminIds : [Principal] = [Principal.fromText("re2jg-bjb6f-frlwq-342yn-bebk2-43ofq-3qwwq-cld3p-xiwxw-bry3n-aqe")];

  public shared (msg) func addAdminId(newAdminId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      adminIds := Array.append<Principal>(adminIds, [newAdminId]);
    };
  };

  public shared (msg) func removeAdminId(adminId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      adminIds := Array.filter<Principal>(adminIds, func(id) : Bool { id != adminId });
    };

  };

  private func isAdmin(principalId : Principal) : Bool {
    return Array.find<Principal>(
      adminIds,
      func(id) : Bool {
        id == principalId;
      },
    ) != null;
  };

  public shared query (msg) func trisAdmin(principalId : Principal) : async Bool {
    if (isAdmin(msg.caller)) {
      return Array.find<Principal>(
        adminIds,
        func(id) : Bool {
          id == principalId;
        },
      ) != null;
    };
    return false;
  };

  // Function to get all admin IDs

  public shared query (msg) func getAdminIds() : async [Principal] {
    if (isAdmin(msg.caller)) {
      return adminIds;
    };
    return [];
  };

  public query func getVersion() : async Text {
    return "V2.0";
  };

  public shared (msg) func restoreAllUserProgress(serializedData : [(Text, [(Nat, Types.SerializedProgress)])]) : async () {
    if (isAdmin(msg.caller)) {
      // Iterate over each user data tuple
      for (tuple in Iter.fromArray(serializedData)) {
        let userId = tuple.0;
        let serializedUserMissions = tuple.1;

        // Retrieve or initialize the user's mission data
        var userMissions = switch (globalUserProgress.get(userId)) {
          case (?existingMissions) { existingMissions };
          case null {
            TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
          };
        };

        // Process each mission for the user
        for (missionTuple in Iter.fromArray(serializedUserMissions)) {
          let missionId = missionTuple.0;
          let serializedProgress = missionTuple.1;

          // Deserialize the serializedProgress
          let completionHistory = Array.map<Types.SerializedMissionRecord, Types.MissionRecord>(
            serializedProgress.completionHistory,
            func(serializedRecord : Types.SerializedMissionRecord) : Types.MissionRecord {
              {
                var timestamp = serializedRecord.timestamp;
                var pointsEarned = serializedRecord.pointsEarned;
                var tweetId = serializedRecord.tweetId;
              };
            },
          );

          let usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
          for (codeTuple in Iter.fromArray(serializedProgress.usedCodes)) {
            let code = codeTuple.0;
            let value = codeTuple.1;
            usedCodes.put(code, value);
          };

          let progress : Types.Progress = {
            var completionHistory = completionHistory;
            var usedCodes = usedCodes;
          };

          // Update the mission progress
          userMissions.put(missionId, progress);
        };

        // Update the user's missions in userProgress
        globalUserProgress.put(userId, userMissions);
      };
    };
  };

  // Pre-upgrade function to serialize the user progress

  var missionAssets : TrieMap.TrieMap<Text, Blob> = TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash);
  stable var serializedMissionAssets : [(Text, Blob)] = [];

  system func preupgrade() {
    // Serialize user progress

    let globalUserProgressEntries = globalUserProgress.entries();
    serializedGlobalUserProgress := Array.map<(Text, Types.UserMissions), (Text, [(Nat, Types.SerializedProgress)])>(
      Iter.toArray(globalUserProgressEntries),
      func(entry : (Text, Types.UserMissions)) : (Text, [(Nat, Types.SerializedProgress)]) {
        let (userId, userMissions) = entry;
        let missionEntries = userMissions.entries();
        let serializedMissionEntries = Array.map<(Nat, Types.Progress), (Nat, Types.SerializedProgress)>(
          Iter.toArray(missionEntries),
          func(missionEntry : (Nat, Types.Progress)) : (Nat, Types.SerializedProgress) {
            let (missionId, progress) = missionEntry;
            (missionId, Serialization.serializeProgress(progress));
          },
        );
        return (userId, serializedMissionEntries);
      },
    );

    let missionAssetsEntries = Iter.toArray(missionAssets.entries());
    serializedMissionAssets := missionAssetsEntries;

  };

  // Post-upgrade function to deserialize the user progress

  system func postupgrade() {

    globalUserProgress := TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);

    for (tuple in Iter.fromArray(serializedGlobalUserProgress)) {
      let text = tuple.0;
      let serializedMissions = tuple.1;

      let userMissions = TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);

      for (missionTuple in Iter.fromArray(serializedMissions)) {
        let missionId = missionTuple.0;
        let serializedProgress = missionTuple.1;

        let completionHistory = Array.map<Types.SerializedMissionRecord, Types.MissionRecord>(
          serializedProgress.completionHistory,
          func(record : Types.SerializedMissionRecord) : Types.MissionRecord {
            {
              var timestamp = record.timestamp;
              var pointsEarned = record.pointsEarned;
              var tweetId = record.tweetId;
            };
          },
        );

        let usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);

        for (codeTuple in Iter.fromArray(serializedProgress.usedCodes)) {
          let code = codeTuple.0;
          let value = codeTuple.1;
          usedCodes.put(code, value);
        };

        let progress : Types.Progress = {
          var completionHistory = completionHistory;
          var usedCodes = usedCodes;
        };

        userMissions.put(missionId, progress);
      };

      globalUserProgress.put(text, userMissions);
    };

    serializedGlobalUserProgress := [];

    // Deserialize the mission assets
    missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash);

    for (assetEntry in serializedMissionAssets.vals()) {
      let (missionId, asset) = assetEntry;
      missionAssets.put(missionId, asset);
    };

    serializedMissionAssets := [];

  };

  public shared (msg) func updateUserProgress(userUUID : Text, missionId : Nat, serializedProgress : Types.SerializedProgress) : async () {

    if (isAdmin(msg.caller)) {

      // Deserialize the progress object
      let progress = Serialization.deserializeProgress(serializedProgress);

      // Retrieve the user's missions or create a new TrieMap if it doesn't exist
      let missions = switch (globalUserProgress.get(userUUID)) {
        case (?map) map;
        case null TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
      };

      // Update the mission progress
      missions.put(missionId, progress);

      // Update the user's progress in the main TrieMap
      globalUserProgress.put(userUUID, missions);

    };
  };

  public shared (msg) func resetUserMissionByIdForUser(userUUID : Text, missionId : Nat) : async () {
    if (isAdmin(msg.caller)) {

      let _missions = switch (globalUserProgress.get(userUUID)) {
        case (?map) {
          map.remove(missionId);
        };
        case null null;
      };
    };
  };

  public shared composite query (msg) func getProgress(userId : Principal, missionId : Nat) : async ?Types.SerializedProgress {

    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      switch (globalUserProgress.get(userUUID)) {
        case (?missions) {
          switch (missions.get(missionId)) {
            case (?progress) return ?Serialization.serializeProgress(progress);
            case null return null;
          };
        };
        case null return null;
      };
    };

    return null;
  };

  public shared composite query (msg) func getUserProgress(userId : Principal) : async ?[(Nat, Types.SerializedProgress)] {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      let userMissionsOpt = globalUserProgress.get(userUUID);

      switch (userMissionsOpt) {
        case (null) {
          return null;
        };
        case (?userMissions) {
          var serializedMissions : [(Nat, Types.SerializedProgress)] = [];

          // Get an iterator for the mission entries
          let missionsIter = userMissions.entries();

          // Loop over the entries in the TrieMap
          for (entry in missionsIter) {
            let missionId = entry.0;
            let progress = entry.1;
            let serializedProgress = Serialization.serializeProgress(progress);
            serializedMissions := Array.append(serializedMissions, [(missionId, serializedProgress)]);
          };

          return ?serializedMissions;
        };
      };
    };

    return null;
  };

  // Function to check if a user can do a mission

  public shared query (msg) func canUserDoMission(userUUID : Text, missionId : Nat) : async Bool {
    if (isAdmin(msg.caller)) {
      var missionOpt : ?Types.MissionV2 = null;
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == missionId) {
          missionOpt := ?mission;
        };
      };

      let mission = switch (missionOpt) {
        case (?m) m;
        case null { Debug.trap("Mission not found") };
      };

      if (Option.isSome(mission.requiredPreviousMissionId)) {
        let ?prevMissionId = mission.requiredPreviousMissionId;
        switch (globalUserProgress.get(userUUID)) {
          case (?userMissions) {
            switch (userMissions.get(prevMissionId)) {
              case (?prevProgress) {
                if (Array.size(prevProgress.completionHistory) == 0) {
                  return false;
                };
              };
              case null {
                return false;
              };
            };
          };
          case null {
            return false;
          };
        };
      };

      switch (globalUserProgress.get(userUUID)) {
        case (?userMissions) {
          switch (userMissions.get(missionId)) {
            case (?progress) {
              if (mission.recursive) {

                for (record in Iter.fromArray(progress.completionHistory)) {
                  if (record.timestamp > mission.startDate) {
                    return false;
                  };
                };
              } else {
                if (Array.size(progress.completionHistory) > 0) {
                  return false;
                };
              };
            };
            case null {};
          };
        };
        case null {};
      };
      return true;
    };
    return false;
  };

  public shared composite query (msg) func getTotalSecondsForUser(userId : Principal) : async ?Nat {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      let userMissionsOpt = globalUserProgress.get(userUUID);

      switch (userMissionsOpt) {
        case null {
          return null;
        };
        case (?userMissions) {
          var totalPoints : Nat = 0;

          // Iterate over each mission in the user's progress
          for ((_, progress) in userMissions.entries()) {
            // Access the completion history directly from progress
            let completionHistory = progress.completionHistory;

            // Sum up the pointsEarned from each mission record
            for (missionRecord in Iter.fromArray(completionHistory)) {
              totalPoints += missionRecord.pointsEarned;
            };
          };

          return ?totalPoints;
        };
      };
    };
    return ?0;
  };

  private func generateUniqueIdentifier(imageName : Text) : Text {
    let timestamp = Int.toText(Time.now());
    let hash = Text.hash(imageName);

    // Find the last occurrence of '.' to get the file extension
    let partsIter = Text.split(imageName, #char '.');
    let parts = Iter.toArray(partsIter);

    let extension = switch (Array.size(parts) > 1) {
      case true parts[Array.size(parts) - 1]; // Get the last part as the extension
      case false ""; // No extension found
    };

    return timestamp # "_" # Nat32.toText(hash) # "." # extension;
  };

  public shared (msg) func uploadMissionImage(imageName : Text, imageContent : Blob) : async Text {
    if (isAdmin(msg.caller)) {
      let directory = "/missionassets/";

      // Generate a unique image name using the timestamp and hash
      let uniqueImageName = generateUniqueIdentifier(imageName);
      let url = directory # uniqueImageName;

      // Store the image content associated with the unique URL
      missionAssets.put(url, imageContent);

      return url;
    };
    return "Nice try lmao";
  };

  stable var missionsV2 : Vector.Vector<Types.MissionV2> = Vector.new<Types.MissionV2>();

  public shared (msg) func addOrUpdateMission(newMission : Types.SerializedMissionV2) : async () {
    if (isAdmin(msg.caller)) {

      let newDeserializedMission = Serialization.deserializeMissionV2(newMission);
      var missionFound = false;

      let size = Vector.size(missionsV2);
      for (i in Iter.range(0, size - 1)) {
        let existingMissionOpt = Vector.get(missionsV2, i);
        switch (existingMissionOpt) {
          case (mission) {
            if (mission.id == newMission.id) {
              let updatedMission : Types.MissionV2 = {
                var id = newDeserializedMission.id;
                var title = newDeserializedMission.title;
                var description = newDeserializedMission.description;
                var obj1 = newDeserializedMission.obj1;
                var obj2 = newDeserializedMission.obj2;
                var inputPlaceholder = newDeserializedMission.inputPlaceholder;
                var startDate = newDeserializedMission.startDate;
                var endDate = newDeserializedMission.endDate;
                var recursive = newDeserializedMission.recursive;
                var points = newDeserializedMission.points;
                var functionName1 = newDeserializedMission.functionName1;
                var functionName2 = newDeserializedMission.functionName2;
                var image = newDeserializedMission.image;
                var secretCodes = newDeserializedMission.secretCodes;
                var mode = newDeserializedMission.mode;
                var requiredPreviousMissionId = newDeserializedMission.requiredPreviousMissionId;
                var iconUrl = newDeserializedMission.iconUrl;
                var token = newDeserializedMission.token;
                var subAccount = newDeserializedMission.subAccount;
                var subMissions = newDeserializedMission.subMissions;
                var maxUsers = newDeserializedMission.maxUsers;
                var usersThatCompleted = mission.usersThatCompleted; // Keep
                var status = newDeserializedMission.status;
                creationTime = mission.creationTime; // Keep
              };
              Vector.put(missionsV2, i, updatedMission);
              missionFound := true;
            };
          };
        };
      };

      if (not missionFound) {

        let missionToAdd : Types.MissionV2 = {
          var id = newDeserializedMission.id;
          var title = newDeserializedMission.title;
          var description = newDeserializedMission.description;
          var obj1 = newDeserializedMission.obj1;
          var obj2 = newDeserializedMission.obj2;
          var inputPlaceholder = newDeserializedMission.inputPlaceholder;
          var startDate = newDeserializedMission.startDate;
          var endDate = newDeserializedMission.endDate;
          var recursive = newDeserializedMission.recursive;
          var points = newDeserializedMission.points;
          var functionName1 = newDeserializedMission.functionName1;
          var functionName2 = newDeserializedMission.functionName2;
          var image = newDeserializedMission.image;
          var secretCodes = newDeserializedMission.secretCodes;
          var mode = newDeserializedMission.mode;
          var requiredPreviousMissionId = newDeserializedMission.requiredPreviousMissionId;
          var iconUrl = newDeserializedMission.iconUrl;
          var token = newDeserializedMission.token;
          var subAccount = newDeserializedMission.subAccount;
          var subMissions = newDeserializedMission.subMissions;
          var maxUsers = newDeserializedMission.maxUsers;
          var usersThatCompleted = null; // Empty
          var status = newDeserializedMission.status;
          creationTime = Time.now(); // New
        };
        Vector.add<Types.MissionV2>(missionsV2, missionToAdd);
      };
    };
    return;
  };

  public shared query (msg) func getAllMissions() : async [Types.SerializedMissionV2] {
    if (isAdmin(msg.caller)) {
      return Array.map<Types.MissionV2, Types.SerializedMissionV2>(Vector.toArray(missionsV2), Serialization.serializeMissionV2);
    } else {
      let filteredMissions = Array.filter<Types.MissionV2>(
        Vector.toArray(missionsV2),
        func(mission : Types.MissionV2) : Bool {
          mission.startDate <= Time.now();
        },
      );

      return Array.map<Types.MissionV2, Types.SerializedMissionV2>(
        filteredMissions,
        func(mission : Types.MissionV2) : Types.SerializedMissionV2 {
          let serialized = Serialization.serializeMissionV2(mission);
          let updatedSerialized = { serialized with secretCodes = null };
          return updatedSerialized;
        },
      );
    };
  };

  public shared query (msg) func getMissionById(id : Nat) : async ?Types.SerializedMissionV2 {
    if (isAdmin(msg.caller)) {
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == id) {
          return ?Serialization.serializeMissionV2(mission);
        };
      };
    } else {
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == id and mission.startDate <= Time.now()) {
          return ?Serialization.serializeMissionV2(mission);
        };
      };
    };
    return null;
  };

  public shared query (msg) func getMissionPoints(id : Nat) : async Int {
    if (isAdmin(msg.caller)) {
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == id) {
          return mission.points;
        };
      };
    } else {
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == id and mission.startDate <= Time.now()) {
          return mission.points;
        };
      };
    };
    return 0;
  };

  public shared (msg) func resetMissions() : async () {
    if (isAdmin(msg.caller)) {
      Vector.clear(missionsV2); // Clear all missions
      missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash); // Clear all images in missionAssets
    };
    return;
  };

  public shared query (msg) func countUsersWhoCompletedMission(missionId : Nat) : async Nat {
    if (isAdmin(msg.caller)) {
      var count : Nat = 0;
      for ((_, userMissions) in globalUserProgress.entries()) {
        if (Option.isSome(userMissions.get(missionId))) {
          count += 1;
        };
      };
      return count;
    };
    return 0;
  };

  public shared query (msg) func getAllUsersProgress(offset : Nat, limit : Nat) : async {
    data : [(Text, [(Nat, Types.SerializedProgress)])];
    total : Nat;
  } {
    if (isAdmin(msg.caller)) {
      // Convert userProgress entries to an array
      let entries : [(Text, Types.UserMissions)] = Iter.toArray(globalUserProgress.entries());
      let total : Nat = Array.size(entries);

      // Handle cases where offset might be greater than total
      let adjustedOffset : Nat = if (offset >= total) { total } else { offset };
      let adjustedEnd : Nat = if (offset + limit > total) { total } else {
        offset + limit;
      };

      // Calculate the length for subArray
      let length : Nat = adjustedEnd - adjustedOffset;

      // Apply pagination using Array.subArray with (from, length)
      let paginatedEntries : [(Text, Types.UserMissions)] = Array.subArray(entries, adjustedOffset, length);

      // Serialize the paginated entries using Array.map
      let serializedEntries : [(Text, [(Nat, Types.SerializedProgress)])] = Array.map<(Text, Types.UserMissions), (Text, [(Nat, Types.SerializedProgress)])>(
        paginatedEntries,
        func(entry : (Text, Types.UserMissions)) : (Text, [(Nat, Types.SerializedProgress)]) {
          let (userId, userMissions) = entry;
          let missionEntries : [(Nat, Types.Progress)] = Iter.toArray(userMissions.entries());

          // Serialize mission entries using Array.map
          let serializedMissionEntries : [(Nat, Types.SerializedProgress)] = Array.map<(Nat, Types.Progress), (Nat, Types.SerializedProgress)>(
            missionEntries,
            func(missionEntry : (Nat, Types.Progress)) : (Nat, Types.SerializedProgress) {
              let (missionId, progress) = missionEntry;
              (missionId, Serialization.serializeProgress(progress));
            },
          );

          (userId, serializedMissionEntries);
        },
      );

      return { data = serializedEntries; total = total };
    };

    return { data = []; total = 0 };
  };

  public shared (msg) func missionOne(userId : Principal, canisterId : Text) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      try {
        let canister = actor (canisterId) : actor {
          helloWorld : query () -> async Text;
        };
        let result = await canister.helloWorld();
        if (result == "Hello World") {
          let firstMissionRecord : Types.MissionRecord = {
            var timestamp = Time.now();
            var pointsEarned = 100;
            var tweetId = null;
          };
          let firstMissionProgress : Types.Progress = {
            var completionHistory = [firstMissionRecord];
            var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
          };
          let tempP = Serialization.serializeProgress(firstMissionProgress);
          await updateUserProgress(userUUID, 0, tempP);
          return "Success";
        } else {
          return "Your canister doesn't have the method as described";
        };
      } catch (_e) {
        return "You're not a controller of the given canister";
      };
    };
    return "";
  };

  public shared (msg) func missionTwo(userId : Principal, canisterId : Text) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      try {
        let canister = actor (canisterId) : actor {
          interCanisterCall : query () -> async Text;
        };

        var randomText = "";
        var seed = Random.Finite(await Random.blob());

        for (i in Iter.range(0, 30)) {
          switch (seed.byte()) {
            case (?b) {
              randomText #= Char.toText(Char.fromNat32(Nat32.fromNat(Nat8.toNat(b) % 26 + 97)));
            };
            case null {
              seed := Random.Finite(await Random.blob());
            };
          };
        };

        mission2Text := randomText;

        let result = await canister.interCanisterCall();
        if (result == mission2Text) {
          let firstMissionRecord : Types.MissionRecord = {
            var timestamp = Time.now();
            var pointsEarned = 100;
            var tweetId = null;
          };
          let firstMissionProgress : Types.Progress = {
            var completionHistory = [firstMissionRecord];
            var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
          };
          let tempP = Serialization.serializeProgress(firstMissionProgress);
          await updateUserProgress(userUUID, 1, tempP);
          return "Success";
        } else {
          return "Your canister doesn't have the method as described";
        };
      } catch (_e) {
        return "You're not a controller of the given canister";
      };
    };
    return "";
  };

  public shared (msg) func missionOpenChat(userId : Principal) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
        getUserByPrincipal : query (Principal) -> async ?Types.SerializedGlobalUser;
      };

      let uuidPromise = index.getUUID(userId);
      let userPromise = index.getUserByPrincipal(userId);

      let userUUID = await uuidPromise;
      let user = await userPromise;

      switch (user) {
        case (?user) {
          let oc = user.ocProfile;
          switch (oc) {
            case (?oc) {
              if (oc != "") {
                let firstMissionRecord : Types.MissionRecord = {
                  var timestamp = Time.now();
                  var pointsEarned = 100;
                  var tweetId = null;
                };
                let firstMissionProgress : Types.Progress = {
                  var completionHistory = [firstMissionRecord];
                  var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
                };
                let tempP = Serialization.serializeProgress(firstMissionProgress);
                await updateUserProgress(userUUID, 4, tempP);
                return "Success";
              };
            };
            case null return "Hasn't joined";
          };
        };
        case null return "Hasn't joined";
      };
    };
    return "";
  };

  public query func http_request(req : Types.HttpRequest) : async Types.HttpResponse {
    let path = req.url;

    // Check if the path is directly in missionAssets (which includes the full path)
    switch (missionAssets.get(path)) {
      case (?fileBlob) {
        // Extract the file extension from the path
        let partsIter = Text.split(path, #char '.');
        let parts = Iter.toArray(partsIter);

        let extension = switch (Array.size(parts) > 1) {
          case true {
            Text.toLowercase(parts[Array.size(parts) - 1]) // Get the last part as the extension and convert to lowercase
          };
          case false {
            ""; // No extension found
          };
        };

        // Set the Content-Type based on the file extension
        let contentType = switch (extension) {
          case "png" {
            "image/png";
          };
          case "jpg" {
            "image/jpeg";
          };
          case "jpeg" {
            "image/jpeg";
          };
          case "webp" {
            "image/webp";
          };
          case _ {
            "application/octet-stream" // Default content type
          };
        };

        return {
          status_code = 200;
          headers = [("Content-Type", contentType)];
          body = fileBlob;
        };
      };
      case null {
        return {
          status_code = 404;
          headers = [("Content-Type", "text/plain")];
          body = Text.encodeUtf8("File not found");
        };
      };
    };
  };

  public query func availableCycles() : async Nat {
    return Cycles.balance();
  };

  public shared query func icrc28_trusted_origins() : async Types.Icrc28TrustedOriginsResponse {
    let trusted_origins : [Text] = [
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp0.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.raw.icp0.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.ic0.app",
      "https://dlas6-raaaa-aaaag-qm75a-cai.raw.ic0.app",
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp0.icp-api.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp-api.io",
      "https://pre.konecta.one",
      "https://adminpre.konecta.one",
      "https://stats.konecta.one",
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
    ];

    return {
      trusted_origins;
    };
  };

  public shared (msg) func resetall() : async () {
    if (isAdmin(msg.caller)) {
      return;
    };
  };
};
