import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import StableTrieMap "../StableTrieMap";

module NewTypes {

  public type SerializedGlobalUser = {
    twitterid : ?Nat;
    twitterhandle : ?Text;
    creationTime : Int;
    pfpProgress : Text;
    deducedPoints : Nat;
    ocProfile : ?Text;
    discordUser : ?Text;
    telegramUser : ?Text;
    nuanceUser : ?Text;
    nnsPrincipal : ?Principal;
    firstname : ?Text;
    lastname : ?Text;
    username : ?Text;
    email : ?Text;
    bio : ?Text;
    categories : ?[Text];
    profilepic : ?Text;
    coverphoto : ?Text;
    country : ?Text;
    timezone : ?Text;
    icrc1tokens : ?[Principal];
    nft721 : ?[Principal];
  };

  public type Icrc28TrustedOriginsResponse = {
    trusted_origins : [Text];
  };

  public type Permissions = {

    // Admin
    var addAdmin : Bool;
    var removeAdmin : Bool;
    var editAdmin : Bool;
    var viewAdmins : Bool;

    // Project Info
    var editProjectInfo : Bool;

    // Missions

    var createMission : Bool;
    var editMissionInfo : Bool;
    var editMissionFlow : Bool;
    var updateMissionStatus : Bool;
    var deleteMission : Bool;

    // User Progress

    var viewAnyUserProgress : Bool;
    var resetUserProgress : Bool;
    var adjustUserProgress : Bool;
  };

  public type SerializedPermissions = {
    addAdmin : Bool;
    removeAdmin : Bool;
    editAdmin : Bool;
    viewAdmins : Bool;
    editProjectInfo : Bool;
    createMission : Bool;
    editMissionInfo : Bool;
    editMissionFlow : Bool;
    updateMissionStatus : Bool;
    deleteMission : Bool;
    viewAnyUserProgress : Bool;
    resetUserProgress : Bool;
    adjustUserProgress : Bool;
  };

  public type PermissionKey = {
    // Admin Management
    #CanAddAdmin;
    #CanRemoveAdmin;
    #CanEditAdminPermissions;
    #CanViewAdmins;

    // Project Info
    #CanEditProjectInfo;

    // Missions
    #CanCreateMission;
    #CanEditMissionInfo;
    #CanEditMissionFlow;
    #CanUpdateMissionStatus;
    #CanDeleteMission;

    // User Progress
    #CanViewAnyUserProgress;
    #CanResetUserProgress;
    #CanAdjustUserProgress;
  };

  public type ImageUploadInput = {
    #Url : Text;
    #Asset : { originalFileName : Text; content : Blob };
  };

  public type ProjectContactInfo = {
    var xAccountUrl : ?Text;
    var telegramGroupUrl : ?Text;
    var discordInviteUrl : ?Text;
    var openChatUrl : ?Text;
    var websiteUrl : ?Text;
    var emailContact : ?Text;
    var otherLinks : ?[(Text, Text)]; // Optional list of other relevant links, e.g., [("Blog", "https://..."), ("Documentation", "https://...")]
  };

  public type ProjectDetails = {
    var name : Text;
    var isVisible : Bool;
    var iconUrl : ?Text;
    var bannerUrl : ?Text;
    var description : Text;
    var aboutInfo : ?Text;
    var contactInfo : ProjectContactInfo;
    var lastUpdated : Int;
    var updatedBy : Principal;
  };

  public type SerializedProjectContactInfo = {
    xAccountUrl : ?Text;
    telegramGroupUrl : ?Text;
    discordInviteUrl : ?Text;
    openChatUrl : ?Text;
    websiteUrl : ?Text;
    emailContact : ?Text;
    otherLinks : ?[(Text, Text)];
  };

  public type SerializedProjectDetails = {
    name : Text;
    isVisible : Bool;
    iconUrl : ?Text;
    bannerUrl : ?Text;
    description : Text;
    aboutInfo : ?Text;
    contactInfo : SerializedProjectContactInfo;
    lastUpdated : Int;
    updatedBy : Principal;
  };

  // --- Enums for Statuses ---
  public type MissionStatus = {
    #Draft;
    #Active;
    #Paused;
    #Completed; // Overall mission goal met, or FCFS limit reached
    #Expired;
    #Concluded;
  };

  // Status of a user's attempt at a single action/step in a mission flow
  public type UserActionStepStatus = {
    #NotStarted;
    #InProgress; // User has initiated it, backend processing/verification ongoing
    #Attempted; // User submitted data, outcome was failure (but can retry if allowed)
    #Verified; // Successfully completed and verified by Actions Canister
    #FailedVerification; // Verification by Actions Canister did not pass (final for this attempt)
    #Skipped; // If skipping is allowed for the step
    #RequiresUserInput; // Action paused, waiting for more input (e.g. after an OAuth redirect)
    #PendingSettlement; // For leaderboard missions awaiting their end date.
  };

  // These mirror the Actions Canister types and are used when parsing ActionResult JSON
  public type ActionStatusFromBackend = {
    #Ok;
    #Error;
    #Pending;
    #RequiresUserAction;
    #InvalidParameters;
    #PreconditionNotMet;
  };

