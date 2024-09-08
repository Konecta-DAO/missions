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

  // Upgrade Functions

  //

  // Pre-upgrade function to serialize the user progress

  system func preupgrade() {

    // Serialize user progress
    let entries = Iter.toArray(userProgress.entries());
    var serializedEntries : [(Principal, [(Nat, Types.SerializedProgress)])] = [];

    for (entry in entries.vals()) {
      let (userId, userMissions) = entry;
      let serializedMissions = Iter.toArray(userMissions.entries());
      var serializedMissionEntries : [(Nat, Types.SerializedProgress)] = [];

      for (missionEntry in serializedMissions.vals()) {
        let (missionId, progress) = missionEntry;

        let serializedProgress = {
          completionHistory = Array.map<Types.MissionRecord, Types.SerializedMissionRecord>(progress.completionHistory, func(record : Types.MissionRecord) : Types.SerializedMissionRecord { { timestamp = record.timestamp; pointsEarned = record.pointsEarned; tweetId = record.tweetId } });
          usedCodes = Iter.toArray(progress.usedCodes.entries());
        };

        serializedMissionEntries := Array.append(serializedMissionEntries, [(missionId, serializedProgress)]);
      };

      serializedUserProgress := Array.append(serializedEntries, [(userId, serializedMissionEntries)]);
    };

    // Serialize mission assets
    let missionAssetsEntries = Iter.toArray(missionAssets.entries());
    serializedMissionAssets := missionAssetsEntries;

    // Serialize user pictures
    let userPicturesEntries = Iter.toArray(userPictures.entries());
    serializedUserPictures := userPicturesEntries;
  };

  // Post-upgrade function to deserialize the user progress

  system func postupgrade() {

    // Initialize the new userProgress TrieMap
    userProgress := TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);

    // Iterate over the serialized user progress data
    for (entry in serializedUserProgress.vals()) {
      let (userId, serializedMissions) = entry;
      let userMissions = TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);

      // Iterate over each serialized mission progress
      for (missionEntry in serializedMissions.vals()) {
        let (missionId, serializedProgress) = missionEntry;

        // Deserialize the Progress object
        let progress = {
          var completionHistory = Array.map<Types.SerializedMissionRecord, Types.MissionRecord>(serializedProgress.completionHistory, func(record : Types.SerializedMissionRecord) : Types.MissionRecord { { var timestamp = record.timestamp; var pointsEarned = record.pointsEarned; var tweetId = record.tweetId } });
          var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
        };

        // Deserialize the usedCodes
        for (codeEntry in serializedProgress.usedCodes.vals()) {
          let (code, used) = codeEntry;
          progress.usedCodes.put(code, used);
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

    // Deserialize the user pictures
    userPictures := TrieMap.TrieMap<Principal, Bool>(Principal.equal, Principal.hash);

    for (pictureEntry in serializedUserPictures.vals()) {
      let (userId, hasPicture) = pictureEntry;
      userPictures.put(userId, hasPicture);
    };
  };

  //

  // Twitter related functions

  //

  // Twitter Stuff
  stable var twitterStuff : [Text] = ["#Konecta"];

  // Function to get the Twitter Stuff
  public func getTwitterStuff() : async [Text] {
    return twitterStuff;
  };

  // Function to add Twitter Stuff
  public func addTwitterStuff(newStuff : Text) : async () {
    twitterStuff := Array.append(twitterStuff, [newStuff]);
  };

  //

  // Admin Management

  //

  // Admin IDs

  stable var adminIds : [Principal] = [];

  // Function to add an admin ID

  public func addAdminId(newAdminId : Principal) : async () {
    adminIds := Array.append<Principal>(adminIds, [newAdminId]);
  };

  // Function to check if the principal is an admin

  public query func isAdmin(principalId : Principal) : async Bool {
    return Array.find<Principal>(
      adminIds,
      func(id) : Bool {
        id == principalId;
      },
    ) != null;
  };

  // Function to get all admin IDs

  public query func getAdminIds() : async [Principal] {
    return adminIds;
  };

  // Function to remove an admin ID

  public func removeAdminId(adminId : Principal) : async () {
    adminIds := Array.filter<Principal>(adminIds, func(id) : Bool { id != adminId });
  };

  //

  // User Progress & Code Submission

  //

  // TrieMap to store the progress of each user's missions

  private var userProgress : TrieMap.TrieMap<Principal, Types.UserMissions> = TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);

  // Stable storage for serialized data

  stable var serializedUserProgress : [(Principal, [(Nat, Types.SerializedProgress)])] = [];

  // Function to record or update progress on a mission

  public shared func updateUserProgress(userId : Principal, missionId : Nat, serializedProgress : Types.SerializedProgress) : async (Bool) {
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

    return true;
  };

  // Function to get the progress of a specific mission for a user

  public query func getProgress(userId : Principal, missionId : Nat) : async ?Types.SerializedProgress {
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

  public shared func getUserProgress(userId : Principal) : async ?[(Nat, Types.SerializedProgress)] {
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

  // Function to add a secret code to a user's progress for the mission

  public shared func submitCode(userId : Principal, missionId : Nat, code : Text) : async Bool {

    // Retrieve user's missions progress
    let userMissions = switch (userProgress.get(userId)) {
      case (?progress) progress;
      case null return false; // User progress not found
    };

    // Retrieve the mission progress
    let missionProgress = switch (userMissions.get(missionId)) {
      case (?progress) progress;
      case null return false; // Mission progress not found
    };

    // Retrieve the mission details from the missions vector
    let missionOpt = Vector.get(missions, missionId);
    let mission = switch (missionOpt) {
      case (m) m;
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

    // Update the mission progress with the earned points
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

  // Get the total seconds of an user by Principal

  public query func getTotalSecondsForUser(userId : Principal) : async ?Nat {
    // Retrieve the user's mission progress from userProgress
    let userMissionsOpt = userProgress.get(userId);

    // If the user does not exist, return null
    let userMissions = switch (userMissionsOpt) {
      case null return null; // User not found
      case (?missions) missions; // User found, continue
    };

    // Initialize a variable to keep track of total seconds
    var totalSeconds : Nat = 0;

    // Iterate through all missions for the user
    for ((missionId, progress) in userMissions.entries()) {
      // Iterate through the completion history of the mission
      for (record in progress.completionHistory.vals()) {
        totalSeconds += record.pointsEarned;
      };
    };

    return ?totalSeconds; // Return the total seconds
  };

  //

  // Image & Media Handling

  //

  // Mission Assets

  var missionAssets : TrieMap.TrieMap<Text, Blob> = TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash);

  // Stable storage for serialized mission assets

  stable var serializedMissionAssets : [(Text, Blob)] = [];

  // TrieMap for checking if an user did the picture mission

  var userPictures : TrieMap.TrieMap<Principal, Bool> = TrieMap.TrieMap<Principal, Bool>(Principal.equal, Principal.hash);

  // Stable storage for serialized user pictures

  stable var serializedUserPictures : [(Principal, Bool)] = [];

  // Function to check if an user has done the picture mission

  public query func getUserPicture(userId : Principal) : async Bool {
    return switch (userPictures.get(userId)) {
      case (?didthem) didthem;
      case null false;
    };
  };

  // Function to set the user picture mission as done

  public func setUserPicture(userId : Principal, didthem : Bool) : async () {
    userPictures.put(userId, didthem);
  };

  // Generate a unique image identifier using a combination of timestamp and hash

  func generateUniqueIdentifier(imageName : Text) : Text {
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

  public shared func uploadMissionImage(imageName : Text, imageContent : Blob) : async Text {
    let directory = "/missionassets/";

    // Generate a unique image name using the timestamp and hash
    let uniqueImageName = generateUniqueIdentifier(imageName);
    let url = directory # uniqueImageName;

    // Store the image content associated with the unique URL
    missionAssets.put(url, imageContent);

    return url;
  };

  //

  // Mission Management

  //

  // Mission List

  stable var missions : Vector.Vector<Types.Mission> = Vector.new<Types.Mission>();

  // Function to add or update a mission

  public shared func addOrUpdateMission(newMission : Types.SerializedMission) : async Bool {
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

    return true;
  };

  // Function to get all missions (serialized)

  public query func getAllMissions() : async [Types.SerializedMission] {
    return Array.map<Types.Mission, Types.SerializedMission>(
      Vector.toArray(missions),
      Serialization.serializeMission,
    );
  };

  // Function to get a mission by ID

  public query func getMissionById(id : Nat) : async ?Types.SerializedMission {
    for (mission in Vector.vals(missions)) {
      if (mission.id == id) {
        return ?Serialization.serializeMission(mission);
      };
    };
    return null;
  };

  // Function to get the max and min seconds a Mission can give

  public query func getMaxMinSecs(id : Nat) : async (Int, Int) {
    for (mission in Vector.vals(missions)) {
      if (mission.id == id) {
        return ((mission.mintime, mission.maxtime));
      };
    };
    return (0, 0); // Default return value if mission not found
  };

  // Function to reset all missions

  public func resetMissions() : async () {
    Vector.clear(missions); // Clear all missions
    missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash); // Clear all images in missionAssets
  };

  // Function to count the number of users who have completed a specific mission

  public query func countUsersWhoCompletedMission(missionId : Nat) : async Nat {
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
          // The user hasn't started this mission
        };
      };
    };

    return count;
  };

  //

  // User Management

  //

  // Registered Users

  stable var users : Vector.Vector<Types.User> = Vector.new<Types.User>();

  // Register an user by Principal

  public func addUser(id : Principal) : async () {

    // Initialize new user's mission progress
    var newUserMissions : Types.UserMissions = TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);

    // Complete the first mission automatically
    let missionId : Nat = 0; // Assuming 0 is the first mission ID

    // Generate random points between 3600 and 21600
    let pointsEarnedOpt = getRandomNumberBetween(Vector.get(missions, 1).mintime, Vector.get(missions, 1).maxtime);

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

    // Add the first mission progress to the user's missions
    newUserMissions.put(missionId, firstMissionProgress);

    // Add the user's progress to the global userProgress
    userProgress.put(id, newUserMissions);

    // Add the user to the users vector
    let newUser : Types.User = {
      id = id;
      var twitterid = null;
      var twitterhandle = null;
      creationTime = Time.now();
    };
    Vector.add<Types.User>(users, newUser);
  };

  // Function to get all registered users

  public query func getUsers() : async [Types.SerializedUser] {
    return Array.map<Types.User, Types.SerializedUser>(
      Vector.toArray(users),
      Serialization.serializeUser,
    );
  };

  public query func getUser(id : Principal) : async ?Types.SerializedUser {
    for (user in Vector.vals(users)) {
      if (user.id == id) {
        return ?Serialization.serializeUser(user);
      };
    };
    return null;
  };

  // Function to add Twitter information to a user

  public shared func addTwitterInfo(principalId : Principal, twitterId : Nat, twitterHandle : Text) : async () {
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

  public shared func setPTW(payloadArray : [Text]) : async Text {
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

  // Function to upload Retweet Id

  public shared func postRT(payload : Text) : async Text {
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

  public func resetall() : async () {
    Vector.clear(users);
    userProgress := TrieMap.TrieMap<Principal, Types.UserMissions>(Principal.equal, Principal.hash);
    return;
  };

  // Function to reset an user Progress

  public func resetUserProgress(userId : Principal) : async () {
    userProgress.delete(userId);
    return;
  };

  // Function to reset a specific Mission Progress for an user

  public func resetUserMissionProgress(userId : Principal, missionId : Nat) : async () {
    let userMissions = switch (userProgress.get(userId)) {
      case (?progress) progress;
      case null return;
    };

    userMissions.delete(missionId);
    userProgress.put(userId, userMissions);
    return;
  };

  // Function to get trusted origins for NFID authentication

  public shared query func icrc28_trusted_origins() : async Types.Icrc28TrustedOriginsResponse {
    let trustedOrigins = [
      "https://okowr-oqaaa-aaaag-qkedq-cai.icp0.io", // Frontend Canister to auth NFID
      "https://pre.konecta.one", // Domain
      "https://apcy6-tiaaa-aaaag-qkfda-cai.icp0.io", // Admin Frontend Canister to auth NFID
      "https://adminpre.konecta.one", // Admin Domain
    ];
    return { trusted_origins = trustedOrigins };
  };

  // Security function to transform the response

  public query func transform(raw : Types.TransformArgs) : async Types.CanisterHttpResponsePayload {
    let transformed : Types.CanisterHttpResponsePayload = {
      status = raw.response.status;
      body = raw.response.body;
      headers = [
        {
          name = "Content-Security-Policy";
          value = "default-src 'self'";
        },
        { name = "Referrer-Policy"; value = "strict-origin" },
        { name = "Permissions-Policy"; value = "geolocation=(self)" },
        {
          name = "Strict-Transport-Security";
          value = "max-age=63072000";
        },
        { name = "X-Frame-Options"; value = "DENY" },
        { name = "X-Content-Type-Options"; value = "nosniff" },
      ];
    };
    transformed;
  };

  // Function to check if the middleman server is reachable

  public func isMiddlemanReachable() : async Bool {
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
};
