import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ActionResultFromActions {
  'status' : ActionStatusFromBackend,
  'nextStepIdToProcess' : [] | [bigint],
  'isFlowCompleted' : [] | [boolean],
  'message' : [] | [string],
  'success' : boolean,
  'returnedDataJson' : [] | [string],
}
export type ActionStatusFromBackend = { 'Ok' : null } |
  { 'Error' : null } |
  { 'RequiresUserAction' : null } |
  { 'InvalidParameters' : null } |
  { 'PreconditionNotMet' : null } |
  { 'Pending' : null };
export interface AggregatedFunnelStep {
  'step_id' : bigint,
  'users_reached_step' : bigint,
  'step_name' : [] | [string],
  'users_completed_step' : bigint,
}
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'certificate' : [] | [Uint8Array | number[]],
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
  'status_code' : number,
}
export interface Icrc28TrustedOriginsResponse {
  'trusted_origins' : Array<string>,
}
export type ImageUploadInput = { 'Url' : string } |
  {
    'Asset' : { 'originalFileName' : string, 'content' : Uint8Array | number[] }
  };
export interface MissionAnalyticsSummary {
  'creation_time' : bigint,
  'status' : MissionStatus,
  'unique_completers' : bigint,
  'name' : string,
  'tags' : [] | [Array<string>],
  'estimated_starts' : bigint,
  'mission_start_time' : bigint,
  'total_completions' : bigint,
  'mission_end_time' : [] | [bigint],
  'mission_id' : bigint,
}
export type MissionStatus = { 'Paused' : null } |
  { 'Active' : null } |
  { 'Draft' : null } |
  { 'Completed' : null } |
  { 'Expired' : null };
