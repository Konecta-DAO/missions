import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

actor class Backend() {

  var ids = Buffer.Buffer<Text>(0);

  public func registerid(newID : Text) : async () {
    let alreadyReg = Buffer.contains<Text>(ids, newID, func(a, b) { a == b });

    if (alreadyReg == false) {
      ids.add(newID);
    };

    return;
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
      "https://5vsfh-biaaa-aaaab-qac3a-cai.icp0.io" //Frontend Canister
    ];
    return trustedOrigins;
  };

};
