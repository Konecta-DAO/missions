import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

actor class Backend() {

  var ids = Buffer.Buffer<Text>(0);
  let seconds = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);

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
      "https://xblvd-yqaaa-aaaab-qaddq-cai.icp0.io" //Frontend Canister to auth NFID
    ];
    return trustedOrigins;
  };

  public shared query func getSecs(principal : Text) : async Nat {
    switch (seconds.get(principal)) {
      case (?secs) { return secs };
      case null { return 0 };
    };
  };

};