export interface ProjectBackend {
  'addAdminWithPermissions' : ActorMethod<
    [Principal, SerializedPermissions],
    Result_1
  >,
  'addDefaultPlaceholderMission' : ActorMethod<[], Result_6>,
  'addOrUpdateMission' : ActorMethod<
    [
      bigint,
      string,
      string,
      string,
      bigint,
      [] | [bigint],
      RewardType,
      bigint,
      [] | [bigint],
      [] | [ImageUploadInput],
      [] | [ImageUploadInput],
      [] | [Array<string>],
      [] | [Array<bigint>],
      [] | [{ 'All' : null } | { 'Any' : null }],
      boolean,
      [] | [bigint],
      [] | [bigint],
      [] | [bigint],
      MissionStatus,
      [] | [bigint],
    ],
    Result_1
  >,
  'addSecondPlaceholderMission' : ActorMethod<[], Result_6>,
  'dfdfdf' : ActorMethod<[], undefined>,
  'executeActionStep' : ActorMethod<
    [bigint, bigint, [] | [string], Principal],
    Result_5
  >,
  'generateAnalyticsSeed' : ActorMethod<[], Result_1>,
  'getAdminsWithPermissions' : ActorMethod<[], Result_4>,
  'getAllMissions' : ActorMethod<[], Array<[bigint, SerializedMission]>>,
  'getAllUserMissionsProgress' : ActorMethod<
    [Principal],
    [] | [Array<[bigint, SerializedUserMissionProgress]>]
  >,
  'getBatchGlobalUsers' : ActorMethod<
    [Array<string>],
    Array<[string, [] | [SerializedGlobalUser]]>
  >,
  'getBatchPrimaryAccounts' : ActorMethod<
    [Array<string>],
    Array<[string, [] | [Principal], [] | [string]]>
  >,
  'getMission' : ActorMethod<[bigint], [] | [SerializedMission]>,
  'getMissionCompletionStatusForUser' : ActorMethod<
    [Principal, bigint],
    boolean
  >,
  'getMyAdminPermissions' : ActorMethod<[], [] | [SerializedPermissions]>,
  'getProjectDetails' : ActorMethod<[], SerializedProjectDetails>,
  'getUserActionStepState' : ActorMethod<
    [Principal, bigint, bigint],
    [] | [SerializedUserActionStepState]
  >,
  'getUserMissionProgress' : ActorMethod<
    [Principal, bigint],
    [] | [SerializedUserMissionProgress]
  >,
  'getUserMissionStepStates' : ActorMethod<
    [Principal, bigint],
    [] | [Array<[bigint, SerializedUserActionStepState]>]
  >,
  'get_aggregated_mission_funnel' : ActorMethod<[bigint], Result_3>,
  'get_all_missions_analytics' : ActorMethod<
    [],
    Array<MissionAnalyticsSummary>
  >,
  'get_all_user_analytics_records' : ActorMethod<
    [],
    Array<UserAnalyticsRecord>
  >,
  'get_analytics_overview' : ActorMethod<[], ProjectGlobalAnalytics>,
  'get_user_all_linked_accounts' : ActorMethod<
    [string],
    Array<[string, Principal]>
  >,
  'get_user_mission_step_states_for_analytics' : ActorMethod<
    [string, bigint],
    [] | [Array<[bigint, UserActionStepStatus, bigint]>]
  >,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'icrc28_trusted_origins' : ActorMethod<[], Icrc28TrustedOriginsResponse>,
  'removeAdmin' : ActorMethod<[Principal], Result_1>,
  'setProjectDetails' : ActorMethod<
    [
      string,
      boolean,
      [] | [ImageUploadInput],
      [] | [ImageUploadInput],
      string,
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [Array<[string, string]>],
    ],
    Result_1
  >,
  'startMission' : ActorMethod<[bigint], Result_2>,
  'updateAdminPermissions' : ActorMethod<
    [Principal, SerializedPermissions],
    Result_1
  >,
  'updateMissionStatus' : ActorMethod<[bigint, MissionStatus], Result_1>,
  'uploadMissionAsset' : ActorMethod<[string, Uint8Array | number[]], Result>,
}
export interface ProjectGlobalAnalytics {
  'total_missions' : bigint,
  'unique_users_interacted' : bigint,
  'paused_missions' : bigint,
  'project_lifetime_completions' : bigint,
  'expired_missions' : bigint,
  'draft_missions' : bigint,
  'active_missions' : bigint,
  'project_name' : string,
  'completed_overall_missions' : bigint,
  'project_lifetime_starts_approx' : bigint,
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Result_1 = { 'ok' : null } |
  { 'err' : string };
export type Result_2 = { 'ok' : SerializedUserMissionProgress } |
  { 'err' : string };
export type Result_3 = { 'ok' : Array<AggregatedFunnelStep> } |
  { 'err' : string };
export type Result_4 = { 'ok' : Array<[Principal, SerializedPermissions]> } |
  { 'err' : string };
export type Result_5 = { 'ok' : ActionResultFromActions } |
  { 'err' : string };
export type Result_6 = { 'ok' : bigint } |
  { 'err' : string };
export type RewardType = { 'Points' : null } |
  { 'None' : null } |
  { 'TIME' : null } |
  { 'ICPToken' : { 'memo' : [] | [bigint], 'canisterId' : string } };
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
export interface SerializedMission {
  'currentTotalCompletions' : bigint,
  'startTime' : bigint,
  'status' : MissionStatus,
  'creator' : Principal,
  'maxCompletionsPerUser' : [] | [bigint],
  'isRecursive' : boolean,
  'endTime' : [] | [bigint],
  'minRewardAmount' : bigint,
  'name' : string,
  'tags' : [] | [Array<string>],
  'description' : string,
  'recursiveTimeCooldown' : [] | [bigint],
  'creationTime' : bigint,
  'imageUrl' : [] | [string],
  'usersWhoCompletedCount' : Array<[string, bigint]>,
  'rewardType' : RewardType,
  'updates' : Array<[bigint, Principal]>,
  'actionFlowJson' : string,
  'priority' : [] | [bigint],
  'requiredPreviousMissionId' : [] | [Array<bigint>],
  'maxTotalCompletions' : [] | [bigint],
  'iconUrl' : [] | [string],
  'maxRewardAmount' : [] | [bigint],
  'requiredMissionLogic' : [] | [{ 'All' : null } | { 'Any' : null }],
}
export interface SerializedPermissions {
  'removeAdmin' : boolean,
  'createMission' : boolean,
  'resetUserProgress' : boolean,
  'editProjectInfo' : boolean,
  'editMissionFlow' : boolean,
  'editMissionInfo' : boolean,
  'viewAnyUserProgress' : boolean,
  'addAdmin' : boolean,
  'adjustUserProgress' : boolean,
  'editAdmin' : boolean,
  'viewAdmins' : boolean,
  'updateMissionStatus' : boolean,
}
export interface SerializedProjectContactInfo {
  'otherLinks' : [] | [Array<[string, string]>],
  'websiteUrl' : [] | [string],
  'emailContact' : [] | [string],
  'discordInviteUrl' : [] | [string],
  'xAccountUrl' : [] | [string],
  'openChatUrl' : [] | [string],
  'telegramGroupUrl' : [] | [string],
}
export interface SerializedProjectDetails {
  'contactInfo' : SerializedProjectContactInfo,
  'name' : string,
  'lastUpdated' : bigint,
  'description' : string,
  'updatedBy' : Principal,
  'aboutInfo' : [] | [string],
  'isVisible' : boolean,
  'bannerUrl' : [] | [string],
  'iconUrl' : [] | [string],
}
export interface SerializedUserActionStepState {
  'status' : UserActionStepStatus,
  'lastAttemptTime' : [] | [bigint],
  'attempts' : bigint,
  'lastMessageFromAction' : [] | [string],
}
export interface SerializedUserMissionProgress {
  'completionTime' : [] | [bigint],
  'flowOutputs' : Array<[bigint, string]>,
  'lastActiveTime' : bigint,
  'claimedRewardTime' : [] | [bigint],
  'overallStatus' : UserOverallMissionStatus,
  'currentStepId' : [] | [bigint],
  'stepStates' : Array<[bigint, SerializedUserActionStepState]>,
}
export type UserActionStepStatus = { 'Skipped' : null } |
  { 'RequiresUserInput' : null } |
  { 'Attempted' : null } |
  { 'InProgress' : null } |
  { 'FailedVerification' : null } |
  { 'Verified' : null } |
  { 'NotStarted' : null };
export interface UserAnalyticsRecord {
  'user_uuid' : string,
  'missions_completed_count' : bigint,
  'first_seen_time_approx' : bigint,
  'last_seen_time' : bigint,
  'missions_attempted_count' : bigint,
  'progress_entries' : Array<UserMissionProgressAnalyticsRecord>,
}
export interface UserMissionProgressAnalyticsRecord {
  'overall_status' : UserOverallMissionStatus,
  'last_active_time' : bigint,
  'completions_by_this_user_for_this_mission' : bigint,
  'completion_time' : [] | [bigint],
  'mission_id' : bigint,
}
export type UserOverallMissionStatus = { 'Abandoned' : null } |
  { 'CompletedFailure' : null } |
  { 'InProgress' : null } |
  { 'CompletedSuccess' : null } |
  { 'NotStarted' : null };
export interface _SERVICE extends ProjectBackend {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
