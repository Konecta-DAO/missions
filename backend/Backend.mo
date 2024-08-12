import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import ExperimentalCycles "mo:base/ExperimentalCycles";

actor class Backend() {

  var ids = Buffer.Buffer<Text>(0);
  let seconds = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);
  let tweet = HashMap.HashMap<Text, Bool>(0, Text.equal, Text.hash);

  public func registerTweet(newID : Text) : async () {
    tweet.put(newID, true);
  };

  public func registerid(newID : Text, secs : Nat) : async Bool {
    let alreadyReg = Buffer.contains<Text>(ids, newID, func(a, b) { a == b });

    if (alreadyReg == false) {
      ids.add(newID);
      seconds.put(newID, secs);
    };

    return alreadyReg;
  };

  public shared query func getIds() : async [Text] {
    return Buffer.toArray(ids);
  };

  public func resetids() : async () {
    ids.clear();
    return;
  };

  public shared query func get_trusted_origins() : async [Text] {
    let trustedOrigins = [
      "https://x5pps-pqaaa-aaaab-qadbq-cai.icp0.io" //Frontend Canister to auth NFID
    ];
    return trustedOrigins;
  };

  public shared query func getSecs(principal : Text) : async Nat {
    switch (seconds.get(principal)) {
      case (?secs) { return secs };
      case null { return 0 };
    };
  };

  public shared query func getTweet(id : Text) : async Bool {
    switch (tweet.get(id)) {
      case (?value) { return value };
      case null { return false };
    };
  };

  public func verifyTweet(principal : Text, twitterHandle : Text, tweetText : Text) : async Bool {
    /* let url = "https://api.twitter.com/2/tweets/search/recent?query=from:" # twitterHandle # "%20" # tweetText;
    let headers = [
      ("Authorization", "Bearer TOKEN")
    ];
    let request_body_as_Blob: Blob = Text.encodeUtf8("");
    let request_body_as_nat8: [Nat8] = Blob.toArray(request_body_as_Blob);

    let http_request : ExperimentalCycles.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = headers;
      body = ?request_body_as_nat8;
      method = #get;
      transform = null;
    };

    // Add cycles for the HTTP request
    ExperimentalCycles.add(230_850_258_000);

    // Make the HTTP request
    let response = await ExperimentalCycles.http_request(http_request);

    // Process the response
    switch (response.status) {
      case (#ok) {
        let body = Text.decodeUtf8(response.body);
        switch (body) {
          case (?text) {
            return Text.contains(text, "data");
          };
          case null {
            return false;
          };
        };
      };
      case _ {
        return false;
      };
    };*/
    return false;
  };

};
