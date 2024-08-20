import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface HttpHeader {
  name: string;
  value: string;
}

export interface HttpResponsePayload {
  status: bigint;
  headers: HttpHeader[];
  body: Uint8Array;
}

export interface TransformArgs {
  response: HttpResponsePayload;
  context: Uint8Array;
}

export interface CanisterHttpResponsePayload {
  status: bigint;
  headers: HttpHeader[];
  body: Uint8Array;
}

export interface SerializedUser {
  id: string;
  seconds: bigint;
  twitterid: bigint;
  twitterhandle: string;
  creationTime: bigint;
}

export interface SerializedMission {
  id: bigint;
  mode: bigint;
  description: string;
  obj1: string;
  obj2: string;
  recursive: boolean;
  maxtime: bigint;
  image: Uint8Array;
  functionName1: string;
  functionName2: string;
}

export interface SerializedProgress {
  done: boolean;
  timestamp: bigint;
  totalearned: bigint;
  amountOfTimes: bigint;
  usedCodes: Array<[string, boolean]>;
}

export interface Tweet {
  userid: string;
  tweetid: bigint;
}

export interface Backend {
  getIds: ActorMethod<[], Array<string>>;
  resetall: ActorMethod<[], undefined>;
  get_trusted_origins: ActorMethod<[], Array<string>>;
  getTotalSeconds: ActorMethod<[string], bigint>;
  addTweet: ActorMethod<[string, bigint], undefined>;
  transform: ActorMethod<[TransformArgs], CanisterHttpResponsePayload>;
  availableCycles: ActorMethod<[], bigint>;
  verifyFollow: ActorMethod<[string], boolean>;
  handleTwitterCallback: ActorMethod<[string, string, string], [SerializedUser | null]>;
  addUser: ActorMethod<[string], undefined>;
  isMiddlemanReachable: ActorMethod<[], boolean>;
  addMission: ActorMethod<[bigint, bigint, string, string, string, boolean, bigint, Uint8Array, string, string], undefined>;
  getNumberOfMissions: ActorMethod<[], bigint>;
  getMissionById: ActorMethod<[bigint], [SerializedMission | null]>;
  updateProgress: ActorMethod<[string, SerializedMission, SerializedProgress], undefined>;
  getProgress: ActorMethod<[string, SerializedMission], SerializedProgress>;
  submitSecretCode: ActorMethod<[string, SerializedMission, string], boolean>;
  getTotalEarned: ActorMethod<[string, SerializedMission], [bigint | null]>;
}
export interface _SERVICE extends Backend {}
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
