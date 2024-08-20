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

actor class Backend() {

  // Registered Users
  stable var users : Vector.Vector<Types.User> = Vector.new<Types.User>();

  // Mission Related functions
  type UserMissions = TrieMap.TrieMap<Types.Mission, Types.Progress>;
  // Mission List
  stable var missions : Vector.Vector<Types.Mission> = Vector.new<Types.Mission>();

  // Comparison and hash functions for Text-based UserId
  private func compareUserId(id1 : Text, id2 : Text) : Bool {
    id1 == id2;
  };

  private func hashUserId(id : Text) : Hash.Hash {
    Text.hash(id);
  };

  // Comparison and hash functions for Mission
  private func compareMission(m1 : Types.Mission, m2 : Types.Mission) : Bool {
    m1.id == m2.id;
  };

  private func hashMission(m : Types.Mission) : Hash.Hash {
    Text.hash(Text.concat(m.description, Nat.toText(m.id)));
  };

  // TrieMap to store the progress of each user's missions
  private var userProgress : TrieMap.TrieMap<Text, UserMissions> = TrieMap.TrieMap<Text, UserMissions>(compareUserId, hashUserId);

  // Function to record or update progress on a mission
  public func updateProgress(userId : Text, serializedMission : Types.SerializedMission, serializedProgress : Types.SerializedProgress) : async () {
    let mission = Serialization.deserializeMission(serializedMission);
    let progress = Serialization.deserializeProgress(serializedProgress);

    let missions = switch (userProgress.get(userId)) {
      case (?map) map;
      case null TrieMap.TrieMap<Types.Mission, Types.Progress>(compareMission, hashMission);
    };
    missions.put(mission, progress);
    userProgress.put(userId, missions);
  };

  // Function to get the progress of a specific mission for a user
  public query func getProgress(userId : Text, serializedMission : Types.SerializedMission) : async Types.SerializedProgress {
    let mission = Serialization.deserializeMission(serializedMission);
    switch (userProgress.get(userId)) {
      case (?missions) {
        switch (missions.get(mission)) {
          case (?progress) Serialization.serializeProgress(progress);
          case null {
            let defaultProgress : Types.Progress = {
              var done = false;
              var timestamp = 0;
              var totalearned = 0;
              var amountOfTimes = 0;
              usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
            };
            Serialization.serializeProgress(defaultProgress);
          };
        };
      };
      case null {
        let defaultProgress : Types.Progress = {
          var done = false;
          var timestamp = 0;
          var totalearned = 0;
          var amountOfTimes = 0;
          usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
        };
        Serialization.serializeProgress(defaultProgress);
      };
    };
  };

  // Function to add a secret code to a user's progress for the mission
  public func submitSecretCode(userId : Text, serializedMission : Types.SerializedMission, code : Text) : async Bool {
    let mission = Serialization.deserializeMission(serializedMission);
    var progress : Types.Progress = switch (userProgress.get(userId)) {
      case (?missions) switch (missions.get(mission)) {
        case (?prog) prog;
        case null {
          var progress : Types.Progress = {
            var done = false;
            var timestamp = 0;
            var totalearned = 0;
            var amountOfTimes = 0;
            usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
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
          usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
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
        case null TrieMap.TrieMap<Types.Mission, Types.Progress>(compareMission, hashMission);
      };
      missions.put(mission, progress);
      userProgress.put(userId, missions);

      return true;
    };
  };

  // Function to get the total earned seconds on a specific mission for a user
  public query func getTotalEarned(userId : Text, serializedMission : Types.SerializedMission) : async ?Nat {
    let mission = Serialization.deserializeMission(serializedMission);
    switch (userProgress.get(userId)) {
      case (?missions) {
        switch (missions.get(mission)) {
          case (?progress) return ?progress.totalearned;
          case null return null;
        };
      };
      case null return null;
    };
  };

  // Tweets per Users
  stable var tweets : Vector.Vector<Types.Tweet> = Vector.new<Types.Tweet>();

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

  // Function to get a missions by ID
  public query func getMissionById(id : Nat) : async ?Types.SerializedMission {
    for (mission in Vector.vals(missions)) {
      if (mission.id == id) {
        return ?Serialization.serializeMission(mission);
      };
    };
    return null;
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
      twitterid;
      twitterhandle;
      creationTime;
    };
    Vector.add(users, newuser);
  };

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

  // Register a tweet to an user
  public func addTweet(userid : Text, tweetid : Nat) : async () {
    let newtweet : Types.Tweet = { userid; tweetid };
    Vector.add(tweets, newtweet);
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
                            twitterid = twitterid;
                            twitterhandle = info.screen_name;
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
