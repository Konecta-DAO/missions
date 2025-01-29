import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Types "Types";
import Serialization "Serialization";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Vector "mo:vector";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import TrieMap "mo:base/TrieMap";

actor class Backend() {

  stable var projects : Vector.Vector<Types.ProjectMissions> = Vector.new<Types.ProjectMissions>();

  private var accountLinks : TrieMap.TrieMap<Principal, (Principal, Bool)> = TrieMap.TrieMap<Principal, (Principal, Bool)>(Principal.equal, Principal.hash); // true = NFID to II, false = II to NFID

  stable var serializedAccountLinks : [(Principal, (Principal, Bool))] = [];

  public shared (msg) func syncAccountLinks(serializedLinks : [(Principal, (Principal, Bool))]) : async () {
    if (isBackendAdmin(msg.caller)) {
      // Reinitialize accountLinks with the proper key equality and hash functions.
      accountLinks := TrieMap.TrieMap<Principal, (Principal, Bool)>(Principal.equal, Principal.hash);

      // Iterate over the serialized list and populate the accountLinks TrieMap.
      for ((principal, value) in Iter.fromArray(serializedLinks)) {
        accountLinks.put(principal, value);
      };
    };
  };

  public query func getAccountLinks() : async [(Principal, (Principal, Bool))] {
    let accountLinksEntries = accountLinks.entries();
    return Iter.toArray(accountLinksEntries);
  };

  public shared query (msg) func getAllProjectMissions() : async [Types.SerializedProjectMissions] {
    if (isAdmin(msg.caller)) {
      return Array.map<Types.ProjectMissions, Types.SerializedProjectMissions>(Vector.toArray(projects), Serialization.serializeProjectMissions);
    } else {
      let allProjects = Vector.toArray(projects);
      let activeProjects = Array.filter(
        allProjects,
        func(p : Types.ProjectMissions) : Bool {
          return p.status != "offline";
        },
      );
      return Array.map<Types.ProjectMissions, Types.SerializedProjectMissions>(
        activeProjects,
        Serialization.serializeProjectMissions,
      );
    };
  };

  public shared (msg) func addProjectMissions(canisterId : Principal, name : Text, icon : Text) : async () {
    if (isAdmin(msg.caller)) {
      let newProject : Types.ProjectMissions = {
        var canisterId = canisterId;
        var name = name;
        var creationTime = Time.now();
        var status = "offline";
        var icon = icon;
      };
      Vector.add(projects, newProject);
    };
  };

  public shared (msg) func updateIconLink(canisterId : Principal, icon : Text) : async () {
    if (isAdmin(msg.caller)) {
      var i = 0;
      while (i < Vector.size(projects)) {
        switch (Vector.getOpt(projects, i)) {
          case (?project) {
            if (project.canisterId == canisterId) {
              let updatedProject : Types.ProjectMissions = {
                var canisterId = project.canisterId;
                var name = project.name;
                var creationTime = project.creationTime;
                var status = project.status;
                var icon = icon;
              };
              Vector.put(projects, i, updatedProject);
              return;
            };
          };
          case _ {};
        };
        i += 1;
      };
    };
  };

  public shared (msg) func setProjectStatus(canisterId : Principal, status : Text) : async Text {
    if (status != "online" and status != "offline") {
      return "Invalid Status";
    } else {
      if (isAdmin(msg.caller)) {
        let size = Vector.size(projects);
        for (i in Iter.range(0, size - 1)) {
          let existingProjectOpt = Vector.get(projects, i); // This returns ?Mission
          switch (existingProjectOpt) {
            case (project) {
              // Unwrap the Mission
              if (project.canisterId == canisterId) {
                let updatedProject : Types.ProjectMissions = {
                  var canisterId = project.canisterId;
                  var name = project.name;
                  var creationTime = project.creationTime;
                  var status = status;
                  var icon = project.icon;
                };
                Vector.put(projects, i, updatedProject);
                return "Success";
              };
            };
          };
        };
      };
    };
    return "callern't";
  };

  stable var adminIds : [Principal] = [Principal.fromText("re2jg-bjb6f-frlwq-342yn-bebk2-43ofq-3qwwq-cld3p-xiwxw-bry3n-aqe")];

  public shared (msg) func addAdminId(newAdminId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      adminIds := Array.append<Principal>(adminIds, [newAdminId]);
    };
  };

  public shared (msg) func removeAdminId(adminId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      adminIds := Array.filter<Principal>(adminIds, func(id) : Bool { id != adminId });
    };

  };

  private func isAdmin(principalId : Principal) : Bool {
    return Array.find<Principal>(
      adminIds,
      func(id) : Bool {
        id == principalId;
      },
    ) != null;
  };

  private func isBackendAdmin(principalId : Principal) : Bool {
    if (principalId == Principal.fromText("onpqf-diaaa-aaaag-qkeda-cai") or principalId == Principal.fromText("ynkdv-7qaaa-aaaag-qkluq-cai")) {
      return true;
    };
    return false;
  };
  public shared func trisAdmin(principalId : Principal) : async Bool {
    return Array.find<Principal>(
      adminIds,
      func(id) : Bool {
        id == principalId;
      },
    ) != null;
  };

  // Function to get all admin IDs

  public shared query (msg) func getAdminIds() : async [Principal] {
    if (isAdmin(msg.caller)) {
      return adminIds;
    };
    return [];
  };

  // Pre-upgrade function

  system func preupgrade() {

    let accountLinksEntries = accountLinks.entries();
    serializedAccountLinks := Iter.toArray(accountLinksEntries);

  };

  // Post-upgrade function

  system func postupgrade() {

    accountLinks := TrieMap.TrieMap<Principal, (Principal, Bool)>(Principal.equal, Principal.hash);

    for ((principal, pairValue) in Iter.fromArray(serializedAccountLinks)) {
      accountLinks.put(principal, pairValue);
    };

    serializedAccountLinks := [];

  };

  public query func availableCycles() : async Nat {
    return Cycles.balance();
  };

  public shared query func icrc28_trusted_origins() : async Types.Icrc28TrustedOriginsResponse {
    let trusted_origins : [Text] = [
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp0.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.raw.icp0.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.ic0.app",
      "https://dlas6-raaaa-aaaag-qm75a-cai.raw.ic0.app",
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp0.icp-api.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp-api.io",
      "https://pre.konecta.one",
      "https://adminpre.konecta.one",
      "https://stats.konecta.one",
      "https://konecta.one",
      "https://apcy6-tiaaa-aaaag-qkfda-cai.icp0.io",
      "https://okowr-oqaaa-aaaag-qkedq-cai.icp0.io",
      "https://5bxlt-ryaaa-aaaag-qkhea-cai.icp0.io",
      "https://y7mum-taaaa-aaaag-qklxq-cai.icp0.io",
      "https://apcy6-tiaaa-aaaag-qkfda-cai.raw.icp0.io",
      "https://okowr-oqaaa-aaaag-qkedq-cai.raw.icp0.io",
      "https://5bxlt-ryaaa-aaaag-qkhea-cai.raw.icp0.io",
      "https://y7mum-taaaa-aaaag-qklxq-cai.raw.icp0.io",
      "https://apcy6-tiaaa-aaaag-qkfda-cai.ic0.app",
      "https://okowr-oqaaa-aaaag-qkedq-cai.ic0.app",
      "https://5bxlt-ryaaa-aaaag-qkhea-cai.ic0.app",
      "https://y7mum-taaaa-aaaag-qklxq-cai.ic0.app",
      "https://apcy6-tiaaa-aaaag-qkfda-cai.raw.ic0.app",
      "https://okowr-oqaaa-aaaag-qkedq-cai.raw.ic0.app",
      "https://5bxlt-ryaaa-aaaag-qkhea-cai.raw.ic0.app",
      "https://y7mum-taaaa-aaaag-qklxq-cai.raw.ic0.app",
    ];

    return {
      trusted_origins;
    };
  };

  public shared (msg) func resetall() : async () {
    if (isAdmin(msg.caller)) {
      return;
    };
  };
};
