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

  const User = IDL.Record({
    id: IDL.Text,
    mission: IDL.Nat,
    seconds: IDL.Nat,
    creationTime: IDL.Int,
    twitterhandle: IDL.Text,
    twitterid: IDL.Nat,
  });

  const Mission = IDL.Record({
    id: IDL.Nat,
    mode: IDL.Nat,
    description: IDL.Text,
    obj1: IDL.Text,
    obj2: IDL.Text,
    recursive: IDL.Bool,
    howmany: IDL.Int,
  });

  const Backend = IDL.Service({
    getIds: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    registerid: IDL.Func([IDL.Text, IDL.Nat], [], []),
    resetall: IDL.Func([], [], []),
    get_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    getSeconds: IDL.Func([IDL.Text, IDL.Nat], [IDL.Opt(IDL.Nat)], ['query']),
    getTotalSeconds: IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    addTweet: IDL.Func([IDL.Text, IDL.Nat], [], []),
    transform: IDL.Func([TransformArgs], [CanisterHttpResponsePayload], ['query']),
    availableCycles: IDL.Func([], [IDL.Nat], ['query']),
    verifyFollow: IDL.Func([IDL.Text], [IDL.Bool], []),
    handleTwitterCallback: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Opt(User)], []),
    addUser: IDL.Func([IDL.Text, IDL.Nat], [], []),
    isMiddlemanReachable: IDL.Func([], [IDL.Bool], []),
    addMission: IDL.Func([IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Bool], [], []),
    getNumberOfMissions: IDL.Func([], [IDL.Nat], ['query']),
    getMissionById: IDL.Func([IDL.Nat], [IDL.Opt(Mission)], ['query']),
  });
  return Backend;
};
export const init = ({ IDL }) => {
  return [];
};
