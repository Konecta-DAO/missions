import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Types "Types";
import Array "mo:base/Array";
import Time "mo:base/Time";
//import Random "mo:base/Random";
import Vector "mo:vector";
import Serde "mo:serde";
import Blob "mo:base/Blob";
import Int "mo:base/Int";

actor class Backend() {

  // User Class
  type User = {
    id : Text;
    mission : Nat;
    seconds : Nat;
    twitterid : Nat;
    twitterhandle : Text;
    creationTime : Int;
  };

  type Mission = {
    id : Nat;
    mode : Nat;
    description : Text;
    obj1 : Text;
    obj2 : Text;
    recursive : Bool;
    howmany : Int;
    maxtime : Int;
    image : [Nat8];
  };

  type Tweet = {
    userid : Text;
    tweetid : Nat;
  };

  // Mission List
  stable var missions : Vector.Vector<Mission> = Vector.new<Mission>();
  // Registered Users
  stable var users : Vector.Vector<User> = Vector.new<User>();
  // Tweets per Users
  stable var tweets : Vector.Vector<Tweet> = Vector.new<Tweet>();

  // Function to add a new mission
  public func addMission(id : Nat, mode : Nat, description : Text, obj1 : Text, obj2 : Text, recursive : Bool, howmany : Int, maxtime : Int, image : [Nat8]) : async () {
    let newMission : Mission = {
      id;
      mode;
      description;
      obj1;
      obj2;
      recursive;
      howmany;
      maxtime;
      image;
    };
    Vector.add(missions, newMission);
  };

  // Function to get the number of missions available
  public query func getNumberOfMissions() : async Nat {
    return Vector.size(missions);
  };

  // Function to get a missions by ID
  public query func getMissionById(id : Nat) : async ?Mission {
    for (mission in Vector.vals(missions)) {
      if (mission.id == id) {
        return ?mission;
      };
    };
    return null;
  };

  // Register an user by Principalid
  public func addUser(id : Text, seconds : Nat) : async () {
    let twitterid = 0;
    let mission = 0;
    let twitterhandle = "";
    let creationTime = Time.now();
    let newuser : User = {
      id;
      mission;
      seconds;
      twitterid;
      twitterhandle;
      creationTime;
    };
    Vector.add(users, newuser);
  };

  // Get the seconds of an user by Principalid for a given mission
  public query func getSeconds(id : Text, mission : Nat) : async ?Nat {
    for (user in Vector.vals(users)) {
      if (user.id == id and user.mission == mission) {
        return ?user.seconds;
      };
    };
    return null;
  };

  // Get the total seconds of an user by Principalid
  public query func getTotalSeconds(id : Text) : async Nat {
    var sum : Nat = 0;
    for (user in Vector.vals(users)) {
      if (user.id == id) {
        sum += user.seconds;
      };
    };
    return sum;
  };

  // Function to register a new Principal ID with their first generated seconds
  public func registerid(newID : Text, secs : Nat) : async () {
    var alreadyReg = false;

    label searching for (user in Vector.vals(users)) {
      if (user.id == newID) {
        alreadyReg := true;
        break searching;
      };
    };

    if (alreadyReg) {
      await addUser(newID, secs);
    };

    return;
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
    let newtweet : Tweet = { userid; tweetid };
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

  public shared func handleTwitterCallback(principalId : Text, oauthToken : Text, oauthVerifier : Text) : async ?User {
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

                          let updatedUser : User = {
                            id = user.id;
                            mission = user.mission;
                            seconds = user.seconds;
                            twitterid = twitterid;
                            twitterhandle = info.screen_name;
                            creationTime = user.creationTime;
                          };

                          // Update the user in the vector
                          Vector.put(users, i, updatedUser);
                          return ?updatedUser;
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
