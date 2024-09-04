import Types "Types";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Array "mo:base/Array";

module Serialization {

  public func serializeUser(user : Types.User) : Types.SerializedUser {
    {
      id = user.id;
      twitterid = user.twitterid;
      twitterhandle = user.twitterhandle;
      creationTime = user.creationTime;
    };
  };

  public func deserializeUser(serializedUser : Types.SerializedUser) : Types.User {
    {
      id = serializedUser.id;
      var twitterid = serializedUser.twitterid;
      var twitterhandle = serializedUser.twitterhandle;
      creationTime = serializedUser.creationTime;
    };
  };

  public func serializeMission(mission : Types.Mission) : Types.SerializedMission {
    {
      id = mission.id;
      mode = mission.mode;
      description = mission.description;
      obj1 = mission.obj1;
      obj2 = mission.obj2;
      recursive = mission.recursive;
      maxtime = mission.maxtime;
      image = mission.image;
      functionName1 = mission.functionName1;
      functionName2 = mission.functionName2;
      startDate = mission.startDate;
      endDate = mission.endDate;
      title = mission.title;
      inputPlaceholder = mission.inputPlaceholder;
      mintime = mission.mintime;
      secretCodes = mission.secretCodes;
      requiredPreviousMissionId = mission.requiredPreviousMissionId;
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
      var maxtime = serializedMission.maxtime;
      var image = serializedMission.image;
      var functionName1 = serializedMission.functionName1;
      var functionName2 = serializedMission.functionName2;
      var startDate = serializedMission.startDate;
      var endDate = serializedMission.endDate;
      var title = serializedMission.title;
      var inputPlaceholder = serializedMission.inputPlaceholder;
      var mintime = serializedMission.mintime;
      var secretCodes = serializedMission.secretCodes;
      var requiredPreviousMissionId = serializedMission.requiredPreviousMissionId;
    };
  };

  public func serializeProgress(progress : Types.Progress) : Types.SerializedProgress {
    {
      completionHistory = Array.map<Types.MissionRecord, Types.SerializedMissionRecord>(progress.completionHistory, func(record : Types.MissionRecord) : Types.SerializedMissionRecord { { timestamp = record.timestamp; pointsEarned = record.pointsEarned; tweetId = record.tweetId; } });
      usedCodes = Iter.toArray(progress.usedCodes.entries());
    };
  };

  public func deserializeProgress(serializedProgress : Types.SerializedProgress) : Types.Progress {
    {
      var completionHistory = Array.map<Types.SerializedMissionRecord, Types.MissionRecord>(serializedProgress.completionHistory, func(record : Types.SerializedMissionRecord) : Types.MissionRecord { { var timestamp = record.timestamp; var pointsEarned = record.pointsEarned; var tweetId = record.tweetId } });
      var usedCodes = TrieMap.fromEntries<Text, Bool>(serializedProgress.usedCodes.vals(), Text.equal, Text.hash);
    };
  };
};