  public type ActionOutcomeFromBackend = {
    #Success;
    #Failed;
    #AlreadyDone;
    #NotApplicable;
    #PendingVerification;
  };

  // --- Reward Definition ---
  public type RewardType = {
    #Points;
    #ICPToken : { canisterId : Text; memo : ?Nat64 };
    #TIME;
    #None;
  };

  // --- Mission Definition (as stored in Project Canister) ---
  public type Mission = {
    var name : Text;
    var description : Text;
    // JSON string representing the ActionsCanister.Types.ActionFlow.
    // This flow includes ParameterBindings to define how action parameters are sourced for this mission.
    var actionFlowJson : Text;
    var minRewardAmount : Nat;
    var maxRewardAmount : ?Nat;
    var rewardType : RewardType;
    var startTime : Int;
    var endTime : ?Int;
    var status : MissionStatus;
    creator : Principal;
    var imageUrl : ?Text;
    var iconUrl : ?Text;
    var tags : ?[Text];
    var requiredPreviousMissionId : ?[Nat]; // Mission IDs
    var requiredMissionLogic : ?{ #All; #Any };
    var isRecursive : Bool;
    var recursiveTimeCooldown : ?Int; // Duration in nanoseconds
    var maxCompletionsPerUser : ?Nat;
    var maxTotalCompletions : ?Nat;
    var currentTotalCompletions : Nat;
    // userUUID (Text) -> completion count for this specific mission
    var usersWhoCompletedCount : StableTrieMap.StableTrieMap<Text, Nat>;
    creationTime : Int;
    var updates : [(Int, Principal)]; // Timestamp and updater Principal
    var priority : ?Nat; // For ordering/featuring missions
  };

  public type SerializedMission = {
    name : Text;
    description : Text;
    actionFlowJson : Text;
    minRewardAmount : Nat;
    maxRewardAmount : ?Nat;
    rewardType : RewardType;
    startTime : Int;
    endTime : ?Int;
    status : MissionStatus;
    creator : Principal;
    imageUrl : ?Text;
    iconUrl : ?Text;
    tags : ?[Text];
    requiredPreviousMissionId : ?[Nat];
    requiredMissionLogic : ?{ #All; #Any };
    isRecursive : Bool;
    recursiveTimeCooldown : ?Int;
    maxCompletionsPerUser : ?Nat;
    maxTotalCompletions : ?Nat;
    currentTotalCompletions : Nat;
    usersWhoCompletedCount : [(Text, Nat)];
    creationTime : Int;
    updates : [(Int, Principal)];
    priority : ?Nat;
  };

  // --- User Progress & Interaction Types ---

  // Represents the overall state of a user's progress through an entire ActionFlow of a Mission
  public type UserMissionProgress = {
    var overallStatus : UserOverallMissionStatus;
    var stepStates : StableTrieMap.StableTrieMap<Nat, UserActionStepState>;
    var currentStepId : ?Nat;
    var flowOutputs : StableTrieMap.StableTrieMap<Nat, Text>;
    var completionTime : ?Int;
    var claimedRewardTime : ?Int;
    var lastActiveTime : Int;
  };

  public type SerializedUserMissionProgress = {
    overallStatus : UserOverallMissionStatus;
    stepStates : [(Nat, SerializedUserActionStepState)];
    currentStepId : ?Nat;
    flowOutputs : [(Nat, Text)];
    completionTime : ?Int;
    claimedRewardTime : ?Int;
    lastActiveTime : Int;
  };

  public type UserOverallMissionStatus = {
    #NotStarted;
    #InProgress;
    #CompletedSuccess; // Entire flow completed successfully, eligible for reward
    #CompletedFailure; // Flow cannot be completed due to a persistent failure in a step
    #Abandoned; // User explicitly abandoned or timed out
  };

  // State for a single action step within a mission flow for a particular user
  public type UserActionStepState = {
    var status : UserActionStepStatus;
    var attempts : Nat;
    var lastAttemptTime : ?Int;
    var lastMessageFromAction : ?Text;
  };

  public type SerializedUserActionStepState = {
    status : UserActionStepStatus;
    attempts : Nat;
    lastAttemptTime : ?Int;
    lastMessageFromAction : ?Text;
  };

  // Input provided by the user for an action step.
  // It's serialized to JSON and sent to the Actions Canister.
  // The Actions Canister uses ParameterValueSource.#UserSuppliedInput with an inputKeyPath to extract data.
  public type UserProvidedInput = {
    #SingleValueInput : { key : Text; value : Text }; // e.g. key="tweetUrl", value="..."
    #KeyValueMapInput : { data : [(Text, Text)] }; // For multiple distinct inputs for a single step
    #NoInput;
  };

  // --- Action Result (this is what Project Canister expects to parse from Actions Canister's JSON response) ---
  public type ActionResultFromActions = {
    // Corresponds to ActionsCanister.Types.ExecuteActionResult
    success : Bool; // Overall success based on ActionOutcomeFromBackend (e.g. #Success or #AlreadyDone)
    status : ActionStatusFromBackend; // Process status from Actions Canister
    message : ?Text; // User-facing message from Actions Canister
    returnedDataJson : ?Text;
    nextStepIdToProcess : ?Nat;
    isFlowCompleted : ?Bool;
  };
};
