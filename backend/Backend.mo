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

actor class Backend() {

  private var streakPercentage : TrieMap.TrieMap<Principal, Nat> = TrieMap.TrieMap<Principal, Nat>(Principal.equal, Principal.hash);

  stable var serializedstreakPercentage : [(Principal, Nat)] = [];

  private var streak : TrieMap.TrieMap<Principal, Nat> = TrieMap.TrieMap<Principal, Nat>(Principal.equal, Principal.hash);

  stable var serializedstreak : [(Principal, Nat)] = [];

  private var userStreak : TrieMap.TrieMap<Principal, Types.UserStreak> = TrieMap.TrieMap<Principal, Types.UserStreak>(Principal.equal, Principal.hash);

  stable var serializedUserStreak : [(Principal, Types.SerializedUserStreak)] = [];

  private var oisyWallet : TrieMap.TrieMap<Principal, Principal> = TrieMap.TrieMap<Principal, Principal>(Principal.equal, Principal.hash);

  stable var serializedOisyWallet : [(Principal, Principal)] = [];

  private var accountLinks : TrieMap.TrieMap<Principal, (Principal, Bool)> = TrieMap.TrieMap<Principal, (Principal, Bool)>(Principal.equal, Principal.hash);

  //      - `Bool = true`  => The main principal is an NFID user
  //                                   linked to an II principal.
  //      - `Bool = false` => The main principal is an II user
  //                                   linked to an NFID principal.

  stable var serializedAccountLinks : [(Principal, (Principal, Bool))] = [];

  stable var nfidToII : [(Principal, Principal)] = [];

  //   `nfidToII` holds pairs (NFIDuser, IIuser),
  //   meaning an NFID user is trying to link to an II user.

  stable var iiToNFID : [(Principal, Principal)] = [];

  //   `iiToNFID` holds pairs (IIuser, NFIDuser),
  //   meaning an II user is trying to link to an NFID user.

  //

  // Upgrade And Restore Functions

  //

  // TrieMap to store the progress of each user's missions

  private var userProgress : TrieMap.TrieMap<Principal, Types.UserMissions> = TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);

  // Stable storage for serialized data

  stable var serializedUserProgress : [(Principal, [(Nat, Types.SerializedProgress)])] = [];

  private var terms : TrieMap.TrieMap<Principal, Bool> = TrieMap.TrieMap<Principal, Bool>(Principal.equal, Principal.hash);

  stable var serializedTerms : [(Principal, Bool)] = [];

  stable var serializedNuanceUsers : [(Principal, Text)] = [];

  public func resetAccountLinks() : async () {
    nfidToII := [];
    iiToNFID := [];
    accountLinks := TrieMap.TrieMap<Principal, (Principal, Bool)>(Principal.equal, Principal.hash);
  };

  public func getAllAccountLinks() : async ([(Principal, Principal)]) {
    return Array.append(nfidToII, iiToNFID);
  };

  private func linkAccountsToIndex() : async () {

    let indexCanister = actor ("tui2b-giaaa-aaaag-qnbpq-cai") : actor {
      syncAccountLinks : ([(Principal, (Principal, Bool))]) -> async ();
    };

    let accountLinksEntries = accountLinks.entries();
    serializedAccountLinks := Iter.toArray(accountLinksEntries);

    await indexCanister.syncAccountLinks(serializedAccountLinks);
  };

  public query (msg) func hasAcceptedTerms(userId : Principal) : async Bool {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      switch (terms.get(user)) {
        case (?value) {
          if (value == true) {
            return true;
          } else {
            switch (terms.get(userId)) {
              case (?value) {
                if (value == true) {
                  return true;
                } else {
                  return false;
                };
              };
              case null return false;
            };
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

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      terms.put(userId, true);
      terms.put(user, true);
    };
  };

  public shared (msg) func linkAsNFIDToII(nfidUser : Principal, iiUser : Principal) : async Text {
    // Basic authorization check: must be called by nfidUser
    if (nfidUser != msg.caller or Principal.isAnonymous(msg.caller)) {
      return "Unauthorized";
    };

    // Check if user is already in the process of linking an II
    let (isLinking, maybeII) = await isLinkingNFIDtoII(nfidUser);
    if (isLinking) {
      switch (maybeII) {
        case (?existingII) return "Already linking to II: " # Principal.toText(existingII);
        case null return "Already linking to an II (none specified).";
      };
    };

    // Record the pending link
    nfidToII := Array.append(nfidToII, [(nfidUser, iiUser)]);

    // Check for reciprocal record in iiToNFID
    let exists = Array.find<(Principal, Principal)>(
      iiToNFID,
      func(pair) : Bool {
        let (iiCandidate, nfidCandidate) = pair;
        iiCandidate == iiUser and nfidCandidate == nfidUser;
      },
    );

    if (exists != null) {
      // Both sides have attempted to link => finalize in `accountLinks`
      // `true` means “main principal is NFID linking an II”
      accountLinks.put(nfidUser, (iiUser, true));

      // If you have extra logic to share wallets, etc:
      let hasOisy = oisyWallet.get(nfidUser);
      switch (hasOisy) {
        case (?walletId) {
          if (oisyWallet.get(iiUser) != ?walletId) {
            oisyWallet.put(iiUser, walletId);
          };
        };
        case null {};
      };

      await linkAccountsToIndex();
      return "Success";
    };

    // Otherwise, still waiting for the other side to call link
    return "First link successful, pending reciprocal link";
  };

  public shared (msg) func linkAsIIToNFID(iiUser : Principal, nfidUser : Principal) : async Text {
    // Basic authorization check: must be called by iiUser
    if (iiUser != msg.caller or Principal.isAnonymous(msg.caller)) {
      return "Unauthorized";
    };

    // Check if user is already in the process of linking an NFID
    let (isLinking, maybeNFID) = await isLinkingIItoNFID(iiUser);
    if (isLinking) {
      switch (maybeNFID) {
        case (?existingNFID) return "Already linking to NFID: " # Principal.toText(existingNFID);
        case null return "Already linking to an NFID (none specified).";
      };
    };

    // Record the pending link
    iiToNFID := Array.append(iiToNFID, [(iiUser, nfidUser)]);

    // Check for reciprocal record in nfidToII
    let exists = Array.find<(Principal, Principal)>(
      nfidToII,
      func(pair) : Bool {
        let (nfidCandidate, iiCandidate) = pair;
        nfidCandidate == nfidUser and iiCandidate == iiUser;
      },
    );

    if (exists != null) {
      // Both sides have attempted to link => finalize in `accountLinks`
      // `false` means “main principal is II linking an NFID”
      accountLinks.put(iiUser, (nfidUser, false));

      // If you have extra logic to share wallets, etc:
      let hasOisy = oisyWallet.get(iiUser);
      switch (hasOisy) {
        case (?walletId) {
          if (oisyWallet.get(nfidUser) != ?walletId) {
            oisyWallet.put(nfidUser, walletId);
          };
        };
        case null {};
      };

      await linkAccountsToIndex();
      return "Success";
    };

    // Otherwise, still waiting for the other side to call link
    return "First link successful, pending reciprocal link";
  };

  public shared query (msg) func isLinkingNFIDtoII(nfidUser : Principal) : async (Bool, ?Principal) {
    if (isAdmin(msg.caller) or nfidUser == msg.caller and not Principal.isAnonymous(msg.caller)) {
      let exists = Array.find<(Principal, Principal)>(
        nfidToII,
        func(pair) : Bool {
          let (candidateNFID, _candidateII) = pair;
          candidateNFID == nfidUser;
        },
      );
      if (exists != null) {
        let ?(_, secondPrincipal) = exists;
        return (true, ?secondPrincipal);
      };
    };
    return (false, null);
  };

  public shared query (msg) func isLinkingIItoNFID(iiUser : Principal) : async (Bool, ?Principal) {
    if (isAdmin(msg.caller) or iiUser == msg.caller and not Principal.isAnonymous(msg.caller)) {
      let exists = Array.find<(Principal, Principal)>(
        iiToNFID,
        func(pair) : Bool {
          let (candidateII, _candidateNFID) = pair;
          candidateII == iiUser;
        },
      );
      if (exists != null) {
        let ?(_, secondPrincipal) = exists;
        return (true, ?secondPrincipal);
      };
    };
    return (false, null);
  };

  public shared query (msg) func getLinkedAccount(userId : Principal) : async ?Principal {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      switch (accountLinks.get(userId)) {
        case (?pair) {
          let (linkedAcc, _) = pair;
          return ?linkedAcc;
        };
        case null return null;
      };
    };
    return null;
  };

  public shared (msg) func addOisyWallet(userId : Principal, walletId : Principal) : async Text {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      // Retrieve existing wallet entries for both accounts
      let walletForUser = oisyWallet.get(user);
      let walletForUserId = oisyWallet.get(userId);

      // Check if both already have the wallet
      if (walletForUser == ?walletId and walletForUserId == ?walletId) {
        return "User already has a wallet";
      };

      // If the derived user doesn't have the wallet, assign it
      if (walletForUser != ?walletId) {
        oisyWallet.put(user, walletId);
      };

      // If the original userId doesn't have the wallet, assign it
      if (walletForUserId != ?walletId) {
        oisyWallet.put(userId, walletId);
      };

      return "Success";
    };

    return "Unauthorized";
  };

  public shared query (msg) func getUserOisyWallet(userId : Principal) : async ?Principal {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      switch (oisyWallet.get(user)) {
        case (?value) return ?value;
        case null {
          switch (oisyWallet.get(userId)) {
            case (?value) return ?value;
            case null {};
          };
        };
      };
    };
    return null;
  };

  public shared (msg) func updatedTerms() : async () {
    if (isAdmin(msg.caller)) {
      for (key in terms.keys()) {
        terms.put(key, false);
      };
    };
  };

  // Restore Function

  public shared (msg) func restoreAllUserProgress(serializedData : [(Principal, [(Nat, Types.SerializedProgress)])]) : async () {
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

    let termsEntries = terms.entries();
    serializedTerms := Iter.toArray(termsEntries);

    let streakPEntries = streakPercentage.entries();
    serializedstreakPercentage := Iter.toArray(streakPEntries);

    let streakEntries = streak.entries();
    serializedstreak := Iter.toArray(streakEntries);

    let oisyEntries = oisyWallet.entries();
    serializedOisyWallet := Iter.toArray(oisyEntries);

    let accountLinksEntries = accountLinks.entries();
    serializedAccountLinks := Iter.toArray(accountLinksEntries);

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

    // Terms

    terms := TrieMap.TrieMap<Principal, Bool>(Principal.equal, Principal.hash);

    for ((principal, boolValue) in Iter.fromArray(serializedTerms)) {
      terms.put(principal, boolValue);
    };

    serializedTerms := [];

    streakPercentage := TrieMap.TrieMap<Principal, Nat>(Principal.equal, Principal.hash);

    for ((principal, natValue) in Iter.fromArray(serializedstreakPercentage)) {
      streakPercentage.put(principal, natValue);
    };

    serializedstreakPercentage := [];

    streak := TrieMap.TrieMap<Principal, Nat>(Principal.equal, Principal.hash);

    for ((principal, natValue) in Iter.fromArray(serializedstreak)) {
      streak.put(principal, natValue);
    };

    serializedstreak := [];

    oisyWallet := TrieMap.TrieMap<Principal, Principal>(Principal.equal, Principal.hash);

    for ((principal, principalValue) in Iter.fromArray(serializedOisyWallet)) {
      oisyWallet.put(principal, principalValue);
    };

    serializedOisyWallet := [];

    accountLinks := TrieMap.TrieMap<Principal, (Principal, Bool)>(Principal.equal, Principal.hash);

    for ((principal, pairValue) in Iter.fromArray(serializedAccountLinks)) {
      accountLinks.put(principal, pairValue);
    };

    serializedAccountLinks := [];

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

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      // Initialize variables to hold streak values for both principals
      var streakValueUser : Nat = 0;
      var streakValueUserId : Nat = 0;

      // Fetch streak for the resolved `user`
      switch (streak.get(user)) {
        case (?value) { streakValueUser := value };
        case null {};
      };

      // If `user` and `userId` are different, check streak for the original `userId`
      if (user != userId) {
        switch (streak.get(userId)) {
          case (?value) { streakValueUserId := value };
          case null {};
        };
      };

      // Return the higher of the two values
      if (streakValueUser >= streakValueUserId) {
        return streakValueUser;
      } else {
        return streakValueUserId;
      };
    };
    return 0;
  };

  public shared query (msg) func getUserStreakPercentage(userId : Principal) : async Nat {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      // Determine the effective user by checking account links.
      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (not isNFID) {
          user := linkedAcc;
        };
      };

      // Lookup streak percentage for the effective user.
      let userValue : Nat = switch (streakPercentage.get(user)) {
        case (?value) value;
        case null 0;
      };

      // If the effective user is the same as the original, return its value.
      if (user == userId) {
        return userValue;
      };

      // Otherwise, also lookup streak percentage for the original userId.
      let userIdValue : Nat = switch (streakPercentage.get(userId)) {
        case (?value) value;
        case null 0;
      };

      // Return the higher of the two values.
      return if (userValue > userIdValue) { userValue } else { userIdValue };
    };
    return 0;
  };

  public shared query (msg) func getUserAllStreak(userId : Principal) : async Types.SerializedUserStreak {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      var user = userId;
      let temp = accountLinks.get(userId);
      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (not isNFID) {
          user := linkedAcc;
        };
      };

      // This will hold the most recent (timestamp, streak) found so far.
      var mostRecent : ?(Int, Nat) = null;
      let entriesUS = userStreak.entries();

      // Check both resolved `user` and original `userId`
      let principalsToCheck = if (user == userId) { [user] } else {
        [user, userId];
      };

      for (principal in Iter.fromArray(principalsToCheck)) {
        for (entryUS in entriesUS) {
          if (entryUS.0 == principal) {
            let totalStreak = entryUS.1;
            for ((timestamp, streakValue) in totalStreak.entries()) {
              // If this entry is more recent than the current most recent, update it
              switch (mostRecent) {
                case null { mostRecent := ?(timestamp, streakValue) };
                case (?(currentTimestamp, _)) {
                  if (timestamp > currentTimestamp) {
                    mostRecent := ?(timestamp, streakValue);
                  };
                };
              };
            };
          };
        };
      };

      // If a most recent entry was found, return it inside a vector; otherwise, return empty
      switch (mostRecent) {
        case null {
          return [];
        };
        case (?recentEntry) {
          return [recentEntry];
        };
      };
    };

    return [];
  };

  public shared query (msg) func getAllUsersStreak() : async [(Principal, [(Int, Nat)])] {
    // Only admin can fetch all streaks:
    if (isAdmin(msg.caller)) {
      let entries = userStreak.entries();
      var result : [(Principal, [(Int, Nat)])] = [];

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

  public shared query (msg) func getUserStreakTime(userId : Principal) : async Int {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      // Resolve linked account if applicable
      var user = userId;
      let temp = accountLinks.get(userId);
      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      // Initialize separate tracking variables for both accounts
      var hasStartedUser = false;
      var hasStartedUserId = false;
      var lastTimestampUser : Int = 0;
      var lastTimestampUserId : Int = 0;

      let mainEntries = streak.entries();

      for (mainEntry in mainEntries) {
        let mainUserId = mainEntry.0;

        // Check for the linked account "user"
        if (user == mainUserId) {
          hasStartedUser := true;
          let entries = userStreak.entries();
          for (entry in entries) {
            let theUserId = entry.0;
            let theUserStreak = entry.1;
            if (theUserId == user) {
              let subEntries = theUserStreak.entries();
              for (subEntry in subEntries) {
                let timestampU = subEntry.0;
                if (timestampU > lastTimestampUser) {
                  lastTimestampUser := timestampU;
                };
              };
            };
          };
        };

        // Check for the original "userId"
        if (userId == mainUserId) {
          hasStartedUserId := true;
          let entries = userStreak.entries();
          for (entry in entries) {
            let theUserId = entry.0;
            let theUserStreak = entry.1;
            if (theUserId == userId) {
              let subEntries = theUserStreak.entries();
              for (subEntry in subEntries) {
                let timestampU = subEntry.0;
                if (timestampU > lastTimestampUserId) {
                  lastTimestampUserId := timestampU;
                };
              };
            };
          };
        };
      };

      // If neither account has started a streak, return 0.
      if (not hasStartedUser and not hasStartedUserId) {
        return 0;
      } else if (lastTimestampUser >= lastTimestampUserId) {
        return lastTimestampUser;
      } else {
        return lastTimestampUserId;
      };
    };

    return 0;
  };

  public shared (msg) func claimStreak(userId : Principal) : async (Text, Nat) {
    // Only allow if admin or (caller == userId and caller not anonymous)
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      let currentTime = Time.now();

      // STEP 1: Resolve "linked" accounts for both userId (user1) and msg.caller (user2)
      var user1 = userId;
      let temp1 = accountLinks.get(user1);
      if (temp1 != null) {
        let ?(linkedAcc1, isNFID1) = temp1;
        if (isNFID1 == false) {
          user1 := linkedAcc1;
        };
      };

      var user2 = msg.caller;
      let temp2 = accountLinks.get(user2);
      if (temp2 != null) {
        let ?(linkedAcc2, isNFID2) = temp2;
        if (isNFID2 == false) {
          user2 := linkedAcc2;
        };
      };

      // If both principals end up the same, we effectively only need to handle one.
      // But let's keep logic for both, in case user1 == user2 by coincidence.

      // STEP 2: Gather existing streak info for user1
      var hasStarted1 = false;
      var mainStreak1 : Nat = 0;
      var lastTimestamp1 : Int = 0;
      var chanceOfFail1 = false;
      var streakPercentage1 : Nat = 80; // default if not in the map

      // We'll also keep the userStreak map for user1 so we can update it
      var userStreakMap1 : TrieMap.TrieMap<Int, Nat> = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);
      do {
        let mainEntries1 = streak.entries();
        for (me in mainEntries1) {
          if (me.0 == user1) {
            hasStarted1 := true;
            mainStreak1 := me.1;
          };
        };
        let entries1 = userStreak.entries();
        for (e in entries1) {
          if (e.0 == user1) {
            userStreakMap1 := e.1;
            let subEntries1 = e.1.entries();
            for (se1 in subEntries1) {
              let timestampU1 = se1.0;
              if (timestampU1 > lastTimestamp1) {
                lastTimestamp1 := timestampU1;
              };
            };
          };
        };
        let decisiveEntries1 = streakPercentage.entries();
        for (de1 in decisiveEntries1) {
          if (de1.0 == user1) {
            chanceOfFail1 := true;
            streakPercentage1 := de1.1;
          };
        };
      };

      // STEP 3: Gather existing streak info for user2
      var hasStarted2 = false;
      var mainStreak2 : Nat = 0;
      var lastTimestamp2 : Int = 0;
      var chanceOfFail2 = false;
      var streakPercentage2 : Nat = 80; // default if not in the map

      var userStreakMap2 : TrieMap.TrieMap<Int, Nat> = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);
      do {
        let mainEntries2 = streak.entries();
        for (me2 in mainEntries2) {
          if (me2.0 == user2) {
            hasStarted2 := true;
            mainStreak2 := me2.1;
          };
        };
        let entries2 = userStreak.entries();
        for (e2 in entries2) {
          if (e2.0 == user2) {
            userStreakMap2 := e2.1;
            let subEntries2 = e2.1.entries();
            for (se2 in subEntries2) {
              let timestampU2 = se2.0;
              if (timestampU2 > lastTimestamp2) {
                lastTimestamp2 := timestampU2;
              };
            };
          };
        };
        let decisiveEntries2 = streakPercentage.entries();
        for (de2 in decisiveEntries2) {
          if (de2.0 == user2) {
            chanceOfFail2 := true;
            streakPercentage2 := de2.1;
          };
        };
      };

      // STEP 4: Determine "time window" state for each user
      // We'll define inWindowX = 1 => can't claim yet
      //                       = 2 => normal claim
      //                       = 3 => chance-of-fail window
      //                       = 4 => forced reset
      //                       = 5 => never started
      var inWindow1 = 0;
      if (hasStarted1) {
        if ((lastTimestamp1 + streakTimeNanos) > currentTime) {
          inWindow1 := 1;
        } else if ((lastTimestamp1 + streakTimeNanos) <= currentTime and currentTime < (lastTimestamp1 + (streakTimeNanos * 2))) {
          inWindow1 := 2;
        } else if ((lastTimestamp1 + (streakTimeNanos * 2)) <= currentTime and currentTime < (lastTimestamp1 + (streakTimeNanos * 3))) {
          inWindow1 := 3;
        } else if (currentTime >= (lastTimestamp1 + (streakTimeNanos * 3))) {
          inWindow1 := 4;
        };
      } else {
        inWindow1 := 5; // not started
      };

      var inWindow2 = 0;
      if (hasStarted2) {
        if ((lastTimestamp2 + streakTimeNanos) > currentTime) {
          inWindow2 := 1;
        } else if ((lastTimestamp2 + streakTimeNanos) <= currentTime and currentTime < (lastTimestamp2 + (streakTimeNanos * 2))) {
          inWindow2 := 2;
        } else if ((lastTimestamp2 + (streakTimeNanos * 2)) <= currentTime and currentTime < (lastTimestamp2 + (streakTimeNanos * 3))) {
          inWindow2 := 3;
        } else if (currentTime >= (lastTimestamp2 + (streakTimeNanos * 3))) {
          inWindow2 := 4;
        };
      } else {
        inWindow2 := 5; // not started
      };

      // STEP 5: Pick the "most favorable" outcome window
      // Rules summary:
      //  - if either user is in an earlier (better) window, we pick that for both
      //  - if one hasn't started (5) but the other has, keep the better scenario
      //  - if "one would reset" but the other wouldn't, do NOT reset
      //  - if "one is in normal claim" and the other is in chance-of-fail" => pick normal claim
      // We'll do this by picking the MIN of inWindow1 and inWindow2, with special checks for 5
      var finalWindow = 0;

      // Special handling if both are 5 => truly first time for both
      if (inWindow1 == 5 and inWindow2 == 5) {
        finalWindow := 5; // both are first-time
      } else if (inWindow1 == 5 and inWindow2 != 5) {
        // one is first time, the other is started => we do NOT forcibly start the first-time user if the other is in mid-streak
        // so we pick the other user's window
        finalWindow := inWindow2;
        // if inWindow2=1 => can't claim, etc.
        // no forced "5" start
        if (inWindow2 == 4) {
          // but if the other is forced reset, that's not "favorable."
          // We can never do worse than "can't claim yet," so let's see if that is better
          // We'll treat forced reset (4) as the worst scenario.
          // If user1 is truly new (5), that is ironically "better" than resetting from a big streak
          // but the instructions say "If one user is starting first time and the other isn't, don't start first time."
          // So we won't "upgrade" the other user from (4) to (5). We keep (4).
        };
      } else if (inWindow2 == 5 and inWindow1 != 5) {
        finalWindow := inWindow1;
        if (inWindow1 == 4) {
          // same note as above
        };
      } else {
        // Now both have started (none is 5) -> pick the smallest window number
        //  1 => can't claim
        //  2 => normal claim
        //  3 => chance fail
        //  4 => reset
        // The smaller number is better (1 is "can't claim" though, which doesn't help you earn minutes, but it's safer than '4' which resets)
        // But per your rules: "If one is in normal claim (2) and the other is in chance-of-fail (3), pick normal claim (2)."
        // "If one is in 2 and other is 4, pick 2 (don't reset)."
        // So effectively finalWindow = min(inWindow1, inWindow2)
        let minWin = if (inWindow1 < inWindow2) { inWindow1 } else { inWindow2 };
        if (minWin == 4) {
          // Check if the other is < 4; if so, we won't reset
          if ((inWindow1 == 4 and inWindow2 < 4) or (inWindow2 == 4 and inWindow1 < 4)) {
            finalWindow := if (inWindow1 < inWindow2) { inWindow1 } else {
              inWindow2;
            };
          } else {
            // both are 4 => we accept 4
            finalWindow := 4;
          };
        } else {
          finalWindow := minWin;
        };
      };

      // STEP 6: Now apply the "most favorable" streak logic:
      //  - Use the bigger of the two streaks
      var finalStreak = if (mainStreak1 > mainStreak2) { mainStreak1 } else {
        mainStreak2;
      };

      //  - If one has no chance of fail and the other does, ignore chance-of-fail
      var finalChanceOfFail = false;
      var finalStreakPercentage = 80;
      if ((chanceOfFail1 == false) or (chanceOfFail2 == false)) {
        // at least one has no chance => no chance
        finalChanceOfFail := false;
      } else {
        // both have a chance => pick the bigger percentage
        finalChanceOfFail := true;
        finalStreakPercentage := if (streakPercentage1 > streakPercentage2) {
          streakPercentage1;
        } else { streakPercentage2 };
      };

      // If *both* are truly new => finalWindow=5 => just do a first-time awarding
      if (finalWindow == 5) {
        // They are starting first time. Award 5 minutes
        // per your old logic: streak.put(user, 1); streakPercentage.put(user, 80) ...
        // but the instructions say "If one is new and the other isn't, don't do first time."
        // We only get finalWindow=5 if both are 5
        streak.put(user1, 1);
        streakPercentage.put(user1, 80);
        let firstStreak1 : TrieMap.TrieMap<Int, Nat> = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);
        firstStreak1.put(currentTime, 300);
        userStreak.put(user1, firstStreak1);

        streak.put(user2, 1);
        streakPercentage.put(user2, 80);
        let firstStreak2 : TrieMap.TrieMap<Int, Nat> = TrieMap.TrieMap<Int, Nat>(Int.equal, Int.hash);
        firstStreak2.put(currentTime, 300);
        userStreak.put(user2, firstStreak2);

        return ("You have earned 5 minutes!", 300);
      };

      if (finalWindow == 1) {
        // Means: "You can't claim your streak yet."
        return ("You can't claim your streak yet.", 0);
      } else if (finalWindow == 2) {
        // Normal claim => finalStreak + 1
        let newStreakVal = finalStreak + 1;
        streak.put(user1, newStreakVal);
        streak.put(user2, newStreakVal);

        // We'll add (300 + 300*newStreakVal) to both userStreak maps
        let earned = 300 + (300 * newStreakVal);
        let earnedText = Nat.toText(earned / 60); // old code used /60 => "in minutes"

        // user1
        let newStreakMap1 : TrieMap.TrieMap<Int, Nat> = userStreakMap1;
        newStreakMap1.put(currentTime, earned);
        userStreak.put(user1, newStreakMap1);
        // user2
        let newStreakMap2 : TrieMap.TrieMap<Int, Nat> = userStreakMap2;
        newStreakMap2.put(currentTime, earned);
        userStreak.put(user2, newStreakMap2);

        return ("You have earned " # earnedText # " minutes!", earned);
      } else if (finalWindow == 3) {
        // Chance of fail if finalChanceOfFail == true
        // If finalChanceOfFail == false => treat it like normal claim (2)
        if (finalChanceOfFail == false) {
          // same as normal claim
          let newStreakVal2 = finalStreak + 1;
          streak.put(user1, newStreakVal2);
          streak.put(user2, newStreakVal2);
          let earned2 = 300 + (300 * newStreakVal2);
          let earnedText2 = Nat.toText(earned2 / 60);

          let newStreakMap1b : TrieMap.TrieMap<Int, Nat> = userStreakMap1;
          newStreakMap1b.put(currentTime, earned2);
          userStreak.put(user1, newStreakMap1b);

          let newStreakMap2b : TrieMap.TrieMap<Int, Nat> = userStreakMap2;
          newStreakMap2b.put(currentTime, earned2);
          userStreak.put(user2, newStreakMap2b);

          return ("You have earned " # earnedText2 # " minutes!", earned2);
        } else {
          // Both have chance => finalStreakPercentage is the biggest
          let seed : Blob = await Random.blob();
          let randomNumber = Nat8.toNat(Random.byteFrom(seed) % 100);
          if (randomNumber < finalStreakPercentage) {
            // Success => continue streak
            let newStreakVal3 = finalStreak + 1;
            streak.put(user1, newStreakVal3);
            streak.put(user2, newStreakVal3);

            // reduce finalStreakPercentage by 25, but not below 1
            let newPerc = if (finalStreakPercentage > 25) {
              Nat.sub(finalStreakPercentage, 25);
            } else {
              1;
            };
            streakPercentage.put(user1, newPerc);
            streakPercentage.put(user2, newPerc);

            let earned3 = 300 + (300 * newStreakVal3);
            let earnedText3 = Nat.toText(earned3 / 60);

            let newMap1c : TrieMap.TrieMap<Int, Nat> = userStreakMap1;
            newMap1c.put(currentTime, earned3);
            userStreak.put(user1, newMap1c);

            let newMap2c : TrieMap.TrieMap<Int, Nat> = userStreakMap2;
            newMap2c.put(currentTime, earned3);
            userStreak.put(user2, newMap2c);

            return ("Your streak is ALIVE! You have earned " # earnedText3 # " minutes!", earned3);
          } else {
            // Failure => reset streak
            streak.put(user1, 1);
            streak.put(user2, 1);
            streakPercentage.put(user1, 80);
            streakPercentage.put(user2, 80);

            let resetMap1 : TrieMap.TrieMap<Int, Nat> = userStreakMap1;
            resetMap1.put(currentTime, 300);
            userStreak.put(user1, resetMap1);

            let resetMap2 : TrieMap.TrieMap<Int, Nat> = userStreakMap2;
            resetMap2.put(currentTime, 300);
            userStreak.put(user2, resetMap2);

            return ("Too bad, your past streak died. Starting again with 5 minutes...", 300);
          };
        };
      } else if (finalWindow == 4) {
        // Both ended up truly in reset window => reset
        streak.put(user1, 1);
        streak.put(user2, 1);
        streakPercentage.put(user1, 80);
        streakPercentage.put(user2, 80);

        let newMap1 : TrieMap.TrieMap<Int, Nat> = userStreakMap1;
        newMap1.put(currentTime, 300);
        userStreak.put(user1, newMap1);

        let newMap2 : TrieMap.TrieMap<Int, Nat> = userStreakMap2;
        newMap2.put(currentTime, 300);
        userStreak.put(user2, newMap2);

        return ("You have lost your past streak. Starting again with 5 minutes...", 300);
      };

      // If we get here, no relevant case matched - fallback
      return ("You can't claim your streak yet.", 0);
    };

    // Not authorized
    return ("", 0);
  };

  let oc = actor ("4bkt6-4aaaa-aaaaf-aaaiq-cai") : actor {
    award_external_achievement : (Types.AwardExternalAchievementArgs) -> async Types.AwardExternalAchievementResponse;
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

  public shared (msg) func updateUserProgress(userId : Principal, missionId : Nat, serializedProgress : Types.SerializedProgress) : async () {

    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller) and missionId == 1)) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      // Deserialize the progress object
      let progress = Serialization.deserializeProgress(serializedProgress);

      // Retrieve the user's missions or create a new TrieMap if it doesn't exist
      let missions = switch (userProgress.get(user)) {
        case (?map) map;
        case null TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
      };

      // Update the mission progress
      missions.put(missionId, progress);

      // Update the user's progress in the main TrieMap
      userProgress.put(user, missions);
      addTotalPointsToUser(user, progress.completionHistory[0].pointsEarned);
      userProgress.put(userId, missions);
      addTotalPointsToUser(userId, progress.completionHistory[0].pointsEarned);
    };
  };

  // Function to add points to the total points of a user

  private func addTotalPointsToUser(userId : Principal, points : Nat) : () {
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
              var totalPoints = user.totalPoints + points;
              var ocProfile = user.ocProfile;
              var ocCompleted = user.ocCompleted;
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

  // Function to Consume All Current Points

  public shared (msg) func useAllPoints(userId : Principal) : async () {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      var i = 0;
      while (i < Vector.size(users)) {
        switch (Vector.getOpt(users, i)) {
          case (?userF) {
            if (userF.id == user) {
              let updatedUser : Types.User = {
                id = userF.id;
                var twitterid = userF.twitterid;
                var twitterhandle = userF.twitterhandle;
                creationTime = userF.creationTime;
                var pfpProgress = userF.pfpProgress;
                var totalPoints = 0;
                var ocProfile = userF.ocProfile;
                var ocCompleted = userF.ocCompleted;
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

  // Function to get the progress of a specific mission for a user

  public shared query (msg) func getProgress(userId : Principal, missionId : Nat) : async ?Types.SerializedProgress {

    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      switch (userProgress.get(user)) {
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

  public shared query (msg) func getUserProgress(userId : Principal) : async ?[(Nat, Types.SerializedProgress)] {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      let userMissionsOpt = userProgress.get(user);

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

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      // Retrieve or initialize user's missions progress
      let userMissions = switch (userProgress.get(user)) {
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
      let size = Vector.size(missions);
      while (index < size and Option.isNull(missionOpt)) {
        let missionAtIndexOpt = Vector.get(missions, index);

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
      userProgress.put(user, userMissions);

      return true;
    };

    return false;
  };

  public shared query (msg) func canUserDoMission(userId : Principal, missionId : Nat) : async Bool {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      switch (userProgress.get(user)) {
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

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      for (mission in Vector.vals(missions)) {
        if (mission.id == missionId) {
          var thismission = mission;

          switch (userProgress.get(user)) {
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

  public shared query (msg) func isFullOc(userId : Principal) : async Nat {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      var i = 0;

      switch (userProgress.get(user)) {
        case (?userMissions) {
          switch (userMissions.get(10)) {
            case (?progress) {
              for (record in Iter.fromArray(progress.completionHistory)) {
                i := i + 1;
              };
            };
            case null {

            };
          };
        };
        case null {};
      };

      return i;
    };
    return 0;
  };

  public shared query (msg) func isRecOc(userId : Principal) : async Nat {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      var i = 0;

      switch (userProgress.get(user)) {
        case (?userMissions) {
          switch (userMissions.get(5)) {
            case (?progress) {
              for (record in Iter.fromArray(progress.completionHistory)) {
                i := i + 1;
              };
            };
            case null {

            };
          };
        };
        case null {};
      };

      return i;
    };
    return 0;
  };

  public shared (msg) func isOc(userId : Principal) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var userF = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          userF := linkedAcc;
        };
      };

      for (user in Vector.vals(users)) {
        if (user.id == userF) {
          let a = await isRecOc(userF);
          if (a >= 1) {
            // SET TO 3
            if (user.ocCompleted) {
              let b = await isFullOc(userF);
              if (b >= 1) {
                switch (user.ocProfile) {
                  case (?ocProfile) {
                    let achievement = {
                      achievement_id = Nat32.fromNat(2531583761);
                      user_id = Principal.fromText(ocProfile);
                    };
                    let response = await oc.award_external_achievement(achievement);
                    switch (response) {
                      case (#Success { remaining_chit_budget }) {
                        for (mission in Vector.vals(missions)) {
                          if (mission.id == 7 and mission.startDate <= Time.now()) {
                            let pointsEarnedOpt = getRandomNumberBetween(mission.mintime, mission.maxtime);
                            let firstMissionRecord : Types.SerializedMissionRecord = {
                              timestamp = Time.now();
                              pointsEarned = Int.abs(pointsEarnedOpt);
                              tweetId = null;
                            };
                            // Create progress for the first mission
                            let firstMissionProgress : Types.SerializedProgress = {
                              completionHistory = [firstMissionRecord];
                              usedCodes = [];
                            };
                            await updateUserProgress(userF, 7, firstMissionProgress);
                          };
                        };
                        return "Success";
                      };
                      case (#InvalidCaller) {
                        return "Invalid caller";
                      };
                      case (#NotFound) {
                        return "Achievement not found";
                      };
                      case (#AlreadyAwarded) {
                        for (mission in Vector.vals(missions)) {
                          if (mission.id == 7 and mission.startDate <= Time.now()) {
                            let pointsEarnedOpt = getRandomNumberBetween(mission.mintime, mission.maxtime);
                            let firstMissionRecord : Types.SerializedMissionRecord = {
                              timestamp = Time.now();
                              pointsEarned = Int.abs(pointsEarnedOpt);
                              tweetId = null;
                            };
                            // Create progress for the first mission
                            let firstMissionProgress : Types.SerializedProgress = {
                              completionHistory = [firstMissionRecord];
                              usedCodes = [];
                            };
                            await updateUserProgress(userF, 7, firstMissionProgress);
                          };
                        };
                        return "You have already done this mission (although it shouldn't be possible)";

                      };
                      case (#InsufficientBudget) {
                        return "Seconds Awarded! However, external budget is empty, so no external points to give on this Mission";
                      };
                      case (#Expired) {
                        return "This Mission is already over";
                      };
                    };
                  };
                  case null {
                    return "You have to log in into the OpenChat Frame first";
                  };
                };
              } else {
                return "You have to do the Main Retweet Mission";
              };
            } else {
              return "You have to join the OC Group";
            };
          } else {
            return "You have to complete 3 recursive retweet missions before doing this mission";
          };
        };
      };
    };
    return "";
  };

  // Get the total seconds of an user by Principal

  public shared query (msg) func getTotalSecondsForUser(userId : Principal) : async ?Nat {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var user = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          user := linkedAcc;
        };
      };

      let userMissionsOpt = userProgress.get(user);

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
            if (principal == user) {
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

  stable var missions : Vector.Vector<Types.Mission> = Vector.new<Types.Mission>();

  // Function to add or update a mission

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

  // Function to get all missions

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

  // Function to get a mission by ID

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

  // Function to reset all missions

  public shared (msg) func resetMissions() : async () {
    if (isAdmin(msg.caller)) {
      Vector.clear(missions); // Clear all missions
      missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash); // Clear all images in missionAssets
    };
    return;
  };

  // Function to count the number of users who have completed a specific mission

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

  //

  // User Management

  //

  // Registered Users

  stable var users : Vector.Vector<Types.User> = Vector.new<Types.User>();

  // Register an user by Principal

  public shared (msg) func addUser(userId : Principal) : async (?Types.SerializedUser) {

    let dummyUser : Types.User = {
      id = userId;
      var twitterid = null;
      var twitterhandle = null;
      creationTime = Time.now();
      var pfpProgress = "false";
      var totalPoints = 0;
      var ocProfile = null;
      var ocCompleted = false;
      var oisyWallet = null;
    };

    if ((isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) and not Vector.contains<Types.User>(users, dummyUser, func(a : Types.User, b : Types.User) : Bool { a.id == b.id })) {

      // Generate random points between 3600 and 21600
      let pointsEarnedOpt = getRandomNumberBetween(Vector.get(missions, 0).mintime, Vector.get(missions, 0).maxtime);

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

      await updateUserProgress(userId, 0, tempP);

      // Add the user to the users vector
      let newUser : Types.User = {
        id = userId;
        var twitterid = null;
        var twitterhandle = null;
        creationTime = Time.now();
        var pfpProgress = "false";
        var totalPoints = Int.abs(pointsEarnedOpt);
        var ocProfile = null;
        var ocCompleted = false;
        var oisyWallet = null;
      };
      Vector.add<Types.User>(users, newUser);
      return ?Serialization.serializeUser(newUser);
    };
    return null;
  };

  // Function to get all registered users

  public shared query (msg) func getUsers() : async [Types.SerializedUser] {
    if (isAdmin(msg.caller)) {
      return Array.map<Types.User, Types.SerializedUser>(Vector.toArray(users), Serialization.serializeUser);
    };
    return [];
  };

  // Function to get all users with the Profile Mission Pending

  public shared query (msg) func getPFPUsers() : async [Types.SerializedUser] {
    if (isAdmin(msg.caller)) {
      let usersArray = Vector.toArray(users);

      let filteredUsers = Array.filter<Types.User>(
        usersArray,
        func(user : Types.User) : Bool {
          return user.pfpProgress == "loading";
        },
      );

      // Map the filtered users to the serialized form
      return Array.map<Types.User, Types.SerializedUser>(filteredUsers, Serialization.serializeUser);
    };
    return [];
  };

  public shared (msg) func setOCMissionEnabled(userId : Principal) : async () {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var userF = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          userF := linkedAcc;
        };
      };

      var i = 0;
      while (i < Vector.size(users)) {
        switch (Vector.getOpt(users, i)) {
          case (?user) {
            switch (user.id) {
              case (id) {
                if (user.id == userF) {
                  let updatedUser : Types.User = {
                    id = user.id;
                    var twitterid = user.twitterid;
                    var twitterhandle = user.twitterhandle;
                    creationTime = user.creationTime;
                    var pfpProgress = user.pfpProgress;
                    var totalPoints = user.totalPoints;
                    var ocProfile = user.ocProfile;
                    var ocCompleted = true;
                  };
                  Vector.put(users, i, updatedUser);
                };
              };
            };
          };
          case _ {};
        };
        i += 1;
      };
    };
  };

  public shared (msg) func setOCMissionDisabled(userId : Principal) : async () {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var userF = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          userF := linkedAcc;
        };
      };

      var i = 0;
      while (i < Vector.size(users)) {
        switch (Vector.getOpt(users, i)) {
          case (?user) {
            switch (user.id) {
              case (id) {
                if (user.id == userF) {
                  let updatedUser : Types.User = {
                    id = user.id;
                    var twitterid = user.twitterid;
                    var twitterhandle = user.twitterhandle;
                    creationTime = user.creationTime;
                    var pfpProgress = user.pfpProgress;
                    var totalPoints = user.totalPoints;
                    var ocProfile = user.ocProfile;
                    var ocCompleted = false;
                  };
                  Vector.put(users, i, updatedUser);
                };
              };
            };
          };
          case _ {};
        };
        i += 1;
      };
    };
  };

  // Function to restore all users

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
        };

        // Add the new user to the vector

        Vector.add<Types.User>(users, newUser);
      };
    };
  };

  // Function to get All Users Progress

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

  // Function to get an specific User

  public shared query (msg) func getUser(userId : Principal) : async ?Types.SerializedUser {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var userF = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          userF := linkedAcc;
        };
      };

      for (user in Vector.vals(users)) {
        if (user.id == userF) {
          return ?Serialization.serializeUser(user);
        };
      };
    };
    return null;
  };

  // Function to check if a Twitter Id is already used

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

  // Function to get the Mission PFP Progress

  public shared query (msg) func getPFPProgress(userId : Principal) : async ?Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var userF = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          userF := linkedAcc;
        };
      };

      for (user in Vector.vals(users)) {
        if (user.id == userF) {
          return ?user.pfpProgress;
        };
      };
    };
    return null;
  };

  // Function to set the MIssion PFP Progress as Loading

  public shared (msg) func setPFPProgressLoading(userId : Principal) : async (Text) {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      var userF = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          userF := linkedAcc;
        };
      };

      func updateUserPFPProgress(targetUser : Principal) : Bool {
        var i = 0;
        while (i < Vector.size(users)) {
          switch (Vector.getOpt(users, i)) {
            case (?user) {
              if (user.id == targetUser) {
                let updatedUser : Types.User = {
                  id = user.id;
                  var twitterid = user.twitterid;
                  var twitterhandle = user.twitterhandle;
                  creationTime = user.creationTime;
                  var pfpProgress = "loading";
                  var totalPoints = user.totalPoints;
                  var ocProfile = user.ocProfile;
                  var ocCompleted = user.ocCompleted;
                };
                Vector.put(users, i, updatedUser);
                return true;
              };
            };
            case _ {};
          };
          i += 1;
        };
        return false;
      };

      let updatedF = updateUserPFPProgress(userF);

      var updatedId = false;

      if (userF != userId) {
        updatedId := updateUserPFPProgress(userId);
      };

      if (updatedF or updatedId) {
        return "loading";
      } else {
        return "false";
      };
    };
    return "false";
  };

  // Function to set the Mission PFP Progress

  public shared (msg) func setPFPProgress(userId : Principal) : async () {
    if (isAdmin(msg.caller)) {
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
                var pfpProgress = "verified";
                var totalPoints = user.totalPoints;
                var ocProfile = user.ocProfile;
                var ocCompleted = user.ocCompleted;
              };
              Vector.put(users, i, updatedUser);

              let pointsEarnedOpt = getRandomNumberBetween(Vector.get(missions, 2).mintime, Vector.get(missions, 2).maxtime);

              let firstMissionRecord : Types.SerializedMissionRecord = {
                timestamp = Time.now();
                pointsEarned = Int.abs(pointsEarnedOpt); // Convert to Nat using Int.abs
                tweetId = null; // No tweet associated with this mission
              };

              // Create progress for the first mission
              let firstMissionProgress : Types.SerializedProgress = {
                completionHistory = [firstMissionRecord];
                usedCodes = [];
              };

              await updateUserProgress(userId, 2, firstMissionProgress);
              return;
            };
          };
          case _ {};
        };
        i += 1;
      };
    };
  };

  // Function to add Twitter information to a user

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

  public shared (msg) func addOCProfile(userId : Principal, ocprofile : Text) : async () {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

      var userF = userId;
      let temp = accountLinks.get(userId);

      if (temp != null) {
        let ?(linkedAcc, isNFID) = temp;
        if (isNFID == false) {
          userF := linkedAcc;
        };
      };

      func updateUserOCProfile(targetUser : Principal, newOCProfile : Text) {
        var i = 0;
        while (i < Vector.size(users)) {
          switch (Vector.getOpt(users, i)) {
            case (?user) {
              if (user.id == targetUser) {
                let updatedUser : Types.User = {
                  id = user.id;
                  var twitterid = user.twitterid;
                  var twitterhandle = user.twitterhandle;
                  creationTime = user.creationTime;
                  var pfpProgress = user.pfpProgress;
                  var totalPoints = user.totalPoints;
                  var ocProfile = ?newOCProfile;
                  var ocCompleted = user.ocCompleted;
                };
                Vector.put(users, i, updatedUser);
              };
            };
            case _ {};
          };
          i += 1;
        };
      };

      updateUserOCProfile(userF, ocprofile);

      if (userF != userId) {
        updateUserOCProfile(userId, ocprofile);
      };

    };
  };

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
      Vector.clear(users);
      userProgress := TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);
      oisyWallet := TrieMap.TrieMap<Principal, Principal>(Principal.equal, Principal.hash);
      return;
    };
  };

  public shared (msg) func resetallProgress() : async () {
    if (isAdmin(msg.caller)) {
      userProgress := TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);
      return;
    };
  };

  // Function to reset a specific Mission Progress for an user

  public shared (msg) func resetUserMissionProgress(userId : Principal, missionId : Nat) : async () {
    if (isAdmin(msg.caller)) {
      let userMissions = switch (userProgress.get(userId)) {
        case (?progress) progress;
        case null return;
      };

      userMissions.delete(missionId);
      userProgress.put(userId, userMissions);
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

            await updateUserProgress(userId, 11, nuanceProgress);
            serializedNuanceUsers := Array.append<(Principal, Text)>(serializedNuanceUsers, [(userId, username)]);
            return true;
          };
          case null return false;
        };
      };
    };
    return false;
  };

};
