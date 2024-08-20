import Types "Types";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

module Serialization {

  public func serializeUser(user : Types.User) : Types.SerializedUser {
    {
      id = user.id;
      seconds = user.seconds;
      twitterid = user.twitterid;
      twitterhandle = user.twitterhandle;
      creationTime = user.creationTime;
    };
  };

  public func deserializeUser(serializedUser : Types.SerializedUser) : Types.User {
    {
      id = serializedUser.id;
      var seconds = serializedUser.seconds;
      twitterid = serializedUser.twitterid;
      twitterhandle = serializedUser.twitterhandle;
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
    };
  };

  public func deserializeMission(serializedMission : Types.SerializedMission) : Types.Mission {
    {
      id = serializedMission.id;
      var mode = serializedMission.mode;
      var description = serializedMission.description;
      var obj1 = serializedMission.obj1;
      var obj2 = serializedMission.obj2;
      var recursive = serializedMission.recursive;
      var maxtime = serializedMission.maxtime;
      var image = serializedMission.image;
      var functionName1 = serializedMission.functionName1;
      var functionName2 = serializedMission.functionName2;
    };
  };

  public func serializeProgress(progress : Types.Progress) : Types.SerializedProgress {
    {
      done = progress.done;
      timestamp = progress.timestamp;
      totalearned = progress.totalearned;
      amountOfTimes = progress.amountOfTimes;
      usedCodes = Iter.toArray(progress.usedCodes.entries());
    };
  };

  public func deserializeProgress(serializedProgress : Types.SerializedProgress) : Types.Progress {
    {
      var done = serializedProgress.done;
      var timestamp = serializedProgress.timestamp;
      var totalearned = serializedProgress.totalearned;
      var amountOfTimes = serializedProgress.amountOfTimes;
      usedCodes = TrieMap.fromEntries<Text, Bool>(serializedProgress.usedCodes.vals(), Text.equal, Text.hash);
    };
  };
};
