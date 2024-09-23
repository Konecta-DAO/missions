import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Types "Types";
import Serialization "Serialization";
import Array "mo:base/Array";
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
actor class Backend() {

  //

  // Upgrade And Restore Functions

  //

  // TrieMap to store the progress of each user's missions

  private var userProgress : TrieMap.TrieMap<Principal, Types.UserMissions> = TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);

  // Stable storage for serialized data

  stable var serializedUserProgress : [(Principal, [(Nat, Types.SerializedProgress)])] = [];

  // Restore Function

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

  };

  let oc = actor ("7njde-waaaa-aaaaf-ab2ca-cai") : actor {
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

  // Function to get all admin IDs

  public shared query (msg) func getAdminIds() : async [Principal] {
    if (isAdmin(msg.caller)) {
      return adminIds;
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
                var totalPoints = 0;
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

  // Function to get the progress of a specific mission for a user

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

  // Function to get the progress of all missions for a user

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

  // Function to add a secret code to a user's progress for the mission

  public shared (msg) func submitCode(userId : Principal, missionId : Nat, code : Text) : async Bool {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      // Retrieve or initialize user's missions progress
      let userMissions = switch (userProgress.get(userId)) {
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

      // Retrieve the mission details from the missions vector using getOpt
      let missionOpt : ?Types.Mission = Vector.getOpt(missions, missionId);
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
      userProgress.put(userId, userMissions);

      return true;
    };

    return false;
  };

  // Function to check Mission #7

  public shared (msg) func isOc(userId : Principal) : async Text {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      for (user in Vector.vals(users)) {
        if (user.id == userId) {
          if (user.ocCompleted) {
            let achievement = {
              achievement_id = Nat32.fromNat(1234);
              user_id = userId;
            };
            let response = await oc.award_external_achievement(achievement);
            switch (response) {
              case (#Success { remaining_budget }) {
                return "Success";
                cBudget := remaining_budget;
              };
              case (#InvalidCaller) {};
              case (#NotFound) {};
              case (#AlreadyAwarded) {
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
        };
      };
    };
    return "";
  };

  // Get the total seconds of an user by Principal

  public shared query (msg) func getTotalSecondsForUser(userId : Principal) : async ?Nat {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      for (user in Vector.vals(users)) {
        if (user.id == userId) {
          return ?user.totalPoints;
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

  // Budget for Mission 7

  stable var cBudget : Nat32 = 0;

  // Get Budget from Mission 7

  public shared query (msg) func getcBudget() : async Nat32 {
    if (isAdmin(msg.caller)) {
      return cBudget;
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
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

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
      for (user in Vector.vals(users)) {
        if (user.id == userId) {
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
      for (user in Vector.vals(users)) {
        if (user.id == userId) {
          return ?user.pfpProgress;
        };
      };
    };
    return null;
  };

  // Function to set the MIssion PFP Progress as Loading

  public shared (msg) func setPFPProgressLoading(userId : Principal) : async (Text) {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
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
                var pfpProgress = "loading";
                var totalPoints = user.totalPoints;
                var ocProfile = user.ocProfile;
                var ocCompleted = user.ocCompleted;
              };
              Vector.put(users, i, updatedUser);
              return "loading";
            };
          };
          case _ {};
        };
        i += 1;
      };
    };
    return "false";
  };

  // Function to set the MIssion PFP Progress

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

  //

  // Http Request and Cycles

  //

  // Http Request Function

  public query func http_request(req : Types.HttpRequest) : async Types.HttpResponse {

    let path = req.url;

    // Check if the path is directly in missionAssets (which includes the full path)
    switch (missionAssets.get(path)) {
      case (?fileBlob) {
        return {
          status_code = 200;
          headers = [("Content-Type", "image/png")];
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

};
