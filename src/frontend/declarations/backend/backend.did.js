export const idlFactory = ({ IDL }) => {
  const HttpHeader = IDL.Record({ name: IDL.Text, value: IDL.Text });

  const HttpResponsePayload = IDL.Record({
    status: IDL.Nat,
    headers: IDL.Vec(HttpHeader),
    body: IDL.Vec(IDL.Nat8),
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
    id: IDL.Text,
    seconds: IDL.Nat,
    twitterid: IDL.Nat,
    twitterhandle: IDL.Text,
    creationTime: IDL.Int,
  });

  const SerializedMission = IDL.Record({
    id: IDL.Nat,
    mode: IDL.Nat,
    description: IDL.Text,
    obj1: IDL.Text,
    obj2: IDL.Text,
    recursive: IDL.Bool,
    maxtime: IDL.Int,
    image: IDL.Text,
    functionName1: IDL.Text,
    functionName2: IDL.Text,
  });

  const SerializedProgress = IDL.Record({
    done: IDL.Bool,
    timestamp: IDL.Int,
    totalearned: IDL.Nat,
    amountOfTimes: IDL.Nat,
    usedCodes: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Bool)),
  });

  const Backend = IDL.Service({
    getIds: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    resetall: IDL.Func([], [], []),
    get_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    getTotalSeconds: IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    addTweet: IDL.Func([IDL.Text, IDL.Nat], [], []),
    getTweets: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)))], []),
    transform: IDL.Func([TransformArgs], [CanisterHttpResponsePayload], ['query']),
    availableCycles: IDL.Func([], [IDL.Nat], ['query']),
    verifyFollow: IDL.Func([IDL.Text], [IDL.Bool], []),
    handleTwitterCallback: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Opt(SerializedUser)], []),
    addUser: IDL.Func([IDL.Text], [], []),
    isMiddlemanReachable: IDL.Func([], [IDL.Bool], []),
    addMission: IDL.Func([IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Bool, IDL.Int, IDL.Text, IDL.Text, IDL.Text], [], []),
    getNumberOfMissions: IDL.Func([], [IDL.Nat], ['query']),
    getMissionById: IDL.Func([IDL.Nat], [IDL.Opt(SerializedMission)], ['query']),
    updateUserProgress: IDL.Func([IDL.Text, IDL.Nat, SerializedProgress], [], []),
    getProgress: IDL.Func([IDL.Text, IDL.Nat], [IDL.Opt(SerializedProgress)], ['query']),
    submitSecretCode: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    getTotalEarned: IDL.Func([IDL.Text, IDL.Nat], [IDL.Opt(IDL.Nat)], ['query']),
    isAdmin: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    countCompletedUsers: IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    getAllMissions: IDL.Func([], [IDL.Vec(SerializedMission)], ['query']),
    addAdminId: IDL.Func([IDL.Text], [], []),
    getUsers: IDL.Func([], [IDL.Vec(SerializedUser)], ['query']),
    getAdminIds: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    removeAdminId: IDL.Func([IDL.Text], [], []),
    addCode: IDL.Func([IDL.Text], [], []),
    removeCode: IDL.Func([IDL.Text], [], []),
    getCodes: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    uploadMissionImage: IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [IDL.Text], []),
    getMissionImage: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
  });
  return Backend;
};
export const init = ({ IDL }) => {
  return [];
};
