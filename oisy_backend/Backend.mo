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
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Debug "mo:base/Debug";

actor class Backend() {

  private var globalUserProgress : TrieMap.TrieMap<Text, Types.UserMissions> = TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);

  // Stable storage for serialized data

  stable var serializedGlobalUserProgress : [(Text, [(Nat, Types.SerializedProgress)])] = [];

  public shared (msg) func mergeAccounts(canonicalUUID : Text, mergingUUID : Text) : async Text {

    if (msg.caller == Principal.fromText("tui2b-giaaa-aaaag-qnbpq-cai")) {

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

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
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

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
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

  public shared query (msg) func canUserDoMission(userUUID : Text, missionId : Nat) : async Bool {
    if (isAdmin(msg.caller)) {
      var missionOpt : ?Types.MissionV2 = null;
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == missionId) {
          missionOpt := ?mission;
        };
      };

      // Fetch the user's mission progress.
      switch (globalUserProgress.get(userUUID)) {
        case (?userMissions) {
          switch (userMissions.get(missionId)) {
            case (?progress) {
              // If we have mission details, check based on whether it is recursive.
              if (Option.isSome(missionOpt)) {
                let mission : Types.MissionV2 = switch (missionOpt) {
                  case (?m) m;
                  case null { Debug.trap("Mission not found") };
                };
                if (mission.recursive) {
                  // For recursive missions, disallow if any completion is after the mission start date.
                  for (record in Iter.fromArray(progress.completionHistory)) {
                    if (record.timestamp > mission.startDate) {
                      return false;
                    };
                  };
                } else {
                  // For non-recursive missions, disallow if any completion exists.
                  if (Array.size(progress.completionHistory) > 0) {
                    return false;
                  };
                };
              } else {
                // If mission details aren't found, default to non-recursive behavior.
                if (Array.size(progress.completionHistory) > 0) {
                  return false;
                };
              };
            };
            case null {
              // No progress recorded; the mission is allowed.
            };
          };
        };
        case null {
          // No missions recorded for the user.
        };
      };
    };
    return false;
  };

  public shared composite query (msg) func getTotalSecondsForUser(userId : Principal) : async ?Nat {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
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

  // stable var missions : Vector.Vector<Types.Mission> = Vector.new<Types.Mission>();

  stable var missionsV2 : Vector.Vector<Types.MissionV2> = Vector.new<Types.MissionV2>();

  public shared (msg) func addOrUpdateMission(newMission : Types.SerializedMissionV2) : async () {
    if (isAdmin(msg.caller)) {
      // Convert SerializedMission to a mutable Mission
      let newDeserializedMission = Serialization.deserializeMissionV2(newMission);

      // Check if the mission already exists in the vector
      var missionFound = false;

      let size = Vector.size(missionsV2);
      for (i in Iter.range(0, size - 1)) {
        let existingMissionOpt = Vector.get(missionsV2, i); // This returns ?Mission

        // Properly handle the optional ?Mission value
        switch (existingMissionOpt) {
          case (mission) {
            // Unwrap the Mission
            if (mission.id == newMission.id) {
              // Update the existing mission using Vector.put
              Vector.put(missionsV2, i, newDeserializedMission);
              missionFound := true;
            };
          };
        };
      };

      // If the mission was not found, add a new one
      if (not missionFound) {
        Vector.add<Types.MissionV2>(missionsV2, newDeserializedMission);
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

      // Iterate through all users in globalUserProgress
      for ((userId, userMissions) in globalUserProgress.entries()) {
        // Check if the user has progress for the specific mission
        switch (userMissions.get(missionId)) {
          case (?progress) {
            // If there is a completion history, check if the user has completed the mission at least once
            if (Array.size(progress.completionHistory) > 0) {
              count += 1;
            };
          };
          case null {
            return 0;
          };
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

  public shared (msg) func verifyOisyICP(userId : Principal) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      //Subaccount: subaccountArray[31] = 1
      var canisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai";

      let ledgercanister = actor (canisterId) : actor {
        icrc1_balance_of : query (Types.Account) -> async (Types.Icrc1Tokens);
      };

      var canisterIdIndex = "tui2b-giaaa-aaaag-qnbpq-cai";

      let indexcanister = actor (canisterIdIndex) : actor {
        getOisyWallet : query (Principal) -> async (?Principal);
      };

      let userOisy = await indexcanister.getOisyWallet(userId);

      switch userOisy {
        case (?wallet) {
          let balance = await ledgercanister.icrc1_balance_of({
            owner = wallet;
            subaccount = null;
          });

          if (balance > 0) {
            let missionRecord : Types.MissionRecord = {
              var timestamp = Time.now();
              var pointsEarned = 200;
              var tweetId = null;
            };
            let missionProgress : Types.Progress = {
              var completionHistory = [missionRecord];
              var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
            };
            let tempP = Serialization.serializeProgress(missionProgress);
            await updateUserProgress(userUUID, 0, tempP);
            return "Success";
          } else {
            return "Oisy Wallet has no ICP";
          };
        };
        case null {
          return "No linked Oisy Wallet";
        };
      };
    } else {
      return "Unauthorized";
    };
  };

  public shared (msg) func verifyOisyOG(userId : Principal) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      //Subaccount: subaccountArray[31] = 1

      var canisterIdLedgerIndex = "qhbym-qaaaa-aaaaa-aaafq-cai";

      let ledgerIndexcanister = actor (canisterIdLedgerIndex) : actor {
        get_account_transactions : query (Types.GetAccountTransactionsArgs) -> async (Types.GetAccountIdentifierTransactionsResult);
        icrc1_balance_of : query (Types.Account) -> async (Nat64);
      };

      let missionSubaccountArray = Array.init<Nat8>(32, 0);

      missionSubaccountArray[31] := Nat8.fromNat(1);

      let subaccount : ?Blob = ?Blob.fromArray(Array.freeze(missionSubaccountArray));

      let owner = Principal.fromText("eyark-fqaaa-aaaag-qm7oa-cai");

      let hasCanisterEnoughICP = await ledgerIndexcanister.icrc1_balance_of({
        owner = owner;
        subaccount = subaccount;
      });

      if (hasCanisterEnoughICP >= 10_000 + 10_000) {

        var canisterIdIndex = "tui2b-giaaa-aaaag-qnbpq-cai";

        let indexcanister = actor (canisterIdIndex) : actor {
          getOisyWallet : query (Principal) -> async (?Principal);
        };

        let userOisy = await indexcanister.getOisyWallet(userId);

        switch userOisy {
          case (?wallet) {

            let account : Types.Account = {
              owner = wallet;
              subaccount = null;
            };

            let transactionsResult = await ledgerIndexcanister.get_account_transactions({
              account = account;
              max_results = 100;
              start = null;
            });

            switch transactionsResult {
              case (#Ok(transactions)) {
                // Define the cutoff timestamp
                let cutoffTimestamp : Nat = 1740715200000000000;

                // Use Array.find to locate a transaction with timestamp_nanos < cutoffTimestamp
                let oldTransaction = Array.find<Types.TransactionWithId>(
                  transactions.transactions,
                  func(txWithId : Types.TransactionWithId) : Bool {
                    switch (txWithId.transaction.timestamp) {
                      case (?ts) {
                        ts.timestamp_nanos < Nat64.fromNat(cutoffTimestamp);
                      };
                      case null { false };
                    };
                  },
                );

                if (oldTransaction != null) {

                  let toAccount : Types.Account = {
                    owner = wallet;
                    subaccount = null;
                  };

                  let icrc1TransferArg : Types.TransferArg = {
                    from_subaccount = subaccount;
                    to = toAccount;
                    amount = 10_000;
                    fee = null;
                    memo = null;
                    created_at_time = null;
                  };

                  let ledgercanister = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai") : actor {
                    icrc1_transfer : (Types.TransferArg) -> async (Types.Icrc1TransferResult);
                    icrc1_balance_of : query (Types.Account) -> async (Types.Icrc1Tokens);
                    icrc1_fee : query () -> async (Nat);
                  };

                  let result : Types.Icrc1TransferResult = await ledgercanister.icrc1_transfer(icrc1TransferArg);

                  switch (result) {
                    case (#Ok(_blockIndex)) {
                      let missionRecord : Types.MissionRecord = {
                        var timestamp = Time.now();
                        var pointsEarned = 10000;
                        var tweetId = null;
                      };
                      let missionProgress : Types.Progress = {
                        var completionHistory = [missionRecord];
                        var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
                      };
                      let tempP = Serialization.serializeProgress(missionProgress);
                      await updateUserProgress(userUUID, 1, tempP);
                      return "Success";
                    };
                    case (#Err(err)) {
                      return "Error from transfer: Details: "
                      # debug_show (err);
                    };
                  };

                } else {
                  // No transaction satisfies the condition
                  return "Not an Oisy OG! Sorry, you can't claim the mission";
                };
              };
              case (#Err(err)) {
                return "Failed to retrieve transactions: "
                # debug_show (err);
              };
            };
          };
          case null {
            return "No linked Oisy Wallet";
          };
        };
      } else {
        return "Canister out of rewards! Try Again later";
      };
      return "e";
    } else {
      return "Unauthorized";
    };
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

  private func serializeTextArrayToJson(arr : [Text]) : Text {

    var jsonText = "[";
    var isFirst = true;
    for (text in arr.vals()) {
      if (not isFirst) {
        jsonText #= ",";
      };
      jsonText #= "\"" # text # "\"";
      isFirst := false;
    };
    jsonText #= "]";
    return jsonText;
  };

  public shared (msg) func setPTW(payloadArray : [Text]) : async Text {
    if (isAdmin(msg.caller)) {
      // 1. DECLARE IC MANAGEMENT CANISTER
      let ic : Types.IC = actor ("aaaaa-aa");

      // 2. Add cycles for the HTTP request
      Cycles.add<system>(22_935_266_640);

      // 3. Serialize the array into a JSON array
      let payloadJson = serializeTextArrayToJson(payloadArray);

      // 4. Prepare the headers for the request
      let host : Text = "do.konecta.one";
      let url = "https://" # host # "/oisyPTW";

      // 5. Prepare the body for the POST request (the JSON-serialized array)
      let body : Blob = Text.encodeUtf8(payloadJson);
      let bodyAsNat8 : [Nat8] = Blob.toArray(body);

      // 6. Define the HTTP request
      let http_request : Types.HttpRequestArgs = {
        url = url;
        max_response_bytes = null;
        headers = [
          { name = "Content-Type"; value = "application/json" },

        ];
        body = ?bodyAsNat8; // Ensure body is an optional Blob
        method = #post; // Use variant for POST method
        transform = null;
      };

      // 7. Make the HTTP outcall
      let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

      // 8. Handle the response
      if (http_response.status == 200) {
        if (http_response.body.size() > 0) {
          switch (Text.decodeUtf8(Blob.fromArray(http_response.body))) {
            case (?decodedBody) {
              return "POST request successful: " # decodedBody;
            };
            case (null) {
              return "POST request successful but failed to decode body";
            };
          };
        } else {
          return "POST request successful but no body in response";
        };
      } else {
        if (http_response.body.size() > 0) {
          switch (Text.decodeUtf8(Blob.fromArray(http_response.body))) {
            case (?decodedBody) {
              return "POST request failed: " # decodedBody;
            };
            case (null) {
              return "POST request failed and failed to decode body";
            };
          };
        } else {
          return "POST request failed and no body in response";
        };
      };
    };
    return "";
  };

  public shared (msg) func postRT(payload : Text) : async Text {
    if (isAdmin(msg.caller)) {
      // 1. DECLARE IC MANAGEMENT CANISTER
      let ic : Types.IC = actor ("aaaaa-aa");

      // 2. Add cycles for the HTTP request
      Cycles.add<system>(22_935_266_640);

      // 3. Serialize the array into a JSON array
      let payloadJson = "{\"id\": \"" # payload # "\"}"; // Create JSON with "id"

      // 4. Prepare the headers for the request
      let host : Text = "do.konecta.one";
      let url = "https://" # host # "/storeRetweetId";

      // 5. Prepare the body for the POST request (the JSON-serialized array)
      let body : Blob = Text.encodeUtf8(payloadJson);
      let bodyAsNat8 : [Nat8] = Blob.toArray(body);

      // 6. Define the HTTP request
      let http_request : Types.HttpRequestArgs = {
        url = url;
        max_response_bytes = null;
        headers = [
          { name = "Content-Type"; value = "application/json" },

        ];
        body = ?bodyAsNat8; // Ensure body is an optional Blob
        method = #post; // Use variant for POST method
        transform = null;
      };

      Cycles.add<system>(22_935_266_640);

      // 7. Make the HTTP outcall
      let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

      // 8. Handle the response
      if (http_response.status == 200) {
        if (http_response.body.size() > 0) {
          switch (Text.decodeUtf8(Blob.fromArray(http_response.body))) {
            case (?decodedBody) {
              return "POST request successful: " # decodedBody;
            };
            case (null) {
              return "POST request successful but failed to decode body";
            };
          };
        } else {
          return "POST request successful but no body in response";
        };
      } else {
        if (http_response.body.size() > 0) {
          switch (Text.decodeUtf8(Blob.fromArray(http_response.body))) {
            case (?decodedBody) {
              return "POST request failed: " # decodedBody;
            };
            case (null) {
              return "POST request failed and failed to decode body";
            };
          };
        } else {
          return "POST request failed and no body in response";
        };
      };
    };
    return "";
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
      globalUserProgress := TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);
      return;
    };
  };
};
