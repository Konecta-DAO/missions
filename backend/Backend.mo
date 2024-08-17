import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Blob "mo:base/Blob";
import Types "Types";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Random "mo:base/Random";
import Error "mo:base/Error";

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
  // Twitter ID for each Principal ID
  let twitterHandles = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);
  // Twitter Handle for each Principal ID
  let twitterIds = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);

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

  public func storeTwitterHandle(principalId : Text, handle : Text, twitterId : Text) : async () {
    // Store the Twitter handle and ID in HashMaps
    twitterHandles.put(principalId, handle);
    twitterIds.put(principalId, twitterId);
  };

  // Function to check if a tweet was made by the user
  public func check_tweet(principalId : Text) : async Bool {
    // Retrieve the stored Twitter handle or ID
    let handle = switch (twitterHandles.get(principalId)) {
      case (?h) h;
      case null "No handle found";
    };
    let id = switch (twitterIds.get(principalId)) {
      case (?id) id;
      case null "No ID found";
    };

    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. SETUP ARGUMENTS FOR HTTP GET request to check tweets
    let host : Text = "[2604:a880:400:d0::22e6:5001]";
    let url = "https://" # host # "/checkTweet?handle=" # handle;

    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = [];
      body = null;
      method = #get;
      transform = null;
    };

    Cycles.add<system>(22_935_266_640);
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) "No value returned";
      case (?y) y;
    };

    // Convert Buffer to Array
    let tagsArray = Buffer.toArray(tags);
    let keywordsArray = Buffer.toArray(keywords);

    // Check for specific tag and keywords
    let tweets : [Text] = Iter.toArray(Text.split(decoded_text, #char '\n'));
    let isValid = if (Array.size(tagsArray) == 0 and Array.size(keywordsArray) == 0) {
      true;
    } else {
      Array.size(
        Array.filter<Text>(
          tweets,
          func(tweet : Text) : Bool {
            let tagMatch = Array.size(tagsArray) == 0 or Array.size(
              Array.filter<Text>(
                tagsArray,
                func(tag : Text) : Bool {
                  Text.contains(tweet, #text tag);
                },
              )
            ) > 0;
            let keywordMatch = Array.size(keywordsArray) == 0 or Array.size(
              Array.filter<Text>(
                keywordsArray,
                func(keyword : Text) : Bool {
                  Text.contains(tweet, #text keyword);
                },
              )
            ) == Array.size(keywordsArray);
            tagMatch and keywordMatch;
          },
        )
      ) > 0;
    };

    if (isValid) {
      // Generate a random blob ONLY WHEN SIMULATING
      let randomBlob = await Random.blob();
      let random = Random.Finite(randomBlob);

      // Generate a random Tweet ID ONLY WHEN SIMULATING
      let tweetID = switch (random.range(32)) {
        case (?value) value;
        case null 0;
      };

      await registerTweet(principalId, tweetID);

      // Generate a random number of seconds
      let randomSecs = switch (random.range(32)) {
        case (?value) 3600 + (value % (21600 - 3600 : Nat + 1)); // Between 1h and 6h
        case null 3600; // Fallback in case of error
      };

      // Add the random seconds to the existing seconds
      let existingSecs = switch (seconds.get(principalId)) {
        case (?secs) secs;
        case null 0;
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

  public func requestToken() : async Text {
    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. SETUP ARGUMENTS FOR HTTP POST request to request a token
    let host : Text = "[2604:a880:400:d0::22e6:5001]";
    let url = "https://" # host # "/requestToken";

    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = [];
      body = null;
      method = #post;
      transform = null;
    };

    Cycles.add<system>(22_935_266_640);
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) "No value returned";
      case (?y) y;
    };

    // Extract the request token from the response
    let tokenPattern = "oauth_token=";
    let requestToken : Text = if (Text.contains(decoded_text, #text tokenPattern)) {
      let partsArray = Iter.toArray(Text.tokens(decoded_text, #text tokenPattern));
      let tokenPartArray = Iter.toArray(Text.tokens(partsArray[1], #char '&'));
      tokenPartArray[0];
    } else {
      "No token found";
    };

    return requestToken;
  };

  public func handleCallback(principalId : Text, oauthVerifier : Text) : async (Text, Text) {
    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. SETUP ARGUMENTS FOR HTTP POST request to exchange the request token for an access token
    let host : Text = "[2604:a880:400:d0::22e6:5001]";
    let url = "https://" # host # "/accessToken";

    let bodyContent : [Nat8] = Blob.toArray(Text.encodeUtf8("oauth_verifier=" # oauthVerifier));
    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = [];
      body = ?bodyContent;
      method = #post;
      transform = null;
    };

    Cycles.add<system>(22_935_266_640);
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) "No value returned";
      case (?y) y;
    };

    // Extract the access token and user information from the response
    let handlePattern = "screen_name=";
    let idPattern = "user_id=";
    let twitterHandle : Text = if (Text.contains(decoded_text, #text handlePattern)) {
      let partsArray = Iter.toArray(Text.tokens(decoded_text, #text handlePattern));
      let handlePartArray = Iter.toArray(Text.tokens(partsArray[1], #char '&'));
      handlePartArray[0];
    } else {
      "No handle found";
    };
    let twitterId : Text = if (Text.contains(decoded_text, #text idPattern)) {
      let partsArray = Iter.toArray(Text.tokens(decoded_text, #text idPattern));
      let idPartArray = Iter.toArray(Text.tokens(partsArray[1], #char '&'));
      idPartArray[0];
    } else {
      "No ID found";
    };

    // Store the Twitter handle and ID in HashMaps
    twitterHandles.put(principalId, twitterHandle);
    twitterIds.put(principalId, twitterId);

    return (twitterHandle, twitterId);
  };

  public func check_if_following(principalId : Text) : async Bool {
    // Retrieve the stored Twitter handle or ID
    let handle = switch (twitterHandles.get(principalId)) {
      case (?h) h;
      case null "No handle found";
    };
    let id = switch (twitterIds.get(principalId)) {
      case (?id) id;
      case null "No ID found";
    };

    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. GET USER ID OF THE HANDLE
    let host : Text = "[2604:a880:400:d0::22e6:5001]";
    let url = "https://" # host # "/checkFollow?handle=" # handle;

    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = [];
      body = null;
      method = #get;
      transform = null;
    };

    Cycles.add<system>(22_935_266_640);
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) "No value returned";
      case (?y) y;
    };

    // Manually extract the user ID
    let idPattern = "\"id\":\"";
    let userId : Text = if (Text.contains(decoded_text, #text idPattern)) {
      let partsArray = Iter.toArray(Text.tokens(decoded_text, #text idPattern));
      let idPartArray = Iter.toArray(Text.tokens(partsArray[1], #char '\"'));
      idPartArray[0];
    } else {
      "No ID found";
    };

    // 3. SETUP ARGUMENTS FOR HTTP GET request to get followers
    let url_followers = "https://" # host # "/followers?handle=" # handle;

    let http_request_followers : Types.HttpRequestArgs = {
      url = url_followers;
      max_response_bytes = null;
      headers = [];
      body = null;
      method = #get;
      transform = null;
    };

    Cycles.add<system>(22_935_266_640);
    let http_response_followers : Types.HttpResponsePayload = await ic.http_request(http_request_followers);

    let response_body_followers : Blob = Blob.fromArray(http_response_followers.body);
    let decoded_text_followers : Text = switch (Text.decodeUtf8(response_body_followers)) {
      case (null) "No value returned";
      case (?y) y;
    };

    var followerIds : [Text] = [];
    let idsStart = indexOf(decoded_text_followers, '[');
    let idsEnd = indexOf(decoded_text_followers, ']');

    switch (idsStart, idsEnd) {
      case (?start, ?end) {
        var idsText = "";
        var i = start + 1;
        while (i < end) {
          idsText #= Text.fromChar(Text.toArray(decoded_text_followers)[i]);
          i += 1;
        };
        followerIds := Iter.toArray(Text.tokens(idsText, #char ','));
      };
      case _ {
        return false;
      };
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
          case (?secs) secs;
          case null 0;
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
    let a = Buffer.toArray(tags);
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

  // Function to authenticate the user using Twitter OAuth and store the handle or ID
  public func authenticateTwitter(principalId : Text) : async (Text, Text) {
    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. SETUP ARGUMENTS FOR HTTP POST request to authenticate
    let host : Text = "[2604:a880:400:d0::22e6:5001]";
    let url = "https://" # host # "/authenticateTwitter";

    let bodyContent : [Nat8] = Blob.toArray(Text.encodeUtf8("principalId=" # principalId));
    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = [];
      body = ?bodyContent;
      method = #post;
      transform = null;
    };

    Cycles.add<system>(22_935_266_640);
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) "No value returned";
      case (?y) y;
    };

    // Extract Twitter handle and ID from the response
    let handlePattern = "\"screen_name\":\"";
    let idPattern = "\"user_id\":\"";
    let twitterHandle : Text = if (Text.contains(decoded_text, #text handlePattern)) {
      let partsArray = Iter.toArray(Text.tokens(decoded_text, #text handlePattern));
      let handlePartArray = Iter.toArray(Text.tokens(partsArray[1], #char '\"'));
      handlePartArray[0];
    } else {
      "No handle found";
    };
    let twitterId : Text = if (Text.contains(decoded_text, #text idPattern)) {
      let partsArray = Iter.toArray(Text.tokens(decoded_text, #text idPattern));
      let idPartArray = Iter.toArray(Text.tokens(partsArray[1], #char '\"'));
      idPartArray[0];
    } else {
      "No ID found";
    };

    // Store the Twitter handle and ID in HashMaps
    twitterHandles.put(principalId, twitterHandle);
    twitterIds.put(principalId, twitterId);

    return (twitterHandle, twitterId);
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
    for (key in twitterHandles.keys()) {
      twitterHandles.delete(key);
    };
    for (key in twitterIds.keys()) {
      twitterIds.delete(key);
    };
    for (key in isFollowing.keys()) {
      isFollowing.delete(key);
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

  // Function to check if the Twitter API is reachable
  public func isTwitterApiReachable() : async Bool {
    // 1. DECLARE IC MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");

    // 2. SETUP ARGUMENTS FOR HTTP GET request to test Twitter API via Render middleman
    let url = "[2604:a880:400:d0::22e6:5001]/testTWMiddleman";
    let httpRequest : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = [];
      body = null;
      method = #get;
      transform = null;
    };

    // Add cycles
    Cycles.add<system>(22_935_266_640);
    let httpResponse : Types.HttpResponsePayload = await ic.http_request(httpRequest);

    // Check if the response status is 200 (OK)
    return httpResponse.status == 200;
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
