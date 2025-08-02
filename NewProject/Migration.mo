import Principal "mo:base/Principal";

import StableTrieMap "../StableTrieMap";
import NewTypes "NewTypes";
import NewTypesTemp "NewTypesTemp";

module PermissionMigration {
  func convertPermissions(oldPermissions: {
    var addAdmin : Bool;
    var removeAdmin : Bool;
    var editAdmin : Bool;
    var viewAdmins : Bool;
    var editProjectInfo : Bool;
    var createMission : Bool;
    var editMissionInfo : Bool;
    var editMissionFlow : Bool;
    var updateMissionStatus : Bool;
    var viewAnyUserProgress : Bool;
    var resetUserProgress : Bool;
    var adjustUserProgress : Bool;
  }) : NewTypesTemp.Permissions {
    {
      var addAdmin = oldPermissions.addAdmin;
      var removeAdmin = oldPermissions.removeAdmin;
      var editAdmin = oldPermissions.editAdmin;
      var viewAdmins = oldPermissions.viewAdmins;
      var editProjectInfo = oldPermissions.editProjectInfo;
      var createMission = oldPermissions.createMission;
      var editMissionInfo = oldPermissions.editMissionInfo;
      var editMissionFlow = oldPermissions.editMissionFlow;
      var updateMissionStatus = oldPermissions.updateMissionStatus;
      var deleteMission = oldPermissions.createMission;
      var viewAnyUserProgress = oldPermissions.viewAnyUserProgress;
      var resetUserProgress = oldPermissions.resetUserProgress;
      var adjustUserProgress = oldPermissions.adjustUserProgress;
    }
  };

  public func migration(old: {
    var adminPermissions : StableTrieMap.StableTrieMap<Principal, NewTypes.Permissions>;
  }) : {
    var adminPermissions : StableTrieMap.StableTrieMap<Principal, NewTypesTemp.Permissions>;
  } {
    var newAdminPermissions = StableTrieMap.new<Principal, NewTypesTemp.Permissions>();

    for ((principal, oldPerms) in StableTrieMap.entries(old.adminPermissions)) {
      let newPerms = convertPermissions(oldPerms); // Your conversion function
      StableTrieMap.put(newAdminPermissions, Principal.equal, Principal.hash, principal, newPerms);
    };

    {
      var adminPermissions = newAdminPermissions;
    }
  }
};