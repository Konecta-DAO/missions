import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Error "mo:base/Error";

import Types "Types";

actor class Backend() {

  // Registered Principal IDs
  var ids = Buffer.Buffer<Text>(0);
  // Seconds Accumulated by each Registered ID
  let seconds = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);

  // Twitter Related Variables
  let tweet = HashMap.HashMap<Text, Bool>(0, Text.equal, Text.hash);
  var keywords : [Text] = [];
  var tags : [Text] = [];

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

  // Function to register that a Principal ID did tweet successfully
  public func registerTweet(newID : Text) : async () {
    tweet.put(newID, true);
  };

  // Function to check if a tweet was made by the user
  public func check_tweet(handle : Text) : async Bool {

    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. SETUP ARGUMENTS FOR HTTP GET request
    let host : Text = "api.twitter.com";
    let url = "https://" # host # "/1.1/statuses/user_timeline.json?screen_name=" # handle # "&count=200";

    // 2.2 prepare headers for the system http_request call
    let request_headers = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "twitter_check_canister" },
      {
        name = "Authorization";
        value = "Bearer AAAAAAAAAAAAAAAAAAAAANNBvQEAAAAAwIGyKk3%2FN5poBsSYSETQ35TOApE%3DC5Qu9kRUPHBRP1W9rnkanW0fY7UYXYKqgB9mR12EkoQi6ZCsjx";
      },
    ];

    // 2.2.1 Transform context
    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    // 2.3 The HTTP request
    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null; // optional for request
      headers = request_headers;
      body = null; // optional for request
      method = #get;
      transform = ?transform_context;
    };

    // 3. ADD CYCLES TO PAY FOR HTTP REQUEST
    Cycles.add(22_935_266_640);

    // 4. MAKE HTTPS REQUEST AND WAIT FOR RESPONSE
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

    // 5. DECODE THE RESPONSE
    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    // 6. CHECK FOR SPECIFIC TAG AND KEYWORDS
    let tweets : [Text] = Iter.toArray(Text.split(decoded_text, #char '\n'));
    let isValid = if (Array.size(tags) == 0 and Array.size(keywords) == 0) {
      true;
    } else {
      Array.size(
        Array.filter<Text>(
          tweets,
          func(tweet : Text) : Bool {
            let tagMatch = Array.size(tags) == 0 or Array.size(
              Array.filter<Text>(
                tags,
                func(tag : Text) : Bool {
                  Text.contains(tweet, #text tag);
                },
              )
            ) > 0;
            let keywordMatch = Array.size(keywords) == 0 or Array.size(
              Array.filter<Text>(
                keywords,
                func(keyword : Text) : Bool {
                  Text.contains(tweet, #text keyword);
                },
              )
            ) == Array.size(keywords);
            tagMatch and keywordMatch;
          },
        )
      ) > 0;
    };

    if (isValid) {
      await registerTweet("a");
      true;
    } else {
      false;
    };
  };

  // Function to check if a handle follows @konectA_Dao
  public func check_if_following(handle : Text) : async Bool {

    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. SETUP ARGUMENTS FOR HTTP GET request
    let host : Text = "api.twitter.com";
    let url = "https://" # host # "/1.1/friendships/show.json?source_screen_name=" # handle # "&target_screen_name=konectA_Dao";

    // 2.2 prepare headers for the system http_request call
    let request_headers = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "twitter_check_canister" },
      {
        name = "Authorization";
        value = "Bearer AAAAAAAAAAAAAAAAAAAAANNBvQEAAAAAwIGyKk3%2FN5poBsSYSETQ35TOApE%3DC5Qu9kRUPHBRP1W9rnkanW0fY7UYXYKqgB9mR12EkoQi6ZCsjx";
      },
    ];

    // 2.2.1 Transform context
    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    // 2.3 The HTTP request
    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null; // optional for request
      headers = request_headers;
      body = null; // optional for request
      method = #get;
      transform = ?transform_context;
    };

    // 3. ADD CYCLES TO PAY FOR HTTP REQUEST
    Cycles.add(22_935_266_640);

    // 4. MAKE HTTPS REQUEST AND WAIT FOR RESPONSE
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

    // 5. DECODE THE RESPONSE
    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    // 6. CHECK IF FOLLOWING
    let isFollowing = Text.contains(decoded_text, #text "\"following\":true");

    if (isFollowing) {
      return true;
    } else {
      return false;
    };
  };

  // Function to add a keyword
  public func addKeyword(keyword : Text) : async () {
    keywords := Array.append(keywords, [keyword]);
  };

  // Function to remove a keyword
  public func removeKeyword(keyword : Text) : async () {
    keywords := Array.filter<Text>(
      keywords,
      func(k : Text) : Bool {
        k != keyword;
      },
    );
  };

  // Function to add a tag
  public func addTag(tag : Text) : async () {
    tags := Array.append(tags, [tag]);
  };

  // Function to remove a tag
  public func removeTag(tag : Text) : async () {
    tags := Array.filter<Text>(
      tags,
      func(t : Text) : Bool {
        t != tag;
      },
    );
  };

  // Function to show all keywords
  public query func showKeywords() : async [Text] {
    keywords;
  };

  // Function to show all tags
  public query func showTags() : async [Text] {
    tags;
  };

  // Function to register a new Principal ID with their first generated seconds
  public func registerid(newID : Text, secs : Nat) : async Bool {
    let alreadyReg = Buffer.contains<Text>(ids, newID, func(a, b) { a == b });

    if (alreadyReg == false) {
      ids.add(newID);
      seconds.put(newID, secs);
    };

    return alreadyReg;
  };

  // Function to get all registered Principal IDs
  public shared query func getIds() : async [Text] {
    return Buffer.toArray(ids);
  };

  // Function to reset all registered Principal IDs
  public func resetids() : async () {
    ids.clear();
    return;
  };

  // Function to get trusted origins for NFID authentication
  public shared query func get_trusted_origins() : async [Text] {
    let trustedOrigins = [
      "https://okowr-oqaaa-aaaag-qkedq-cai.icp0.io" // Frontend Canister to auth NFID
    ];
    return trustedOrigins;
  };

  // Function to get seconds accumulated by a registered Principal ID
  public shared query func getSecs(principal : Text) : async Nat {
    switch (seconds.get(principal)) {
      case (?secs) { return secs };
      case null { return 0 };
    };
  };

  // Function to check if a Principal ID did tweet
  public shared query func getTweet(id : Text) : async Bool {
    switch (tweet.get(id)) {
      case (?value) { return value };
      case null { return false };
    };
  };

  // Function to get canister cycles balance
  public query func getCyclesBalance() : async Nat {
    return Cycles.balance();
  };

  public func post_tweet(status : Text) : async (Bool, Text) {
    let ic : Types.IC = actor ("aaaaa-aa");
    let host : Text = "api.twitter.com";
    let url = "https://" # host # "/1.1/statuses/update.json";

    let request_headers = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "twitter_post_canister" },
      { name = "Authorization"; value = "Bearer YAAAAAAAAAAAAAAAAAAAAANNBvQEAAAAAwIGyKk3%2FN5poBsSYSETQ35TOApE%3DC5Qu9kRUPHBRP1W9rnkanW0fY7UYXYKqgB9mR12EkoQi6ZCsjx" },
      { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
    ];

    let body_prefix = Text.encodeUtf8("status=");
    let body_status = Text.encodeUtf8(status);
    let body_array = Array.append(Blob.toArray(body_prefix), Blob.toArray(body_status));

    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = request_headers;
      body = ?body_array;
      method = #post;
      transform = ?transform_context;
    };

    try {
      Cycles.add(22_935_266_640);
      let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
      let response_body : Blob = Blob.fromArray(http_response.body);
      let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
        case (null) { "No value returned" };
        case (?y) { y };
      };
      return (true, "Tweet posted: " # decoded_text);
    } catch (e) {
      return (false, "Error posting tweet: " # Error.message(e));
    };
  };

  public func get_random_post() : async (Bool, Text) {
    let ic : Types.IC = actor ("aaaaa-aa");
    let host : Text = "jsonplaceholder.typicode.com";
    let url = "https://" # host # "/posts/1";

    let request_headers = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "json_placeholder_canister" },
    ];

    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = request_headers;
      body = null;
      method = #get;
      transform = ?transform_context;
    };

    try {
      Cycles.add(22_935_266_640);
      let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
      let response_body : Blob = Blob.fromArray(http_response.body);
      let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
        case (null) { "No value returned" };
        case (?y) { y };
      };
      return (true, "Post title: " # decoded_text);
    } catch (e) {
      return (false, "Error fetching post: " # Error.message(e));
    };
  };
};
