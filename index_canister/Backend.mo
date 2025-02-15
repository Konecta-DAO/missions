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
import Source "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";
import Sha256 "mo:sha2/Sha256";
import Nat8 "mo:base/Nat8";
import Blob "mo:base/Blob";

actor class Backend() {

  stable var projects : Vector.Vector<Types.ProjectMissions> = Vector.new<Types.ProjectMissions>();

  private var principalToUUID : TrieMap.TrieMap<Principal, Text> = TrieMap.TrieMap<Principal, Text>(Principal.equal, Principal.hash);

  stable var serializedprincipalToUUID : [(Principal, Text)] = [];

  private var uuidToLinkedAccounts : TrieMap.TrieMap<Text, [(Text, Principal)]> = TrieMap.TrieMap<Text, [(Text, Principal)]>(Text.equal, Text.hash);

  stable var serializedUuidToLinkedAccounts : [(Text, [(Text, Principal)])] = [];

  stable var allowedAccountTypes : [Text] = ["NFIDW", "InternetIdentity", "Oisy"];

  private var uuidToUser : TrieMap.TrieMap<Text, Types.User> = TrieMap.TrieMap<Text, Types.User>(Text.equal, Text.hash);

  stable var serializedUuidToUser : [(Text, Types.User)] = [];

  // Pre-upgrade function

  system func preupgrade() {

    let principalToUUIDEntries = principalToUUID.entries();
    serializedprincipalToUUID := Iter.toArray(principalToUUIDEntries);

    let uuidToLinkedAccountsEntries = uuidToLinkedAccounts.entries();
    serializedUuidToLinkedAccounts := Iter.toArray(uuidToLinkedAccountsEntries);

    let pendingLinkRequestsEntries = pendingLinkRequests.entries();
    serializedPendingLinkRequests := Iter.toArray(pendingLinkRequestsEntries);

    let uuidToUserEntries = uuidToUser.entries();
    serializedUuidToUser := Iter.toArray(uuidToUserEntries);
  };

  // Post-upgrade function

  system func postupgrade() {

    principalToUUID := TrieMap.TrieMap<Principal, Text>(Principal.equal, Principal.hash);

    for ((principal, textValue) in Iter.fromArray(serializedprincipalToUUID)) {
      principalToUUID.put(principal, textValue);
    };

    serializedprincipalToUUID := [];

    uuidToLinkedAccounts := TrieMap.TrieMap<Text, [(Text, Principal)]>(Text.equal, Text.hash);

    for ((text, principalArray) in Iter.fromArray(serializedUuidToLinkedAccounts)) {
      uuidToLinkedAccounts.put(text, principalArray);
    };

    serializedUuidToLinkedAccounts := [];

    pendingLinkRequests := TrieMap.TrieMap<Text, Types.LinkRequest>(Text.equal, Text.hash);

    for ((text, linkRequest) in Iter.fromArray(serializedPendingLinkRequests)) {
      pendingLinkRequests.put(text, linkRequest);
    };

    serializedPendingLinkRequests := [];

    uuidToUser := TrieMap.TrieMap<Text, Types.User>(Text.equal, Text.hash);

    for ((text, user) in Iter.fromArray(serializedUuidToUser)) {
      uuidToUser.put(text, user);
    };

    serializedUuidToUser := [];

  };

  private func makeLinkKey(requester : Principal, target : Principal) : Text {
    Principal.toText(requester) # "_" # Principal.toText(target);
  };

  private func isAllowedType(accType : Text) : Bool {
    Array.foldLeft<Text, Bool>(
      allowedAccountTypes,
      false,
      func(acc : Bool, t : Text) : Bool { acc or (t == accType) },
    );
  };

  private var pendingLinkRequests : TrieMap.TrieMap<Text, Types.LinkRequest> = TrieMap.TrieMap<Text, Types.LinkRequest>(Text.equal, Text.hash);

  stable var serializedPendingLinkRequests : [(Text, Types.LinkRequest)] = [];

  public shared (msg) func initiateLink(requester : Principal, requesterType : Text, target : Principal, targetType : Text) : async Text {

    if (msg.caller != requester) {
      return "Unauthorized: Caller does not match the requester.";
    };

    if (not isAllowedType(requesterType)) {
      return "Requester account type '" # requesterType # "' is not allowed.";
    };
    if (not isAllowedType(targetType)) {
      return "Target account type '" # targetType # "' is not allowed.";
    };

    if (requesterType == targetType) {
      return "Cannot link two accounts of the same type (" # requesterType # ").";
    };

    // Get canonical UUIDs for both accounts.
    let requesterUUID = await getUUID(requester);
    let targetUUID = await getUUID(target);

    // If both principals already map to the same UUID, they are already linked.
    if (requesterUUID == targetUUID) {
      return "Accounts are already linked.";
    };

    let requesterAlreadyLinked = switch (uuidToLinkedAccounts.get(requesterUUID)) {
      case (?vec) {
        Array.find(
          vec,
          func(entry : (Text, Principal)) : Bool {
            let (accType, _) = entry;
            accType == requesterType;
          },
        ) != null;
      };
      case null { false };
    };

    if (requesterAlreadyLinked) {
      return "An account of type '" # requesterType # "' is already linked for the requester.";
    };

    let targetAlreadyLinked = switch (uuidToLinkedAccounts.get(targetUUID)) {
      case (?vec) {
        Array.find(
          vec,
          func(entry : (Text, Principal)) : Bool {
            let (accType, _) = entry;
            accType == targetType;
          },
        ) != null;
      };
      case null { false };
    };

    if (targetAlreadyLinked) {
      return "An account of type '" # targetType # "' is already linked for the target.";
    };

    let linkKey = makeLinkKey(requester, target);
    let linkRequest : Types.LinkRequest = {
      requester = requester;
      requesterType = requesterType;
      target = target;
      targetType = targetType;
      status = "pending";
      requestedAt = Time.now();
    };
    pendingLinkRequests.put(linkKey, linkRequest);
    return "Link request initiated. Awaiting acceptance from the target account.";
  };

  public shared (msg) func acceptLink(requester : Principal, target : Principal, canonicalUUID : Text) : async Text {

    if (msg.caller != target) {
      return "Unauthorized: Only the target account can accept the link request.";
    };

    let linkKey = makeLinkKey(requester, target);
    switch (pendingLinkRequests.get(linkKey)) {
      case null {
        return "No pending link request found.";
      };
      case (?linkRequest) {

        if (linkRequest.target != target) {
          return "Unauthorized: Only the target account can accept this request.";
        };

        principalToUUID.put(requester, canonicalUUID);
        principalToUUID.put(target, canonicalUUID);

        var linkedAccounts : [(Text, Principal)] = switch (uuidToLinkedAccounts.get(canonicalUUID)) {
          case (?vec) { vec };
          case null { [] };
        };

        if (
          Array.find(
            linkedAccounts,
            func(entry : (Text, Principal)) : Bool {
              let (accType, _) = entry;
              accType == linkRequest.requesterType;
            },
          ) == null
        ) {
          linkedAccounts := Array.append(linkedAccounts, [(linkRequest.requesterType, linkRequest.requester)]);
        };

        if (
          Array.find(
            linkedAccounts,
            func(entry : (Text, Principal)) : Bool {
              let (accType, _) = entry;
              accType == linkRequest.targetType;
            },
          ) == null
        ) {
          linkedAccounts := Array.append(linkedAccounts, [(linkRequest.targetType, linkRequest.target)]);
        };

        uuidToLinkedAccounts.put(canonicalUUID, linkedAccounts);

        let updatedRequest : Types.LinkRequest = {
          requester = linkRequest.requester;
          requesterType = linkRequest.requesterType;
          target = linkRequest.target;
          targetType = linkRequest.targetType;
          status = "accepted";
          requestedAt = linkRequest.requestedAt;
        };

        pendingLinkRequests.put(linkKey, updatedRequest);

        return "Link accepted. Accounts have been merged under canonical UUID: " # canonicalUUID;
      };
    };
  };

  public shared (msg) func rejectLink(requester : Principal, target : Principal) : async Text {

    if (msg.caller != target) {
      return "Unauthorized: Only the target account can reject the link request.";
    };

    let linkKey = makeLinkKey(requester, target);
    switch (pendingLinkRequests.get(linkKey)) {
      case null {
        return "No pending link request found.";
      };
      case (?linkRequest) {

        if (linkRequest.target != target) {
          return "Unauthorized: Only the target account can reject this link request.";
        };

        let updatedRequest : Types.LinkRequest = {
          requester = linkRequest.requester;
          requesterType = linkRequest.requesterType;
          target = linkRequest.target;
          targetType = linkRequest.targetType;
          status = "rejected";
          requestedAt = linkRequest.requestedAt;
        };

        pendingLinkRequests.put(linkKey, updatedRequest);
        return "Link request has been rejected.";
      };
    };
  };

  public shared (msg) func linkOisyAccount(currentUser : Principal, oisy : Principal) : async Text {

    if (msg.caller != currentUser) {
      return "Unauthorized: Caller does not match the current user.";
    };

    if (not isAllowedType("Oisy")) {
      return "Oisy account type is not allowed.";
    };

    let canonicalUUID = await getUUID(currentUser);

    principalToUUID.put(oisy, canonicalUUID);

    var linkedAccounts : [(Text, Principal)] = switch (uuidToLinkedAccounts.get(canonicalUUID)) {
      case (?vec) { vec };
      case null { [] };
    };

    // Check if an Oisy account is already linked.
    if (
      Array.find(
        linkedAccounts,
        func(entry : (Text, Principal)) : Bool {
          let (accType, _) = entry;
          accType == "Oisy";
        },
      ) != null
    ) {
      return "An Oisy account is already linked.";
    };

    linkedAccounts := Array.append(linkedAccounts, [("Oisy", oisy)]);

    uuidToLinkedAccounts.put(canonicalUUID, linkedAccounts);

    return "Oisy account linked successfully.";
  };

  public shared (msg) func getPendingLinkRequestsForTarget(target : Principal) : async [Types.LinkRequest] {

    if (msg.caller != target and not isAdmin(msg.caller)) {
      return [];
    };

    var pendingRequests : [Types.LinkRequest] = [];

    for ((_, linkRequest) in pendingLinkRequests.entries()) {
      if (linkRequest.target == target and linkRequest.status == "pending") {
        pendingRequests := Array.append(pendingRequests, [linkRequest]);
      };
    };

    return pendingRequests;

  };

  public func getLinkStatus(requester : Principal, target : Principal) : async Text {

    let linkKey = makeLinkKey(requester, target);
    switch (pendingLinkRequests.get(linkKey)) {
      case null { return "No link request found." };
      case (?linkRequest) { return linkRequest.status };
    };

  };

  private func generateUUID() : async Text {
    let g = Source.Source();
    let a = UUID.toText(await g.new());
    return a;
  };

  public shared (msg) func createUser(newUser : Types.SerializedUser, accountType : Text, userId : Principal) : async () {
    if (isAdmin(msg.caller)) {

      if (not isAllowedType(accountType)) {
        return;
      };

      let uuid = await generateUUID();
      uuidToUser.put(uuid, Serialization.deserializeUser(newUser));
      principalToUUID.put(userId, uuid);
      uuidToLinkedAccounts.put(uuid, [(accountType, userId)]);
    };
  };

  public query (msg) func getUUID(userId : Principal) : async Text {

    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      switch (principalToUUID.get(userId)) {
        case (?uuid) { return uuid };
        case null {};
      };

    };

    return "";

  };

  private func getUserUUID(userId : Principal) : Text {

    switch (principalToUUID.get(userId)) {
      case (?uuid) { return uuid };
      case null {};
    };
    return "";
  };

  public query (msg) func getUserSubaccount(uuid : Text) : async [Nat8] {

    if (isAdmin(msg.caller) or (getUserUUID(msg.caller)) == uuid) {
      let encoded = Text.encodeUtf8(uuid # "tui2b-giaaa-aaaag-qnbpq-cai");

      let hashBlob = Sha256.fromBlob(#sha256, encoded);

      let hash = Blob.toArray(hashBlob);

      let subaccount = Array.tabulate(
        32,
        func(i : Nat) : Nat8 {
          if (i < hash.size()) { hash[i] } else { 0 };
        },
      );

      return subaccount;
    };
    return [];

  };

  private func mergeUsers(user1 : Types.SerializedUser, user2 : Types.SerializedUser) : Types.User {

    // Keep the oldest creationTime.
    let mergedCreationTime = if (user1.creationTime <= user2.creationTime) {
      user1.creationTime;
    } else { user2.creationTime };

    // Helper to merge optional Text fields.
    let mergeOptionalText = func(field1 : ?Text, field2 : ?Text, creationTime1 : Int, creationTime2 : Int) : ?Text {
      switch (field1, field2) {
        case (null, null) { null };
        case (null, ?v2) { ?v2 };
        case (?v1, null) { ?v1 };
        case (?v1, ?v2) {
          if (v1 == v2) {
            ?v1;
          } else if (creationTime1 >= creationTime2) {
            ?v1;
          } else {
            ?v2;
          };
        };
      };
    };

    // Helper to merge optional Nat fields.
    let mergeOptionalNat = func(field1 : ?Nat, field2 : ?Nat) : ?Nat {
      switch (field1, field2) {
        case (null, null) { null };
        case (null, ?v2) { ?v2 };
        case (?v1, null) { ?v1 };
        case (?v1, ?v2) { if (v1 == v2) { ?v1 } else { null } };
      };
    };

    // Helper to merge optional Principal fields.
    let mergeOptionalPrincipal = func(field1 : ?Principal, field2 : ?Principal) : ?Principal {
      switch (field1, field2) {
        case (null, null) { null };
        case (null, ?v2) { ?v2 };
        case (?v1, null) { ?v1 };
        case (?v1, ?v2) { if (v1 == v2) { ?v1 } else { null } };
      };
    };

    // Merge categories: union the two lists (if any).
    let mergeCategories = func(cat1 : ?[Text], cat2 : ?[Text]) : ?[Text] {
      switch (cat1, cat2) {
        case (null, null) { null };
        case (null, ?l2) { ?l2 };
        case (?l1, null) { ?l1 };
        case (?l1, ?l2) {
          let merged = Array.append(l1, l2);
          ?(
            Array.foldLeft<Text, [Text]>(
              merged,
              [],
              func(acc : [Text], t : Text) : [Text] {
                if (Array.find<Text>(acc, func(x : Text) : Bool { x == t }) != null) {
                  acc;
                } else {
                  Array.append(acc, [t]);
                };
              },
            )
          );
        };
      };
    };

    return {
      var twitterid = mergeOptionalNat(user1.twitterid, user2.twitterid);
      var twitterhandle = mergeOptionalText(user1.twitterhandle, user2.twitterhandle, user1.creationTime, user2.creationTime);
      creationTime = mergedCreationTime;
      var pfpProgress = if (user1.pfpProgress == "verified" or user2.pfpProgress == "verified") {
        "verified"
      } else if (user1.pfpProgress == "loading" or user2.pfpProgress == "loading") {
        "loading"
      } else {
        "false"
      };
      var deducedPoints = switch (mergeOptionalNat(?user1.deducedPoints, ?user2.deducedPoints)) {
        case (?n) { n };
        case null { 0 };
      };
      var ocProfile = mergeOptionalText(user1.ocProfile, user2.ocProfile, user1.creationTime, user2.creationTime);
      var discordUser = mergeOptionalText(user1.discordUser, user2.discordUser, user1.creationTime, user2.creationTime);
      var telegramUser = mergeOptionalText(user1.telegramUser, user2.telegramUser, user1.creationTime, user2.creationTime);
      var nnsPrincipal = mergeOptionalPrincipal(user1.nnsPrincipal, user2.nnsPrincipal);
      var firstname = mergeOptionalText(user1.firstname, user2.firstname, user1.creationTime, user2.creationTime);
      var lastname = mergeOptionalText(user1.lastname, user2.lastname, user1.creationTime, user2.creationTime);
      var username = mergeOptionalText(user1.username, user2.username, user1.creationTime, user2.creationTime);
      var email = mergeOptionalText(user1.email, user2.email, user1.creationTime, user2.creationTime);
      var bio = mergeOptionalText(user1.bio, user2.bio, user1.creationTime, user2.creationTime);
      var categories = mergeCategories(user1.categories, user2.categories);
      var profilepic = mergeOptionalText(user1.profilepic, user2.profilepic, user1.creationTime, user2.creationTime);
      var coverphoto = mergeOptionalText(user1.coverphoto, user2.coverphoto, user1.creationTime, user2.creationTime);
      var country = mergeOptionalText(user1.country, user2.country, user1.creationTime, user2.creationTime);
      var timezone = mergeOptionalText(user1.timezone, user2.timezone, user1.creationTime, user2.creationTime);
    };
  };

  public shared (msg) func mergeAccounts(canonicalUUID : Text, mergingUUID : Text) : async Text {
    if (isAdmin(msg.caller)) {
      let maybeCanonicalUser = uuidToUser.get(canonicalUUID);
      let maybeMergingUser = uuidToUser.get(mergingUUID);

      switch (maybeCanonicalUser, maybeMergingUser) {
        case (null, null) {
          return "No user accounts found for the provided UUIDs.";
        };
        case (null, ?user2) {
          // If a canonical record does not exist, we simply adopt the merging record.
          uuidToUser.put(canonicalUUID, user2);
          uuidToUser.delete(mergingUUID);
          return "Canonical user not found; merged account has been assigned to the canonical UUID.";
        };
        case (?_, null) {
          return "Merging user not found.";
        };
        case (?user1, ?user2) {
          let mergedUser = mergeUsers(Serialization.serializeUser(user1), Serialization.serializeUser(user2));
          uuidToUser.put(canonicalUUID, mergedUser);
          uuidToUser.delete(mergingUUID);
          return "Accounts merged successfully.";
        };
      };
    };
    return "";
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
    if (isAdmin(msg.caller)) {

      if (status != "online" and status != "offline") {
        return "Invalid Status";
      };

      if (isAdmin(msg.caller)) {
        let size = Vector.size(projects);
        for (i in Iter.range(0, size - 1)) {
          let existingProjectOpt = Vector.get(projects, i);
          switch (existingProjectOpt) {
            case (project) {
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
