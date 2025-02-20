import Types "Types";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Vector "mo:vector";

module Serialization {

  func serializeSubMissionArray(subMissionArray : Vector.Vector<Types.MissionV2>) : [Types.SerializedMissionV2] {
    let st = Vector.toArray(subMissionArray);
    return Array.map(st, serializeMissionV2);
  };

  func deserializeSubMissionArray(subMissionArray : [Types.SerializedMissionV2]) : Vector.Vector<Types.MissionV2> {
    let deserializedArray = Array.map(subMissionArray, deserializeMissionV2);
    let st : Vector.Vector<Types.MissionV2> = Vector.fromArray<Types.MissionV2>(deserializedArray);
    return st;
  };

  public func serializeMission(mission : Types.Mission) : Types.SerializedMission {
    {
      id = mission.id;
      mode = mission.mode;
      description = mission.description;
      obj1 = mission.obj1;
      obj2 = mission.obj2;
      recursive = mission.recursive;
      image = mission.image;
      functionName1 = mission.functionName1;
      functionName2 = mission.functionName2;
      startDate = mission.startDate;
      endDate = mission.endDate;
      title = mission.title;
      inputPlaceholder = mission.inputPlaceholder;
      points = mission.points;
      token = mission.token;
      secretCodes = mission.secretCodes;
      requiredPreviousMissionId = mission.requiredPreviousMissionId;
      iconUrl = mission.iconUrl;
    };
  };

  public func deserializeMission(serializedMission : Types.SerializedMission) : Types.Mission {
    {
      var id = serializedMission.id;
      var mode = serializedMission.mode;
      var description = serializedMission.description;
      var obj1 = serializedMission.obj1;
      var obj2 = serializedMission.obj2;
      var recursive = serializedMission.recursive;
      var image = serializedMission.image;
      var functionName1 = serializedMission.functionName1;
      var functionName2 = serializedMission.functionName2;
      var startDate = serializedMission.startDate;
      var endDate = serializedMission.endDate;
      var title = serializedMission.title;
      var inputPlaceholder = serializedMission.inputPlaceholder;
      var secretCodes = serializedMission.secretCodes;
      var requiredPreviousMissionId = serializedMission.requiredPreviousMissionId;
      var iconUrl = serializedMission.iconUrl;
      var points = serializedMission.points;
      var token = serializedMission.token;
    };
  };

  public func serializeMissionV2(mission : Types.MissionV2) : Types.SerializedMissionV2 {
    {
      id = mission.id;
      mode = mission.mode;
      description = mission.description;
      obj1 = mission.obj1;
      obj2 = mission.obj2;
      recursive = mission.recursive;
      image = mission.image;
      functionName1 = mission.functionName1;
      functionName2 = mission.functionName2;
      startDate = mission.startDate;
      endDate = mission.endDate;
      title = mission.title;
      inputPlaceholder = mission.inputPlaceholder;
      points = mission.points;
      token = mission.token;
      secretCodes = mission.secretCodes;
      requiredPreviousMissionId = mission.requiredPreviousMissionId;
      iconUrl = mission.iconUrl;
      subAccount = mission.subAccount;
      subMissions = switch (mission.subMissions) {
        case (?sM) ?serializeSubMissionArray(sM);
        case null ?[];
      };
      maxUsers = mission.maxUsers;
      usersThatCompleted = mission.usersThatCompleted;
      status = mission.status;
      creationTime = mission.creationTime;
    };
  };

  public func deserializeMissionV2(serializedMission : Types.SerializedMissionV2) : Types.MissionV2 {
    {
      var id = serializedMission.id;
      var mode = serializedMission.mode;
      var description = serializedMission.description;
      var obj1 = serializedMission.obj1;
      var obj2 = serializedMission.obj2;
      var recursive = serializedMission.recursive;
      var image = serializedMission.image;
      var functionName1 = serializedMission.functionName1;
      var functionName2 = serializedMission.functionName2;
      var startDate = serializedMission.startDate;
      var endDate = serializedMission.endDate;
      var title = serializedMission.title;
      var inputPlaceholder = serializedMission.inputPlaceholder;
      var secretCodes = serializedMission.secretCodes;
      var requiredPreviousMissionId = serializedMission.requiredPreviousMissionId;
      var iconUrl = serializedMission.iconUrl;
      var points = serializedMission.points;
      var token = serializedMission.token;
      var subAccount = serializedMission.subAccount;
      var subMissions = switch (serializedMission.subMissions) {
        case (?sM) ?deserializeSubMissionArray(sM);
        case null null;
      };
      var maxUsers = serializedMission.maxUsers;
      var usersThatCompleted = serializedMission.usersThatCompleted;
      var status = serializedMission.status;
      creationTime = serializedMission.creationTime;
    };
  };

  public func serializeProgress(progress : Types.Progress) : Types.SerializedProgress {
    {
      completionHistory = Array.map<Types.MissionRecord, Types.SerializedMissionRecord>(progress.completionHistory, func(record : Types.MissionRecord) : Types.SerializedMissionRecord { { timestamp = record.timestamp; pointsEarned = record.pointsEarned; tweetId = record.tweetId } });
      usedCodes = Iter.toArray(progress.usedCodes.entries());
    };
  };

  public func deserializeProgress(serializedProgress : Types.SerializedProgress) : Types.Progress {
    {
      var completionHistory = Array.map<Types.SerializedMissionRecord, Types.MissionRecord>(serializedProgress.completionHistory, func(record : Types.SerializedMissionRecord) : Types.MissionRecord { { var timestamp = record.timestamp; var pointsEarned = record.pointsEarned; var tweetId = record.tweetId } });
      var usedCodes = TrieMap.fromEntries<Text, Bool>(serializedProgress.usedCodes.vals(), Text.equal, Text.hash);
    };
  };

  public func serializeUserMissions(missions : Types.UserMissions) : [(Nat, Types.SerializedProgress)] {
    var serializedMissions : [(Nat, Types.SerializedProgress)] = [];

    let missionsIter = missions.entries();

    for (entry in missionsIter) {
      let missionId = entry.0;
      let progress = entry.1;
      let serializedProgress = serializeProgress(progress);

      serializedMissions := Array.append(serializedMissions, [(missionId, serializedProgress)]);
    };

    return serializedMissions;
  };

};
