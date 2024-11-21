import Types "Types";

module Serialization {
  public func serializeProjectMissions(projectMissions : Types.ProjectMissions) : Types.SerializedProjectMissions {
    {
      canisterId = projectMissions.canisterId;
      name = projectMissions.name;
      creationTime = projectMissions.creationTime;
      status = projectMissions.status;
      icon = projectMissions.icon;
    };
  };

  public func deserializeProjectMission(serializedProjectMission : Types.SerializedProjectMissions) : Types.ProjectMissions {
    {
      var canisterId = serializedProjectMission.canisterId;
      var name = serializedProjectMission.name;
      var creationTime = serializedProjectMission.creationTime;
      var status = serializedProjectMission.status;
      var icon = serializedProjectMission.icon;
    };
  };
};
