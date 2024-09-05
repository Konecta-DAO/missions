import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
  id: Principal;
  twitterid: bigint | null;
  twitterhandle: string | null;
  creationTime: bigint;
}

export interface SerializedMission {
  id: bigint;
  title: string;
  description: string;
  obj1: string | null;
  obj2: string;
  inputPlaceholder: string | null;
  startDate: bigint;
  endDate: bigint;
  recursive: boolean;
  mintime: bigint;
  maxtime: bigint;
  functionName1: string | null;
  functionName2: string;
  image: string;
  secretCodes: string | null;
  mode: bigint;
  requiredPreviousMissionId: bigint | null;
}

export interface SerializedProgress {
  completionHistory: Array<{ timestamp: bigint; pointsEarned: bigint; tweetId: string | null }>;
  usedCodes: Array<[string, boolean]>;
}

export interface Backend {
  // General and utility functions
  getIds: ActorMethod<[], Array<string>>;
  resetall: ActorMethod<[], undefined>;
  icrc28_trusted_origins: ActorMethod<[], Array<string>>;
  availableCycles: ActorMethod<[], bigint>;
  isMiddlemanReachable: ActorMethod<[], boolean>;

  // Twitter and social interaction
  addTweet: ActorMethod<[string, bigint], undefined>;
  getTweets: ActorMethod<[string], Array<[bigint, bigint]> | null>;
  verifyFollow: ActorMethod<[string], boolean>;
  handleTwitterCallback: ActorMethod<[Principal, string, string], SerializedUser | null>;
  addTwitterInfo: ActorMethod<[Principal, bigint | null, string | null], undefined>;

  // User management
  addUser: ActorMethod<[Principal], undefined>;
  getUsers: ActorMethod<[], Array<SerializedUser>>;

  // Admin management
  addAdminId: ActorMethod<[string], undefined>;
  getAdminIds: ActorMethod<[], Array<string>>;
  removeAdminId: ActorMethod<[string], undefined>;
  isAdmin: ActorMethod<[Principal], boolean>;

  // Mission management
  addMission: ActorMethod<[SerializedMission], undefined>;
  getNumberOfMissions: ActorMethod<[], bigint>;
  getMissionById: ActorMethod<[bigint], SerializedMission | null>;
  getAllMissions: ActorMethod<[], Array<SerializedMission>>;
  countUsersWhoCompletedMission: ActorMethod<[bigint], bigint>;

  // Progress and secret code handling
  updateUserProgress: ActorMethod<[Principal, bigint, SerializedProgress], undefined>;
  getProgress: ActorMethod<[Principal, bigint], SerializedProgress | null>;
  submitSecretCode: ActorMethod<[Principal, bigint, string], boolean>;
  getEarnedForMission: ActorMethod<[Principal, bigint], bigint | null>;

  // New function
  getTotalSecondsForUser: ActorMethod<[Principal], bigint | null>;

  // HTTP and transformation
  transform: ActorMethod<[TransformArgs], CanisterHttpResponsePayload>;

  // Media upload (image upload)
  uploadMissionImage: ActorMethod<[string, Uint8Array], string>;
}

export interface _SERVICE extends Backend { }
