import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface HttpHeader {
  name: string;
  value: string;
}

export interface HttpRequestArgs {
  url: string;
  max_response_bytes: bigint | null;
  headers: HttpHeader[];
  body: Uint8Array | null;
  method: { get: null; post: null; head: null };
  transform: { function: Principal; context: Uint8Array } | null;
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
  image: string;
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

export interface Backend {
  getIds: ActorMethod<[], Array<string>>;
  resetall: ActorMethod<[], undefined>;
  icrc28_trusted_origins: ActorMethod<[], Array<string>>;
  getTotalSeconds: ActorMethod<[string], bigint>;
  addTweet: ActorMethod<[string, bigint], undefined>;
  getTweets: ActorMethod<[string], [Array<[bigint, bigint]> | null]>;
  transform: ActorMethod<[TransformArgs], CanisterHttpResponsePayload>;
  availableCycles: ActorMethod<[], bigint>;
  verifyFollow: ActorMethod<[string], boolean>;
  handleTwitterCallback: ActorMethod<[string, string, string], [SerializedUser | null]>;
  addUser: ActorMethod<[string], undefined>;
  isMiddlemanReachable: ActorMethod<[], boolean>;
  addMission: ActorMethod<[bigint, bigint, string, string, string, boolean, bigint, string, string], undefined>;
  getNumberOfMissions: ActorMethod<[], bigint>;
  getMissionById: ActorMethod<[bigint], [SerializedMission | null]>;
  updateUserProgress: ActorMethod<[string, bigint, SerializedProgress], undefined>;
  getProgress: ActorMethod<[string, bigint], [SerializedProgress | null]>;
  submitSecretCode: ActorMethod<[string, string], boolean>;
  getTotalEarned: ActorMethod<[string, bigint], [bigint | null]>;
  isAdmin: ActorMethod<[string], boolean>;
  countCompletedUsers: ActorMethod<[bigint], bigint>;
  getAllMissions: ActorMethod<[], Array<SerializedMission>>;
  addAdminId: ActorMethod<[string], undefined>;
  getUsers: ActorMethod<[], Array<SerializedUser>>;
  getAdminIds: ActorMethod<[], Array<string>>;
  removeAdminId: ActorMethod<[string], undefined>;
  addCode: ActorMethod<[string], undefined>;
  removeCode: ActorMethod<[string], undefined>;
  getCodes: ActorMethod<[], Array<string>>;
  uploadMissionImage: ActorMethod<[string, Uint8Array], string>;
  getMissionImage: ActorMethod<[string], [Uint8Array | null]>;
  addTwitterInfo: ActorMethod<[string, bigint, string], undefined>;
}

export interface _SERVICE extends Backend {}

export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
