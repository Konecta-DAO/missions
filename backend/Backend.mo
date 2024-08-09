import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

actor class Backend() {
 
  var ids = Buffer.Buffer<Text>(0);

  public func registerid(newID : Text) : async () {
    ids.add(newID);
    return;
  };

  public shared query func getIds() : async [Text] {
    return Buffer.toArray(ids);
  };

  public func resetids() : async () {
    ids.clear();
    return;
  };

};
