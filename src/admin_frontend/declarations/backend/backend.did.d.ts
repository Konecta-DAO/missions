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

export interface User {
  id: string;
  mission: bigint;
  seconds: bigint;
  creationTime: bigint;
  twitterhandle: string;
  twitterid: bigint;
}

export interface Mission {
  id: bigint;
  mode: bigint;
  description: string;
  obj1: string;
  obj2: string;
  recursive: boolean;
  howmany: int;
}

export interface Backend {
  getIds: ActorMethod<[], Array<string>>;
  registerid: ActorMethod<[string, bigint], undefined>;
  resetall: ActorMethod<[], undefined>;
  get_trusted_origins: ActorMethod<[], Array<string>>;
  getSeconds: ActorMethod<[string, bigint], [bigint | null]>;
  getTotalSeconds: ActorMethod<[string], bigint>;
  addTweet: ActorMethod<[string, bigint], undefined>;
  transform: ActorMethod<[TransformArgs], CanisterHttpResponsePayload>;
  availableCycles: ActorMethod<[], bigint>;
  verifyFollow: ActorMethod<[string], boolean>;
  handleTwitterCallback: ActorMethod<[string, string, string], [User | null]>;
  addUser: ActorMethod<[string, bigint], undefined>;
  isMiddlemanReachable: ActorMethod<[], boolean>;
  addMission: ActorMethod<[bigint, bigint, string, string, string, boolean], undefined>;
  getNumberOfMissions: ActorMethod<[], bigint>;
  getMissionById: ActorMethod<[bigint], [Mission | null]>;
}
export interface _SERVICE extends Backend {}
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
