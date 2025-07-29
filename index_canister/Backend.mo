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
import Option "mo:base/Option";
import Debug "mo:base/Debug";

persistent actor class Backend() {

  transient let indexCanisterId : Text = "q3itu-vqaaa-aaaag-qngyq-cai";

  transient let konectaCanisterId : Text = "ynkdv-7qaaa-aaaag-qkluq-cai";

  stable var projects : Vector.Vector<Types.ProjectMissions> = Vector.new<Types.ProjectMissions>();

  stable var projectsV2 : Vector.Vector<Principal> = Vector.new<Principal>();

  private transient var principalToUUID : TrieMap.TrieMap<Principal, Text> = TrieMap.TrieMap<Principal, Text>(Principal.equal, Principal.hash);

  stable var serializedPrincipalToUUID : [(Principal, Text)] = [];

  private transient var uuidToLinkedAccounts : TrieMap.TrieMap<Text, [(Text, Principal)]> = TrieMap.TrieMap<Text, [(Text, Principal)]>(Text.equal, Text.hash);

  stable var serializedUuidToLinkedAccounts : [(Text, [(Text, Principal)])] = [];

  stable var allowedAccountTypes : [Text] = ["NFIDW", "InternetIdentity", "Oisy"];

  private transient var uuidToUser : TrieMap.TrieMap<Text, Types.GlobalUser> = TrieMap.TrieMap<Text, Types.GlobalUser>(Text.equal, Text.hash);

  stable var serializedUuidToUser : [(Text, Types.SerializedGlobalUser)] = [];

  private transient var accountTypeLinkTimestamps : TrieMap.TrieMap<Text, TrieMap.TrieMap<Text, Int>> = TrieMap.TrieMap<Text, TrieMap.TrieMap<Text, Int>>(Text.equal, Text.hash);

  stable var serializedAccountTypeLinkTimestamps : [(Text, [(Text, Int)])] = [];

  stable var unlinkedPrincipals : [Principal] = [];

  stable var failedTransfers : [(Principal, Text)] = [];

  stable var uuidToRedditHandle : [(Text, Text)] = [];

  stable let currentVersion : Text = "V2.0";

  // Pre-upgrade function

  public shared func addProjectV2(project : Principal) : async Bool {
    Vector.add(projectsV2, project);
    return true;
  };

  public shared query func getProjects() : async [Principal] {
    return Vector.toArray(projectsV2);
  };

  system func preupgrade() {

    let principalToUUIDEntries = principalToUUID.entries();
    serializedPrincipalToUUID := Iter.toArray(principalToUUIDEntries);

    let uuidToLinkedAccountsEntries = uuidToLinkedAccounts.entries();
    serializedUuidToLinkedAccounts := Iter.toArray(uuidToLinkedAccountsEntries);

    let pendingLinkRequestsEntries = pendingLinkRequests.entries();
    serializedPendingLinkRequests := Iter.toArray(pendingLinkRequestsEntries);

    let uuidToUserEntries = uuidToUser.entries();
    serializedUuidToUser := Iter.toArray(
      Iter.map<(Text, Types.GlobalUser), (Text, Types.SerializedGlobalUser)>(
        uuidToUserEntries,
        func(pair : (Text, Types.GlobalUser)) : (Text, Types.SerializedGlobalUser) {
          let (key, user) = pair;
          (key, Serialization.serializeUser(user));
        },
      )
    );

    let accountTypeLinkTimestampsEntries = accountTypeLinkTimestamps.entries();

    serializedAccountTypeLinkTimestamps := Iter.toArray(
      Iter.map<(Text, TrieMap.TrieMap<Text, Int>), (Text, [(Text, Int)])>(
        accountTypeLinkTimestampsEntries,
        func(pair : (Text, TrieMap.TrieMap<Text, Int>)) : (Text, [(Text, Int)]) {
          let (key, innerMap) = pair;
          let innerEntries = innerMap.entries();
          let innerList = Iter.toArray(innerEntries);
          (key, innerList);
        },
      )
    );
  };

  // Post-upgrade function

  system func postupgrade() {

    principalToUUID := TrieMap.TrieMap<Principal, Text>(Principal.equal, Principal.hash);

    for ((principal, textValue) in Iter.fromArray(serializedPrincipalToUUID)) {
      principalToUUID.put(principal, textValue);
    };

    serializedPrincipalToUUID := [];

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

    uuidToUser := TrieMap.TrieMap<Text, Types.GlobalUser>(Text.equal, Text.hash);

    for ((text, user) in Iter.fromArray(serializedUuidToUser)) {
      uuidToUser.put(text, Serialization.deserializeUser(user));
    };

    serializedUuidToUser := [];

    accountTypeLinkTimestamps := TrieMap.TrieMap<Text, TrieMap.TrieMap<Text, Int>>(Text.equal, Text.hash);

    for ((text, innerList) in Iter.fromArray(serializedAccountTypeLinkTimestamps)) {
      let innerMap = TrieMap.TrieMap<Text, Int>(Text.equal, Text.hash);
      for ((accType, timestamp) in Iter.fromArray(innerList)) {
        innerMap.put(accType, timestamp);
      };
      accountTypeLinkTimestamps.put(text, innerMap);
    };

    serializedAccountTypeLinkTimestamps := [];

  };

  public shared query (msg) func getAllowedAccountTypes() : async [Text] {
    if (not Principal.isAnonymous(msg.caller)) {
      return allowedAccountTypes;
    };
    return [];
  };

  // Returns the linked accounts for the given principal.
  public shared query (msg) func getLinkedAccountsForPrincipal(userId : Principal) : async [(Text, Principal)] {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      let uuid = getUserUUID(userId);
      switch (uuidToLinkedAccounts.get(uuid)) {
        case (?accounts) { return accounts };
        case null { return [] };
      };
    };
    return [];
  };

  // Returns the remaining cooldown (in nanoseconds) for linking an account of a specific type.
  public shared query (msg) func getLinkCooldownForPrincipal(userId : Principal, accType : Text) : async Int {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      let uuid = getUserUUID(userId);
      let currentTime = Time.now();
      let oneMonthNanoseconds : Int = 2592000 * 1000000000;
      switch (accountTypeLinkTimestamps.get(uuid)) {
        case null { return 0 };
        case (?innerMap) {
          switch (innerMap.get(accType)) {
            case null { return 0 };
            case (?timestamp) {
              let elapsed = currentTime - timestamp;
              if (elapsed >= oneMonthNanoseconds) { return 0 } else {
                return oneMonthNanoseconds - elapsed;
              };
            };
          };
        };
      };
    };
    return 2147483647;
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

  private transient var pendingLinkRequests : TrieMap.TrieMap<Text, Types.LinkRequest> = TrieMap.TrieMap<Text, Types.LinkRequest>(Text.equal, Text.hash);

  stable var serializedPendingLinkRequests : [(Text, Types.LinkRequest)] = [];

  private func canLinkForUUID(uuid : Text, accType : Text, currentTime : Int) : Bool {
    let oneMonthNanoseconds : Int = 2592000 * 1000000000;
    switch (accountTypeLinkTimestamps.get(uuid)) {
      case null {
        // No account of any type was unlinked before for this UUID.
        true;
      };
      case (?innerMap) {
        switch (innerMap.get(accType)) {
          case null {
            // This account type was never linked (or was never unlinked).
            true;
          };
          case (?timestamp) {
            // Only allow linking if at least one month has passed since the original linking.
            (currentTime - timestamp) >= oneMonthNanoseconds;
          };
        };
      };
    };
  };

  private func isUnlinked(principal : Principal) : Bool {
    Array.find(unlinkedPrincipals, func(p : Principal) : Bool { p == principal }) != null;
  };

  public shared (msg) func initiateLink(requester : Principal, requesterType : Text, target : Principal, targetType : Text) : async Text {
    if (msg.caller != requester) {
      return "Unauthorized: Caller does not match the requester.";
    };
    if (isUnlinked(requester) or isUnlinked(target)) {
      return "One of the involved principals has been unlinked and cannot participate in linking.";
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

    let maybeRequesterUUID = getUserUUID(requester);
    let maybeTargetUUID = getUserUUID(target);
    switch (maybeRequesterUUID, maybeTargetUUID) {
      case ("", _) { return "Requester is not registered." };
      case (_, "") { return "Target is not registered." };
      case (requesterUUID, targetUUID) {
        if (requesterUUID == targetUUID) {
          return "Accounts are already linked.";
        };

        let requesterAlreadyLinked = switch (uuidToLinkedAccounts.get(requesterUUID)) {
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

        if (requesterAlreadyLinked) {
          return "An account of type '" # requesterType # "' is already linked for the requester.";
        };

        let targetAlreadyLinked = switch (uuidToLinkedAccounts.get(targetUUID)) {
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

        if (targetAlreadyLinked) {
          return "An account of type '" # targetType # "' is already linked for the target.";
        };

        let currentTime = Time.now();
        if (not canLinkForUUID(requesterUUID, requesterType, currentTime)) {
          return "Requester cannot link an account of type " # requesterType # " until one month has passed since the previous linking.";
        };
        if (not canLinkForUUID(targetUUID, targetType, currentTime)) {
          return "Target cannot link an account of type " # targetType # " until one month has passed since the previous linking.";
        };

        let linkKey = makeLinkKey(requester, target);
        let linkRequest : Types.LinkRequest = {
          requester = requester;
          requesterType = requesterType;
          target = target;
          targetType = targetType;
          status = "pending";
          requestedAt = currentTime;
        };
        pendingLinkRequests.put(linkKey, linkRequest);
        return "Link request initiated. Awaiting acceptance from the target account.";
      };
    };
  };

  public shared (msg) func acceptLink(requester : Principal, target : Principal, canonicalUUID : Text) : async Text {
    if (msg.caller != target) {
      return "Unauthorized: Only the target account can accept the link request.";
    };
    if (isUnlinked(requester) or isUnlinked(target)) {
      return "One of the involved principals has been unlinked and cannot participate in linking.";
    };

    let maybeRequesterUUID = getUserUUID(requester);
    let maybeTargetUUID = getUserUUID(target);
    switch (maybeRequesterUUID, maybeTargetUUID) {
      case ("", _) { return "Requester is not registered." };
      case (_, "") { return "Target is not registered." };
      case (requesterUUID, targetUUID) {
        if (canonicalUUID != requesterUUID and canonicalUUID != targetUUID) {
          return "Invalid canonical UUID provided. It must match one of the existing account UUIDs.";
        };

        let linkKey = makeLinkKey(requester, target);
        switch (pendingLinkRequests.get(linkKey)) {
          case null { return "No pending link request found." };
          case (?linkRequest) {
            if (linkRequest.target != target) {
              return "Unauthorized: Only the target account can accept this request.";
            };

            // Update principal mappings
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
              await recordLinkTimestamp(canonicalUUID, linkRequest.requesterType);
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
              await recordLinkTimestamp(canonicalUUID, linkRequest.targetType);
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

            return "Link accepted. Accounts have been merged under UUID: " # canonicalUUID;
          };
        };
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
    if (isUnlinked(currentUser) or isUnlinked(oisy)) {
      return "One of the involved principals has been unlinked and cannot participate in linking.";
    };
    if (not isAllowedType("Oisy")) {
      return "Oisy account type is not allowed.";
    };

    let maybeCanonicalUUID = getUserUUID(currentUser);
    switch (maybeCanonicalUUID) {
      case "" { return "Current user is not registered." };
      case (canonicalUUID) {
        // Prevent linking if the Oisy principal is already registered.
        if (getUserUUID(oisy) != "") {
          return "The Oisy principal is already linked to an account.";
        };

        let currentTime = Time.now();
        if (not canLinkForUUID(canonicalUUID, "Oisy", currentTime)) {
          return "Cannot link an Oisy account until one month has passed since the previous linking.";
        };

        var linkedAccounts : [(Text, Principal)] = switch (uuidToLinkedAccounts.get(canonicalUUID)) {
          case (?vec) { vec };
          case null { [] };
        };

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

        principalToUUID.put(oisy, canonicalUUID);
        linkedAccounts := Array.append(linkedAccounts, [("Oisy", oisy)]);
        uuidToLinkedAccounts.put(canonicalUUID, linkedAccounts);
        await recordLinkTimestamp(canonicalUUID, "Oisy");

        return "Oisy account linked successfully.";
      };
    };
  };

  public shared query (msg) func getOisyWallet(userId : Principal) : async ?Principal {
    if (isAdmin(msg.caller) or isProject(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      let uuid = getUserUUID(userId);
      switch (uuidToLinkedAccounts.get(uuid)) {
        case (?linkedAccounts) {
          let oisyEntry = Array.find(
            linkedAccounts,
            func(entry : (Text, Principal)) : Bool {
              let (accType, _) = entry;
              accType == "Oisy";
            },
          );
          switch (oisyEntry) {
            case (?entry) {
              let (_, oisyPrincipal) = entry;
              return ?oisyPrincipal;
            };
            case null { return null };
          };
        };
        case null { return null };
      };
    };
    return null;
  };

  public shared query (msg) func getPendingLinkRequestsForTarget(target : Principal) : async [Types.LinkRequest] {

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

  private func recordLinkTimestamp(uuid : Text, accType : Text) : async () {
    let currentTime = Time.now();
    switch (accountTypeLinkTimestamps.get(uuid)) {
      case null {
        // Create an inner map if one doesn't exist for this UUID.
        let innerMap = TrieMap.TrieMap<Text, Int>(Text.equal, Text.hash);
        innerMap.put(accType, currentTime);
        accountTypeLinkTimestamps.put(uuid, innerMap);
      };
      case (?innerMap) {
        // Record the timestamp only if this account type hasn't been recorded yet.
        if (innerMap.get(accType) == null) {
          innerMap.put(accType, currentTime);
        };
      };
    };
  };

  public shared (msg) func unlinkPrincipal(principal : Principal) : async Text {
    // Authorization: only the principal itself (or an admin) may unlink.
    if (msg.caller != principal and not isAdmin(msg.caller)) {
      return "Unauthorized: Only the account owner or an admin can unlink this principal.";
    };

    // Check if this principal has already been unlinked.
    if (Array.find(unlinkedPrincipals, func(p : Principal) : Bool { p == principal }) != null) {
      return "This principal has already been unlinked and cannot be relinked.";
    };

    // Look up the UUID for this principal.
    switch (principalToUUID.get(principal)) {
      case null {
        return "Principal is not linked to any account.";
      };
      case (?uuid) {
        // Remove the mapping from principal to UUID.
        principalToUUID.delete(principal);

        // Retrieve the list of linked accounts for this user.
        switch (uuidToLinkedAccounts.get(uuid)) {
          case null {
            return "Internal error: No linked accounts found for this user.";
          };
          case (?linkedAccounts) {
            // Find the account entry for this principal.
            let maybeEntry = Array.find(
              linkedAccounts,
              func(entry : (Text, Principal)) : Bool {
                let (accType, p) = entry;
                p == principal;
              },
            );
            switch (maybeEntry) {
              case null {
                return "Principal not found in linked accounts.";
              };
              case (?entry) {
                let (accType, _) = entry;
                // Remove the entry from the user's linked accounts.
                let updatedAccounts = Array.filter(
                  linkedAccounts,
                  func(e : (Text, Principal)) : Bool {
                    let (_, p) = e;
                    p != principal;
                  },
                );
                uuidToLinkedAccounts.put(uuid, updatedAccounts);

                // Mark the principal as permanently unlinked (using an array).
                unlinkedPrincipals := Array.append(unlinkedPrincipals, [principal]);

                // Record the original linking timestamp using the nested map.
                await recordLinkTimestamp(uuid, accType);

                return "Principal unlinked successfully. A new principal of the same account type cannot be linked until one month has passed since the original linking time.";
              };
            };
          };
        };
      };
    };
  };

  public shared query func getLinkStatus(requester : Principal, target : Principal) : async Text {

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

  public shared (msg) func createUser(userId : Principal, accountType : Text) : async ?Types.SerializedGlobalUser {

    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      if (not isAllowedType(accountType)) {
        return null;
      };

      if (principalToUUID.get(userId) != null) {
        return null;
      };

      let uuid = await generateUUID();

      let newUser : Types.GlobalUser = {
        var twitterid = null;
        var twitterhandle = null;
        creationTime = Time.now();
        var pfpProgress = "false";
        var deducedPoints = 0;
        var ocProfile = null;
        var discordUser = null;
        var telegramUser = null;
        var nuanceUser = null;
        var nnsPrincipal = null;
        var firstname = null;
        var lastname = null;
        var username = null;
        var email = null;
        var bio = null;
        var categories = null;
        var profilepic = null;
        var coverphoto = null;
        var country = null;
        var timezone = null;
        var icrc1tokens = null;
        var nft721 = null;
      };

      uuidToUser.put(uuid, newUser);
      principalToUUID.put(userId, uuid);
      uuidToLinkedAccounts.put(uuid, [(accountType, userId)]);

      let konectaCanister = actor (konectaCanisterId) : actor {
        completeMainMission : (Text) -> async ();
      };

      await konectaCanister.completeMainMission(uuid);

      return ?Serialization.serializeUser(newUser);
    };
    return null;
  };

  public query (msg) func getUUID(userId : Principal) : async Text {

    if (isAdmin(msg.caller) or isProject(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {

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
      let encoded = Text.encodeUtf8(uuid # indexCanisterId);

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

  private func mergeUsers(user1 : Types.SerializedGlobalUser, user2 : Types.SerializedGlobalUser) : Types.GlobalUser {

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

    let mergePrincipalLists = func(list1 : ?[Principal], list2 : ?[Principal]) : ?[Principal] {
      switch (list1, list2) {
        case (null, null) { null };
        case (null, ?l2) { ?l2 };
        case (?l1, null) { ?l1 };
        case (?l1, ?l2) {
          let merged = Array.append(l1, l2);
          ?(
            Array.foldLeft<Principal, [Principal]>(
              merged,
              [],
              func(acc : [Principal], p : Principal) : [Principal] {
                if (Array.find<Principal>(acc, func(x : Principal) : Bool { x == p }) != null) {
                  acc;
                } else {
                  Array.append(acc, [p]);
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
        "verified";
      } else if (user1.pfpProgress == "loading" or user2.pfpProgress == "loading") {
        "loading";
      } else {
        "false";
      };
      var deducedPoints = switch (mergeOptionalNat(?user1.deducedPoints, ?user2.deducedPoints)) {
        case (?n) { n };
        case null { 0 };
      };
      var ocProfile = mergeOptionalText(user1.ocProfile, user2.ocProfile, user1.creationTime, user2.creationTime);
      var discordUser = mergeOptionalText(user1.discordUser, user2.discordUser, user1.creationTime, user2.creationTime);
      var telegramUser = mergeOptionalText(user1.telegramUser, user2.telegramUser, user1.creationTime, user2.creationTime);
      var nuanceUser = mergeOptionalText(user1.nuanceUser, user2.nuanceUser, user1.creationTime, user2.creationTime);
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
      var icrc1tokens = mergePrincipalLists(user1.icrc1tokens, user2.icrc1tokens);
      var nft721 = mergePrincipalLists(user1.nft721, user2.nft721);
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
          // If a record does not exist, we simply adopt the merging record.
          uuidToUser.put(canonicalUUID, user2);
          uuidToUser.delete(mergingUUID);
          return "User not found; merged account has been assigned to the UUID.";
        };
        case (?_, null) {
          return "Merging user not found.";
        };
        case (?user1, ?user2) {

          let mergingTokens : [Principal] = switch (user2.icrc1tokens) {
            case null { [] };
            case (?tokens) { tokens };
          };

          // Get the subaccount for each account.
          let mergingSubaccount : [Nat8] = await getUserSubaccount(mergingUUID);
          let canonicalSubaccount : [Nat8] = await getUserSubaccount(canonicalUUID);

          // Define the ledger principal (used for constructing the Account record)
          let ledgerPrincipal = Principal.fromText(indexCanisterId);

          // Process each token canister
          for (tokenPrincipal in Iter.fromArray(mergingTokens)) {
            // Create an actor for the token canister.
            let tokenCanister = actor (Principal.toText(tokenPrincipal)) : actor {
              icrc1_transfer : (Types.TransferArg) -> async (Types.Icrc1TransferResult);
              icrc1_balance_of : query (Types.Account) -> async (Types.Icrc1Tokens);
              icrc1_fee : query () -> async (Nat);
            };

            // Build the Account record for checking balance.
            let accountForBalance : Types.Account = {
              owner = ledgerPrincipal;
              subaccount = ?Blob.fromArray(mergingSubaccount);
            };

            // Query the balance.
            let balance : Types.Icrc1Tokens = await tokenCanister.icrc1_balance_of(accountForBalance);

            if (balance > 0) {
              // Get the fee required for a transfer.
              let fee : Nat = await tokenCanister.icrc1_fee();
              let transferable : Types.Icrc1Tokens = balance - fee;
              if (transferable > 0) {
                // Build the destination Account record.
                let canonicalAccount : Types.Account = {
                  owner = ledgerPrincipal;
                  subaccount = ?Blob.fromArray(canonicalSubaccount);
                };

                // Prepare the transfer argument.
                let transferArg : Types.TransferArg = {
                  from_subaccount = ?Blob.fromArray(mergingSubaccount);
                  to = canonicalAccount;
                  amount = transferable;
                  fee = ?fee;
                  memo = null;
                  created_at_time = null;
                };

                // Initiate the transfer.
                let transferResult = await tokenCanister.icrc1_transfer(transferArg);
                switch (transferResult) {
                  case (#Ok(_)) {};
                  case (#Err(_)) {
                    // add the details of the failed transfer to a log
                    let fromSubaccountStr = "from_subaccount: " # Array.foldLeft<Nat8, Text>(
                      mergingSubaccount,
                      "",
                      func(acc, n) { acc # Nat.toText(Nat8.toNat(n)) # " " },
                    );
                    let toStr = "to: " # Principal.toText(canonicalAccount.owner);
                    let amountStr = "amount: " # Nat.toText(transferable);
                    let feeStr = "fee: " # Nat.toText(fee);
                    let details = "Transfer failed on token: " # Principal.toText(tokenPrincipal)
                    # ", Error: " # "Error occurred"
                    # ", " # fromSubaccountStr
                    # ", " # toStr
                    # ", " # amountStr
                    # ", " # feeStr;
                    failedTransfers := Array.append(failedTransfers, [(tokenPrincipal, details)]);
                  };
                };
              };
            };
          };

          let konectaActor = actor (konectaCanisterId) : actor {
            //CAMBIAR
            mergeAccounts : (Text, Text) -> async Text;
          };

          let mergeResult = await konectaActor.mergeAccounts(canonicalUUID, mergingUUID);

          if (mergeResult != "Success") {
            return "Error merging accounts on the Konecta canister";
          };

          for (project in Iter.fromArray(Vector.toArray(projects))) {
            let projectActor = actor (Principal.toText(project.canisterId)) : actor {
              mergeAccounts : (Text, Text) -> async Text;
              getVersion : query () -> async Text;
            };

            let projectCanisterVersion = await projectActor.getVersion();
            if (projectCanisterVersion == currentVersion) {
              let projectMergeResult = await projectActor.mergeAccounts(canonicalUUID, mergingUUID);
              if (projectMergeResult != "Success") {
                return "Error merging accounts on the Project: " # project.name;
              };
            };
          };

          let mergedUser = mergeUsers(Serialization.serializeUser(user1), Serialization.serializeUser(user2));
          uuidToUser.put(canonicalUUID, mergedUser);
          uuidToUser.delete(mergingUUID);
          return "Accounts merged successfully.";
        };
      };
    };
    return "";
  };

  public query (msg) func getUserByUUID(uuid : Text) : async ?Types.SerializedGlobalUser {
    if (isAdmin(msg.caller) or (getUserUUID(msg.caller)) == uuid) {
      switch (uuidToUser.get(uuid)) {
        case (?user) {
          return ?Serialization.serializeUser(user);
        };
        case null {
          return null;
        };
      };
    };
    return null;
  };

  public shared query (msg) func getAllUsers() : async [(Text, Types.SerializedGlobalUser)] {
    if (isAdmin(msg.caller)) {
      let uuidToUserEntries = uuidToUser.entries();
      return Iter.toArray(
        Iter.map<(Text, Types.GlobalUser), (Text, Types.SerializedGlobalUser)>(
          uuidToUserEntries,
          func(pair : (Text, Types.GlobalUser)) : (Text, Types.SerializedGlobalUser) {
            let (key, user) = pair;
            (key, Serialization.serializeUser(user));
          },
        )
      );
    };
    return [];
  };

  public query (msg) func getUserByPrincipal(userId : Principal) : async ?Types.SerializedGlobalUser {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {
      switch (uuidToUser.get(getUserUUID(userId))) {
        case (?user) {
          return ?Serialization.serializeUser(user);
        };
        case null {};
      };
    };
    return null;
  };

  public shared query (msg) func getAllPrincipalsWithUUIDs() : async [(Principal, Text)] {
    if (isAdmin(msg.caller)) {
      return Iter.toArray(principalToUUID.entries());
    };
    return [];
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

  public shared (msg) func removeProjectMissions(canisterId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      let projectArray = Vector.toArray(projects);
      let filteredProjects = Array.filter<Types.ProjectMissions>(
        projectArray,
        func(p : Types.ProjectMissions) : Bool {
          p.canisterId != canisterId;
        },
      );
      projects := Vector.fromArray(filteredProjects);
      return;
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

  private func isProject(principalId : Principal) : Bool {
    return Array.find<Principal>(
      Vector.toArray(projectsV2),
      func(id : Principal) : Bool {
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

  public shared query (msg) func isTwitterIdUsed(userUUID : Text, twitterhandle : Text) : async Bool {
    if (isAdmin(msg.caller)) {
      for ((uuid, user) in uuidToUser.entries()) {
        if (uuid != userUUID) {
          switch (user.twitterhandle) {
            case (?th) {
              if (th == twitterhandle) {
                return true;
              };
            };
            case null {};
          };
        };
      };
    };
    return false;
  };

  public shared query (msg) func isRedditUsed(userUUID : Text, reddithandle : Text) : async Bool {
    if (isAdmin(msg.caller)) {
      let matching = Array.find(
        uuidToRedditHandle,
        func(pair : (Text, Text)) : Bool {
          let (id, handle) = pair;
          (id != userUUID) and (handle == reddithandle);
        },
      );
      switch (matching) {
        case (?_) { return true };
        case null { return false };
      };
    };
    return false;
  };

  public shared query (msg) func isDiscordUsed(userUUID : Text, discordHandle : Text) : async Bool {
    if (isAdmin(msg.caller)) {
      for ((uuid, user) in uuidToUser.entries()) {
        // skip the user themselves
        if (uuid != userUUID) {
          switch (user.discordUser) {
            case (?dh) {
              if (dh == discordHandle) {
                return true;
              };
            };
            case null { /* no discord handle on this record */ };
          };
        };
      };
    };
    return false;
  };

  public shared query (msg) func isNuanceHandleUsed(userUUID : Text, nuanceHandle : Text) : async Bool {
    if (isAdmin(msg.caller)) {
      for ((uuid, user) in uuidToUser.entries()) {
        if (uuid != userUUID) {
          switch (user.nuanceUser) {
            case (?nHandle) {
              if (nHandle == nuanceHandle) {
                return true;
              };
            };
            case null {};
          };
        };
      };
    };
    return false;
  };

  public shared query (msg) func getNFIDbyUUID(uuid : Text) : async ?Principal {
    if (isAdmin(msg.caller) or (isProject(msg.caller)) or (getUserUUID(msg.caller)) == uuid) {
      switch (uuidToLinkedAccounts.get(uuid)) {
        case (?accounts) {
          // Look for an account with type "NFIDW"
          let nfAccount = Array.find(
            accounts,
            func(entry : (Text, Principal)) : Bool {
              let (accType, _) = entry;
              accType == "NFIDW";
            },
          );
          switch (nfAccount) {
            case (?(_, principal)) { return ?principal };
            case null {};
          };
        };
        case null {};
      };
    };
    return null;
  };

  // Returns, for each UUID in the input array, the NFIDW principal (if any).
  public shared query (msg) func getBatchNFIDbyUUID(uuids : [Text]) : async [(Text, ?Principal)] {
    // Only admins or project canister calls can fetch in bulk
    if (not (isAdmin(msg.caller) or isProject(msg.caller))) {
      return [];
    };

    var results : [(Text, ?Principal)] = [];
    for (uuid in Iter.fromArray(uuids)) {
      switch (uuidToLinkedAccounts.get(uuid)) {
        case (?accounts) {
          // find the NFIDW entry in the linked‐accounts list
          let nfEntry = Array.find<(Text, Principal)>(
            accounts,
            func(entry) : Bool { entry.0 == "NFIDW" },
          );
          switch (nfEntry) {
            case (?(_, p)) { results := Array.append(results, [(uuid, ?p)]) };
            case null {
              results := Array.append(results, [(uuid, null)]);
            };
          };
        };
        case null {
          // no linked accounts at all
          results := Array.append(results, [(uuid, null)]);
        };
      };
    };
    results;
  };

  public shared query (msg) func getPFPProgress(userId : Principal) : async ?Text {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      let uuid = getUserUUID(userId);
      if (uuid == "") {
        return null;
      };
      switch (uuidToUser.get(uuid)) {
        case (?user) { return ?user.pfpProgress };
        case null { return null };
      };
    };
    return null;
  };

  public shared (msg) func setPFPProgressLoading(userId : Principal) : async Text {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      let uuid = getUserUUID(userId);
      if (uuid == "") {
        return "User not found";
      };
      switch (uuidToUser.get(uuid)) {
        case (?user) {
          // Reconstruct the user record updating only pfpProgress to "loading"
          let updatedUser : Types.GlobalUser = {
            var twitterid = user.twitterid;
            var twitterhandle = user.twitterhandle;
            creationTime = user.creationTime;
            var pfpProgress = "loading";
            var deducedPoints = user.deducedPoints;
            var ocProfile = user.ocProfile;
            var discordUser = user.discordUser;
            var telegramUser = user.telegramUser;
            var nuanceUser = user.nuanceUser;
            var nnsPrincipal = user.nnsPrincipal;
            var firstname = user.firstname;
            var lastname = user.lastname;
            var username = user.username;
            var email = user.email;
            var bio = user.bio;
            var categories = user.categories;
            var profilepic = user.profilepic;
            var coverphoto = user.coverphoto;
            var country = user.country;
            var timezone = user.timezone;
            var icrc1tokens = user.icrc1tokens;
            var nft721 = user.nft721;
          };
          uuidToUser.put(uuid, updatedUser);
          return "loading";
        };
        case null {
          return "User not found";
        };
      };
    };
    return "false";
  };

  public shared (msg) func setPFPProgress(userId : Principal) : async Text {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      let uuid = getUserUUID(userId);
      if (uuid == "") {
        return "User not found";
      };
      switch (uuidToUser.get(uuid)) {
        case (?user) {
          let updatedUser : Types.GlobalUser = {
            var twitterid = user.twitterid;
            var twitterhandle = user.twitterhandle;
            creationTime = user.creationTime;
            var pfpProgress = "verified";
            var deducedPoints = user.deducedPoints;
            var ocProfile = user.ocProfile;
            var discordUser = user.discordUser;
            var telegramUser = user.telegramUser;
            var nuanceUser = user.nuanceUser;
            var nnsPrincipal = user.nnsPrincipal;
            var firstname = user.firstname;
            var lastname = user.lastname;
            var username = user.username;
            var email = user.email;
            var bio = user.bio;
            var categories = user.categories;
            var profilepic = user.profilepic;
            var coverphoto = user.coverphoto;
            var country = user.country;
            var timezone = user.timezone;
            var icrc1tokens = user.icrc1tokens;
            var nft721 = user.nft721;
          };
          uuidToUser.put(uuid, updatedUser);
          return "verified";
        };
        case null {
          return "User not found";
        };
      };
    };
    return "false";
  };

  public shared (msg) func addNuanceHandleToUserByUUID(uuid : Text, nuanceHandle : Text) : async Text {
    if (not isAdmin(msg.caller)) {
      return "Unauthorized: Only admin can update users.";
    };

    switch (uuidToUser.get(uuid)) {
      case null {
        return "User not found.";
      };
      case (?globalUser) {
        if (globalUser.nuanceUser == null) {
          globalUser.nuanceUser := ?nuanceHandle;
          uuidToUser.put(uuid, globalUser);
          return "Nuance handle added successfully.";
        } else {
          return "User already has a nuance handle.";
        };
      };
    };
  };

  public shared query (msg) func getNuanceIDByUUID(uuid : Text) : async Text {
    if (not isAdmin(msg.caller)) {
      return "";
    };

    switch (uuidToUser.get(uuid)) {
      case (null) {
        return "";
      };
      case (?globalUser) {
        switch (globalUser.nuanceUser) {
          case (null) {
            return "";
          };
          case (?nuanceID) {
            return nuanceID;
          };
        };
      };
    };
  };

  public shared query (msg) func getDiscordByUUID(uuid : Text) : async Text {
    if (not isAdmin(msg.caller)) {
      return "";
    };

    switch (uuidToUser.get(uuid)) {
      case (null) {
        return "";
      };
      case (?globalUser) {
        switch (globalUser.discordUser) {
          case (null) {
            return "";
          };
          case (?discordID) {
            return discordID;
          };
        };
      };
    };
  };

  public shared (msg) func addTwitterInfo(uuid : Text, twitterId : Nat, twitterHandle : Text) : async () {
    if (isAdmin(msg.caller)) {
      switch (uuidToUser.get(uuid)) {
        case (?user) {

          let updatedUser : Types.GlobalUser = {
            var twitterid = ?twitterId;
            var twitterhandle = ?twitterHandle;
            creationTime = user.creationTime;
            var pfpProgress = user.pfpProgress;
            var deducedPoints = user.deducedPoints;
            var ocProfile = user.ocProfile;
            var discordUser = user.discordUser;
            var telegramUser = user.telegramUser;
            var nuanceUser = user.nuanceUser;
            var nnsPrincipal = user.nnsPrincipal;
            var firstname = user.firstname;
            var lastname = user.lastname;
            var username = user.username;
            var email = user.email;
            var bio = user.bio;
            var categories = user.categories;
            var profilepic = user.profilepic;
            var coverphoto = user.coverphoto;
            var country = user.country;
            var timezone = user.timezone;
            var icrc1tokens = user.icrc1tokens;
            var nft721 = user.nft721;
          };
          uuidToUser.put(uuid, updatedUser);
        };
        case null {};
      };
    };
  };

  public shared (msg) func addRedditInfo(uuid : Text, redditHandle : Text) : async () {
    if (isAdmin(msg.caller)) {
      uuidToRedditHandle := Array.append(uuidToRedditHandle, [(uuid, redditHandle)]);
    };
  };

  public shared (msg) func addDiscordInfo(uuid : Text, discordHandle : Text) : async () {
    if (isAdmin(msg.caller)) {
      switch (uuidToUser.get(uuid)) {
        case (?user) {
          let updatedUser : Types.GlobalUser = {
            var twitterid = user.twitterid;
            var twitterhandle = user.twitterhandle;
            creationTime = user.creationTime;
            var pfpProgress = user.pfpProgress;
            var deducedPoints = user.deducedPoints;
            var ocProfile = user.ocProfile;
            var discordUser = ?discordHandle;
            var telegramUser = user.telegramUser;
            var nuanceUser = user.nuanceUser;
            var nnsPrincipal = user.nnsPrincipal;
            var firstname = user.firstname;
            var lastname = user.lastname;
            var username = user.username;
            var email = user.email;
            var bio = user.bio;
            var categories = user.categories;
            var profilepic = user.profilepic;
            var coverphoto = user.coverphoto;
            var country = user.country;
            var timezone = user.timezone;
            var icrc1tokens = user.icrc1tokens;
            var nft721 = user.nft721;
          };
          uuidToUser.put(uuid, updatedUser);
        };
        case null {};
      };
    };
  };

  public shared (msg) func addOCProfile(userId : Principal, ocprofile : Text) : async () {
    if (isAdmin(msg.caller) or (userId == msg.caller and not Principal.isAnonymous(msg.caller))) {
      let uuid = getUserUUID(userId);
      if (uuid == "") {
        return;
      };
      switch (uuidToUser.get(uuid)) {
        case (?user) {
          let updatedUser : Types.GlobalUser = {
            var twitterid = user.twitterid;
            var twitterhandle = user.twitterhandle;
            creationTime = user.creationTime;
            var pfpProgress = user.pfpProgress;
            var deducedPoints = user.deducedPoints;
            var ocProfile = ?ocprofile;
            var discordUser = user.discordUser;
            var telegramUser = user.telegramUser;
            var nuanceUser = user.nuanceUser;
            var nnsPrincipal = user.nnsPrincipal;
            var firstname = user.firstname;
            var lastname = user.lastname;
            var username = user.username;
            var email = user.email;
            var bio = user.bio;
            var categories = user.categories;
            var profilepic = user.profilepic;
            var coverphoto = user.coverphoto;
            var country = user.country;
            var timezone = user.timezone;
            var icrc1tokens = user.icrc1tokens;
            var nft721 = user.nft721;
          };
          uuidToUser.put(uuid, updatedUser);
        };
        case null {};
      };
    };
  };

  private func getPrimaryAccountFromList(linkedAccountsList : [(Text, Principal)]) : (?Principal, ?Text) {
    var nfidPrincipal : ?Principal = null;
    var oisyPrincipal : ?Principal = null;
    var iiPrincipal : ?Principal = null;

    var otherFirstPrincipal : ?Principal = null; // To store the first encountered non-preferred account
    var otherFirstType : ?Text = null;

    if (Array.size(linkedAccountsList) == 0) {
      return (null, null);
    };

    for ((accType, principal) in Iter.fromArray(linkedAccountsList)) {
      if (accType == "NFIDW" and nfidPrincipal == null) {
        // Take the first NFIDW encountered
        nfidPrincipal := ?principal;
      } else if (accType == "Oisy" and oisyPrincipal == null) {
        // Take the first Oisy
        oisyPrincipal := ?principal;
      } else if (accType == "InternetIdentity" and iiPrincipal == null) {
        // Take the first II
        iiPrincipal := ?principal;
      };

      // Capture the first 'other' account in case no preferred types are found
      // and if we haven't already found one of the preferred types.
      // This ensures we only store an "other" if a preferred type isn't immediately found.
      if (otherFirstPrincipal == null and accType != "NFIDW" and accType != "Oisy" and accType != "InternetIdentity") {
        otherFirstPrincipal := ?principal;
        otherFirstType := ?accType;
      };
    };

    if (Option.isSome(nfidPrincipal)) { return (nfidPrincipal, ?"NFIDW") } else if (Option.isSome(oisyPrincipal)) {
      return (oisyPrincipal, ?"Oisy");
    } else if (Option.isSome(iiPrincipal)) {
      return (iiPrincipal, ?"InternetIdentity");
    } else if (Option.isSome(otherFirstPrincipal)) {
      return (otherFirstPrincipal, otherFirstType);
    } // Return the first 'other' if no preferred found
    else {
      // This case implies the list might have contained only preferred types, but they were null (not possible for Principal)
      // or the list was empty (handled at the start), or became empty.
      // As a final fallback, if the list somehow had entries but none matched the above,
      // take the absolute first one. This is defensive.
      if (Array.size(linkedAccountsList) > 0) {
        let (firstType, firstPrincipal) = linkedAccountsList[0];
        return (?firstPrincipal, ?firstType);
      };
      return (null, null); // Should be covered by the empty check at the start
    };
  };

  public shared query (msg) func getBatchPrimaryAccounts(userUUIDs : [Text]) : async [(Text, ?Principal, ?Text)] {
    if (not isProject(msg.caller)) {
      Debug.trap("getBatchPrimaryAccounts: Caller is not authorized.");
    };

    var results : [(Text, ?Principal, ?Text)] = [];

    for (uuid in Iter.fromArray(userUUIDs)) {
      switch (uuidToLinkedAccounts.get(uuid)) {
        case (null) {
          // UUID not found in the map
          results := Array.append(results, [(uuid, null, null)]);
        };
        case (?linkedAccountsList) {
          // UUID found, process its linked accounts
          let (primaryPrincipal, primaryAccountType) = getPrimaryAccountFromList(linkedAccountsList);
          results := Array.append(results, [(uuid, primaryPrincipal, primaryAccountType)]);
        };
      };
    };
    return results;
  };

  public shared query (msg) func getBatchGlobalUsers(userUUIDs : [Text]) : async [(Text, ?Types.SerializedGlobalUser)] {
    if (not isProject(msg.caller)) {
      Debug.trap("getBatchGlobalUsers: Caller is not authorized.");
    };

    var results : [(Text, ?Types.SerializedGlobalUser)] = [];

    for (uuid in Iter.fromArray(userUUIDs)) {
      switch (uuidToUser.get(uuid)) {
        case (null) {
          // UUID not found in the map
          results := Array.append(results, [(uuid, null)]);
        };
        case (?user) {
          // UUID found, serialize the user
          let serializedUser = Serialization.serializeUser(user);
          results := Array.append(results, [(uuid, ?serializedUser)]);
        };
      };
    };
    return results;
  };

  public shared query (msg) func getLinkedAccountsForUUID(uuid : Text) : async [(Text, Principal)] {

    if (not isProject(msg.caller)) {
      Debug.trap("getBatchGlobalUsers: Caller is not authorized.");
    };

    switch (uuidToLinkedAccounts.get(uuid)) {
      case (null) { return [] }; // No entry for UUID means no linked accounts
      case (?accountsList) { return accountsList }; // Return the list of (AccountType, Principal)
    };
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
      "https://3qzqh-pqaaa-aaaag-qnheq-cai.icp0.io",
      "https://3qzqh-pqaaa-aaaag-qnheq-cai.raw.icp0.io",
      "https://3qzqh-pqaaa-aaaag-qnheq-cai.ic0.app",
      "https://3qzqh-pqaaa-aaaag-qnheq-cai.raw.ic0.app",
    ];

    return {
      trusted_origins;
    };
  };

  public shared (msg) func resetall() : async () {
    if (isAdmin(msg.caller)) {
      uuidToUser := TrieMap.TrieMap<Text, Types.GlobalUser>(Text.equal, Text.hash);
      principalToUUID := TrieMap.TrieMap<Principal, Text>(Principal.equal, Principal.hash);
      uuidToLinkedAccounts := TrieMap.TrieMap<Text, [(Text, Principal)]>(Text.equal, Text.hash);
      pendingLinkRequests := TrieMap.TrieMap<Text, Types.LinkRequest>(Text.equal, Text.hash);
      return;
    };
  };
};
