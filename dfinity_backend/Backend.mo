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

actor class Backend() {

  private var streak : TrieMap.TrieMap<Principal, Nat> = TrieMap.TrieMap<Principal, Nat>(Principal.equal, Principal.hash);

  stable var serializedstreak : [(Principal, Nat)] = [];

  private var userStreak : TrieMap.TrieMap<Principal, Types.UserStreak> = TrieMap.TrieMap<Principal, Types.UserStreak>(Principal.equal, Principal.hash);

  stable var serializedUserStreak : [(Principal, Types.SerializedUserStreak)] = [];

  private var userProgress : TrieMap.TrieMap<Principal, Types.UserMissions> = TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);

  // Stable storage for serialized data

  stable var serializedUserProgress : [(Principal, [(Nat, Types.SerializedProgress)])] = [];

  private var verified : TrieMap.TrieMap<Principal, Bool> = TrieMap.TrieMap<Principal, Bool>(Principal.equal, Principal.hash);

  stable var serializedVerified : [(Principal, Bool)] = [];

  private var nfidVaults : TrieMap.TrieMap<Principal, Principal> = TrieMap.TrieMap<Principal, Principal>(Principal.equal, Principal.hash);

  stable var serializednfidVaults : [(Principal, Principal)] = [];

  stable var twitterVerifiedNFID : [Principal] = [];

  stable var discordVerifiedNFID : [Principal] = [];

  stable var mission2Text : Text = "";

  public shared (msg) func getMission2Text() : async Text {
    if (not Principal.isAnonymous(msg.caller)) {
      return mission2Text;
    };
    return "";
  };

  public shared (msg) func addNfidVault(userId : Principal, vault : Principal) : async () {
    if (isAdmin(msg.caller)) {
      nfidVaults.put(userId, vault);
    };
  };

  public shared query (msg) func getNfidVault(userId : Principal) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      let theVault = nfidVaults.get(userId);
      switch (theVault) {
        case (?theVault) {
          return Principal.toText(theVault);
        };
        case null {
          return "";
        };
      };
    };
    return "";
  };

  public shared (msg) func addTwitterVerifiedNFID(newTWVerifiedUser : Principal) : async () {
    if (isAdmin(msg.caller)) {
      twitterVerifiedNFID := Array.append<Principal>(twitterVerifiedNFID, [newTWVerifiedUser]);
    };
  };

  public shared (msg) func isTwitterVerifiedNFID(principalId : Principal) : async Bool {
    if (isAdmin(msg.caller) or principalId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      return Array.find<Principal>(
        twitterVerifiedNFID,
        func(id) : Bool {
          id == principalId;
        },
      ) != null;
    };
    return false;
  };

  public shared func isDCVerifiedNFID(principalId : Principal) : async Bool {
    return Array.find<Principal>(
      discordVerifiedNFID,
      func(id) : Bool {
        id == principalId;
      },
    ) != null;
  };

  public shared (msg) func addDiscordVerifiedNFID(newDCVerifiedUser : Principal) : async () {
    if (isAdmin(msg.caller)) {
      discordVerifiedNFID := Array.append<Principal>(discordVerifiedNFID, [newDCVerifiedUser]);
    };
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

  public shared func trisAdmin(principalId : Principal) : async Bool {
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

  public query (msg) func hasVerified(userId : Principal) : async Bool {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      switch (verified.get(userId)) {
        case (?value) {
          if (value == true) {
            return true;
          } else {
            return false;
          };
        };
        case null return false;
      };
      return false;
    };
    return false;
  };

  public shared (msg) func verifyUser(userId : Principal) : async () {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      verified.put(userId, true);
    };
  };

  public shared (msg) func unVerifyUser(userId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      for (key in verified.keys()) {
        if (key == userId) {
          verified.put(key, false);
        };
      };
    };
  };

  public shared (msg) func restoreAllUserProgress(
    serializedData : [(Principal, [(Nat, Types.SerializedProgress)])]
  ) : async () {
    if (isAdmin(msg.caller)) {
      // Iterate over each user data tuple
      for (tuple in Iter.fromArray(serializedData)) {
        let userId = tuple.0;
        let serializedUserMissions = tuple.1;

        // Retrieve or initialize the user's mission data
        var userMissions = switch (userProgress.get(userId)) {
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
        userProgress.put(userId, userMissions);
      };
    };
  };

  // Pre-upgrade function to serialize the user progress

  var missionAssets : TrieMap.TrieMap<Text, Blob> = TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash);
  stable var serializedMissionAssets : [(Text, Blob)] = [];

  system func preupgrade() {
    // Serialize user progress
    let entries = userProgress.entries();

    var serializedUserProgressVec = Vector.new<(Principal, [(Nat, Types.SerializedProgress)])>();

    for (entry in entries) {
      let (userId, userMissions) = entry;
      let missionEntries = userMissions.entries();

      var serializedMissionEntries = Vector.new<(Nat, Types.SerializedProgress)>();

      for (missionEntry in missionEntries) {
        let (missionId, progress) = missionEntry;

        let serializedProgress = {
          completionHistory = Array.map<Types.MissionRecord, Types.SerializedMissionRecord>(
            progress.completionHistory,
            func(record : Types.MissionRecord) : Types.SerializedMissionRecord {
              {
                timestamp = record.timestamp;
                pointsEarned = record.pointsEarned;
                tweetId = record.tweetId;
              };
            },
          );
          usedCodes = Iter.toArray(progress.usedCodes.entries());
        };

        Vector.add<(Nat, Types.SerializedProgress)>(serializedMissionEntries, (missionId, serializedProgress));
      };
      Vector.add<(Principal, [(Nat, Types.SerializedProgress)])>(serializedUserProgressVec, (userId, Vector.toArray(serializedMissionEntries)));

    };
    serializedUserProgress := Vector.toArray(serializedUserProgressVec);

    let missionAssetsEntries = Iter.toArray(missionAssets.entries());
    serializedMissionAssets := missionAssetsEntries;

    let verifiedEntries = verified.entries();
    serializedVerified := Iter.toArray(verifiedEntries);

    let nfidVaultEntries = nfidVaults.entries();
    serializednfidVaults := Iter.toArray(nfidVaultEntries);

    let streakEntries = streak.entries();
    serializedstreak := Iter.toArray(streakEntries);

    let serializedUserStreakVec = Vector.new<(Principal, Types.SerializedUserStreak)>();

    let entriesUS = userStreak.entries();
    for (entryUS in entriesUS) {
      let (principal, streakMap) = entryUS;

      // Retrieve all entries from the inner UserStreak TrieMap<Int, Nat>
      let streakEntries = streakMap.entries();

      // Create a Vector to accumulate serialized (Int, Nat) tuples
      let serializedStreakEntries = Vector.new<(Int, Nat)>();

      // Iterate over each (Int, Nat) pair in the UserStreak
      for (streakEntry in streakEntries) {
        let (streakId, streakValue) = streakEntry;

        // Add the (Int, Nat) tuple to the serializedStreakEntries Vector
        Vector.add<(Int, Nat)>(serializedStreakEntries, (streakId, streakValue));
      };

      // Convert the Vector to an Array and add the (Principal, SerializedUserStreak) tuple to serializedUserStreakVec
      Vector.add<(Principal, Types.SerializedUserStreak)>(serializedUserStreakVec, (principal, Vector.toArray(serializedStreakEntries)));
    };

    serializedUserStreak := Vector.toArray(serializedUserStreakVec);

  };

  // Post-upgrade function to deserialize the user progress

  system func postupgrade() {

    // Iterate over the serialized user progress data
    for (tuple in Iter.fromArray(serializedUserProgress)) {

      let userId = tuple.0;
      let serializedUserMissions = tuple.1;

      let userMissions = TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);

      // Iterate over each serialized mission progress for the current user
      for (missionTuple in Iter.fromArray(serializedUserMissions)) {
        let missionId = missionTuple.0; // Destructure the first element (Nat)
        let serializedProgress = missionTuple.1; // Destructure the second element (SerializedProgress)

        // Deserialize completionHistory
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

        // Create an empty TrieMap for usedCodes
        let usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);

        // Deserialize the usedCodes
        for (codeTuple in Iter.fromArray(serializedProgress.usedCodes)) {
          let code = codeTuple.0; // First element (Text)
          let value = codeTuple.1; // Second element (Bool)
          usedCodes.put(code, value);
        };

        // Now construct the full Progress object after deserializing both completionHistory and usedCodes
        let progress : Types.Progress = {
          var completionHistory = completionHistory;
          var usedCodes = usedCodes;
        };

        // Put the deserialized progress into the userMissions TrieMap
        userMissions.put(missionId, progress);
      };

      // Put the deserialized userMissions into the main userProgress TrieMap
      userProgress.put(userId, userMissions);
    };

    // Deserialize the mission assets
    missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash);

    for (assetEntry in serializedMissionAssets.vals()) {
      let (missionId, asset) = assetEntry;
      missionAssets.put(missionId, asset);
    };
    serializedUserProgress := [];
    serializedMissionAssets := [];

    // Verified

    verified := TrieMap.TrieMap<Principal, Bool>(Principal.equal, Principal.hash);

    for ((principal, boolValue) in Iter.fromArray(serializedVerified)) {
      verified.put(principal, boolValue);
    };

    serializedVerified := [];

    // NFID Vaults

    nfidVaults := TrieMap.TrieMap<Principal, Principal>(Principal.equal, Principal.hash);

    for ((principal, principalnfid) in Iter.fromArray(serializednfidVaults)) {
      nfidVaults.put(principal, principalnfid);
    };

    serializednfidVaults := [];

    streak := TrieMap.TrieMap<Principal, Nat>(Principal.equal, Principal.hash);

    for ((principal, natValue) in Iter.fromArray(serializedstreak)) {
      streak.put(principal, natValue);
    };

    serializedstreak := [];

    userStreak := TrieMap.TrieMap<Principal, Types.UserStreak>(Principal.equal, Principal.hash);

    for (tuple in Iter.fromArray(serializedUserStreak)) {
      let principal = tuple.0;
      let serializedStreak = tuple.1;

      // Initialize a new TrieMap for the UserStreak of the current Principal
      let streakMap = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);

      // Iterate over each (Int, Nat) tuple in SerializedUserStreak
      for (streakTuple in Iter.fromArray(serializedStreak)) {
        let streakId = streakTuple.0;
        let streakValue = streakTuple.1;

        // Deserialize and insert into streakMap
        streakMap.put(streakId, streakValue);
      };

      // Insert the deserialized streakMap into userStreak TrieMap
      userStreak.put(principal, streakMap);
    };

    serializedUserStreak := [];

  };

  stable var streakTime = 15; // Streak reset timer in MINUTES
  stable var streakTimeNanos = streakTime * 60 * 1_000_000_000;

  public shared query (msg) func getStreakTime() : async Nat {
    if (isAdmin(msg.caller) or (not Principal.isAnonymous(msg.caller))) {
      return streakTimeNanos;
    };
    return 0;
  };

  public shared (msg) func setStreakTime(newNum : Nat) : async () {
    if (isAdmin(msg.caller)) {
      streakTime := newNum;
      streakTimeNanos := newNum * 60 * 1_000_000_000;
    };
  };

  public shared query (msg) func getUserStreakAmount(userId : Principal) : async Nat {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      switch (streak.get(userId)) {
        case (?value) return value;
        case null return 0;
      };
    };
    return 0;
  };

  public shared query (msg) func getUserAllStreak(userId : Principal) : async Types.SerializedUserStreak {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      let entriesUS = userStreak.entries();
      for (entryUS in entriesUS) {
        let principal = entryUS.0;
        let totalStreak = entryUS.1;
        if (principal == userId) {
          let serializedStreakEntries = Vector.new<(Int, Nat)>();
          let streakEntries = totalStreak.entries();
          for (streakEntry in streakEntries) {
            let (streakId, streakValue) = streakEntry;

            // Add the (Int, Nat) tuple to the serializedStreakEntries Vector
            Vector.add<(Int, Nat)>(serializedStreakEntries, (streakId, streakValue));
          };
          return Vector.toArray(serializedStreakEntries);
        };
      };
    };
    let default = Vector.new<(Int, Nat)>();
    return Vector.toArray(default);
  };

  public shared query (msg) func getUserStreakTime(userId : Principal) : async Int {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      var hasStarted = false;

      var lastTimestamp : Int = 0;
      let mainEntries = streak.entries();

      for (mainEntry in mainEntries) {
        // Iter if user did start Streak
        let mainUserId = mainEntry.0;
        if (userId == mainUserId) {
          // The user did start
          hasStarted := true;
          let entries = userStreak.entries();
          for (entry in entries) {
            let theUserId = entry.0;
            let theUserStreak = entry.1;
            if (theUserId == userId) {
              let subEntries = theUserStreak.entries();
              for (subEntry in subEntries) {
                let timestampU = subEntry.0;
                if (timestampU > lastTimestamp) {
                  lastTimestamp := timestampU;
                };
              };
            };

          };
        };
      };

      if (not hasStarted) {
        // The user is starting first time
        return 0;
      } else {
        return lastTimestamp;
      };
    };
    return 0;
  };

  public shared (msg) func claimStreak(userId : Principal) : async (Text, Nat) {

    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      let currentTime = Time.now();
      var hasStarted = false;

      var lastTimestamp : Int = 0;

      let mainEntries = streak.entries();

      for (mainEntry in mainEntries) {
        // Iter if user did start Streak
        let mainUserId = mainEntry.0;
        let mainStreak = mainEntry.1;
        if (userId == mainUserId) {
          // The user did start
          hasStarted := true;
          let entries = userStreak.entries();

          for (entry in entries) {
            let theUserId = entry.0;
            let theUserStreak = entry.1;

            if (theUserId == userId) {
              let subEntries = theUserStreak.entries();

              for (subEntry in subEntries) {
                let timestampU = subEntry.0;

                if (timestampU > lastTimestamp) {
                  lastTimestamp := timestampU;
                };
              };

              if ((lastTimestamp + streakTimeNanos) > currentTime) {
                return ("You can't claim your streak yet.", 0);
              } else if ((lastTimestamp + streakTimeNanos) <= currentTime and currentTime < (lastTimestamp + (streakTimeNanos * 2))) {
                // User can claim their streak normally
                streak.put(userId, mainStreak + 1);
                let newStreak : TrieMap.TrieMap<Int, Nat> = theUserStreak;
                let earnedText = Nat.toText((300 + (300 * (mainStreak + 1))) / 60);
                newStreak.put(currentTime, 300 + (300 * (mainStreak + 1))); // 5 minutes + Extra minutes per streak
                userStreak.put(userId, newStreak);
                return ("You have earned " # earnedText # " minutes!", (300 + (300 * (mainStreak + 1))));
              } else if (currentTime >= (lastTimestamp + (streakTimeNanos * 2))) {
                // Reset streak after third window
                streak.put(userId, 1);
                let newStreakMap : TrieMap.TrieMap<Int, Nat> = theUserStreak;
                newStreakMap.put(currentTime, 300);
                userStreak.put(userId, newStreakMap);
                return ("You have lost your past streak. Starting again with 5 minutes...", 300);
              } else {
                return ("You can't claim your streak yet.", 0);
              };
            };
          };
        };
      };

      if (not hasStarted) {
        // The user is starting first time

        streak.put(userId, 1); // 1 Time Streak
        let firstStreak : TrieMap.TrieMap<Int, Nat> = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);
        firstStreak.put(currentTime, 300); // 5 minutes first streak
        userStreak.put(userId, firstStreak);

        return ("You have earned 5 minutes!", 300);
      };

      return ("", 0);
    };
    return ("", 0);
  };

  public shared (msg) func updateUserProgress(userId : Principal, missionId : Nat, serializedProgress : Types.SerializedProgress) : async () {

    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller) and missionId == 1)) {
      // Deserialize the progress object
      let progress = Serialization.deserializeProgress(serializedProgress);

      // Retrieve the user's missions or create a new TrieMap if it doesn't exist
      let missions = switch (userProgress.get(userId)) {
        case (?map) map;
        case null TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
      };

      // Update the mission progress
      missions.put(missionId, progress);

      // Update the user's progress in the main TrieMap
      userProgress.put(userId, missions);

      let mPoints = await getMissionPoints(missionId);
      let natPoints = Nat.fromText(Int.toText(mPoints));
      switch (natPoints) {
        case (?natPoints) {
          var i = 0;
          while (i < Vector.size(users)) {
            switch (Vector.getOpt(users, i)) {
              case (?user) {
                if (user.id == userId) {
                  let updatedUser : Types.User = {
                    id = user.id;
                    var twitterid = user.twitterid;
                    var twitterhandle = user.twitterhandle;
                    creationTime = user.creationTime;
                    var pfpProgress = user.pfpProgress;
                    var totalPoints = user.totalPoints + natPoints;
                    var ocProfile = user.ocProfile;
                    var ocCompleted = user.ocCompleted;
                    var discordUser = user.discordUser;
                    var telegramUser = user.telegramUser;
                    var nnsPrincipal = user.nnsPrincipal;
                  };
                  Vector.put(users, i, updatedUser);
                  return;
                };
              };
              case _ {};
            };
            i += 1;
          };
        };
        case (null) {

        };
      };
    };
  };

  public shared (msg) func resetUserMissionByIdForUser(userId : Principal, missionId : Nat) : async () {
    if (isAdmin(msg.caller)) {
      let _missions = switch (userProgress.get(userId)) {
        case (?map) {
          map.remove(missionId);
        };
        case null null;
      };
    };
  };

  public shared query (msg) func getProgress(userId : Principal, missionId : Nat) : async ?Types.SerializedProgress {

    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      switch (userProgress.get(userId)) {
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

  public shared query (msg) func getUserProgress(userId : Principal) : async ?[(Nat, Types.SerializedProgress)] {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let userMissionsOpt = userProgress.get(userId);

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

  public shared query (msg) func canUserDoMission(userId : Principal, missionId : Nat) : async Bool {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      switch (userProgress.get(userId)) {
        case (?userMissions) {
          switch (userMissions.get(missionId)) {
            case (?progress) {
              for (record in Iter.fromArray(progress.completionHistory)) {
                return false;
              };
            };
            case null {

            };
          };
        };
        case null {};
      };

      return true;
    };
    return false;
  };

  public shared query (msg) func canUserDoMissionRecursive(userId : Principal, missionId : Nat) : async Bool {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      for (mission in Vector.vals(missions)) {
        if (mission.id == missionId) {
          var thismission = mission;

          switch (userProgress.get(userId)) {
            case (?userMissions) {
              switch (userMissions.get(missionId)) {
                case (?progress) {
                  for (record in Iter.fromArray(progress.completionHistory)) {
                    if (record.timestamp > thismission.startDate) {
                      return false;
                    };
                  };
                };
                case null {

                };
              };
            };
            case null {};
          };

        };
      };

      return true;
    };
    return false;
  };

  public shared query (msg) func getTotalSecondsForUser(userId : Principal) : async ?Nat {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let userMissionsOpt = userProgress.get(userId);

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

          let entriesUS = userStreak.entries();
          for (entryUS in entriesUS) {
            let principal = entryUS.0;
            let totalStreak = entryUS.1;
            if (principal == userId) {
              let streakEntries = totalStreak.entries();
              for (streakEntry in streakEntries) {
                let streakValue = streakEntry.1;
                totalPoints += streakValue;
              };
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

  stable var missions : Vector.Vector<Types.Mission> = Vector.new<Types.Mission>();

  public shared (msg) func addOrUpdateMission(newMission : Types.SerializedMission) : async () {
    if (isAdmin(msg.caller)) {
      // Convert SerializedMission to a mutable Mission
      let newDeserializedMission = Serialization.deserializeMission(newMission);

      // Check if the mission already exists in the vector
      var missionFound = false;

      let size = Vector.size(missions);
      for (i in Iter.range(0, size - 1)) {
        let existingMissionOpt = Vector.get(missions, i); // This returns ?Mission

        // Properly handle the optional ?Mission value
        switch (existingMissionOpt) {
          case (mission) {
            // Unwrap the Mission
            if (mission.id == newMission.id) {
              // Update the existing mission using Vector.put
              Vector.put(missions, i, newDeserializedMission);
              missionFound := true;
            };
          };
        };
      };

      // If the mission was not found, add a new one
      if (not missionFound) {
        Vector.add<Types.Mission>(missions, newDeserializedMission);
      };
    };

    return;
  };

  public shared query (msg) func getAllMissions() : async [Types.SerializedMission] {
    if (not Principal.isAnonymous(msg.caller)) {
      if (isAdmin(msg.caller)) {
        return Array.map<Types.Mission, Types.SerializedMission>(Vector.toArray(missions), Serialization.serializeMission);
      } else {
        let filteredMissions = Array.filter<Types.Mission>(
          Vector.toArray(missions),
          func(mission : Types.Mission) : Bool {
            mission.startDate <= Time.now();
          },
        );

        return Array.map<Types.Mission, Types.SerializedMission>(
          filteredMissions,
          func(mission : Types.Mission) : Types.SerializedMission {
            let serialized = Serialization.serializeMission(mission);
            let updatedSerialized = { serialized with secretCodes = null };
            return updatedSerialized;
          },
        );
      };
    };
    return [];
  };

  public shared query (msg) func getMissionById(id : Nat) : async ?Types.SerializedMission {
    if (isAdmin(msg.caller)) {
      for (mission in Vector.vals(missions)) {
        if (mission.id == id) {
          return ?Serialization.serializeMission(mission);
        };
      };
    } else {
      for (mission in Vector.vals(missions)) {
        if (mission.id == id and mission.startDate <= Time.now()) {
          return ?Serialization.serializeMission(mission);
        };
      };
    };
    return null;
  };

  public shared query (msg) func getMissionPoints(id : Nat) : async Int {
    if (isAdmin(msg.caller)) {
      for (mission in Vector.vals(missions)) {
        if (mission.id == id) {
          return mission.points;
        };
      };
    } else {
      for (mission in Vector.vals(missions)) {
        if (mission.id == id and mission.startDate <= Time.now()) {
          return mission.points;
        };
      };
    };
    return 0;
  };

  public shared (msg) func resetMissions() : async () {
    if (isAdmin(msg.caller)) {
      Vector.clear(missions); // Clear all missions
      missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash); // Clear all images in missionAssets
    };
    return;
  };

  public shared query (msg) func countUsersWhoCompletedMission(missionId : Nat) : async Nat {
    if (isAdmin(msg.caller)) {
      var count : Nat = 0;

      // Iterate through all users in userProgress
      for ((userId, userMissions) in userProgress.entries()) {
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

  stable var users : Vector.Vector<Types.User> = Vector.new<Types.User>();

  stable var placeholderUsers : Vector.Vector<Types.User> = Vector.new<Types.User>();

  public shared (msg) func addPlaceholderUsers(pusers : [Types.SerializedUser]) : async () {
    if (isAdmin(msg.caller)) {

      for (placeholderUser in Iter.fromArray(pusers)) {
        Vector.add<Types.User>(placeholderUsers, Serialization.deserializeUser(placeholderUser));
      };
    };
  };

  public shared (msg) func resetPlaceholderUsers() : async () {
    if (isAdmin(msg.caller)) {
      placeholderUsers := Vector.new<Types.User>();
    };
  };

  public shared (msg) func addUser(userId : Principal) : async (?Types.SerializedUser) {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      // Create a completion record for the first mission

      // Create progress for the first mission

      // Add the user to the users vector
      let newUser : Types.User = {
        id = userId;
        var twitterid = null;
        var twitterhandle = null;
        creationTime = Time.now();
        var pfpProgress = "false";
        var totalPoints = 0;
        var ocProfile = null;
        var ocCompleted = false;
        var discordUser = null;
        var telegramUser = null;
        var nnsPrincipal = null;
      };
      Vector.add<Types.User>(users, newUser);
      return ?Serialization.serializeUser(newUser);
    };
    return null;
  };

  public shared (msg) func nfidMainMission(userId : Principal, tg : Text, oc : Text, nns : Principal) : async Text {
    if (isAdmin(msg.caller)) {
      let vtw = await isTwitterVerifiedNFID(userId);
      if (vtw) {
        let vdc = await isDCVerifiedNFID(userId);
        if (vdc) {
          let serializedUser = await getUser(userId);
          switch (serializedUser) {
            case (?serializedUser) {
              let user = Serialization.deserializeUser(serializedUser);
              let placeHuser = await getPlaceholderUser(userId);
              switch (placeHuser) {
                case (?placeHuser) {
                  let newUser : Types.User = {
                    id = userId;
                    var twitterid = user.twitterid;
                    var twitterhandle = user.twitterhandle;
                    creationTime = Time.now();
                    var pfpProgress = "false";
                    var totalPoints = 65;
                    var ocProfile = ?oc;
                    var ocCompleted = false;
                    var discordUser = user.discordUser;
                    var telegramUser = ?tg;
                    var nnsPrincipal = ?nns;
                  };
                  var i = 0;
                  while (i < Vector.size(users)) {
                    switch (Vector.getOpt(users, i)) {
                      case (?user) {
                        if (user.id == userId) {
                          Vector.put(users, i, newUser);
                        };
                      };
                      case _ {};
                    };
                    i += 1;
                  };

                  let firstMissionRecord : Types.MissionRecord = {
                    var timestamp = Time.now();
                    var pointsEarned = 65;
                    var tweetId = null;
                  };

                  let firstMissionProgress : Types.Progress = {
                    var completionHistory = [firstMissionRecord];
                    var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
                  };

                  let tempP = Serialization.serializeProgress(firstMissionProgress);

                  await updateUserProgress(userId, 0, tempP);
                  await verifyUser(userId);
                  return "Success";
                };
                case (null) {
                  let newUser : Types.User = {
                    id = userId;
                    var twitterid = user.twitterid;
                    var twitterhandle = user.twitterhandle;
                    creationTime = Time.now();
                    var pfpProgress = "false";
                    var totalPoints = 65;
                    var ocProfile = ?oc;
                    var ocCompleted = false;
                    var discordUser = user.discordUser;
                    var telegramUser = ?tg;
                    var nnsPrincipal = ?nns;
                  };
                  var i = 0;
                  while (i < Vector.size(users)) {
                    switch (Vector.getOpt(users, i)) {
                      case (?user) {
                        if (user.id == userId) {
                          Vector.put(users, i, newUser);
                        };
                      };
                      case _ {};
                    };
                    i += 1;
                  };

                  let firstMissionRecord : Types.MissionRecord = {
                    var timestamp = Time.now();
                    var pointsEarned = 65;
                    var tweetId = null;
                  };

                  let firstMissionProgress : Types.Progress = {
                    var completionHistory = [firstMissionRecord];
                    var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
                  };

                  let tempP = Serialization.serializeProgress(firstMissionProgress);

                  await updateUserProgress(userId, 0, tempP);
                  await verifyUser(userId);
                  return "Success";
                };
              };
            };
            case (null) {
              return "no user";
            };
          };

        } else {
          return "Discord Not Verified";
        };
      } else {
        return "Twitter Not Verified";
      };
    };
    return "";
  };

  public shared query (msg) func getUsers() : async [Types.SerializedUser] {
    if (isAdmin(msg.caller)) {
      return Array.map<Types.User, Types.SerializedUser>(Vector.toArray(users), Serialization.serializeUser);
    };
    return [];
  };

  public shared query (msg) func getPlaceholderUsers() : async [Types.SerializedUser] {
    if (isAdmin(msg.caller)) {
      return Array.map<Types.User, Types.SerializedUser>(Vector.toArray(placeholderUsers), Serialization.serializeUser);
    };
    return [];
  };

  public shared (msg) func restoreUsers(serializedUsers : [Types.SerializedUser]) : async () {
    if (isAdmin(msg.caller)) {
      users := Vector.new<Types.User>();

      // Loop over serializedUsers and convert each to a User
      for (serializedUser in serializedUsers.vals()) {
        let newUser : Types.User = {
          id = serializedUser.id;
          var twitterid = serializedUser.twitterid;
          var twitterhandle = serializedUser.twitterhandle;
          creationTime = serializedUser.creationTime;
          var pfpProgress = serializedUser.pfpProgress;
          var totalPoints = serializedUser.totalPoints;
          var ocProfile = serializedUser.ocProfile;
          var ocCompleted = serializedUser.ocCompleted;
          var discordUser = serializedUser.discordUser;
          var telegramUser = serializedUser.telegramUser;
          var nnsPrincipal = serializedUser.nnsPrincipal;
        };

        // Add the new user to the vector

        Vector.add<Types.User>(users, newUser);
      };
    };
  };

  public shared query (msg) func getAllUsersProgress(offset : Nat, limit : Nat) : async {
    data : [(Principal, [(Nat, Types.SerializedProgress)])];
    total : Nat;
  } {
    if (isAdmin(msg.caller)) {
      // Convert userProgress entries to an array
      let entries : [(Principal, Types.UserMissions)] = Iter.toArray(userProgress.entries());
      let total : Nat = Array.size(entries);

      // Handle cases where offset might be greater than total
      let adjustedOffset : Nat = if (offset >= total) { total } else { offset };
      let adjustedEnd : Nat = if (offset + limit > total) { total } else {
        offset + limit;
      };

      // Calculate the length for subArray
      let length : Nat = adjustedEnd - adjustedOffset;

      // Apply pagination using Array.subArray with (from, length)
      let paginatedEntries : [(Principal, Types.UserMissions)] = Array.subArray(entries, adjustedOffset, length);

      // Serialize the paginated entries using Array.map
      let serializedEntries : [(Principal, [(Nat, Types.SerializedProgress)])] = Array.map<(Principal, Types.UserMissions), (Principal, [(Nat, Types.SerializedProgress)])>(
        paginatedEntries,
        func(entry : (Principal, Types.UserMissions)) : (Principal, [(Nat, Types.SerializedProgress)]) {
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

  public shared query (msg) func getUser(userId : Principal) : async ?Types.SerializedUser {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      for (user in Vector.vals(users)) {
        if (user.id == userId) {
          return ?Serialization.serializeUser(user);
        };
      };
    };
    return null;
  };

  public shared query func helloWorld() : async Text {
    return "Hello World";
  };

  public shared (msg) func missionOne(userId : Principal, canisterId : Text) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
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
          await updateUserProgress(userId, 0, tempP);
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
          await updateUserProgress(userId, 1, tempP);
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
      let user = await getUser(userId);
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
                await updateUserProgress(userId, 4, tempP);
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

  public shared (msg) func addPointsToUser(userId : Principal, addition : Nat) : async (Text, Nat, Nat) {
    if (isAdmin(msg.caller)) {
      var i = 0;
      while (i < Vector.size(users)) {
        switch (Vector.getOpt(users, i)) {
          case (?user) {
            if (user.id == userId) {
              var prePoints = user.totalPoints;
              let updatedUser : Types.User = {
                id = user.id;
                var twitterid = user.twitterid;
                var twitterhandle = user.twitterhandle;
                creationTime = user.creationTime;
                var pfpProgress = user.pfpProgress;
                var totalPoints = user.totalPoints + addition;
                var ocProfile = user.ocProfile;
                var ocCompleted = user.ocCompleted;
                var discordUser = user.discordUser;
                var telegramUser = user.telegramUser;
                var nnsPrincipal = user.nnsPrincipal;
              };
              Vector.put(users, i, updatedUser);
              return ("Updated user points: ", prePoints, user.totalPoints);
            };
          };
          case _ {};
        };
        i += 1;
      };
    };
    return ("", 0, 0);
  };

  public shared (msg) func deletePointsToUser(userId : Principal, deletion : Nat) : async (Text, Nat, Nat) {
    if (isAdmin(msg.caller)) {
      var i = 0;
      while (i < Vector.size(users)) {
        switch (Vector.getOpt(users, i)) {
          case (?user) {
            if (user.id == userId) {
              var prePoints = user.totalPoints;
              let updatedUser : Types.User = {
                id = user.id;
                var twitterid = user.twitterid;
                var twitterhandle = user.twitterhandle;
                creationTime = user.creationTime;
                var pfpProgress = user.pfpProgress;
                var totalPoints = user.totalPoints - deletion;
                var ocProfile = user.ocProfile;
                var ocCompleted = user.ocCompleted;
                var discordUser = user.discordUser;
                var telegramUser = user.telegramUser;
                var nnsPrincipal = user.nnsPrincipal;
              };
              Vector.put(users, i, updatedUser);
              return ("Updated user points: ", prePoints, user.totalPoints);
            };
          };
          case _ {};
        };
        i += 1;
      };
    };
    return ("", 0, 0);
  };

  public shared query (msg) func getPlaceholderUser(userId : Principal) : async ?Types.SerializedUser {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      for (user in Vector.vals(placeholderUsers)) {
        if (user.id == userId) {
          return ?Serialization.serializeUser(user);
        };
      };
    };
    return null;
  };

  public shared query (msg) func isTwitterIdUsed(twitterhandle : Text) : async Bool {
    if (isAdmin(msg.caller)) {
      for (user in Vector.vals(users)) {
        switch (user.twitterhandle) {
          case (?handle) {
            if (handle == twitterhandle) {
              return true;
            };
          };
          case null {};
        };
      };
    };
    return false;
  };

  public shared query (msg) func isDiscordIdUsed(discordhandle : Text) : async Bool {
    if (isAdmin(msg.caller)) {
      for (user in Vector.vals(users)) {
        switch (user.discordUser) {
          case (?handle) {
            if (handle == discordhandle) {
              return true;
            };
          };
          case null {};
        };
      };
    };
    return false;
  };

  public shared (msg) func addTwitterInfo(principalId : Principal, twitterId : Nat, twitterHandle : Text) : async () {
    if (isAdmin(msg.caller)) {
      var i = 0;
      while (i < Vector.size(users)) {
        switch (Vector.getOpt(users, i)) {
          case (?user) {
            if (user.id == principalId) {
              let updatedUser : Types.User = {
                id = user.id;
                var twitterid = ?twitterId;
                var twitterhandle = ?twitterHandle;
                creationTime = user.creationTime;
                var pfpProgress = user.pfpProgress;
                var totalPoints = user.totalPoints;
                var ocProfile = user.ocProfile;
                var ocCompleted = user.ocCompleted;
                var discordUser = user.discordUser;
                var telegramUser = user.telegramUser;
                var nnsPrincipal = user.nnsPrincipal;
              };
              Vector.put(users, i, updatedUser);
              return;
            };
          };
          case _ {};
        };
        i += 1;
      };
    };
  };

  public shared (msg) func addDiscordInfo(principalId : Principal, discordHandle : Text) : async () {
    if (isAdmin(msg.caller)) {
      var i = 0;
      while (i < Vector.size(users)) {
        switch (Vector.getOpt(users, i)) {
          case (?user) {
            if (user.id == principalId) {
              let updatedUser : Types.User = {
                id = user.id;
                var twitterid = user.twitterid;
                var twitterhandle = user.twitterhandle;
                creationTime = user.creationTime;
                var pfpProgress = user.pfpProgress;
                var totalPoints = user.totalPoints;
                var ocProfile = user.ocProfile;
                var ocCompleted = user.ocCompleted;
                var discordUser = ?discordHandle;
                var telegramUser = user.telegramUser;
                var nnsPrincipal = user.nnsPrincipal;
              };
              Vector.put(users, i, updatedUser);
              return;
            };
          };
          case _ {};
        };
        i += 1;
      };
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
      let url = "https://" # host # "/twitterstuff";

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

  public shared (msg) func addOCProfile(userId : Principal, ocprofile : Text) : async () {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      var i = 0;
      while (i < Vector.size(users)) {
        switch (Vector.getOpt(users, i)) {
          case (?user) {
            if (user.id == userId) {
              let updatedUser : Types.User = {
                id = user.id;
                var twitterid = user.twitterid;
                var twitterhandle = user.twitterhandle;
                creationTime = user.creationTime;
                var pfpProgress = user.pfpProgress;
                var totalPoints = user.totalPoints;
                var ocProfile = ?ocprofile;
                var ocCompleted = user.ocCompleted;
                var discordUser = user.discordUser;
                var telegramUser = user.telegramUser;
                var nnsPrincipal = user.nnsPrincipal;
              };
              Vector.put(users, i, updatedUser);
              return;
            };
          };
          case _ {};
        };
        i += 1;
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
      Vector.clear(users);
      userProgress := TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);
      verified := TrieMap.TrieMap<Principal, Bool>(Principal.equal, Principal.hash);
      twitterVerifiedNFID := [];
      discordVerifiedNFID := [];
      placeholderUsers := Vector.new<Types.User>();
      return;
    };
  };
};
