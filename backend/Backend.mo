import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Blob "mo:base/Blob";
import Types "Types";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Random "mo:base/Random";

actor class Backend() {

  // Registered Principal IDs
  var ids = Buffer.Buffer<Text>(0);
  // Seconds Accumulated by each Registered ID
  let seconds = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);
  // Tweet IDs for each Principal ID
  let tweetIds = HashMap.HashMap<Text, [Nat]>(0, Text.equal, Text.hash);
  // Timestamp for each Principal ID
  let timestamps = HashMap.HashMap<Text, Int>(0, Text.equal, Text.hash);
  // Konecta Following Status for each Principal ID
  let isFollowing = HashMap.HashMap<Text, Bool>(0, Text.equal, Text.hash);

  // Twitter Checking Related Variables
  var keywords = Buffer.Buffer<Text>(0);
  var tags = Buffer.Buffer<Text>(0);

  func indexOf(t : Text, char : Char) : ?Nat {
    var i = 0;
    for (c in Text.toIter(t)) {
      if (c == char) {
        return ?i;
      };
      i += 1;
    };
    return null;
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

  // Function to register that a Principal ID did tweet successfully
  public func registerTweet(newID : Text, tweetID : Nat) : async () {
    let existingTweets = switch (tweetIds.get(newID)) {
      case (?tweets) { tweets };
      case null { [] };
    };
    let updatedTweets = Array.append(existingTweets, [tweetID]);
    tweetIds.put(newID, updatedTweets);
  };

  // Function to check if a tweet was made by the user
  public func check_tweet(principalId : Text, handle : Text) : async Bool {

    /*

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

    */

    // Skipping all the checking and directly setting isValid to true
    let isValid = true;

    if (isValid) {
      // Generate a random blob ONLY WHEN SIMULATING
      let randomBlob = await Random.blob();
      let random = Random.Finite(randomBlob);

      // Generate a random Tweet ID ONLY WHEN SIMULATING
      let tweetID = switch (random.range(32)) {
        case (?value) { value };
        case null { 0 };
      };

      await registerTweet(principalId, tweetID);

      // Generate a random number of seconds
      let randomSecs = switch (random.range(32)) {
        case (?value) { 3600 + (value % (21600 - 3600 : Nat + 1)) }; //Between 1h and 6h
        case null { 3600 }; // Fallback in case of error
      };

      // Add the random seconds to the existing seconds
      let existingSecs = switch (seconds.get(principalId)) {
        case (?secs) { secs };
        case null { 0 };
      };
      let newSecs = existingSecs + randomSecs;
      seconds.put(principalId, newSecs);

      // Store the current timestamp
      let currentTimestamp = Time.now();
      timestamps.put(principalId, currentTimestamp);

      return true;
    } else {
      return false;
    };
  };

  public func check_if_following(principalId : Text, handle : Text) : async Bool {

    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. GET USER ID OF THE HANDLE
    let userIdUrl = "https://" # "api.twitter.com/2/users/by/username/" # handle;
    let userIdRequestHeaders = [{
      name = "Authorization";
      value = "Bearer YOUR_BEARER_TOKEN";
    }];
    let userIdRequest : Types.HttpRequestArgs = {
      url = userIdUrl;
      max_response_bytes = null;
      headers = userIdRequestHeaders;
      body = null;
      method = #get;
      transform = null;
    };

    Cycles.add(22_935_266_640);
    let userIdResponse : Types.HttpResponsePayload = await ic.http_request(userIdRequest);
    let userIdResponseBody : Blob = Blob.fromArray(userIdResponse.body);
    let userIdDecodedText : Text = switch (Text.decodeUtf8(userIdResponseBody)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    // Manually extract the user ID
    let idPattern = "\"id\":\"";
    let userId : Text = if (Text.contains(userIdDecodedText, #text idPattern)) {
      let parts = Text.split(userIdDecodedText, #text idPattern);
      let idPart = Text.split(parts[1], #char '\"');
      idPart[0];
    } else {
      "No ID found";
    };

    // 3. SETUP ARGUMENTS FOR HTTP GET request to get followers
    let host : Text = "api.twitter.com";
    let url = "https://" # host # "/1.1/followers/ids.json?screen_name=YOUR_TWITTER_HANDLE";

    let request_headers = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "twitter_check_canister" },
      {
        name = "Authorization";
        value = "Bearer YOUR_BEARER_TOKEN";
      },
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

    Cycles.add(22_935_266_640);
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    let followerIds : [Text] = [];
    let idsStart = indexOf(decoded_text, "[");
    let idsEnd = indexOf(decoded_text, "]");
    if (idsStart != null and idsEnd != null) {
      let idsText = Text.slice(decoded_text, idsStart! + 1, idsEnd!);
      followerIds := Text.split(idsText, ",");
    };

    let isFollowingStatus = Array.find<Text>(followerIds, func(id) { id == userId }) != null;

    if (isFollowingStatus) {
      isFollowing.put(principalId, true);
    };

    return isFollowingStatus;
  };

  // Function to get the following status of a Principal ID
  public func getFollow(principalId : Text) : async Bool {
    switch (isFollowing.get(principalId)) {
      case (?true) {
        let existingSecs = switch (seconds.get(principalId)) {
          case (?secs) { secs };
          case null { 0 };
        };
        let newSecs = existingSecs + 1800;
        seconds.put(principalId, newSecs);
        return true;
      };
      case _ { false };
    };
  };

  // Function to add a keyword
  public func addKeyword(keyword : Text) : async () {
    keywords.add(keyword);
  };

  // Function to remove a keyword
  public func removeKeyword(keyword : Text) : async () {
    let keywordArray = Buffer.toArray(keywords);
    keywords := Buffer.Buffer<Text>(0);
    for (k in Array.vals(Array.filter<Text>(keywordArray, func(k) { k != keyword }))) {
      keywords.add(k);
    };
  };

  // Function to add a tag
  public func addTag(tag : Text) : async () {
    tags.add(tag);
  };

  // Function to remove a tag
  public func removeTag(tag : Text) : async () {
    let tagArray = Buffer.toArray(tags);
    tags := Buffer.Buffer<Text>(0);
    for (t in Array.vals(Array.filter<Text>(tagArray, func(t) { t != tag }))) {
      tags.add(t);
    };
  };

  // Function to show all keywords
  public query func showKeywords() : async [Text] {
    Buffer.toArray(keywords);
  };

  // Function to show all tags
  public query func showTags() : async [Text] {
    Buffer.toArray(tags);
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

  // Function to reset all data Structures
  public func resetids() : async () {
    ids.clear();
    for (key in seconds.keys()) {
      seconds.delete(key);
    };
    for (key in tweetIds.keys()) {
      tweetIds.delete(key);
    };
    for (key in timestamps.keys()) {
      timestamps.delete(key);
    };
    keywords.clear();
    tags.clear();
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
    return switch (seconds.get(principal)) {
      case (?secs) secs;
      case null 0;
    };
  };
  // Function to get the timestamp for a Principal ID
  public shared query func getTimestamp(principalId : Text) : async Int {
    return switch (timestamps.get(principalId)) {
      case (?timestamp) timestamp;
      case null 0;
    };
  };

  // Function to get canister cycles balance
  public query func getCyclesBalance() : async Nat {
    return Cycles.balance();
  };

};
