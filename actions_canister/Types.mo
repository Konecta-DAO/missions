module Types {

  public type ParamValue = {
    #TextValue : Text;
    #NatValue : Nat;
    #Nat64Value : Nat64;
    #IntValue : Int;
    #BoolValue : Bool;
    #PrincipalValue : Principal;
    #ArrayText : [Text];
    #ArrayNat : [Nat];
    #ArrayNat64 : [Nat64];
    #ArrayInt : [Int];
    #ArrayBool : [Bool];
    #ArrayPrincipal : [Principal];
    #OptText : ?Text;
    #OptNat : ?Nat;
    #OptNat64 : ?Nat64;
    #OptInt : ?Int;
    #OptBool : ?Bool;
    #OptPrincipal : ?Principal;
    #Null;
  };

  // --- Core Action Flow and Execution Structure ---
  public type ActionFlow = {
    var name : ?Text; // Optional name for the flow itself
    var steps : [ActionStep];
    var completionLogic : FlowCompletionLogic; // How to determine if the whole flow is complete
  };

  public type ActionStep = {
    stepId : Nat; // Unique within the ActionFlow, used for ordering and referencing outputs/state
    var description : ?Text;
    var item : ActionItem;
  };

  public type ActionItem = {
    #SingleAction : ActionInstance;
    #ActionGroup : GroupOfActions;
  };

  public type GroupOfActions = {
    groupId : Nat;
    var actions : [ActionInstance];
    var completionLogic : GroupCompletionLogic;
  };

  public type ActionInstance = {
    instanceId : Nat; // Unique within its step/group, for precise logging or targeting if needed.
    actionDefinitionId : Text; // Key to look up ActionDefinition (e.g., "twitter_follow_v1")
    var parameterBindings : [ParameterBinding]; // How parameters are sourced for this instance
    var uiInteraction : UIInteractionType; // UI hint for the frontend rendering this step
  };

  public type ParameterBinding = {
    parameterName : Text;
    valueSource : ParameterValueSource;
  };

  public type ParameterValueSource = {
    // JSON representation of the literal value.
    // E.g., "\"some_string\"", "123", "[1,2,3]", "{\"key\":\"val\"}", "true", "null".
    // The Actions Canister will parse this into the type expected by the action's parameter.
    #LiteralValue : Text;

    // Value sourced from the output of a previous step in the *same* ActionFlow.
    #PreviousStepOutput : {
      sourceStepId : Nat; // The stepId (ActionStep.stepId) within the current ActionFlow that produced the output.
      // Path to extract the value from the source step's ActionReturnedData JSON.
      // Uses a dot-notation for nested objects/arrays e.g., "tweetId", "userData.id", "results[0].status".
      // The Actions Canister needs a robust JSON path extraction utility.
      outputKeyPath : Text;
    };

    // Value sourced from the JSON supplied by the Project Canister for the current step.
    #UserSuppliedInput : {
      // Path to extract value from the JSON.
      inputKeyPath : Text;
    };

    // Value sourced from context data provided by the Project Canister about the mission itself
    // or the overall user state, passed alongside the request to execute a step.
    #MissionContext : {
      // Key to look up in the missionContextJson provided by the Project Canister.
      // e.g., "missionName", "missionId", "userPrincipal", "userTotalPoints".
      contextKey : Text;
    };
  };

  public type ActionDefinition = {
    id : Text; // Unique ID for this type of action (e.g., "twitter_follow_v1", "sns_vote_v1")
    var name : Text; // User-friendly name (e.g., "Follow on Twitter")
    var descriptionTemplate : Text; // Template for describing the action, may use placeholders for parameters.
    // e.g., "Follow {{accounts}} on Twitter." Placeholders match ParameterDefinition.name.
    platform : PlatformType;
    var version : Nat; // Version of this action definition
    var defaultUIType : UIInteractionType; // Suggested UI if not overridden in ActionInstance
    // Defines expected parameters, their types, validation, and UI hints.
    var parameterSchema : [ActionParameterDefinition];
    // Optional JSON schema describing the structure of ActionReturnedData for this action.
    // Useful for validation and for consumers building #PreviousStepOutput bindings.
    var outputSchemaJson : ?Text;
    // Identifier for the backend logic/function that verifies/executes this action.
    var executionHandler : Text;
    var tags : ?[Text]; // Tags for categorizing/searching actions
  };

  public type SerializedActionDefinition = {
    id : Text;
    name : Text;
    descriptionTemplate : Text;
    platform : PlatformType;
    version : Nat;
    defaultUIType : UIInteractionType;
    parameterSchema : [SerializedActionParameterDefinition];
    outputSchemaJson : ?Text;
    executionHandler : Text;
    tags : ?[Text];
  };

  public type ActionParameterDefinition = {
    name : Text; // The key for this parameter (e.g., "accounts", "tweetUrl", "proposalId")
    dataType : ParameterDataType; // E.g., #Text, #Nat, #Bool, #Principal, #ArrayText
    isRequired : Bool;
    var inputLabel : Text; // Suggested label for UI forms
    var helpText : ?Text; // More detailed explanation or example
    var defaultValueJson : ?Text; // Optional default value as a JSON string, if applicable
    var validationRegex : ?Text; // Optional regex for validating Text inputs
  };

  public type SerializedActionParameterDefinition = {
    name : Text; // The key for this parameter (e.g., "accounts", "tweetUrl", "proposalId")
    dataType : ParameterDataType; // E.g., #Text, #Nat, #Bool, #Principal, #ArrayText
    isRequired : Bool;
    inputLabel : Text; // Suggested label for UI forms
    helpText : ?Text; // More detailed explanation or example
    defaultValueJson : ?Text; // Optional default value as a JSON string, if applicable
    validationRegex : ?Text; // Optional regex for validating Text inputs
  };

  public type ParameterDataType = {
    #Text;
    #Nat;
    #Nat64;
    #Int;
    #Principal;
    #Bool;
    #JsonText;
    // explicit array variants
    #ArrayText;
    #ArrayNat;
    #ArrayNat64;
    #ArrayInt;
    #ArrayBool;
    #ArrayPrincipal;
    // explicit optional variants
    #OptText;
    #OptNat;
    #OptNat64;
    #OptInt;
    #OptBool;
    #OptPrincipal;
  };

  public type VoteOption = {
    #Yes;
    #No;
  };

  public type ActionParameters = {
    #TwitterFollowParams : {
      var accounts : [Text];
    };
    #TweetRetweetParams : {
      var tweetIds : [Text];
    };
    #VerifyTweetParams : {
      var keywords : ?[Text];
      var mentions : ?[Text];
      var hashtags : ?[Text];
      var cashtags : ?[Text];
      var emojis : ?[Text];
    };
    #TweetLikeParams : {
      var tweetIds : [Text];
    };
    #TwitterBioCheckParams : {
      var keywords : ?[Text];
      var mentions : ?[Text];
      var hashtags : ?[Text];
      var cashtags : ?[Text];
      var emojis : ?[Text];
    };
    #DiscordJoinServerParams : {
      var serverIds : [Text];
    };
    #RedditJoinSubredditParams : {
      var subredditNames : [Text];
    };
    #VoteOnProposalParams : {
      var snsCanisterId : Principal;
      var proposalId : Nat;
      var principalToCheck : Principal;
    };
    #CreateProposalParams : {
      var snsCanisterId : Principal;
    };
    #NuanceFollowParams : {
      var nuanceUsernames : [Text];
    };
    #NftOwnershipParams : {
      var nftCanisterId : Principal;
      var principalToCheck : Principal;
      var requiredTokenCount : ?Nat;
    };
    #ValidateCodeParams : {
      var codeListId : [Text];
    };
    #LeaderboardParams : {
      endDate : Int; // Nanoseconds timestamp
      projectCanisterId : Principal;
      missionIds : [Nat];
      totalReward : Nat; // Total points to be distributed
    };
    #EventJoinParams : {
      var eventId : Text;
      var principalToCheck : Principal;
    };
    #EventCreateAnyParams : {
      var principalToCheck : Principal;
    };
    #NoParams;
  };

  public type ActionReturnedData = {
    #TwitterFollowResult : {
      followedAccounts : [{
        account : Text;
        status : ActionStatusOutcome;
      }];
    };
    #TweetRetweetResult : {
      retweetedTweets : [{
        tweetId : Text;
        status : ActionStatusOutcome;
      }];
    };
    #VerifyTweetResult : {
      isVerified : Bool;
      verificationStatus : ActionStatusOutcome;
      foundTweetId : ?Text;
      foundTweetContent : ?Text;
    };
    #TweetLikeResult : {
      likedTweets : [{ tweetId : Text; status : ActionStatusOutcome }];
    };
    #TwitterBioCheckResult : {
      accountChecked : Text;
      bioContent : ?Text;
      isVerified : Bool;
      verificationStatus : ActionStatusOutcome;
    };
    #DiscordJoinServerResult : {
      serverId : Text;
      serverName : ?Text;
      joinStatus : ActionStatusOutcome;
    };
    #RedditJoinSubredditResult : {
      joinedSubreddits : [{
        subredditName : Text;
        status : ActionStatusOutcome;
      }];
    };
    #VoteOnProposalResult : {
      snsCanisterId : Principal;
      proposalId : Nat;
      principalChecked : Principal; // <<< Principal whose vote was checked
      hasVoted : Bool; // <<< True if the principal (via any neuron) voted
      voteCasted : ?VoteOption; // <<< The actual vote, if hasVoted is true
      verificationStatus : ActionStatusOutcome; // e.g., #Success if check made, #Failed if SNS query failed
    };
    #CreateProposalResult : {
      snsCanisterId : Principal;
      newProposalId : ?Nat;
      creationStatus : ActionStatusOutcome;
    };
    #NuanceFollowResult : {
      followedNuanceUsers : [{
        username : Text;
        status : ActionStatusOutcome;
      }];
    };
    #NftOwnershipResult : {
      nftCanisterId : Principal;
      principalChecked : Principal;
      hasRequiredNft : Bool;
      ownedTokenCount : Nat;
      verificationStatus : ActionStatusOutcome;
      detailMessage : ?Text;
    };
    #ValidateCodeResult : {
      code : Text;
      isValid : Bool;
      message : ?Text;
      attemptsRemaining : ?Nat;
    };
    #LeaderboardResult : {
      status : { #Pending; #Settled; #Failed };
      settlementTime : ?Int;
      winners : ?[{
        rank : Nat;
        userUuid : Text;
        totalPoints : Nat;
        rewardAmount : Nat;
      }];
      detailMessage : ?Text;
    };
    #EventJoinResult : {
      eventId : Text;
      principalChecked : Principal;
      hasJoined : Bool;
      verificationStatus : ActionStatusOutcome;
    };
    #EventCreateAnyResult : {
      principalChecked : Principal;
      hasCreatedEvents : Bool;
      createdEventsCount : Nat;
      verificationStatus : ActionStatusOutcome;
    };
    #NoData;
  };

  public type FlowCompletionLogic = {
    #AllInOrder;
    #AllAnyOrder;
  };
  public type GroupCompletionLogic = { #CompleteAny; #CompleteAll };

  public type UIInteractionType = {
    #ButtonOnly : { buttonText : Text }; // For actions needing just a trigger
    #InputAndButton : {
      // For each field the UI should render for this step:
      inputFields : [{
        keyForUserInput : Text; // The key this input will have in the Provided JSON
        inputLabel : Text;
        placeholder : ?Text;
        // dataType: ParameterDataType; // Hint for UI input type (text, number, url etc.)
        isRequired : Bool;
      }];
      buttonText : Text;
    };
    #Informational; // No direct input, just presents info then maybe auto-proceeds or has a "Continue" button.
    #ExternalRedirect; // UI should explain user will be redirected (e.g. OAuth)
    #NoUIRequired; // Action is automatic, backend-to-backend, or triggered by system event.
  };

  public type PlatformType = {
    #Twitter;
    #Discord;
    #Reddit;
    #Telegram;
    #OpenChat;
    #SNS;
    #CanisterEndpoint;
    #Nuance;
  };

  // Status of the action execution process itself by the Actions Canister
  public type ActionStatus = {
    #Ok; // Logic attempted, see ActionOutcome in returned data for business result
    #Error; // Internal error in Actions Canister during execution (e.g., bug, unhandled exception)
    #Pending; // Async operation in progress (e.g., waiting for external API callback, or long task)
    #RequiresUserAction; // Needs user to interact with an external site (e.g., OAuth, complete a CAPTCHA)
    #InvalidParameters; // Resolved parameters were invalid for the ActionDefinition schema or execution logic
    #PreconditionNotMet; // A prerequisite for the action (defined in flow or action itself) was not met
    #HandlerNotFound; // The ActionDefinition.executionHandler was not found or is not implemented
    #ApiError; // Error communicating with an external API
  };

  // Detailed outcome of the action's business logic (the "result" of the action)
  public type ActionOutcome = {
    #Success; // The action's objective was successfully achieved.
    #Failed; // The action's objective could not be achieved (e.g., user not found, proposal already closed).
    #AlreadyDone; // The action's objective was already met by the user previously.
    #NotApplicable; // The action could not be applied in the current context (e.g. trying to vote on a non-existent proposal).
    #PendingVerification; // Action submitted, but requires off-chain or delayed verification. User might be notified later.
  };

  // This is the primary structure returned (as JSON) by the main execution endpoint of the Actions Canister.
  public type ExecuteActionResult = {
    stepIdProcessed : Nat; // The stepId of the ActionStep that was just processed.
    actionInstanceIdProcessed : Nat; // The instanceId from that step.

    overallSuccess : Bool; // Convenience flag: true if outcome is #Success or #AlreadyDone.
    executionStatus : ActionStatus; // The process status from Actions Canister.
    actionOutcome : ActionOutcome; // The business logic outcome of the action.

    message : ?Text; // User-facing message (can be error, success, or informational).
    // JSON string of ActionReturnedData, IF the action produced data.
    // This is what's stored by Project Canister and used for #PreviousStepOutput.
    returnedDataJson : ?Text;

    nextStepIdToProcess : ?Nat; // If the flow logic can determine the next step immediately.
    isFlowCompleted : ?Bool; // If this action resulted in the completion of the entire flow.
  };

  public type ActionStatusOutcome = {
    #Success;
    #Failed;
    #AlreadyDone;
    #NotApplicable;
    #PendingVerification;
  };
};
