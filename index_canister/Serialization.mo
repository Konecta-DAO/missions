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

  public func serializeUser(user : Types.GlobalUser) : Types.SerializedGlobalUser {
    {
      twitterid = user.twitterid;
      twitterhandle = user.twitterhandle;
      creationTime = user.creationTime;
      pfpProgress = user.pfpProgress;
      deducedPoints = user.deducedPoints;
      ocProfile = user.ocProfile;
      discordUser = user.discordUser;
      telegramUser = user.telegramUser;
      nuanceUser = user.nuanceUser;
      nnsPrincipal = user.nnsPrincipal;
      firstname = user.firstname;
      lastname = user.lastname;
      username = user.username;
      email = user.email;
      bio = user.bio;
      categories = user.categories;
      profilepic = user.profilepic;
      coverphoto = user.coverphoto;
      country = user.country;
      timezone = user.timezone;
      icrc1tokens = user.icrc1tokens;
      nft721 = user.nft721;
    };
  };

  public func deserializeUser(serializedUser : Types.SerializedGlobalUser) : Types.GlobalUser {
    {
      var twitterid = serializedUser.twitterid;
      var twitterhandle = serializedUser.twitterhandle;
      creationTime = serializedUser.creationTime;
      var pfpProgress = serializedUser.pfpProgress;
      var deducedPoints = serializedUser.deducedPoints;
      var ocProfile = serializedUser.ocProfile;
      var discordUser = serializedUser.discordUser;
      var telegramUser = serializedUser.telegramUser;
      var nuanceUser = serializedUser.nuanceUser;
      var nnsPrincipal = serializedUser.nnsPrincipal;
      var firstname = serializedUser.firstname;
      var lastname = serializedUser.lastname;
      var username = serializedUser.username;
      var email = serializedUser.email;
      var bio = serializedUser.bio;
      var categories = serializedUser.categories;
      var profilepic = serializedUser.profilepic;
      var coverphoto = serializedUser.coverphoto;
      var country = serializedUser.country;
      var timezone = serializedUser.timezone;
      var icrc1tokens = serializedUser.icrc1tokens;
      var nft721 = serializedUser.nft721;
    };
  };

};
