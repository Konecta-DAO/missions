import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Backend {
  'acceptLink' : ActorMethod<[Principal, Principal, string], string>,
  'addAdminId' : ActorMethod<[Principal], undefined>,
  'addDiscordInfo' : ActorMethod<[string, string], undefined>,
  'addNuanceHandleToUserByUUID' : ActorMethod<[string, string], string>,
  'addOCProfile' : ActorMethod<[Principal, string], undefined>,
  'addProjectMissions' : ActorMethod<[Principal, string, string], undefined>,
  'addProjectV2' : ActorMethod<[Principal], boolean>,
  'addRedditInfo' : ActorMethod<[string, string], undefined>,
  'addTwitterInfo' : ActorMethod<[string, bigint, string], undefined>,
  'availableCycles' : ActorMethod<[], bigint>,
  'createUser' : ActorMethod<[Principal, string], [] | [SerializedGlobalUser]>,
  'getAdminIds' : ActorMethod<[], Array<Principal>>,
  'getAllPrincipalsWithUUIDs' : ActorMethod<[], Array<[Principal, string]>>,
  'getAllProjectMissions' : ActorMethod<[], Array<SerializedProjectMissions>>,
  'getAllUsers' : ActorMethod<[], Array<[string, SerializedGlobalUser]>>,
  'getAllowedAccountTypes' : ActorMethod<[], Array<string>>,
  'getBatchGlobalUsers' : ActorMethod<
    [Array<string>],
    Array<[string, [] | [SerializedGlobalUser]]>
  >,
  'getBatchNFIDbyUUID' : ActorMethod<
    [Array<string>],
    Array<[string, [] | [Principal]]>
  >,
  'getBatchPrimaryAccounts' : ActorMethod<
    [Array<string>],
    Array<[string, [] | [Principal], [] | [string]]>
  >,
  'getDiscordByUUID' : ActorMethod<[string], string>,
  'getLinkCooldownForPrincipal' : ActorMethod<[Principal, string], bigint>,
  'getLinkStatus' : ActorMethod<[Principal, Principal], string>,
  'getLinkedAccountsForPrincipal' : ActorMethod<
    [Principal],
    Array<[string, Principal]>
  >,
  'getLinkedAccountsForUUID' : ActorMethod<
    [string],
    Array<[string, Principal]>
  >,
  'getNFIDbyUUID' : ActorMethod<[string], [] | [Principal]>,
  'getNuanceIDByUUID' : ActorMethod<[string], string>,
  'getOisyWallet' : ActorMethod<[Principal], [] | [Principal]>,
  'getPFPProgress' : ActorMethod<[Principal], [] | [string]>,
  'getPendingLinkRequestsForTarget' : ActorMethod<
    [Principal],
    Array<LinkRequest>
  >,
  'getProjects' : ActorMethod<[], Array<Principal>>,
  'getUUID' : ActorMethod<[Principal], string>,
  'getUserByPrincipal' : ActorMethod<[Principal], [] | [SerializedGlobalUser]>,
  'getUserByUUID' : ActorMethod<[string], [] | [SerializedGlobalUser]>,
  'getUserSubaccount' : ActorMethod<[string], Uint8Array | number[]>,
  'icrc28_trusted_origins' : ActorMethod<[], Icrc28TrustedOriginsResponse>,
  'initiateLink' : ActorMethod<[Principal, string, Principal, string], string>,
  'isDiscordUsed' : ActorMethod<[string, string], boolean>,
  'isNuanceHandleUsed' : ActorMethod<[string, string], boolean>,
  'isRedditUsed' : ActorMethod<[string, string], boolean>,
  'isTwitterIdUsed' : ActorMethod<[string, string], boolean>,
  'linkOisyAccount' : ActorMethod<[Principal, Principal], string>,
  'mergeAccounts' : ActorMethod<[string, string], string>,
  'rejectLink' : ActorMethod<[Principal, Principal], string>,
  'removeAdminId' : ActorMethod<[Principal], undefined>,
  'removeProjectMissions' : ActorMethod<[Principal], undefined>,
  'resetall' : ActorMethod<[], undefined>,
  'setPFPProgress' : ActorMethod<[Principal], string>,
  'setPFPProgressLoading' : ActorMethod<[Principal], string>,
  'setProjectStatus' : ActorMethod<[Principal, string], string>,
  'trisAdmin' : ActorMethod<[Principal], boolean>,
  'unlinkPrincipal' : ActorMethod<[Principal], string>,
  'updateIconLink' : ActorMethod<[Principal, string], undefined>,
}
export interface Icrc28TrustedOriginsResponse {
  'trusted_origins' : Array<string>,
}
export interface LinkRequest {
  'status' : string,
  'requester' : Principal,
  'target' : Principal,
  'targetType' : string,
  'requesterType' : string,
  'requestedAt' : bigint,
}
export interface SerializedGlobalUser {
  'bio' : [] | [string],
  'categories' : [] | [Array<string>],
  'nft721' : [] | [Array<Principal>],
  'timezone' : [] | [string],
  'firstname' : [] | [string],
  'country' : [] | [string],
  'username' : [] | [string],
  'telegramUser' : [] | [string],
  'ocProfile' : [] | [string],
  'email' : [] | [string],
  'discordUser' : [] | [string],
  'creationTime' : bigint,
  'nuanceUser' : [] | [string],
  'twitterhandle' : [] | [string],
  'pfpProgress' : string,
  'twitterid' : [] | [bigint],
  'nnsPrincipal' : [] | [Principal],
  'icrc1tokens' : [] | [Array<Principal>],
  'profilepic' : [] | [string],
  'coverphoto' : [] | [string],
  'lastname' : [] | [string],
  'deducedPoints' : bigint,
}
export interface SerializedProjectMissions {
  'status' : string,
  'icon' : string,
  'name' : string,
  'creationTime' : bigint,
  'canisterId' : Principal,
}
export interface _SERVICE extends Backend {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
