import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Types "Types";
import Serialization "Serialization";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Time "mo:base/Time";
import Random "mo:base/Random";
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
import Debug "mo:base/Debug";

actor class Backend() {

  private var globalStreakPercentage : TrieMap.TrieMap<Text, Nat> = TrieMap.TrieMap<Text, Nat>(Text.equal, Text.hash);

  stable var serializedGlobalStreakPercentage : [(Text, Nat)] = [];

  private var globalStreak : TrieMap.TrieMap<Text, Nat> = TrieMap.TrieMap<Text, Nat>(Text.equal, Text.hash);

  stable var serializedGlobalStreak : [(Text, Nat)] = [];

  private var globalUserStreak : TrieMap.TrieMap<Text, Types.UserStreak> = TrieMap.TrieMap<Text, Types.UserStreak>(Text.equal, Text.hash);

  stable var serializedGlobalUserStreak : [(Text, Types.SerializedUserStreak)] = [];

  private var globalUserProgress : TrieMap.TrieMap<Text, Types.UserMissions> = TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);

  stable var serializedGlobalUserProgress : [(Text, [(Nat, Types.SerializedProgress)])] = [];

  private var globalTerms : TrieMap.TrieMap<Text, Bool> = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);

  stable var serializedGlobalTerms : [(Text, Bool)] = [];

  stable var serializedNuanceUsers : [(Principal, Text)] = [];

  public shared (msg) func mergeAccounts(canonicalUUID : Text, mergingUUID : Text) : async Text {

    if (msg.caller == Principal.fromText("tui2b-giaaa-aaaag-qnbpq-cai")) {

      // For merging timestamps by day, we use the following constant:
      let nanosecPerDay : Int = 86400 * 1000000000; // 86400 seconds * 1e9 = 86,400,000,000,000 ns

      // 1. Merge globalStreakPercentage: keep the higher Nat value.
      let canonPercOpt = globalStreakPercentage.get(canonicalUUID);
      let mergingPercOpt = globalStreakPercentage.get(mergingUUID);
      switch (canonPercOpt, mergingPercOpt) {
        case (?p1, ?p2) {
          globalStreakPercentage.put(canonicalUUID, if (p1 >= p2) { p1 } else { p2 });
        };
        case (null, ?p2) {
          globalStreakPercentage.put(canonicalUUID, p2);
        };
        case (?p1, null) {
          globalStreakPercentage.put(canonicalUUID, p1);
        };
        case (null, null) {};
      };
      globalStreakPercentage.delete(mergingUUID);

      // 2. Merge globalStreak: keep the higher Nat.
      let canonStreakOpt = globalStreak.get(canonicalUUID);
      let mergingStreakOpt = globalStreak.get(mergingUUID);
      switch (canonStreakOpt, mergingStreakOpt) {
        case (?s1, ?s2) {
          globalStreak.put(canonicalUUID, if (s1 >= s2) { s1 } else { s2 });
        };
        case (null, ?s2) { globalStreak.put(canonicalUUID, s2) };
        case (?s1, null) { globalStreak.put(canonicalUUID, s1) };
        case (null, null) {};
      };
      globalStreak.delete(mergingUUID);

      // 3. Merge globalUserStreak (UserStreak = TrieMap<Int, Nat>)
      // Since timestamps are in nanoseconds and two timestamps on the same day (day = ts / nanosecPerDay)
      // should yield only the record with the higher points, we first build a temporary map keyed by day.
      var tempDayMap : TrieMap.TrieMap<Int, (Int, Nat)> = TrieMap.TrieMap<Int, (Int, Nat)>(Int.equal, Int.hash);

      // Helper: process one UserStreak map into tempDayMap.
      func processUserStreak(map : TrieMap.TrieMap<Int, Nat>) : () {
        for ((ts, pts) in map.entries()) {
          let day = ts / nanosecPerDay;
          switch (tempDayMap.get(day)) {
            case null {
              tempDayMap.put(day, (ts, pts));
            };
            case (?existing) {
              let (_, existingPts) = existing;
              if (pts > existingPts) {
                tempDayMap.put(day, (ts, pts));
              };
            };
          };
        };
      };

      // Process canonical and merging user streaks (if present)
      switch (globalUserStreak.get(canonicalUUID)) {
        case (?canonMap) { processUserStreak(canonMap) };
        case null {};
      };
      switch (globalUserStreak.get(mergingUUID)) {
        case (?mergingMap) { processUserStreak(mergingMap) };
        case null {};
      };

      // Rebuild the merged UserStreak map (using the original timestamp keys from tempDayMap)
      var mergedUserStreak : TrieMap.TrieMap<Int, Nat> = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);
      for ((_, (ts, pts)) in tempDayMap.entries()) {
        mergedUserStreak.put(ts, pts);
      };
      globalUserStreak.put(canonicalUUID, mergedUserStreak);
      globalUserStreak.delete(mergingUUID);

      // 4. Merge globalUserProgress (UserMissions = TrieMap<Nat, Progress>)
      var mergedUserProgress : TrieMap.TrieMap<Nat, Types.Progress> = switch (globalUserProgress.get(canonicalUUID)) {
        case (?mp) { mp };
        case null { TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash) };
      };

      switch (globalUserProgress.get(mergingUUID)) {
        case (?mergingProgressMap) {
          for ((missionId, mergingProgress) in mergingProgressMap.entries()) {
            switch (mergedUserProgress.get(missionId)) {
              case null {
                // Mission not present for canonical; add it.
                mergedUserProgress.put(missionId, mergingProgress);
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
                mergedUserProgress.put(missionId, mergedProgressRecord);
              };
            };
          };
        };
        case null {};
      };
      globalUserProgress.put(canonicalUUID, mergedUserProgress);
      globalUserProgress.delete(mergingUUID);

      // 5. Merge globalTerms: if either is true, then true.
      let canonTermOpt = globalTerms.get(canonicalUUID);
      let mergingTermOpt = globalTerms.get(mergingUUID);
      let mergedTerm = switch (canonTermOpt, mergingTermOpt) {
        case (null, null) { false };
        case (null, ?t) { t };
        case (?t, null) { t };
        case (?t1, ?t2) { t1 or t2 };
      };
      globalTerms.put(canonicalUUID, mergedTerm);
      globalTerms.delete(mergingUUID);

      return "Success";
    };
    "";
  };

  public shared composite query (msg) func hasAcceptedTerms(userId : Principal) : async Bool {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      switch (globalTerms.get(userUUID)) {
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

  public shared (msg) func acceptTerms(userId : Principal) : async () {
    if (userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      globalTerms.put(userUUID, true);
    };
  };

  public shared (msg) func updatedTerms() : async () {
    if (isAdmin(msg.caller)) {
      for (key in globalTerms.keys()) {
        globalTerms.put(key, false);
      };
    };
  };

  // Restore Function

  //REMAKE FIX

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

    let globalTermsEntries = globalTerms.entries();
    serializedGlobalTerms := Iter.toArray(globalTermsEntries);

    let globalStreakPEntries = globalStreakPercentage.entries();
    serializedGlobalStreakPercentage := Iter.toArray(globalStreakPEntries);

    let globalStreakEntries = globalStreak.entries();
    serializedGlobalStreak := Iter.toArray(globalStreakEntries);

    let globalUserStreakEntries = globalUserStreak.entries();
    serializedGlobalUserStreak := Array.map<(Text, Types.UserStreak), (Text, Types.SerializedUserStreak)>(
      Iter.toArray(globalUserStreakEntries),
      func(entry : (Text, Types.UserStreak)) : (Text, Types.SerializedUserStreak) {
        let (key, streakMap) = entry;
        let subEntries = streakMap.entries();
        let serializedSubEntries = Array.map<(Int, Nat), (Int, Nat)>(
          Iter.toArray(subEntries),
          func(subEntry : (Int, Nat)) : (Int, Nat) {
            subEntry;
          },
        );
        return (key, serializedSubEntries);
      },
    );

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

    // Terms

    globalTerms := TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);

    for ((text, boolValue) in Iter.fromArray(serializedGlobalTerms)) {
      globalTerms.put(text, boolValue);
    };

    serializedGlobalTerms := [];

    globalStreakPercentage := TrieMap.TrieMap<Text, Nat>(Text.equal, Text.hash);

    for ((text, natValue) in Iter.fromArray(serializedGlobalStreakPercentage)) {
      globalStreakPercentage.put(text, natValue);
    };

    serializedGlobalStreakPercentage := [];

    globalStreak := TrieMap.TrieMap<Text, Nat>(Text.equal, Text.hash);

    for ((text, natValue) in Iter.fromArray(serializedGlobalStreak)) {
      globalStreak.put(text, natValue);
    };

    serializedGlobalStreak := [];

    globalUserStreak := TrieMap.TrieMap<Text, Types.UserStreak>(Text.equal, Text.hash);

    for (tuple in Iter.fromArray(serializedGlobalUserStreak)) {
      let text = tuple.0;
      let serializedStreak = tuple.1;

      // Initialize a new TrieMap for the UserStreak of the current Text
      let streakMap = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);

      // Iterate over each (Int, Nat) tuple in SerializedUserStreak
      for (streakTuple in Iter.fromArray(serializedStreak)) {
        let streakId = streakTuple.0;
        let streakValue = streakTuple.1;

        // Deserialize and insert into streakMap
        streakMap.put(streakId, streakValue);
      };

      // Insert the deserialized streakMap into globalUserStreak TrieMap
      globalUserStreak.put(text, streakMap);
    };

    serializedGlobalUserStreak := [];

  };

  stable var streakTime = 15; // Streak reset timer in MINUTES
  stable var streakTimeNanos = streakTime * 60 * 1_000_000_000;

  // Function to get the streak time

  public shared query (msg) func getStreakTime() : async Nat {
    if (isAdmin(msg.caller) or (not Principal.isAnonymous(msg.caller))) {
      return streakTimeNanos;
    };
    return 0;
  };

  // Function to set the streak time

  public shared (msg) func setStreakTime(newNum : Nat) : async () {
    if (isAdmin(msg.caller)) {
      streakTime := newNum;
      streakTimeNanos := newNum * 60 * 1_000_000_000;
    };
  };

  // Function to get the streak of an user

  public shared composite query (msg) func getUserStreakAmount(userId : Principal) : async Nat {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      switch (globalStreak.get(userUUID)) {
        case (?value) return value;
        case null return 0;
      };
    };
    return 0;
  };

  // Function to get the streak percentage of a user

  public shared composite query (msg) func getUserStreakPercentage(userId : Principal) : async Nat {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      switch (globalStreakPercentage.get(userUUID)) {
        case (?value) return value;
        case null return 0;
      };
    };
    return 0;
  };

  // Function to get all streaks for an user

  public shared composite query (msg) func getUserAllStreak(userId : Principal) : async Types.SerializedUserStreak {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      let entriesUS = globalUserStreak.entries();
      for (entryUS in entriesUS) {
        let principal = entryUS.0;
        let totalStreak = entryUS.1;
        if (principal == userUUID) {
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

  // Function to get all users streak

  public shared query (msg) func getAllUsersStreak() : async [(Text, [(Int, Nat)])] {
    // Only admin can fetch all streaks:
    if (isAdmin(msg.caller)) {
      let entries = globalUserStreak.entries();
      var result : [(Text, [(Int, Nat)])] = [];

      // For each user in userStreak:
      for (entry in entries) {
        let principal = entry.0;
        let userStreakMap = entry.1;

        // Convert sub-entries (timestamp -> streakValue) to an array of (Int, Nat)
        let subEntries = userStreakMap.entries();
        var subResult : [(Int, Nat)] = [];

        for (subEntry in subEntries) {
          let timestamp = subEntry.0;
          let streakValue = subEntry.1;
          // Append to subResult
          subResult := Array.append(subResult, [(timestamp, streakValue)]);
        };

        // Append this user's (Principal, arrayOfStreaks) to result
        result := Array.append(result, [(principal, subResult)]);
      };

      return result;
    };

    // If not admin, return empty list
    return [];
  };

  // Function to get the last streak time of a user

  public shared composite query (msg) func getUserStreakTime(userId : Principal) : async Int {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      var hasStarted = false;

      var lastTimestamp : Int = 0;
      let mainEntries = globalStreak.entries();

      for (mainEntry in mainEntries) {
        // Iter if user did start Streak
        let mainUserId = mainEntry.0;
        if (userUUID == mainUserId) {
          // The user did start
          hasStarted := true;
          let entries = globalUserStreak.entries();
          for (entry in entries) {
            let theUserId = entry.0;
            let theUserStreak = entry.1;
            if (theUserId == userUUID) {
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

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      let currentTime = Time.now();
      var hasStarted = false;

      var lastTimestamp : Int = 0;

      let mainEntries = globalStreak.entries();

      for (mainEntry in mainEntries) {
        // Iter if user did start Streak
        let mainUserId = mainEntry.0;
        let mainStreak = mainEntry.1;
        if (userUUID == mainUserId) {
          // The user did start
          hasStarted := true;
          let entries = globalUserStreak.entries();

          for (entry in entries) {
            let theUserId = entry.0;
            let theUserStreak = entry.1;

            if (theUserId == userUUID) {
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
                globalStreak.put(userUUID, mainStreak + 1);
                let newStreak : TrieMap.TrieMap<Int, Nat> = theUserStreak;
                let earnedText = Nat.toText((300 + (300 * (mainStreak + 1))) / 60);
                newStreak.put(currentTime, 300 + (300 * (mainStreak + 1))); // 5 minutes + Extra minutes per streak
                globalUserStreak.put(userUUID, newStreak);
                return ("You have earned " # earnedText # " minutes!", (300 + (300 * (mainStreak + 1))));
              } else if ((lastTimestamp + (streakTimeNanos * 2)) <= currentTime and currentTime < (lastTimestamp + (streakTimeNanos * 3))) {
                let decisiveEntries = globalStreakPercentage.entries();
                for (decisiveEntry in decisiveEntries) {
                  let decisiveUser = decisiveEntry.0;
                  let percentage = decisiveEntry.1;

                  if (decisiveUser == userUUID) {
                    let seed : Blob = await Random.blob();
                    let randomNumber = Nat8.toNat(Random.byteFrom(seed) % 100);

                    if (randomNumber < percentage) {
                      // Success: continue streak
                      globalStreak.put(userUUID, (mainStreak + 1));
                      globalStreakPercentage.put(userUUID, Nat.max(percentage - 25, 1));
                      let newStreak : TrieMap.TrieMap<Int, Nat> = theUserStreak;
                      let earnedText = Nat.toText((300 + (300 * (mainStreak + 1))) / 60);
                      newStreak.put(currentTime, 300 + (300 * (mainStreak + 1))); // 5 minutes + Extra minutes per streak
                      globalUserStreak.put(userUUID, newStreak);
                      return ("Your streak is ALIVE! Try to not miss it again. You have earned " # earnedText # " minutes!", (300 + (300 * (mainStreak + 1)))); // Saved
                    } else {
                      // Failure: reset streak
                      globalStreak.put(userUUID, 1);
                      globalStreakPercentage.put(userUUID, 80);
                      let firstStreakAgain : TrieMap.TrieMap<Int, Nat> = theUserStreak;
                      firstStreakAgain.put(currentTime, 300);
                      globalUserStreak.put(userUUID, firstStreakAgain);
                      return ("Too bad, your past streak died. Starting again with 5 minutes...", 300); // Died
                    };
                  };
                };
              } else if (currentTime >= (lastTimestamp + (streakTimeNanos * 3))) {
                // Reset streak after third window
                globalStreak.put(userUUID, 1);
                globalStreakPercentage.put(userUUID, 80);
                let newStreakMap : TrieMap.TrieMap<Int, Nat> = theUserStreak;
                newStreakMap.put(currentTime, 300);
                globalUserStreak.put(userUUID, newStreakMap);
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

        globalStreak.put(userUUID, 1); // 1 Time Streak
        globalStreakPercentage.put(userUUID, 80); // 80% Success if missed 1 day
        let firstStreak : TrieMap.TrieMap<Int, Nat> = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);
        firstStreak.put(currentTime, 300); // 5 minutes first streak
        globalUserStreak.put(userUUID, firstStreak);

        return ("You have earned 5 minutes!", 300);
      };

      return ("", 0);
    };
    return ("", 0);
  };

  //

  // Admin Management

  //

  // Admin IDs

  stable var adminIds : [Principal] = [Principal.fromText("re2jg-bjb6f-frlwq-342yn-bebk2-43ofq-3qwwq-cld3p-xiwxw-bry3n-aqe")];

  // Function to add an admin ID

  public shared (msg) func addAdminId(newAdminId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      adminIds := Array.append<Principal>(adminIds, [newAdminId]);
    };
  };

  // Function to login as an admin

  public shared query (msg) func loginAdmin() : async Bool {
    if (isAdmin(msg.caller)) {
      return true;
    };
    return false;
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

  public shared query (msg) func getNuanceIds() : async [(Principal, Text)] {
    if (isAdmin(msg.caller)) {
      return serializedNuanceUsers;
    };
    return [];
  };

  // Function to remove an admin ID

  public shared (msg) func removeAdminId(adminId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      adminIds := Array.filter<Principal>(adminIds, func(id) : Bool { id != adminId });
    };

  };

  //

  // User Progress & Code Submission

  //

  // Function to record or update progress on a mission

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

  // Function to get the progress of a specific mission for a user

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

  // Function to get the progress of all missions for a user

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

  // Function to add a secret code to a user's progress for the mission

  public shared (msg) func submitCode(userId : Principal, missionId : Nat, code : Text) : async Bool {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      let indexC = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await indexC.getUUID(userId);

      // Retrieve or initialize user's missions progress
      let userMissions = switch (globalUserProgress.get(userUUID)) {
        case (?progress) progress;
        case null return false;
      };

      // Retrieve or initialize the mission progress
      let missionProgress = switch (userMissions.get(missionId)) {
        case (?progress) progress;
        case null {
          // Initialize a new Progress record for the mission
          let newProgress : Types.Progress = {
            var completionHistory = [];
            var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
          };
          // Insert the new Progress into userMissions
          userMissions.put(missionId, newProgress);
          newProgress;
        };
      };

      // Find the mission with the matching id directly within submitCode
      var missionOpt : ?Types.Mission = null;
      var index : Nat = 0;
      let size = Vector.size(missionsV2);
      while (index < size and Option.isNull(missionOpt)) {
        let missionAtIndexOpt = Vector.get(missionsV2, index);

        switch (missionAtIndexOpt) {
          case (missionAtIndex) {
            if (missionAtIndex.id == missionId) {
              missionOpt := ?missionAtIndex; // Assign the mission when found
            };
          };
        };

        index += 1;
      };

      // Check if the mission was found
      let mission = switch (missionOpt) {
        case (?m) m;
        case null {
          return false; // Mission ID is invalid
        };
      };

      // Ensure the mission has a secret code enabled
      switch (mission.secretCodes) {
        case (?secretCode) {
          // Ensure the code matches
          if (secretCode != code) {
            return false; // Invalid code
          };
        };
        case null {
          return false; // This mission doesn't accept codes
        };
      };

      // Check if the code has already been used by this user
      if (missionProgress.usedCodes.get(code) == ?true) {
        return false; // Code already used
      };

      // Generate a random number of points between mintime and maxtime using the utility function
      let pointsEarnedOpt = getRandomNumberBetween(mission.mintime, mission.maxtime);

      // Convert the Int points to Nat
      let pointsEarnedNat : Nat = Int.abs(pointsEarnedOpt);

      // Mark the code as used
      missionProgress.usedCodes.put(code, true);

      // Create a new MissionRecord
      let newRecord : Types.MissionRecord = {
        var timestamp = Time.now();
        var pointsEarned = pointsEarnedNat;
        var tweetId = null;
      };

      // Append the new record to the mission's completion history
      missionProgress.completionHistory := Array.append(missionProgress.completionHistory, [newRecord]);

      // Save the updated mission progress
      userMissions.put(missionId, missionProgress);
      globalUserProgress.put(userUUID, userMissions);

      return true;
    };

    return false;
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

  // Get the total seconds of an user by Principal

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

          let entriesUS = globalUserStreak.entries();
          for (entryUS in entriesUS) {
            let principal = entryUS.0;
            let totalStreak = entryUS.1;
            if (principal == userUUID) {
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

  //

  // Image & Media Handling

  //

  // Mission Assets

  var missionAssets : TrieMap.TrieMap<Text, Blob> = TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash);

  // Stable storage for serialized mission assets

  stable var serializedMissionAssets : [(Text, Blob)] = [];

  // Generate a unique image identifier using a combination of timestamp and hash

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

  // Function to upload a mission image and return the URL

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

  //

  // Mission Management

  //

  // Mission List

  stable var missionsV2 : Vector.Vector<Types.MissionV2> = Vector.new<Types.MissionV2>();

  // Function to add or update a mission

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

  // Function to get all missions

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

  // Function to get a mission by ID

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

  // Function to reset all missions

  public shared (msg) func resetMissions() : async () {
    if (isAdmin(msg.caller)) {
      Vector.clear(missionsV2); // Clear all missions
      missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash); // Clear all images in missionAssets
    };
    return;
  };

  // Function to count the number of users who have completed a specific mission

  public shared query (msg) func countUsersWhoCompletedMission(missionId : Nat) : async Nat {
    if (isAdmin(msg.caller)) {
      var count : Nat = 0;

      // Iterate through all users in userProgress
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

  //

  // Progress Management

  //

  // First Mission Completion

  public shared (msg) func completeMainMission(userUUID : Text) : async () {

    if (Principal.fromText("tui2b-giaaa-aaaag-qnbpq-cai") == msg.caller) {

      // Generate random points between 3600 and 21600
      let pointsEarnedOpt = getRandomNumberBetween(Vector.get(missionsV2, 0).mintime, Vector.get(missionsV2, 0).maxtime);

      // Create a completion record for the first mission
      let firstMissionRecord : Types.MissionRecord = {
        var timestamp = Time.now();
        var pointsEarned = Int.abs(pointsEarnedOpt); // Convert to Nat using Int.abs
        var tweetId = null; // No tweet associated with this mission
      };

      // Create progress for the first mission
      let firstMissionProgress : Types.Progress = {
        var completionHistory = [firstMissionRecord];
        var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
      };

      let tempP = Serialization.serializeProgress(firstMissionProgress);

      let progress = Serialization.deserializeProgress(tempP);

      // Retrieve the user's missions or create a new TrieMap if it doesn't exist
      let missions = switch (globalUserProgress.get(userUUID)) {
        case (?map) map;
        case null TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
      };

      // Update the mission progress
      missions.put(0, progress);

      // Update the user's progress in the main TrieMap
      globalUserProgress.put(userUUID, missions);
    };
  };

  // Function to get All Users Progress

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

  // Function to set the Mission PFP Progress

  public shared (msg) func setPFPProgress(userId : Principal) : async Text {

    if (isAdmin(msg.caller)) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        setPFPProgress : (Principal) -> async Text;
      };

      let response = await index.setPFPProgress(userId);

      return response;
    };
    return "";
  };

  // Function to add Twitter information to a user

  //

  // Http Request and Cycles

  //

  // Http Request Function

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

  // Helper function to serialize an array of Texts into a JSON array

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

  //Function to upload Tweet Post Parameters

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

  // Function to upload Retweet Id

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

  // Function to get canister cycles balance

  public query func availableCycles() : async Nat {
    return Cycles.balance();
  };

  //

  // Utility Functions

  //

  // Utility function to generate a random number between min and max (inclusive)

  private func getRandomNumberBetween(min : Int, max : Int) : Int {
    assert (max >= min); // Ensure that max is greater than or equal to min

    let random = Random.Finite("\e2\8f\3b\5d\99\c1\0a\4f\76\ad\12\34\fe");
    let range = max - min + 1; // Calculate the range as an Int
    let randomValue = random.range(32); // Generate a random value

    switch (randomValue) {
      case (?value) {
        let result = min + (Int.abs(value % Int.abs(range))); // Adjust the random value within the range
        return result;
      };
      case (null) {
        return 18745;
      };
    };
  };

  // Function to reset all data Structures

  public shared (msg) func resetall() : async () {
    if (isAdmin(msg.caller)) {
      globalUserProgress := TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);
      return;
    };
  };

  // Function to reset a specific Mission Progress for an user

  public shared (msg) func resetallProgress() : async () {
    if (isAdmin(msg.caller)) {
      globalUserProgress := TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);
      return;
    };
  };

  // Function to reset a specific Mission Progress for an user

  public shared (msg) func resetUserMissionProgress(userUUID : Text, missionId : Nat) : async () {

    if (isAdmin(msg.caller)) {
      let userMissions = switch (globalUserProgress.get(userUUID)) {
        case (?progress) progress;
        case null return;
      };

      userMissions.delete(missionId);
      globalUserProgress.put(userUUID, userMissions);
      return;
    };
  };

  // Function to get trusted origins for NFID authentication

  public shared query func icrc28_trusted_origins() : async Types.Icrc28TrustedOriginsResponse {
    let trusted_origins : [Text] = [
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

  // Utility function to transform the response

  // private query func transform(raw : Types.TransformArgs) : async Types.CanisterHttpResponsePayload {
  //   let transformed : Types.CanisterHttpResponsePayload = {
  //     status = raw.response.status;
  //     body = raw.response.body;
  //     headers = [
  //       {
  //         name = "Content-Security-Policy";
  //         value = "default-src 'self'";
  //       },
  //       { name = "Referrer-Policy"; value = "strict-origin" },
  //       { name = "Permissions-Policy"; value = "geolocation=(self)" },
  //       {
  //         name = "Strict-Transport-Security";
  //         value = "max-age=63072000";
  //       },
  //       { name = "X-Frame-Options"; value = "DENY" },
  //       { name = "X-Content-Type-Options"; value = "nosniff" },
  //     ];
  //   };
  //   transformed;
  // };

  // Function to check if the middleman server is reachable

  public shared (msg) func isMiddlemanReachable() : async Bool {
    if (isAdmin(msg.caller)) {
      // 1. DECLARE IC MANAGEMENT CANISTER
      let ic : Types.IC = actor ("aaaaa-aa");

      // 2. SETUP ARGUMENTS FOR HTTP GET request to test the middleman server
      let host : Text = "do.konecta.one";
      let url = "https://" # host # "/ping";

      let http_request : Types.HttpRequestArgs = {
        url = url;
        max_response_bytes = null;
        headers = [
          { name = "Host"; value = host },
        ];
        body = null;
        method = #get;
        transform = null;
      };

      // Add sufficient cycles for the HTTP request
      Cycles.add<system>(22_935_266_640);

      // Make the HTTP request and wait for the response
      let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

      // Check if the response status is 200 (OK)
      return http_response.status == 200;
    };
    return false;
  };

  public shared (msg) func userFollowsNuance(userId : Principal, username : Text) : async Bool {
    if (isAdmin(msg.caller)) {

      let index = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      var exists = false;

      for (tuple in Iter.fromArray(serializedNuanceUsers)) {
        let userNuance = tuple.1;
        if (userNuance == username) {
          exists := true;
          return false;
        };
      };

      if (not exists) {
        let mission = await getMissionById(11);
        switch mission {
          case (?mission) {
            let pointsEarnedOpt = getRandomNumberBetween(mission.mintime, mission.maxtime);
            let pointsEarnedNat : Nat = Int.abs(pointsEarnedOpt);
            let newRecord : Types.SerializedMissionRecord = {
              timestamp = Time.now();
              pointsEarned = pointsEarnedNat;
              tweetId = null;
            };

            let nuanceProgress : Types.SerializedProgress = {
              completionHistory = [newRecord];
              usedCodes = [(username, true)];
            };

            await updateUserProgress(userUUID, 11, nuanceProgress);
            serializedNuanceUsers := Array.append<(Principal, Text)>(serializedNuanceUsers, [(userId, username)]);
            return true;
          };
          case null return false;
        };
      };
    };
    return false;
  };

  public shared (msg) func whoami() : async Text {
    return Principal.toText(msg.caller);
  };

};
