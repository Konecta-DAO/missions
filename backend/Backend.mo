import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Types "Types";
import Serialization "Serialization";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Random "mo:base/Random";
import Vector "mo:vector";
import Serde "mo:serde";
import Blob "mo:base/Blob";
import Int "mo:base/Int";
import Hash "mo:base/Hash";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";

actor class Backend() {

  // Mission Related functions
  type UserMissions = TrieMap.TrieMap<Nat, Types.Progress>;

  // Stable storage for serialized data
  stable var serializedUserProgress : [(Text, [(Nat, Types.SerializedProgress)])] = [];

  // Comparison and hash functions for Text-based UserId
  private func compareUserId(id1 : Text, id2 : Text) : Bool {
    id1 == id2;
  };

  private func hashUserId(id : Text) : Hash.Hash {
    Text.hash(id);
  };

  // TrieMap to store the progress of each user's missions
  private var userProgress : TrieMap.TrieMap<Text, UserMissions> = TrieMap.TrieMap<Text, UserMissions>(compareUserId, hashUserId);

  // Serialize the user progress before upgrading
  system func preupgrade() {
    let entries = Iter.toArray(userProgress.entries());
    var serializedEntries : [(Text, [(Nat, Types.SerializedProgress)])] = [];
    for (entry in entries.vals()) {
      let (userId, userMissions) = entry;
      let serializedMissions = Iter.toArray(userMissions.entries());
      var serializedMissionEntries : [(Nat, Types.SerializedProgress)] = [];
      for (missionEntry in serializedMissions.vals()) {
        let (missionId, progress) = missionEntry;
        serializedMissionEntries := Array.append(serializedMissionEntries, [(missionId, { done = progress.done; timestamp = progress.timestamp; totalearned = progress.totalearned; amountOfTimes = progress.amountOfTimes; usedCodes = Iter.toArray(progress.usedCodes.entries()) })]);
      };
      serializedEntries := Array.append(serializedEntries, [(userId, serializedMissionEntries)]);
    };
    serializedUserProgress := serializedEntries;
  };

  // Deserialize the user progress after upgrading
  system func postupgrade() {
    userProgress := TrieMap.TrieMap<Text, UserMissions>(compareUserId, hashUserId);
    for (entry in serializedUserProgress.vals()) {
      let (userId, serializedMissions) = entry;
      let userMissions = TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
      for (missionEntry in serializedMissions.vals()) {
        let (missionId, serializedProgress) = missionEntry;
        let progress = {
          var done = serializedProgress.done;
          var timestamp = serializedProgress.timestamp;
          var totalearned = serializedProgress.totalearned;
          var amountOfTimes = serializedProgress.amountOfTimes;
          var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
        };
        for (codeEntry in serializedProgress.usedCodes.vals()) {
          let (code, used) = codeEntry;
          progress.usedCodes.put(code, used);
        };
        userMissions.put(missionId, progress);
      };
      userProgress.put(userId, userMissions);
    };
  };

  // Admin IDs
  stable var adminIds : [Text] = [];

  // Function to check if the principalId is an admin
  public query func isAdmin(principalId : Text) : async Bool {
    return Array.find<Text>(
      adminIds,
      func(id) : Bool {
        id == principalId;
      },
    ) != null;
  };

  // Function to add a new admin ID
  public func addAdminId(newAdminId : Text) : async () {
    adminIds := Array.append<Text>(adminIds, [newAdminId]);
  };

  // Function to get all admin IDs
  public query func getAdminIds() : async [Text] {
    return adminIds;
  };

  // Function to remove an admin ID
  public func removeAdminId(adminId : Text) : async () {
    adminIds := Array.filter<Text>(adminIds, func(id) : Bool { id != adminId });
  };

  // Registered Users
  stable var users : Vector.Vector<Types.User> = Vector.new<Types.User>();

  // Mission List
  stable var missions : Vector.Vector<Types.Mission> = Vector.new<Types.Mission>();

  // Function to record or update progress on a mission
  public shared func updateUserProgress(
    userId : Text,
    missionId : Nat,
    serializedProgress : Types.SerializedProgress,
  ) : async () {
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
  };

  // Function to get the progress of a specific mission for a user
  public query func getProgress(userId : Text, missionId : Nat) : async ?Types.SerializedProgress {
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

  // Function to add a secret code to a user's progress for the mission
  public func submitSecretCode(userId : Text, code : Text) : async Bool {
    let missionId : Nat = 5; // Fixed missionId

    var progress : Types.Progress = switch (userProgress.get(userId)) {
      case (?missions) switch (missions.get(missionId)) {
        case (?prog) prog;
        case null {
          var progress : Types.Progress = {
            var done = false;
            var timestamp = 0;
            var totalearned = 0;
            var amountOfTimes = 0;
            var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
          };
          progress;
        };
      };
      case null {
        var progress : Types.Progress = {
          var done = false;
          var timestamp = 0;
          var totalearned = 0;
          var amountOfTimes = 0;
          var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
        };
        progress;
      };
    };

    // Check if the code has already been used
    if (progress.usedCodes.get(code) != null) {
      return false; // Code has already been used
    } else {
      // Update progress
      progress.usedCodes.put(code, true);
      progress.amountOfTimes += 1;
      progress.timestamp := Time.now(); // Update the timestamp
      progress.totalearned += 100; // Example: Earn 100 seconds or points for each code

      // Save updated progress
      var missions = switch (userProgress.get(userId)) {
        case (?map) map;
        case null TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
      };
      missions.put(missionId, progress);
      userProgress.put(userId, missions);

      return true;
    };
  };

  // Function to get the total earned seconds on a specific mission for a user
  public query func getTotalEarned(userId : Text, missionId : Nat) : async ?Nat {
    switch (userProgress.get(userId)) {
      case (?missions) {
        switch (missions.get(missionId)) {
          case (?progress) return ?progress.totalearned;
          case null return null;
        };
      };
      case null return null;
    };
  };

  // Tweets per Users
  private var tweets : TrieMap.TrieMap<Text, TrieMap.TrieMap<Nat, Nat>> = TrieMap.TrieMap<Text, TrieMap.TrieMap<Nat, Nat>>(Text.equal, Text.hash);

  // Add a tweet for a user
  public func addTweet(userId : Text, tweetId : Nat) : async () {
    let userTweets = switch (tweets.get(userId)) {
      case (?map) map;
      case null TrieMap.TrieMap<Nat, Nat>(Nat.equal, Hash.hash);
    };
    let tweetCount = userTweets.size();
    userTweets.put(tweetCount, tweetId);
    tweets.put(userId, userTweets);
  };

  // Get all tweets for a user
  public func getTweets(userId : Text) : async ?[(Nat, Nat)] {
    switch (tweets.get(userId)) {
      case (?userTweets) return ?Iter.toArray(userTweets.entries());
      case null return null;
    };
  };

  // Function to add a new mission
  public func addMission(id : Nat, mode : Nat, description : Text, obj1 : Text, newobj2 : Text, recursive : Bool, maxtime : Int, image : [Nat8], functionName1 : Text, newfunctionName2 : Text) : async () {

    var obj2 : Text = "";
    var functionName2 : Text = "";
    if (mode != 0) {
      obj2 := newobj2;
      functionName2 := newfunctionName2;
    };

    let newMission : Types.Mission = {
      id;
      var mode;
      var description;
      var obj1;
      var obj2;
      var recursive;
      var maxtime;
      var image;
      var functionName1;
      var functionName2;
    };
    Vector.add(missions, newMission);
  };

  // Function to get the number of missions available
  public query func getNumberOfMissions() : async Nat {
    return Vector.size(missions);
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

  public query func countCompletedUsers(missionId : Nat) : async Nat {
    var count : Nat = 0;
    for ((userId, missions) in userProgress.entries()) {
      switch (missions.get(missionId)) {
        case (?progress) {
          if (progress.done) {
            count += 1;
          };
        };
        case null {};
      };
    };
    return count;
  };

  // Register an user by Principalid
  public func addUser(id : Text) : async () {
    let twitterid : Nat = 0;
    let twitterhandle : Text = "";
    let creationTime = Time.now();
    let randomNumberOpt = await getRandomNumber();
    let seconds : Nat = switch (randomNumberOpt) {
      case (?value) value;
      case null 3600; // Default value if random number generation fails
    };
    let newuser : Types.User = {
      id;
      var seconds;
      var twitterid;
      var twitterhandle;
      creationTime;
    };
    Vector.add(users, newuser);
    let usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
    let serializedProgress : Types.SerializedProgress = {
      done = true;
      timestamp = creationTime;
      totalearned = seconds;
      amountOfTimes = 1;
      usedCodes = Iter.toArray(usedCodes.entries());
    };
    await updateUserProgress(id, 0, serializedProgress);
  };

  // Function to get all registered users
  public query func getUsers() : async [Types.SerializedUser] {
    return Array.map<Types.User, Types.SerializedUser>(
      Vector.toArray(users),
      Serialization.serializeUser,
    );
  };

  // Function to generate a random number between 3600 and 21600
  public func getRandomNumber() : async ?Nat {
    let random = Random.Finite(await Random.blob());
    let range : Nat = 21600 - 3600 + 1;
    let randomValue = random.range(32); // Adjust the range as needed
    switch (randomValue) {
      case (?value) {
        return ?(value % range + 3600);
      };
      case null {
        return null;
      };
    };
  };

  // Get the total seconds of an user by Principalid
  public query func getTotalSeconds(id : Text) : async Nat {
    for (user in Vector.vals(users)) {
      if (user.id == id) {
        return user.seconds;
      };
    };
    return 0;
  };

  // Function to get all registered Principal IDs
  public query func getIds() : async [Text] {
    var ids : [Text] = [];
    for (user in Vector.vals(users)) {
      ids := Array.append<Text>(ids, [user.id]);
    };
    return ids;
  };

  public func verifyFollow(userid : Text) : async Bool {
    let ic : Types.IC = actor ("aaaaa-aa");
    let host : Text = "do.konecta.one";
    let url = "https://" # host # "/verifyFollow?userid=" # userid;

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

    Cycles.add<system>(22_935_266_640);

    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

    let follows = switch (http_response.status) {
      case (200) {
        let body = Blob.fromArray(http_response.body);
        let decodedBody = Text.decodeUtf8(body);

        switch (decodedBody) {
          case (?text) {
            // Handle the result from JSON parsing
            switch (Serde.JSON.fromText(text, null)) {
              case (#ok(blob)) {
                let followInfo : ?{ follows : Bool } = from_candid (blob);

                switch (followInfo) {
                  case (?{ follows = true }) true;
                  case _ false;
                };
              };
              case (#err(_)) false; // Handle JSON parsing error by returning false
            };
          };
          case null false; // Handle case where the body is not valid UTF-8
        };
      };
      case _ false; // Handle non-200 status codes
    };
    return follows;
  };

  public shared func handleTwitterCallback(principalId : Text, oauthToken : Text, oauthVerifier : Text) : async ?Types.SerializedUser {
    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. SETUP ARGUMENTS FOR HTTP POST request to get Twitter user info
    let host : Text = "do.konecta.one";
    let url = "https://" # host # "/getTwitterUser";

    let body = Text.concat("{\"oauthToken\": \"", Text.concat(oauthToken, Text.concat("\", \"oauthVerifier\": \"", Text.concat(oauthVerifier, "\"}"))));
    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = [
        { name = "Host"; value = host },
        { name = "Content-Type"; value = "application/json" },
      ];
      body = ?Blob.toArray(Text.encodeUtf8(body));
      method = #post;
      transform = null;
    };

    // Add sufficient cycles for the HTTP request
    Cycles.add<system>(22_935_266_640);

    // Make the HTTP request and wait for the response
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

    // Check if the response status is 200 (OK) and parse the response body
    if (http_response.status == 200) {
      let body = Blob.fromArray(http_response.body);
      let decodedBody = Text.decodeUtf8(body);

      switch (decodedBody) {
        case (?responseBody) {
          switch (Serde.JSON.fromText(responseBody, null)) {
            case (#ok(blob)) {
              let userInfo : ?{ id_str : Text; screen_name : Text } = from_candid (blob);

              switch (userInfo) {
                case (?info) {
                  var i = 0;
                  while (i < Vector.size(users)) {
                    switch (Vector.getOpt(users, i)) {
                      case (?user) {
                        if (user.id == principalId) {
                          let twitterid : Nat = switch (Nat.fromText(info.id_str)) {
                            case (?nat) nat;
                            case null 0;
                          };

                          let updatedUser : Types.User = {
                            id = user.id;
                            var seconds = user.seconds;
                            var twitterid = twitterid;
                            var twitterhandle = info.screen_name;
                            creationTime = user.creationTime;
                          };

                          // Update the user in the vector
                          Vector.put(users, i, updatedUser);
                          return ?Serialization.serializeUser(updatedUser);
                        };
                      };
                      case _ {};
                    };
                    i += 1;
                  };
                  return null;
                };
                case _ {
                  return null;
                };
              };
            };
            case (#err(_)) {
              // Handle JSON parsing error
              return null;
            };
          };
        };
        case null {
          // Handle decoding error
          return null;
        };
      };
    } else {
      return null;
    };
  };

  // Function to reset all data Structures
  public func resetall() : async () {
    Vector.clear(users);
    userProgress := TrieMap.TrieMap<Text, UserMissions>(compareUserId, hashUserId);
    tweets := TrieMap.TrieMap<Text, TrieMap.TrieMap<Nat, Nat>>(Text.equal, Text.hash);
    return;
  };

  // Function to get trusted origins for NFID authentication
  public shared query func get_trusted_origins() : async [Text] {
    let trustedOrigins = [
      "https://okowr-oqaaa-aaaag-qkedq-cai.icp0.io", // Frontend Canister to auth NFID
      "https://pre.konecta.one", // Domain
      "https://apcy6-tiaaa-aaaag-qkfda-cai.icp0.io", // Admin Frontend Canister to auth NFID
      "https://adminpre.konecta.one", // Admin Domain
    ];
    return trustedOrigins;
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

  // Function to get canister cycles balance
  public query func availableCycles() : async Nat {
    return Cycles.balance();
  };

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
