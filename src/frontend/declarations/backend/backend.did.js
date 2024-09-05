export const idlFactory = ({ IDL }) => {
  const HttpHeader = IDL.Record({ name: IDL.Text, value: IDL.Text });

  const HttpResponsePayload = IDL.Record({
    status: IDL.Nat,
    headers: IDL.Vec(HttpHeader),
    body: IDL.Vec(IDL.Nat8),
  });

  const HttpRequestArgs = IDL.Record({
    url: IDL.Text,
    max_response_bytes: IDL.Opt(IDL.Nat64),
    headers: IDL.Vec(HttpHeader),
    body: IDL.Opt(IDL.Vec(IDL.Nat8)),
    method: IDL.Variant({ get: IDL.Null, post: IDL.Null, head: IDL.Null }),
    transform: IDL.Opt(
      IDL.Record({
        function: IDL.Principal,
        context: IDL.Vec(IDL.Nat8),
      })
    ),
  });

  const CanisterHttpResponsePayload = IDL.Record({
    status: IDL.Nat,
    headers: IDL.Vec(HttpHeader),
    body: IDL.Vec(IDL.Nat8),
  });

  const TransformArgs = IDL.Record({
    response: HttpResponsePayload,
    context: IDL.Vec(IDL.Nat8),
  });

  const SerializedUser = IDL.Record({
    id: IDL.Principal,
    twitterid: IDL.Opt(IDL.Nat),
    twitterhandle: IDL.Opt(IDL.Text),
    creationTime: IDL.Int,
  });

  const SerializedMission = IDL.Record({
    id: IDL.Nat,
    title: IDL.Text,
    description: IDL.Text,
    obj1: IDL.Opt(IDL.Text),
    obj2: IDL.Text,
    inputPlaceholder: IDL.Opt(IDL.Text),
    startDate: IDL.Int,
    endDate: IDL.Int,
    recursive: IDL.Bool,
    mintime: IDL.Int,
    maxtime: IDL.Int,
    functionName1: IDL.Opt(IDL.Text),
    functionName2: IDL.Text,
    image: IDL.Text,
    secretCodes: IDL.Opt(IDL.Text),
    mode: IDL.Nat,
    requiredPreviousMissionId: IDL.Opt(IDL.Nat),
  });

  const SerializedProgress = IDL.Record({
    completionHistory: IDL.Vec(
      IDL.Record({ timestamp: IDL.Int, pointsEarned: IDL.Nat, tweetId: IDL.Opt(IDL.Text) })
    ),
    usedCodes: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Bool)),
  });

  const Backend = IDL.Service({
    // General and utility functions
    getIds: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    resetall: IDL.Func([], [], []),
    icrc28_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    availableCycles: IDL.Func([], [IDL.Nat], ['query']),
    isMiddlemanReachable: IDL.Func([], [IDL.Bool], []),

    // Twitter and social interaction
    addTweet: IDL.Func([IDL.Text, IDL.Nat], [], []),
    getTweets: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)))], []),
    verifyFollow: IDL.Func([IDL.Text], [IDL.Bool], []),
    handleTwitterCallback: IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [IDL.Opt(SerializedUser)], []),
    addTwitterInfo: IDL.Func([IDL.Principal, IDL.Opt(IDL.Nat), IDL.Opt(IDL.Text)], [], []),

    // User management
    addUser: IDL.Func([IDL.Principal], [], []),
    getUsers: IDL.Func([], [IDL.Vec(SerializedUser)], ['query']),

    // Admin management
    addAdminId: IDL.Func([IDL.Text], [], []),
    getAdminIds: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    removeAdminId: IDL.Func([IDL.Text], [], []),
    isAdmin: IDL.Func([IDL.Principal], [IDL.Bool], ['query']), // Updated parameter to Principal

    // Mission management
    addMission: IDL.Func([SerializedMission], [], []),
    getNumberOfMissions: IDL.Func([], [IDL.Nat], ['query']),
    getMissionById: IDL.Func([IDL.Nat], [IDL.Opt(SerializedMission)], ['query']),
    getAllMissions: IDL.Func([], [IDL.Vec(SerializedMission)], ['query']),
    countUsersWhoCompletedMission: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),

    // Progress and secret code handling
    updateUserProgress: IDL.Func([IDL.Principal, IDL.Nat, SerializedProgress], [], []),
    getProgress: IDL.Func([IDL.Principal, IDL.Nat], [IDL.Opt(SerializedProgress)], ['query']),
    submitSecretCode: IDL.Func([IDL.Principal, IDL.Nat, IDL.Text], [IDL.Bool], []),
    getEarnedForMission: IDL.Func([IDL.Principal, IDL.Nat], [IDL.Opt(IDL.Nat)], ['query']), // Updated function

    // Time tracking
    getTotalSecondsForUser: IDL.Func([IDL.Principal], [IDL.Opt(IDL.Nat)], ['query']), // New function

    // HTTP and transformation
    transform: IDL.Func([TransformArgs], [CanisterHttpResponsePayload], ['query']),

    // Media upload (image upload)
    uploadMissionImage: IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [IDL.Text], []),
  });

  return Backend;
};

export const init = ({ IDL }) => {
  return [];
};
