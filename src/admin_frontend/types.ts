export type User = {
  id: string;
  mission: bigint;
  seconds: bigint;
  twitterid: bigint;
  twitterhandle: string;
  creationTime: number;
};

export type SerializedUser = {
  id: string;
  seconds: bigint;
  twitterid: bigint;
  twitterhandle: string;
  creationTime: number;
};

export type Mission = {
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
};

export type Progress = {
  done: boolean;
  timestamp: number;
  totalearned: bigint;
  amountOfTimes: bigint;
  usedCodes: Map<string, boolean>;
};

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

export type SerializedProgress = {
  done: boolean;
  timestamp: bigint;
  totalearned: bigint;
  amountOfTimes: bigint;
  usedCodes: [string, boolean][];
};

export type Tweet = {
  userid: string;
  tweetid: bigint;
};

export type HttpRequestArgs = {
  url: string;
  max_response_bytes?: bigint;
  headers: HttpHeader[];
  body?: Uint8Array;
  method: HttpMethod;
  transform?: TransformRawResponseFunction;
};

export type HttpHeader = {
  name: string;
  value: string;
};

export type HttpMethod = 'get' | 'post' | 'head';

export type HttpResponsePayload = {
  status: bigint;
  headers: HttpHeader[];
  body: Uint8Array;
};

export type TransformRawResponseFunction = {
  function: (args: TransformArgs) => Promise<HttpResponsePayload>;
  context: Uint8Array;
};

export type TransformArgs = {
  response: HttpResponsePayload;
  context: Uint8Array;
};

export type CanisterHttpResponsePayload = {
  status: bigint;
  headers: HttpHeader[];
  body: Uint8Array;
};

export type TransformContext = {
  function: (args: TransformArgs) => Promise<HttpResponsePayload>;
  context: Uint8Array;
};

export type IC = {
  http_request: (args: HttpRequestArgs) => Promise<HttpResponsePayload>;
};

export type HttpRequest = {
  method: string;
  url: string;
  headers: [string, string][];
  body: Uint8Array;
};

export type HttpResponse = {
  status_code: bigint;
  headers: [string, string][];
  body: Uint8Array;
};
