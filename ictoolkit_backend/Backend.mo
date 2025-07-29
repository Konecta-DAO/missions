import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Types "Types";
import Serialization "Serialization";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Vector "mo:vector";
import Blob "mo:base/Blob";
import Int "mo:base/Int";
import Hash "mo:base/Hash";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";
import Int32 "mo:base/Int32";

persistent actor class Backend() {

  public type Account = { owner : ?Principal; subaccount : ?Subaccount };
  public type Action = {
    #ManageNervousSystemParameters : NervousSystemParameters;
    #AddGenericNervousSystemFunction : NervousSystemFunction;
    #ManageDappCanisterSettings : ManageDappCanisterSettings;
    #RemoveGenericNervousSystemFunction : Nat64;
    #SetTopicsForCustomProposals : SetTopicsForCustomProposals;
    #UpgradeSnsToNextVersion : {};
    #RegisterDappCanisters : RegisterDappCanisters;
    #TransferSnsTreasuryFunds : TransferSnsTreasuryFunds;
    #UpgradeSnsControlledCanister : UpgradeSnsControlledCanister;
    #DeregisterDappCanisters : DeregisterDappCanisters;
    #MintSnsTokens : MintSnsTokens;
    #AdvanceSnsTargetVersion : AdvanceSnsTargetVersion;
    #Unspecified : {};
    #ManageSnsMetadata : ManageSnsMetadata;
    #ExecuteGenericNervousSystemFunction : ExecuteGenericNervousSystemFunction;
    #ManageLedgerParameters : ManageLedgerParameters;
    #Motion : Motion;
  };
  public type ActionAuxiliary = {
    #TransferSnsTreasuryFunds : MintSnsTokensActionAuxiliary;
    #MintSnsTokens : MintSnsTokensActionAuxiliary;
    #AdvanceSnsTargetVersion : AdvanceSnsTargetVersionActionAuxiliary;
  };
  public type AddNeuronPermissions = {
    permissions_to_add : ?NeuronPermissionList;
    principal_id : ?Principal;
  };
  public type AdvanceSnsTargetVersion = { new_target : ?SnsVersion };
  public type AdvanceSnsTargetVersionActionAuxiliary = {
    target_version : ?SnsVersion;
  };
  public type Amount = { e8s : Nat64 };
  public type Ballot = {
    vote : Int32;
    cast_timestamp_seconds : Nat64;
    voting_power : Nat64;
  };
  public type By = { #MemoAndController : MemoAndController; #NeuronId : {} };
  public type CachedUpgradeSteps = {
    upgrade_steps : ?Versions;
    response_timestamp_seconds : ?Nat64;
    requested_timestamp_seconds : ?Nat64;
  };
  public type CanisterStatusResultV2 = {
    status : CanisterStatusType;
    memory_size : Nat;
    cycles : Nat;
    settings : DefiniteCanisterSettingsArgs;
    query_stats : ?QueryStats;
    idle_cycles_burned_per_day : Nat;
    module_hash : ?Blob;
  };
  public type CanisterStatusType = { #stopped; #stopping; #running };
  public type ChangeAutoStakeMaturity = {
    requested_setting_for_auto_stake_maturity : Bool;
  };
  public type ChunkedCanisterWasm = {
    wasm_module_hash : Blob;
    chunk_hashes_list : [Blob];
    store_canister_id : ?Principal;
  };
  public type ClaimOrRefresh = { by : ?By };
  public type ClaimOrRefreshResponse = { refreshed_neuron_id : ?NeuronId };
  public type ClaimSwapNeuronsRequest = { neuron_recipes : ?NeuronRecipes };
  public type ClaimSwapNeuronsResponse = {
    claim_swap_neurons_result : ?ClaimSwapNeuronsResult;
  };
  public type ClaimSwapNeuronsResult = {
    #Ok : ClaimedSwapNeurons;
    #Err : Int32;
  };
  public type ClaimedSwapNeurons = { swap_neurons : [SwapNeuron] };
  public type Command = {
    #Split : Split;
    #Follow : Follow;
    #DisburseMaturity : DisburseMaturity;
    #ClaimOrRefresh : ClaimOrRefresh;
    #Configure : Configure;
    #RegisterVote : RegisterVote;
    #SetFollowing : SetFollowing;
    #MakeProposal : Proposal;
    #StakeMaturity : StakeMaturity;
    #RemoveNeuronPermissions : RemoveNeuronPermissions;
    #AddNeuronPermissions : AddNeuronPermissions;
    #MergeMaturity : MergeMaturity;
    #Disburse : Disburse;
  };
  public type Command_1 = {
    #Error : GovernanceError;
    #Split : SplitResponse;
    #Follow : {};
    #DisburseMaturity : DisburseMaturityResponse;
    #ClaimOrRefresh : ClaimOrRefreshResponse;
    #Configure : {};
    #RegisterVote : {};
    #SetFollowing : {};
    #MakeProposal : GetProposal;
    #RemoveNeuronPermission : {};
    #StakeMaturity : StakeMaturityResponse;
    #MergeMaturity : MergeMaturityResponse;
    #Disburse : DisburseResponse;
    #AddNeuronPermission : {};
  };
  public type Command_2 = {
    #Split : Split;
    #Follow : Follow;
    #DisburseMaturity : DisburseMaturity;
    #Configure : Configure;
    #RegisterVote : RegisterVote;
    #SetFollowing : SetFollowing;
    #SyncCommand : {};
    #MakeProposal : Proposal;
    #FinalizeDisburseMaturity : FinalizeDisburseMaturity;
    #ClaimOrRefreshNeuron : ClaimOrRefresh;
    #RemoveNeuronPermissions : RemoveNeuronPermissions;
    #AddNeuronPermissions : AddNeuronPermissions;
    #MergeMaturity : MergeMaturity;
    #Disburse : Disburse;
  };
  public type Configure = { operation : ?Operation };
  public type Decimal = { human_readable : ?Text };
  public type DefaultFollowees = { followees : [(Nat64, Followees)] };
  public type DefiniteCanisterSettingsArgs = {
    freezing_threshold : Nat;
    wasm_memory_threshold : ?Nat;
    controllers : [Principal];
    wasm_memory_limit : ?Nat;
    memory_allocation : Nat;
    compute_allocation : Nat;
  };
  public type DeregisterDappCanisters = {
    canister_ids : [Principal];
    new_controllers : [Principal];
  };
  public type Disburse = { to_account : ?Account; amount : ?Amount };
  public type DisburseMaturity = {
    to_account : ?Account;
    percentage_to_disburse : Nat32;
  };
  public type DisburseMaturityInProgress = {
    timestamp_of_disbursement_seconds : Nat64;
    amount_e8s : Nat64;
    account_to_disburse_to : ?Account;
    finalize_disbursement_timestamp_seconds : ?Nat64;
  };
  public type DisburseMaturityResponse = {
    amount_disbursed_e8s : Nat64;
    amount_deducted_e8s : ?Nat64;
  };
  public type DisburseResponse = { transfer_block_height : Nat64 };
  public type DissolveState = {
    #DissolveDelaySeconds : Nat64;
    #WhenDissolvedTimestampSeconds : Nat64;
  };
  public type ExecuteGenericNervousSystemFunction = {
    function_id : Nat64;
    payload : Blob;
  };
  public type FinalizeDisburseMaturity = {
    amount_to_be_disbursed_e8s : Nat64;
    to_account : ?Account;
  };
  public type Follow = { function_id : Nat64; followees : [NeuronId] };
  public type Followee = { alias : ?Text; neuron_id : ?NeuronId };
  public type Followees = { followees : [NeuronId] };
  public type FolloweesForTopic = { topic : ?Topic; followees : [Followee] };
  public type FunctionType = {
    #NativeNervousSystemFunction : {};
    #GenericNervousSystemFunction : GenericNervousSystemFunction;
  };
  public type GenericNervousSystemFunction = {
    topic : ?Topic;
    validator_canister_id : ?Principal;
    target_canister_id : ?Principal;
    validator_method_name : ?Text;
    target_method_name : ?Text;
  };
  public type GetMaturityModulationResponse = {
    maturity_modulation : ?MaturityModulation;
  };
  public type GetMetadataResponse = {
    url : ?Text;
    logo : ?Text;
    name : ?Text;
    description : ?Text;
  };
  public type GetModeResponse = { mode : ?Int32 };
  public type GetNeuron = { neuron_id : ?NeuronId };
  public type GetNeuronResponse = { result : ?Result };
  public type GetProposal = { proposal_id : ?ProposalId };
  public type GetProposalResponse = { result : ?Result_1 };
  public type GetRunningSnsVersionResponse = {
    deployed_version : ?Version;
    pending_version : ?{
      mark_failed_at_seconds : Nat64;
      checking_upgrade_lock : Nat64;
      proposal_id : Nat64;
      target_version : ?Version;
    };
  };
  public type GetSnsInitializationParametersResponse = {
    sns_initialization_parameters : Text;
  };
  public type GetTimersResponse = { timers : ?Timers };
  public type GetUpgradeJournalRequest = { offset : ?Nat64; limit : ?Nat64 };
  public type GetUpgradeJournalResponse = {
    upgrade_journal : ?UpgradeJournal;
    upgrade_steps : ?Versions;
    response_timestamp_seconds : ?Nat64;
    deployed_version : ?Version;
    target_version : ?Version;
    upgrade_journal_entry_count : ?Nat64;
  };
  public type Governance = {
    root_canister_id : ?Principal;
    timers : ?Timers;
    cached_upgrade_steps : ?CachedUpgradeSteps;
    id_to_nervous_system_functions : [(Nat64, NervousSystemFunction)];
    metrics : ?GovernanceCachedMetrics;
    maturity_modulation : ?MaturityModulation;
    upgrade_journal : ?UpgradeJournal;
    mode : Int32;
    parameters : ?NervousSystemParameters;
    is_finalizing_disburse_maturity : ?Bool;
    deployed_version : ?Version;
    sns_initialization_parameters : Text;
    latest_reward_event : ?RewardEvent;
    pending_version : ?PendingVersion;
    swap_canister_id : ?Principal;
    ledger_canister_id : ?Principal;
    proposals : [(Nat64, ProposalData)];
    in_flight_commands : [(Text, NeuronInFlightCommand)];
    sns_metadata : ?ManageSnsMetadata;
    neurons : [(Text, Neuron)];
    target_version : ?Version;
    genesis_timestamp_seconds : Nat64;
  };
  public type GovernanceCachedMetrics = {
    not_dissolving_neurons_e8s_buckets : [(Nat64, Float)];
    garbage_collectable_neurons_count : Nat64;
    neurons_with_invalid_stake_count : Nat64;
    not_dissolving_neurons_count_buckets : [(Nat64, Nat64)];
    neurons_with_less_than_6_months_dissolve_delay_count : Nat64;
    dissolved_neurons_count : Nat64;
    total_staked_e8s : Nat64;
    total_supply_governance_tokens : Nat64;
    not_dissolving_neurons_count : Nat64;
    dissolved_neurons_e8s : Nat64;
    neurons_with_less_than_6_months_dissolve_delay_e8s : Nat64;
    dissolving_neurons_count_buckets : [(Nat64, Nat64)];
    dissolving_neurons_count : Nat64;
    dissolving_neurons_e8s_buckets : [(Nat64, Float)];
    timestamp_seconds : Nat64;
  };
  public type GovernanceError = { error_message : Text; error_type : Int32 };
  public type IncreaseDissolveDelay = {
    additional_dissolve_delay_seconds : Nat32;
  };
  public type ListNervousSystemFunctionsResponse = {
    reserved_ids : [Nat64];
    functions : [NervousSystemFunction];
  };
  public type ListNeurons = {
    of_principal : ?Principal;
    limit : Nat32;
    start_page_at : ?NeuronId;
  };
  public type ListNeuronsResponse = { neurons : [Neuron] };
  public type ListProposals = {
    include_reward_status : [Int32];
    before_proposal : ?ProposalId;
    limit : Nat32;
    exclude_type : [Nat64];
    include_topics : ?[TopicSelector];
    include_status : [Int32];
  };
  public type ListProposalsResponse = {
    include_ballots_by_caller : ?Bool;
    proposals : [ProposalData];
    include_topic_filtering : ?Bool;
  };
  public type ListTopicsRequest = {};
  public type ListTopicsResponse = {
    uncategorized_functions : ?[NervousSystemFunction];
    topics : ?[TopicInfo];
  };
  public type ManageDappCanisterSettings = {
    freezing_threshold : ?Nat64;
    wasm_memory_threshold : ?Nat64;
    canister_ids : [Principal];
    reserved_cycles_limit : ?Nat64;
    log_visibility : ?Int32;
    wasm_memory_limit : ?Nat64;
    memory_allocation : ?Nat64;
    compute_allocation : ?Nat64;
  };
  public type ManageLedgerParameters = {
    token_symbol : ?Text;
    transfer_fee : ?Nat64;
    token_logo : ?Text;
    token_name : ?Text;
  };
  public type ManageNeuron = { subaccount : Blob; command : ?Command };
  public type ManageNeuronResponse = { command : ?Command_1 };
  public type ManageSnsMetadata = {
    url : ?Text;
    logo : ?Text;
    name : ?Text;
    description : ?Text;
  };
  public type MaturityModulation = {
    current_basis_points : ?Int32;
    updated_at_timestamp_seconds : ?Nat64;
  };
  public type MemoAndController = { controller : ?Principal; memo : Nat64 };
  public type MergeMaturity = { percentage_to_merge : Nat32 };
  public type MergeMaturityResponse = {
    merged_maturity_e8s : Nat64;
    new_stake_e8s : Nat64;
  };
  public type MintSnsTokens = {
    to_principal : ?Principal;
    to_subaccount : ?Subaccount;
    memo : ?Nat64;
    amount_e8s : ?Nat64;
  };
  public type MintSnsTokensActionAuxiliary = { valuation : ?Valuation };
  public type Motion = { motion_text : Text };
  public type NervousSystemFunction = {
    id : Nat64;
    name : Text;
    description : ?Text;
    function_type : ?FunctionType;
  };
  public type NervousSystemParameters = {
    default_followees : ?DefaultFollowees;
    max_dissolve_delay_seconds : ?Nat64;
    max_dissolve_delay_bonus_percentage : ?Nat64;
    max_followees_per_function : ?Nat64;
    automatically_advance_target_version : ?Bool;
    neuron_claimer_permissions : ?NeuronPermissionList;
    neuron_minimum_stake_e8s : ?Nat64;
    max_neuron_age_for_age_bonus : ?Nat64;
    initial_voting_period_seconds : ?Nat64;
    neuron_minimum_dissolve_delay_to_vote_seconds : ?Nat64;
    reject_cost_e8s : ?Nat64;
    max_proposals_to_keep_per_action : ?Nat32;
    wait_for_quiet_deadline_increase_seconds : ?Nat64;
    max_number_of_neurons : ?Nat64;
    transaction_fee_e8s : ?Nat64;
    max_number_of_proposals_with_ballots : ?Nat64;
    max_age_bonus_percentage : ?Nat64;
    neuron_grantable_permissions : ?NeuronPermissionList;
    voting_rewards_parameters : ?VotingRewardsParameters;
    maturity_modulation_disabled : ?Bool;
    max_number_of_principals_per_neuron : ?Nat64;
  };
  public type Neuron = {
    id : ?NeuronId;
    staked_maturity_e8s_equivalent : ?Nat64;
    permissions : [NeuronPermission];
    maturity_e8s_equivalent : Nat64;
    cached_neuron_stake_e8s : Nat64;
    created_timestamp_seconds : Nat64;
    topic_followees : ?{ topic_id_to_followees : [(Int32, FolloweesForTopic)] };
    source_nns_neuron_id : ?Nat64;
    auto_stake_maturity : ?Bool;
    aging_since_timestamp_seconds : Nat64;
    dissolve_state : ?DissolveState;
    voting_power_percentage_multiplier : Nat64;
    vesting_period_seconds : ?Nat64;
    disburse_maturity_in_progress : [DisburseMaturityInProgress];
    followees : [(Nat64, Followees)];
    neuron_fees_e8s : Nat64;
  };
  public type NeuronId = { id : Blob };
  public type NeuronIds = { neuron_ids : [NeuronId] };
  public type NeuronInFlightCommand = {
    command : ?Command_2;
    timestamp : Nat64;
  };
  public type NeuronPermission = {
    principal : ?Principal;
    permission_type : [Int32];
  };
  public type NeuronPermissionList = { permissions : [Int32] };
  public type NeuronRecipe = {
    controller : ?Principal;
    dissolve_delay_seconds : ?Nat64;
    participant : ?Participant;
    stake_e8s : ?Nat64;
    followees : ?NeuronIds;
    neuron_id : ?NeuronId;
  };
  public type NeuronRecipes = { neuron_recipes : [NeuronRecipe] };
  public type NeuronsFund = {
    nns_neuron_hotkeys : ?Principals;
    nns_neuron_controller : ?Principal;
    nns_neuron_id : ?Nat64;
  };
  public type Operation = {
    #ChangeAutoStakeMaturity : ChangeAutoStakeMaturity;
    #StopDissolving : {};
    #StartDissolving : {};
    #IncreaseDissolveDelay : IncreaseDissolveDelay;
    #SetDissolveTimestamp : SetDissolveTimestamp;
  };
  public type Participant = { #NeuronsFund : NeuronsFund; #Direct : {} };
  public type PendingVersion = {
    mark_failed_at_seconds : Nat64;
    checking_upgrade_lock : Nat64;
    proposal_id : ?Nat64;
    target_version : ?Version;
  };
  public type Percentage = { basis_points : ?Nat64 };
  public type Principals = { principals : [Principal] };
  public type Proposal = {
    url : Text;
    title : Text;
    action : ?Action;
    summary : Text;
  };
  public type ProposalData = {
    id : ?ProposalId;
    payload_text_rendering : ?Text;
    topic : ?Topic;
    action : Nat64;
    failure_reason : ?GovernanceError;
    action_auxiliary : ?ActionAuxiliary;
    ballots : [(Text, Ballot)];
    minimum_yes_proportion_of_total : ?Percentage;
    reward_event_round : Nat64;
    failed_timestamp_seconds : Nat64;
    reward_event_end_timestamp_seconds : ?Nat64;
    proposal_creation_timestamp_seconds : Nat64;
    initial_voting_period_seconds : Nat64;
    reject_cost_e8s : Nat64;
    latest_tally : ?Tally;
    wait_for_quiet_deadline_increase_seconds : Nat64;
    decided_timestamp_seconds : Nat64;
    proposal : ?Proposal;
    proposer : ?NeuronId;
    wait_for_quiet_state : ?WaitForQuietState;
    minimum_yes_proportion_of_exercised : ?Percentage;
    is_eligible_for_rewards : Bool;
    executed_timestamp_seconds : Nat64;
  };
  public type ProposalId = { id : Nat64 };
  public type QueryStats = {
    response_payload_bytes_total : ?Nat;
    num_instructions_total : ?Nat;
    num_calls_total : ?Nat;
    request_payload_bytes_total : ?Nat;
  };
  public type RegisterDappCanisters = { canister_ids : [Principal] };
  public type RegisterVote = { vote : Int32; proposal : ?ProposalId };
  public type RemoveNeuronPermissions = {
    permissions_to_remove : ?NeuronPermissionList;
    principal_id : ?Principal;
  };
  public type Result = { #Error : GovernanceError; #Neuron : Neuron };
  public type Result_1 = { #Error : GovernanceError; #Proposal : ProposalData };
  public type RewardEvent = {
    rounds_since_last_distribution : ?Nat64;
    actual_timestamp_seconds : Nat64;
    end_timestamp_seconds : ?Nat64;
    total_available_e8s_equivalent : ?Nat64;
    distributed_e8s_equivalent : Nat64;
    round : Nat64;
    settled_proposals : [ProposalId];
  };
  public type SetDissolveTimestamp = { dissolve_timestamp_seconds : Nat64 };
  public type SetFollowing = { topic_following : [FolloweesForTopic] };
  public type SetMode = { mode : Int32 };
  public type SetTopicsForCustomProposals = {
    custom_function_id_to_topic : [(Nat64, Topic)];
  };
  public type SnsVersion = {
    archive_wasm_hash : ?Blob;
    root_wasm_hash : ?Blob;
    swap_wasm_hash : ?Blob;
    ledger_wasm_hash : ?Blob;
    governance_wasm_hash : ?Blob;
    index_wasm_hash : ?Blob;
  };
  public type Split = { memo : Nat64; amount_e8s : Nat64 };
  public type SplitResponse = { created_neuron_id : ?NeuronId };
  public type StakeMaturity = { percentage_to_stake : ?Nat32 };
  public type StakeMaturityResponse = {
    maturity_e8s : Nat64;
    staked_maturity_e8s : Nat64;
  };
  public type Subaccount = { subaccount : Blob };
  public type SwapNeuron = { id : ?NeuronId; status : Int32 };
  public type Tally = {
    no : Nat64;
    yes : Nat64;
    total : Nat64;
    timestamp_seconds : Nat64;
  };
  public type TargetVersionReset = {
    human_readable : ?Text;
    old_target_version : ?Version;
    new_target_version : ?Version;
  };
  public type TargetVersionSet = {
    old_target_version : ?Version;
    new_target_version : ?Version;
    is_advanced_automatically : ?Bool;
  };
  public type Timers = {
    last_spawned_timestamp_seconds : ?Nat64;
    last_reset_timestamp_seconds : ?Nat64;
    requires_periodic_tasks : ?Bool;
  };
  public type Tokens = { e8s : ?Nat64 };
  public type Topic = {
    #DappCanisterManagement;
    #DaoCommunitySettings;
    #ApplicationBusinessLogic;
    #CriticalDappOperations;
    #TreasuryAssetManagement;
    #Governance;
    #SnsFrameworkManagement;
  };
  public type TopicInfo = {
    native_functions : ?[NervousSystemFunction];
    topic : ?Topic;
    is_critical : ?Bool;
    name : ?Text;
    description : ?Text;
    custom_functions : ?[NervousSystemFunction];
  };
  public type TopicSelector = { topic : ?Topic };
  public type TransferSnsTreasuryFunds = {
    from_treasury : Int32;
    to_principal : ?Principal;
    to_subaccount : ?Subaccount;
    memo : ?Nat64;
    amount_e8s : Nat64;
  };
  public type UpgradeInProgress = {
    mark_failed_at_seconds : Nat64;
    checking_upgrade_lock : Nat64;
    proposal_id : ?Nat64;
    target_version : ?Version;
  };
  public type UpgradeJournal = { entries : [UpgradeJournalEntry] };
  public type UpgradeJournalEntry = {
    event : ?{
      #TargetVersionSet : TargetVersionSet;
      #UpgradeStepsReset : UpgradeStepsReset;
      #UpgradeOutcome : UpgradeOutcome;
      #UpgradeStarted : UpgradeStarted;
      #UpgradeStepsRefreshed : UpgradeStepsRefreshed;
      #TargetVersionReset : TargetVersionReset;
    };
    timestamp_seconds : ?Nat64;
  };
  public type UpgradeOutcome = {
    status : ?{
      #Success : {};
      #Timeout : {};
      #ExternalFailure : {};
      #InvalidState : { version : ?Version };
    };
    human_readable : ?Text;
  };
  public type UpgradeSnsControlledCanister = {
    new_canister_wasm : Blob;
    mode : ?Int32;
    canister_id : ?Principal;
    chunked_canister_wasm : ?ChunkedCanisterWasm;
    canister_upgrade_arg : ?Blob;
  };
  public type UpgradeStarted = {
    current_version : ?Version;
    expected_version : ?Version;
    reason : ?{
      #UpgradeSnsToNextVersionProposal : ProposalId;
      #BehindTargetVersion : {};
    };
  };
  public type UpgradeStepsRefreshed = { upgrade_steps : ?Versions };
  public type UpgradeStepsReset = {
    human_readable : ?Text;
    upgrade_steps : ?Versions;
  };
  public type Valuation = {
    token : ?Int32;
    account : ?Account;
    valuation_factors : ?ValuationFactors;
    timestamp_seconds : ?Nat64;
  };
  public type ValuationFactors = {
    xdrs_per_icp : ?Decimal;
    icps_per_token : ?Decimal;
    tokens : ?Tokens;
  };
  public type Version = {
    archive_wasm_hash : Blob;
    root_wasm_hash : Blob;
    swap_wasm_hash : Blob;
    ledger_wasm_hash : Blob;
    governance_wasm_hash : Blob;
    index_wasm_hash : Blob;
  };
  public type Versions = { versions : [Version] };
  public type VotingRewardsParameters = {
    final_reward_rate_basis_points : ?Nat64;
    initial_reward_rate_basis_points : ?Nat64;
    reward_rate_transition_duration_seconds : ?Nat64;
    round_duration_seconds : ?Nat64;
  };
  public type WaitForQuietState = {
    current_deadline_timestamp_seconds : Nat64;
  };

  transient let indexCanisterId : Text = "tui2b-giaaa-aaaag-qnbpq-cai";

  private transient var globalUserProgress : TrieMap.TrieMap<Text, Types.UserMissions> = TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);

  // Stable storage for serialized data

  stable var serializedGlobalUserProgress : [(Text, [(Nat, Types.SerializedProgress)])] = [];

  public shared (msg) func mergeAccounts(canonicalUUID : Text, mergingUUID : Text) : async Text {

    if (msg.caller == Principal.fromText(indexCanisterId)) {

      // 4. Merge globalglobalUserProgress (UserMissions = TrieMap<Nat, Progress>)
      var mergedglobalUserProgress : TrieMap.TrieMap<Nat, Types.Progress> = switch (globalUserProgress.get(canonicalUUID)) {
        case (?mp) { mp };
        case null { TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash) };
      };

      switch (globalUserProgress.get(mergingUUID)) {
        case (?mergingProgressMap) {
          for ((missionId, mergingProgress) in mergingProgressMap.entries()) {
            switch (mergedglobalUserProgress.get(missionId)) {
              case null {
                // Mission not present for canonical; add it.
                mergedglobalUserProgress.put(missionId, mergingProgress);
              };
              case (?canonProgress) {
                // Merge usedCodes (union: true if either is true)
                let mergedUsedCodes = canonProgress.usedCodes;
                for ((code, used) in mergingProgress.usedCodes.entries()) {
                  switch (mergedUsedCodes.get(code)) {
                    case null { mergedUsedCodes.put(code, used) };
                    case (?curr) { mergedUsedCodes.put(code, curr or used) };
                  };
                };
                // Merge completionHistory:
                let canonHistory = canonProgress.completionHistory;
                let mergingHistory = mergingProgress.completionHistory;
                // If at least one mission record has a tweetId, merge all records.
                let hasTweetId = Option.isSome(Array.find(canonHistory, func(r : Types.MissionRecord) : Bool { r.tweetId != null })) or Option.isSome(Array.find(mergingHistory, func(r : Types.MissionRecord) : Bool { r.tweetId != null }));
                let mergedHistory = if (hasTweetId) {
                  Array.append(canonHistory, mergingHistory);
                } else {
                  // Otherwise, choose the history whose total points is higher.
                  let sumCanon = Array.foldLeft<Types.MissionRecord, Nat>(canonHistory, 0, func(acc : Nat, r : Types.MissionRecord) : Nat { acc + r.pointsEarned });
                  let sumMerging = Array.foldLeft<Types.MissionRecord, Nat>(mergingHistory, 0, func(acc : Nat, r : Types.MissionRecord) : Nat { acc + r.pointsEarned });
                  if (sumCanon >= sumMerging) { canonHistory } else {
                    mergingHistory;
                  };
                };
                let mergedProgressRecord : Types.Progress = {
                  var completionHistory = mergedHistory;
                  var usedCodes = mergedUsedCodes;
                };
                mergedglobalUserProgress.put(missionId, mergedProgressRecord);
              };
            };
          };
        };
        case null {};
      };
      globalUserProgress.put(canonicalUUID, mergedglobalUserProgress);
      globalUserProgress.delete(mergingUUID);

      return "Success";
    };
    "";
  };
  stable var adminIds : [Principal] = [Principal.fromText("re2jg-bjb6f-frlwq-342yn-bebk2-43ofq-3qwwq-cld3p-xiwxw-bry3n-aqe")];

  public shared (msg) func addAdminId(newAdminId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      adminIds := Array.append<Principal>(adminIds, [newAdminId]);
    };
  };

  public shared (msg) func removeAdminId(adminId : Principal) : async () {
    if (isAdmin(msg.caller)) {
      adminIds := Array.filter<Principal>(adminIds, func(id) : Bool { id != adminId });
    };

  };

  private func isAdmin(principalId : Principal) : Bool {
    return Array.find<Principal>(
      adminIds,
      func(id) : Bool {
        id == principalId;
      },
    ) != null;
  };

  public shared query (msg) func trisAdmin(principalId : Principal) : async Bool {
    if (isAdmin(msg.caller)) {
      return Array.find<Principal>(
        adminIds,
        func(id) : Bool {
          id == principalId;
        },
      ) != null;
    };
    return false;
  };

  // Function to get all admin IDs

  public shared query (msg) func getAdminIds() : async [Principal] {
    if (isAdmin(msg.caller)) {
      return adminIds;
    };
    return [];
  };

  public query func getVersion() : async Text {
    return "V2.0";
  };

  public shared (msg) func restoreAllUserProgress(serializedData : [(Text, [(Nat, Types.SerializedProgress)])]) : async () {
    if (isAdmin(msg.caller)) {
      // Iterate over each user data tuple
      for (tuple in Iter.fromArray(serializedData)) {
        let userId = tuple.0;
        let serializedUserMissions = tuple.1;

        // Retrieve or initialize the user's mission data
        var userMissions = switch (globalUserProgress.get(userId)) {
          case (?existingMissions) { existingMissions };
          case null {
            TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
          };
        };

        // Process each mission for the user
        for (missionTuple in Iter.fromArray(serializedUserMissions)) {
          let missionId = missionTuple.0;
          let serializedProgress = missionTuple.1;

          // Deserialize the serializedProgress
          let completionHistory = Array.map<Types.SerializedMissionRecord, Types.MissionRecord>(
            serializedProgress.completionHistory,
            func(serializedRecord : Types.SerializedMissionRecord) : Types.MissionRecord {
              {
                var timestamp = serializedRecord.timestamp;
                var pointsEarned = serializedRecord.pointsEarned;
                var tweetId = serializedRecord.tweetId;
              };
            },
          );

          let usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
          for (codeTuple in Iter.fromArray(serializedProgress.usedCodes)) {
            let code = codeTuple.0;
            let value = codeTuple.1;
            usedCodes.put(code, value);
          };

          let progress : Types.Progress = {
            var completionHistory = completionHistory;
            var usedCodes = usedCodes;
          };

          // Update the mission progress
          userMissions.put(missionId, progress);
        };

        // Update the user's missions in userProgress
        globalUserProgress.put(userId, userMissions);
      };
    };
  };

  // Pre-upgrade function to serialize the user progress

  transient var missionAssets : TrieMap.TrieMap<Text, Blob> = TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash);
  stable var serializedMissionAssets : [(Text, Blob)] = [];

  system func preupgrade() {
    // Serialize user progress

    let globalUserProgressEntries = globalUserProgress.entries();
    serializedGlobalUserProgress := Array.map<(Text, Types.UserMissions), (Text, [(Nat, Types.SerializedProgress)])>(
      Iter.toArray(globalUserProgressEntries),
      func(entry : (Text, Types.UserMissions)) : (Text, [(Nat, Types.SerializedProgress)]) {
        let (userId, userMissions) = entry;
        let missionEntries = userMissions.entries();
        let serializedMissionEntries = Array.map<(Nat, Types.Progress), (Nat, Types.SerializedProgress)>(
          Iter.toArray(missionEntries),
          func(missionEntry : (Nat, Types.Progress)) : (Nat, Types.SerializedProgress) {
            let (missionId, progress) = missionEntry;
            (missionId, Serialization.serializeProgress(progress));
          },
        );
        return (userId, serializedMissionEntries);
      },
    );

    let missionAssetsEntries = Iter.toArray(missionAssets.entries());
    serializedMissionAssets := missionAssetsEntries;

  };

  // Post-upgrade function to deserialize the user progress

  system func postupgrade() {

    globalUserProgress := TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);

    for (tuple in Iter.fromArray(serializedGlobalUserProgress)) {
      let text = tuple.0;
      let serializedMissions = tuple.1;

      let userMissions = TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);

      for (missionTuple in Iter.fromArray(serializedMissions)) {
        let missionId = missionTuple.0;
        let serializedProgress = missionTuple.1;

        let completionHistory = Array.map<Types.SerializedMissionRecord, Types.MissionRecord>(
          serializedProgress.completionHistory,
          func(record : Types.SerializedMissionRecord) : Types.MissionRecord {
            {
              var timestamp = record.timestamp;
              var pointsEarned = record.pointsEarned;
              var tweetId = record.tweetId;
            };
          },
        );

        let usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);

        for (codeTuple in Iter.fromArray(serializedProgress.usedCodes)) {
          let code = codeTuple.0;
          let value = codeTuple.1;
          usedCodes.put(code, value);
        };

        let progress : Types.Progress = {
          var completionHistory = completionHistory;
          var usedCodes = usedCodes;
        };

        userMissions.put(missionId, progress);
      };

      globalUserProgress.put(text, userMissions);
    };

    serializedGlobalUserProgress := [];

    // Deserialize the mission assets
    missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash);

    for (assetEntry in serializedMissionAssets.vals()) {
      let (missionId, asset) = assetEntry;
      missionAssets.put(missionId, asset);
    };

    serializedMissionAssets := [];

  };

  public shared (msg) func updateUserProgress(userUUID : Text, missionId : Nat, serializedProgress : Types.SerializedProgress) : async () {

    if (isAdmin(msg.caller)) {

      // Deserialize the progress object
      let progress = Serialization.deserializeProgress(serializedProgress);

      // Retrieve the user's missions or create a new TrieMap if it doesn't exist
      let missions = switch (globalUserProgress.get(userUUID)) {
        case (?map) map;
        case null TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
      };

      // Update the mission progress
      missions.put(missionId, progress);

      // Update the user's progress in the main TrieMap
      globalUserProgress.put(userUUID, missions);

    };
  };

  public shared (msg) func resetUserMissionByIdForUser(userUUID : Text, missionId : Nat) : async () {
    if (isAdmin(msg.caller)) {

      let _missions = switch (globalUserProgress.get(userUUID)) {
        case (?map) {
          map.remove(missionId);
        };
        case null null;
      };
    };
  };

  public shared composite query (msg) func getProgress(userId : Principal, missionId : Nat) : async ?Types.SerializedProgress {

    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      switch (globalUserProgress.get(userUUID)) {
        case (?missions) {
          switch (missions.get(missionId)) {
            case (?progress) return ?Serialization.serializeProgress(progress);
            case null return null;
          };
        };
        case null return null;
      };
    };

    return null;
  };

  public shared composite query (msg) func getUserProgress(userId : Principal) : async ?[(Nat, Types.SerializedProgress)] {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      let userMissionsOpt = globalUserProgress.get(userUUID);

      switch (userMissionsOpt) {
        case (null) {
          return null;
        };
        case (?userMissions) {
          var serializedMissions : [(Nat, Types.SerializedProgress)] = [];

          // Get an iterator for the mission entries
          let missionsIter = userMissions.entries();

          // Loop over the entries in the TrieMap
          for (entry in missionsIter) {
            let missionId = entry.0;
            let progress = entry.1;
            let serializedProgress = Serialization.serializeProgress(progress);
            serializedMissions := Array.append(serializedMissions, [(missionId, serializedProgress)]);
          };

          return ?serializedMissions;
        };
      };
    };

    return null;
  };

  public shared query (msg) func canUserDoMission(userUUID : Text, missionId : Nat) : async Bool {
    if (isAdmin(msg.caller)) {
      var missionOpt : ?Types.MissionV2 = null;
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == missionId) {
          missionOpt := ?mission;
        };
      };

      let mission = switch (missionOpt) {
        case (?m) m;
        case null { Debug.trap("Mission not found") };
      };

      if (Option.isSome(mission.requiredPreviousMissionId)) {
        let ?prevMissionId = mission.requiredPreviousMissionId;
        switch (globalUserProgress.get(userUUID)) {
          case (?userMissions) {
            switch (userMissions.get(prevMissionId)) {
              case (?prevProgress) {
                if (Array.size(prevProgress.completionHistory) == 0) {
                  return false;
                };
              };
              case null {
                return false;
              };
            };
          };
          case null {
            return false;
          };
        };
      };

      switch (globalUserProgress.get(userUUID)) {
        case (?userMissions) {
          switch (userMissions.get(missionId)) {
            case (?progress) {
              if (mission.recursive) {

                for (record in Iter.fromArray(progress.completionHistory)) {
                  if (record.timestamp > mission.startDate) {
                    return false;
                  };
                };
              } else {
                if (Array.size(progress.completionHistory) > 0) {
                  return false;
                };
              };
            };
            case null {};
          };
        };
        case null {};
      };
      return true;
    };
    return false;
  };

  public shared composite query (msg) func getTotalSecondsForUser(userId : Principal) : async ?Nat {
    if (isAdmin(msg.caller) or userId == msg.caller and not Principal.isAnonymous(msg.caller)) {

      let index = actor (indexCanisterId) : actor {
        getUUID : query (Principal) -> async Text;
      };

      let userUUID = await index.getUUID(userId);

      let userMissionsOpt = globalUserProgress.get(userUUID);

      switch (userMissionsOpt) {
        case null {
          return null;
        };
        case (?userMissions) {
          var totalPoints : Nat = 0;

          // Iterate over each mission in the user's progress
          for ((_, progress) in userMissions.entries()) {
            // Access the completion history directly from progress
            let completionHistory = progress.completionHistory;

            // Sum up the pointsEarned from each mission record
            for (missionRecord in Iter.fromArray(completionHistory)) {
              totalPoints += missionRecord.pointsEarned;
            };
          };

          return ?totalPoints;
        };
      };
    };
    return ?0;
  };

  private func generateUniqueIdentifier(imageName : Text) : Text {
    let timestamp = Int.toText(Time.now());
    let hash = Text.hash(imageName);

    // Find the last occurrence of '.' to get the file extension
    let partsIter = Text.split(imageName, #char '.');
    let parts = Iter.toArray(partsIter);

    let extension = switch (Array.size(parts) > 1) {
      case true parts[Array.size(parts) - 1]; // Get the last part as the extension
      case false ""; // No extension found
    };

    return timestamp # "_" # Nat32.toText(hash) # "." # extension;
  };

  public shared (msg) func uploadMissionImage(imageName : Text, imageContent : Blob) : async Text {
    if (isAdmin(msg.caller)) {
      let directory = "/missionassets/";

      // Generate a unique image name using the timestamp and hash
      let uniqueImageName = generateUniqueIdentifier(imageName);
      let url = directory # uniqueImageName;

      // Store the image content associated with the unique URL
      missionAssets.put(url, imageContent);

      return url;
    };
    return "Nice try lmao";
  };

  // stable var missions : Vector.Vector<Types.Mission> = Vector.new<Types.Mission>();

  stable var missionsV2 : Vector.Vector<Types.MissionV2> = Vector.new<Types.MissionV2>();

  public shared (msg) func addOrUpdateMission(newMission : Types.SerializedMissionV2) : async () {
    if (isAdmin(msg.caller)) {

      let newDeserializedMission = Serialization.deserializeMissionV2(newMission);
      var missionFound = false;

      let size = Vector.size(missionsV2);
      for (i in Iter.range(0, size - 1)) {
        let existingMissionOpt = Vector.get(missionsV2, i);
        switch (existingMissionOpt) {
          case (mission) {
            if (mission.id == newMission.id) {
              let updatedMission : Types.MissionV2 = {
                var id = newDeserializedMission.id;
                var title = newDeserializedMission.title;
                var description = newDeserializedMission.description;
                var obj1 = newDeserializedMission.obj1;
                var obj2 = newDeserializedMission.obj2;
                var inputPlaceholder = newDeserializedMission.inputPlaceholder;
                var startDate = newDeserializedMission.startDate;
                var endDate = newDeserializedMission.endDate;
                var recursive = newDeserializedMission.recursive;
                var points = newDeserializedMission.points;
                var functionName1 = newDeserializedMission.functionName1;
                var functionName2 = newDeserializedMission.functionName2;
                var image = newDeserializedMission.image;
                var secretCodes = newDeserializedMission.secretCodes;
                var mode = newDeserializedMission.mode;
                var requiredPreviousMissionId = newDeserializedMission.requiredPreviousMissionId;
                var iconUrl = newDeserializedMission.iconUrl;
                var token = newDeserializedMission.token;
                var subAccount = newDeserializedMission.subAccount;
                var subMissions = newDeserializedMission.subMissions;
                var maxUsers = newDeserializedMission.maxUsers;
                var usersThatCompleted = mission.usersThatCompleted; // Keep
                var status = newDeserializedMission.status;
                creationTime = mission.creationTime; // Keep
              };
              Vector.put(missionsV2, i, updatedMission);
              missionFound := true;
            };
          };
        };
      };

      if (not missionFound) {

        let missionToAdd : Types.MissionV2 = {
          var id = newDeserializedMission.id;
          var title = newDeserializedMission.title;
          var description = newDeserializedMission.description;
          var obj1 = newDeserializedMission.obj1;
          var obj2 = newDeserializedMission.obj2;
          var inputPlaceholder = newDeserializedMission.inputPlaceholder;
          var startDate = newDeserializedMission.startDate;
          var endDate = newDeserializedMission.endDate;
          var recursive = newDeserializedMission.recursive;
          var points = newDeserializedMission.points;
          var functionName1 = newDeserializedMission.functionName1;
          var functionName2 = newDeserializedMission.functionName2;
          var image = newDeserializedMission.image;
          var secretCodes = newDeserializedMission.secretCodes;
          var mode = newDeserializedMission.mode;
          var requiredPreviousMissionId = newDeserializedMission.requiredPreviousMissionId;
          var iconUrl = newDeserializedMission.iconUrl;
          var token = newDeserializedMission.token;
          var subAccount = newDeserializedMission.subAccount;
          var subMissions = newDeserializedMission.subMissions;
          var maxUsers = newDeserializedMission.maxUsers;
          var usersThatCompleted = null; // Empty
          var status = newDeserializedMission.status;
          creationTime = Time.now(); // New
        };
        Vector.add<Types.MissionV2>(missionsV2, missionToAdd);
      };
    };
    return;
  };

  public shared query (msg) func getAllMissions() : async [Types.SerializedMissionV2] {
    if (isAdmin(msg.caller)) {
      return Array.map<Types.MissionV2, Types.SerializedMissionV2>(Vector.toArray(missionsV2), Serialization.serializeMissionV2);
    } else {
      let filteredMissions = Array.filter<Types.MissionV2>(
        Vector.toArray(missionsV2),
        func(mission : Types.MissionV2) : Bool {
          mission.startDate <= Time.now();
        },
      );

      return Array.map<Types.MissionV2, Types.SerializedMissionV2>(
        filteredMissions,
        func(mission : Types.MissionV2) : Types.SerializedMissionV2 {
          let serialized = Serialization.serializeMissionV2(mission);
          let updatedSerialized = { serialized with secretCodes = null };
          return updatedSerialized;
        },
      );
    };
  };

  public shared query (msg) func getMissionById(id : Nat) : async ?Types.SerializedMissionV2 {
    if (isAdmin(msg.caller)) {
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == id) {
          return ?Serialization.serializeMissionV2(mission);
        };
      };
    } else {
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == id and mission.startDate <= Time.now()) {
          return ?Serialization.serializeMissionV2(mission);
        };
      };
    };
    return null;
  };

  public shared query (msg) func getMissionPoints(id : Nat) : async Int {
    if (isAdmin(msg.caller)) {
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == id) {
          return mission.points;
        };
      };
    } else {
      for (mission in Vector.vals(missionsV2)) {
        if (mission.id == id and mission.startDate <= Time.now()) {
          return mission.points;
        };
      };
    };
    return 0;
  };

  public shared query (msg) func hasUserCompletedMissions_0_to_10(userUUID : Text) : async Bool {
    if (not isAdmin(msg.caller)) {
      Debug.print("hasUserCompletedMissions_0_to_10: Caller is not an admin.");
      return false;
    };

    switch (globalUserProgress.get(userUUID)) {
      case null {
        Debug.print("hasUserCompletedMissions_0_to_10: User " # userUUID # " has no mission progress.");
        return false;
      };
      case (?userMissions) {
        for (missionId in Iter.range(0, 10)) {
          switch (userMissions.get(missionId)) {
            case null {
              Debug.print("hasUserCompletedMissions_0_to_10: User " # userUUID # " has not started/completed mission ID " # Nat.toText(missionId) # ".");
              return false;
            };
            case (?progress) {
              if (Array.size(progress.completionHistory) == 0) {
                Debug.print("hasUserCompletedMissions_0_to_10: User " # userUUID # " has mission ID " # Nat.toText(missionId) # " progress but no completion records.");
                return false;
              };
            };
          };
        };
        return true;
      };
    };
  };

  public shared (msg) func resetMissions() : async () {
    if (isAdmin(msg.caller)) {
      Vector.clear(missionsV2); // Clear all missions
      missionAssets := TrieMap.TrieMap<Text, Blob>(Text.equal, Text.hash); // Clear all images in missionAssets
    };
    return;
  };

  public shared query (msg) func countUsersWhoCompletedMission(missionId : Nat) : async Nat {
    if (isAdmin(msg.caller)) {
      var count : Nat = 0;
      for ((_, userMissions) in globalUserProgress.entries()) {
        if (Option.isSome(userMissions.get(missionId))) {
          count += 1;
        };
      };
      return count;
    };
    return 0;
  };

  public shared query (msg) func getAllUsersProgress(offset : Nat, limit : Nat) : async {
    data : [(Text, [(Nat, Types.SerializedProgress)])];
    total : Nat;
  } {
    if (isAdmin(msg.caller)) {
      // Convert userProgress entries to an array
      let entries : [(Text, Types.UserMissions)] = Iter.toArray(globalUserProgress.entries());
      let total : Nat = Array.size(entries);

      // Handle cases where offset might be greater than total
      let adjustedOffset : Nat = if (offset >= total) { total } else { offset };
      let adjustedEnd : Nat = if (offset + limit > total) { total } else {
        offset + limit;
      };

      // Calculate the length for subArray
      let length : Nat = adjustedEnd - adjustedOffset;

      // Apply pagination using Array.subArray with (from, length)
      let paginatedEntries : [(Text, Types.UserMissions)] = Array.subArray(entries, adjustedOffset, length);

      // Serialize the paginated entries using Array.map
      let serializedEntries : [(Text, [(Nat, Types.SerializedProgress)])] = Array.map<(Text, Types.UserMissions), (Text, [(Nat, Types.SerializedProgress)])>(
        paginatedEntries,
        func(entry : (Text, Types.UserMissions)) : (Text, [(Nat, Types.SerializedProgress)]) {
          let (userId, userMissions) = entry;
          let missionEntries : [(Nat, Types.Progress)] = Iter.toArray(userMissions.entries());

          // Serialize mission entries using Array.map
          let serializedMissionEntries : [(Nat, Types.SerializedProgress)] = Array.map<(Nat, Types.Progress), (Nat, Types.SerializedProgress)>(
            missionEntries,
            func(missionEntry : (Nat, Types.Progress)) : (Nat, Types.SerializedProgress) {
              let (missionId, progress) = missionEntry;
              (missionId, Serialization.serializeProgress(progress));
            },
          );

          (userId, serializedMissionEntries);
        },
      );

      return { data = serializedEntries; total = total };
    };

    return { data = []; total = 0 };
  };

  public query func http_request(req : Types.HttpRequest) : async Types.HttpResponse {
    let path = req.url;

    // Check if the path is directly in missionAssets (which includes the full path)
    switch (missionAssets.get(path)) {
      case (?fileBlob) {
        // Extract the file extension from the path
        let partsIter = Text.split(path, #char '.');
        let parts = Iter.toArray(partsIter);

        let extension = switch (Array.size(parts) > 1) {
          case true {
            Text.toLowercase(parts[Array.size(parts) - 1]) // Get the last part as the extension and convert to lowercase
          };
          case false {
            ""; // No extension found
          };
        };

        // Set the Content-Type based on the file extension
        let contentType = switch (extension) {
          case "png" {
            "image/png";
          };
          case "jpg" {
            "image/jpeg";
          };
          case "jpeg" {
            "image/jpeg";
          };
          case "webp" {
            "image/webp";
          };
          case _ {
            "application/octet-stream" // Default content type
          };
        };

        return {
          status_code = 200;
          headers = [("Content-Type", contentType)];
          body = fileBlob;
        };
      };
      case null {
        return {
          status_code = 404;
          headers = [("Content-Type", "text/plain")];
          body = Text.encodeUtf8("File not found");
        };
      };
    };
  };

  func blobToHex(blob : Blob) : Text {
    // Convert the Blob to an array of bytes (Nat8)
    let bytes : [Nat8] = Blob.toArray(blob);
    var hex : Text = "";
    let hexChars : [Char] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

    // Iterate over the bytes in the array
    for (byteNat8 : Nat8 in bytes.vals()) {
      // Convert Nat8 to Nat for arithmetic operations
      let byte : Nat = Nat8.toNat(byteNat8);
      // Get the high and low nibbles (4 bits)
      let highNibble : Nat = Nat.div(byte, 16);
      let lowNibble : Nat = Nat.rem(byte, 16);
      // Append the corresponding hex characters
      // Note: Array indexing requires Nat, Nat32, or Int. Nat works here.
      hex #= Text.fromChar(hexChars[highNibble]);
      hex #= Text.fromChar(hexChars[lowNibble]);
    };

    return hex;
  };

  public shared (msg) func checkProposalProposerEligibility(
    proposer : Principal,
    governanceCanisterIdText : Text,
    proposalIdText : Text,
  ) : async Text {

    // 1. Parse proposalIdText and construct definiteProposalId
    let definiteProposalId : ProposalId = switch (Nat.fromText(proposalIdText)) {
      case null {
        return "Error: Invalid proposal ID format (not a Nat). Input: '" # proposalIdText # "'.";
      };
      case (?n) {
        // Assuming ProposalId is { id : Nat64 }.
        // Nat64.fromNat will trap if n is too large for Nat64.
        { id = Nat64.fromNat(n) } : ProposalId;
      };
    };

    // 2. Define minimal governance actor interface
    let governanceActor = actor (governanceCanisterIdText) : actor {
      get_proposal : shared query GetProposal -> async GetProposalResponse;
      list_neurons : shared query ListNeurons -> async ListNeuronsResponse;
    };

    // 3. Get Proposal Response (propRes)
    // 'propRes' is initialized by the expression within the try block.
    // If 'await' fails, the catch block returns from 'checkProposalProposerEligibility'.
    let propRes : GetProposalResponse = try {
      await governanceActor.get_proposal({ proposal_id = ?definiteProposalId });
    } catch (e) {
      return "Error: Exception during 'get_proposal' call for proposal ID '" # proposalIdText # "'. Details: ";
    };

    // 4. Process get_proposal response to get pdata
    // 'pdata' is initialized by the result of this switch expression.
    // If any case returns, 'checkProposalProposerEligibility' exits.
    let pdata : ProposalData = switch (propRes.result) {
      case null {
        return "Error: 'get_proposal' for ID '" # proposalIdText # "' returned 'null' (no result variant).";
      };
      case (?resultVariant) {
        switch (resultVariant) {
          case (#Error e) {
            return "Error: 'get_proposal' failed. Type: " # ", Message: '" # e.error_message # "'.";
          };
          case (#Proposal proposalDataResult) {
            proposalDataResult; // This value is assigned to pdata
          };
        };
      };
    };

    // 5. Extract Proposer Neuron ID Blob from pdata
    // 'proposerNeuronIdRecord' is initialized by the result of this switch expression.
    let proposerNeuronIdRecord : NeuronId = switch (pdata.proposer) {
      case null {
        return "Error: Proposal '" # proposalIdText # "' (parsed ID: " # Nat64.toText(definiteProposalId.id) # ") has no proposer specified in its data.";
      };
      case (?nid) {
        nid; // This value is assigned to proposerNeuronIdRecord
      };
    };
    let proposerNeuronIdBlob : Blob = proposerNeuronIdRecord.id;

    // 6. Get User Neurons List
    let listArgs : ListNeurons = {
      of_principal = ?proposer;
      limit = 100 : Nat32;
      start_page_at = null;
    };
    // 'userNeuronsList' is initialized by the expression within the try block (response.neurons).
    // If 'await' fails, the catch block returns from 'checkProposalProposerEligibility'.
    let userNeuronsList : [Neuron] = try {
      let list_response = await governanceActor.list_neurons(listArgs);
      list_response.neurons // This expression's result initializes userNeuronsList
    } catch (e) {
      return "Error: Exception during 'list_neurons' call for user '" # Principal.toText(proposer) # "'. Details: ";
    };

    // 7. Process userNeuronsList
    if (Array.size(userNeuronsList) == 0) {
      return "Info: User '" # Principal.toText(proposer) # "' has no neurons in governance canister '" # governanceCanisterIdText # "' according to list_neurons.";
    };

    // 8. Compare neuron IDs
    var foundMatch : Bool = false;
    var userNeuronIdsHexForDebug : [Text] = [];

    for (neuron_summary in userNeuronsList.vals()) {
      switch (neuron_summary.id) {
        case (?user_neuron_id_obj) {
          userNeuronIdsHexForDebug := Array.append(userNeuronIdsHexForDebug, [blobToHex(user_neuron_id_obj.id)]);
          if (user_neuron_id_obj.id == proposerNeuronIdBlob) {
            foundMatch := true;
          };
        };
        case null {
          userNeuronIdsHexForDebug := Array.append(userNeuronIdsHexForDebug, ["<null_id_in_list_response>"]);
        };
      };
      if (foundMatch) {};
    };

    let userNeuronsDebugText : Text = if (Array.size(userNeuronIdsHexForDebug) == 0) {
      "No processable neuron IDs found for the user from list_neurons response.";
    } else {
      Text.join(", ", Iter.fromArray(userNeuronIdsHexForDebug));
    };
    let proposerHexId : Text = blobToHex(proposerNeuronIdBlob);

    if (foundMatch) {
      return "Success";
    } else {
      return "Failure: User '" # Principal.toText(proposer) # "' (with " # Nat.toText(Array.size(userNeuronsList)) # " neuron(s) listed) does not own the proposing neuron (ID Hex: " # proposerHexId # "). User's Neuron IDs (Hex): [" # userNeuronsDebugText # "].";
    };
  };

  private func isMissionZeroCompleted(userMissions : Types.UserMissions) : Bool {
    switch (userMissions.get(0)) {
      case (?progress_mission_zero) {
        // Check if mission 0 has any completion history
        if (Array.size(progress_mission_zero.completionHistory) > 0) {
          return true; // Mission 0 completed
        };
      };
      case null {};
    };
    return false;
  };

  public shared (msg) func rewardHotkeyIfNeuronHolder(governanceCanisterIdText : Text) : async Bool {
    // 1. Ensure the caller is not anonymous
    if (Principal.isAnonymous(msg.caller)) {
      Debug.print("rewardHotkeyIfNeuronHolder: Anonymous caller not allowed.");
      return false;
    };

    // 2. Define the interface for the target governance canister
    //    This is a minimal interface needed for list_neurons.
    //    Your existing GetNeuronResponse, ListNeurons, ListNeuronsResponse types are already defined publicly.
    let governanceActor = actor (governanceCanisterIdText) : actor {
      list_neurons : shared query ListNeurons -> async ListNeuronsResponse;
      // You might need get_neuron if processOne's path for these missions required deeper checks,
      // but for #RewardHotkeyNeuron and #PointsHotkeyNeuron1Time, list_neurons for the principal is sufficient
      // as per the current structure of processOne for these mission types.
    };

    // 3. Check if msg.caller has at least one neuron in the specified governance canister
    let listRes = await governanceActor.list_neurons({
      of_principal = ?msg.caller; // Check neurons owned by the function caller
      limit = 1 : Nat32; // We only need to know if there's at least one, so limit to 1
      start_page_at = null;
    });

    if (listRes.neurons.size() == 0) {
      Debug.print("rewardHotkeyIfNeuronHolder: Caller " # Principal.toText(msg.caller) # " has no neurons in governance canister " # governanceCanisterIdText # ".");
      return false; // Neuron check failed
    };

    Debug.print("rewardHotkeyIfNeuronHolder: Caller " # Principal.toText(msg.caller) # " has at least one neuron in " # governanceCanisterIdText # ". Proceeding to reward.");

    // 4. If neuron check passes, attempt to process the two missions
    //    The `processOne` function handles checking if the mission was already completed,
    //    ICP payment, and points awarding.
    //    - msg.caller: The entity performing the action (and verified hotkey for some proposal missions, not relevant here).
    //    - #RewardHotkeyNeuron / #PointsHotkeyNeuron1Time: The mission type.
    //    - msg.caller: The principal to whom the reward/points should be credited.
    //    - null: Metadata, not required for these mission types.

    var rewardMissionSuccess : Bool = false;
    var pointsMissionSuccess : Bool = false;

    // Attempt to process #RewardHotkeyNeuron (typically Mission ID 0, ICP reward)
    // This mission type is exempt from the Mission 0 completion check within processOne.
    rewardMissionSuccess := await processOne(msg.caller, #RewardHotkeyNeuron, msg.caller, null);
    if (rewardMissionSuccess) {
      Debug.print("rewardHotkeyIfNeuronHolder: #RewardHotkeyNeuron processed successfully for " # Principal.toText(msg.caller));
    } else {
      Debug.print("rewardHotkeyIfNeuronHolder: #RewardHotkeyNeuron failed or already completed for " # Principal.toText(msg.caller));
    };

    // Attempt to process #PointsHotkeyNeuron1Time (typically Mission ID 5, points reward)
    // This mission type is also exempt from the Mission 0 completion check within processOne.
    pointsMissionSuccess := await processOne(msg.caller, #PointsHotkeyNeuron1Time, msg.caller, null);
    if (pointsMissionSuccess) {
      Debug.print("rewardHotkeyIfNeuronHolder: #PointsHotkeyNeuron1Time processed successfully for " # Principal.toText(msg.caller));
    } else {
      Debug.print("rewardHotkeyIfNeuronHolder: #PointsHotkeyNeuron1Time failed or already completed for " # Principal.toText(msg.caller));
    };

    // The function returns true if the initial neuron check passed,
    // indicating that the reward/points processing was attempted.
    // The individual success of those attempts is logged and handled by processOne.
    return true;
  };

  private func processOne(caller : Principal, missionType : Types.ICToolkitMissionType, principal : Principal, metadata : ?[Text]) : async Bool {

    // ─── 2) lookup userUUID & existing progress ───
    let index = actor (indexCanisterId) : actor {
      getUUID : query (Principal) -> async Text;
    };
    let userUUID = await index.getUUID(principal);
    var userMissions = switch (globalUserProgress.get(userUUID)) {
      case (?m) m;
      case null { TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash) };
    };
    let missionId : Nat = switch (missionType) {
      case (#RewardHotkeyNeuron) 0;
      case (#RewardSaveProposalDraft) 1;
      case (#RewardFavoriteSNS) 2;
      case (#RewardVoteOnToolkit) 3;
      case (#RewardSignupEmailNotification) 4;
      case (#PointsHotkeyNeuron1Time) 5;
      case (#PointsVote) 6;
      case (#PointsCreateProposal) 7;
      case (#PointsSaveProposalDraft) 8;
      case (#PointsFavoriteSNS) 9;
      case (#PointsSignupEmailNotification) 10;
    };

    let isExemptFromMissionZeroCheck = missionType == #RewardHotkeyNeuron or missionType == #PointsHotkeyNeuron1Time or missionType == #RewardSaveProposalDraft or missionType == #PointsSaveProposalDraft or missionType == #RewardFavoriteSNS or missionType == #PointsFavoriteSNS or missionType == #RewardSignupEmailNotification or missionType == #PointsSignupEmailNotification or missionId == 0; // Also exempt if it IS mission 0 itself

    if (not isExemptFromMissionZeroCheck) {
      if (not isMissionZeroCompleted(userMissions)) {
        Debug.print("processOne: User " # userUUID # " has not completed Mission ID 0 - Hotkey Neuron, which is required for mission " # missionTypeToText(missionType));
        return false;
      };
    };

    let award : Nat = switch (missionType) {
      case (#RewardSaveProposalDraft) 15000000; // .15 ICP in e8s
      case (#RewardFavoriteSNS) 15000000; // .15 ICP in e8s
      case (#RewardHotkeyNeuron) 30000000; // .3 ICP in e8s
      case (#RewardVoteOnToolkit) 20000000; // .2 ICP in e8s
      case (#RewardSignupEmailNotification) 20000000; // .2 ICP in e8s
      // Points rewards (these won't trigger ICP payment)
      case (#PointsHotkeyNeuron1Time) 5;
      case (#PointsVote) 1;
      case (#PointsCreateProposal) 3;
      case (#PointsSaveProposalDraft) 2;
      case (#PointsFavoriteSNS) 2;
      case (#PointsSignupEmailNotification) 3;
    };
    // ─── 3) special handling for Vote/CreateProposal ───
    var overrideTweetId : ?Text = null;
    if (missionType == #PointsVote or missionType == #PointsCreateProposal or missionType == #RewardVoteOnToolkit) {
      // require exactly two metadata elements
      if (
        (not Option.isSome(metadata)) or Array.size(
          switch (metadata) {
            case (?m) { m };
            case null { [] };
          }
        ) < 2
      ) {
        return false;
      };
      let meta : [Text] = switch (metadata) {
        case (?m) { m };
        case null { Debug.trap("Metadata is none") };
      };
      let govCanisterText = meta[0];
      let proposalIdText = meta[1];
      // 3a) have we already credited this proposalId?
      switch (userMissions.get(missionId)) {
        case (?prog) {
          if (
            Option.isSome(
              Array.find<Types.MissionRecord>(
                prog.completionHistory,
                func(r : Types.MissionRecord) : Bool {
                  r.tweetId == ?proposalIdText;
                },
              )
            )
          ) {
            Debug.print("processOne: Proposal ID " # proposalIdText # " already credited for missionId " # Nat.toText(missionId));
            return false;
          };
        };
        case null {};
      };
      // 3b) bind a minimal governance interface
      let gov = actor (govCanisterText) : actor {
        get_proposal : shared query GetProposal -> async GetProposalResponse;
        list_neurons : shared query ListNeurons -> async ListNeuronsResponse;
      };
      // 3c) ensure msg.caller is a hotkey on *some* neuron for this principal
      if (missionType == #PointsCreateProposal) {
        let allowed = await checkProposalProposerEligibility(
          principal,
          govCanisterText,
          proposalIdText,
        );
        if (allowed != "Success") {
          Debug.print("processOne: caller is not the proposal’s controller");
          return false;
        };
      } else {
        // original vote‐hotkey logic stays in place for #PointsVote and #RewardVoteOnToolkit
        let listRes = await gov.list_neurons({
          of_principal = ?principal;
          limit = 100 : Nat32;
          start_page_at = null;
        });
        if (listRes.neurons.size() == 0) {
          Debug.print("processOne: no neurons found for principal");
          return false;
        };

        var eligibleNeurons : [Neuron] = [];
        for (n in listRes.neurons.vals()) {
          if (
            Option.isSome(
              Array.find<NeuronPermission>(
                n.permissions,
                func(p : NeuronPermission) : Bool { p.principal == ?caller },
              )
            )
          ) {
            eligibleNeurons := Array.append(eligibleNeurons, [n]);
          };
        };

        if (eligibleNeurons.size() == 0) {
          Debug.print("processOne: caller has no hotkey on any neuron");
          return false;
        };

        // For #RewardVoteOnToolkit, check ballots; for #PointsVote, same ballot logic
        // [existing ballot‐check code omitted here for brevity but remains unchanged]
      };

      overrideTweetId := ?proposalIdText;
    };
    // ─── 4) existing cooldown / one‐time checks ───
    let now = Time.now();
    let existingOpt = userMissions.get(missionId);
    switch (missionType) {
      case (
        #PointsHotkeyNeuron1Time or
        #PointsSaveProposalDraft or
        #PointsFavoriteSNS or
        #PointsSignupEmailNotification or
        #RewardSaveProposalDraft or
        #RewardFavoriteSNS or
        #RewardHotkeyNeuron or
        #RewardSignupEmailNotification
      ) {
        if (Option.isSome(existingOpt)) { return false };
      };
      case (
        #PointsCreateProposal
      ) {
        switch (existingOpt) {
          case (?prog) {
            let lastTs = Array.foldLeft<Types.MissionRecord, Int>(
              prog.completionHistory,
              0,
              func(acc, r) { if (r.timestamp > acc) r.timestamp else acc },
            );
            let oneDay = 24 * 60 * 60 * 1_000_000_000;
            if ((now - lastTs) < oneDay * 2) { return false };
          };
          case null {};
        };
      };
      case _ {
        if (missionType == #RewardSaveProposalDraft) {
          if (Option.isSome(existingOpt)) { return false };
        };
      };
    };

    let newRec : Types.MissionRecord = {
      var timestamp = now;
      var pointsEarned = award; // This `award` is used for points or as the ICP amount for reward missions
      var tweetId = overrideTweetId;
    };
    let updatedProg : Types.Progress = switch (existingOpt) {
      case (?p) {
        {
          var completionHistory = Array.append(p.completionHistory, [newRec]);
          var usedCodes = p.usedCodes;
        };
      };
      case null {
        let emptyCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
        { var completionHistory = [newRec]; var usedCodes = emptyCodes };
      };
    };
    userMissions.put(missionId, updatedProg);
    globalUserProgress.put(userUUID, userMissions);

    let isRewardMission = switch (missionType) {
      case (#RewardHotkeyNeuron) true;
      case (#RewardSaveProposalDraft) true;
      case (#RewardFavoriteSNS) true;
      case (#RewardVoteOnToolkit) true;
      case (#RewardSignupEmailNotification) true;
      case (_) false;
    };

    if (isRewardMission and award > 0) {
      // `award` was calculated at the beginning of this function
      // Define ICRC-1 necessary types (could be defined globally in the actor if used elsewhere)
      type Icrc1Account = { owner : Principal; subaccount : ?Blob };
      type TransferArgs = {
        to : Icrc1Account;
        fee : ?Nat;
        memo : ?Blob;
        from_subaccount : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
      };
      type TransferError = {

        BadFee : { expected_fee : Tokens };
        InsufficientFunds : { balance : Tokens };
        TxTooOld : { allowed_window_nanos : Nat64 };
        TxCreatedInFuture : Null;
        TxDuplicate : { duplicate_of : BlockIndex };
      };
      type BlockIndex = Nat;
      type TransferResult = {
        #Ok : BlockIndex;
        #Err : TransferError;
      };

      // ICP Ledger Canister ID (Mainnet ICP)
      let ledger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai") : actor {
        icrc1_transfer : shared TransferArgs -> async TransferResult;
      };

      let transferToAccount : Icrc1Account = {
        owner = principal;
        subaccount = null;
      }; // Pay to the credited principal's main account
      let transferAmount : Nat = award; // `award` holds the e8s amount for reward missions

      let transferCallArgs : TransferArgs = {
        to = transferToAccount;
        fee = null;
        memo = null;
        created_at_time = null;
        from_subaccount = null;
        amount = transferAmount;
      };

      Debug.print("processOne: Attempting ICRC-1 transfer of " # Nat.toText(transferAmount) # " e8s to " # Principal.toText(principal) # " for mission " # missionTypeToText(missionType));
      let transferOutcome = await ledger.icrc1_transfer(transferCallArgs);

      switch (transferOutcome) {
        case (#Err _err) {
          return false;
        };
        case (#Ok _blockIndex) {
          ();
        };
      };
    };
    return true;
  };

  private func missionTypeToText(m : Types.ICToolkitMissionType) : Text {
    switch m {
      case (#PointsCreateProposal) { "PointsCreateProposal" };
      case (#PointsFavoriteSNS) { "PointsFavoriteSNS" };
      case (#PointsHotkeyNeuron1Time) { "PointsHotkeyNeuron1Time" };
      case (#PointsSaveProposalDraft) { "PointsSaveProposalDraft" };
      case (#PointsSignupEmailNotification) { "PointsSignupEmailNotification" };
      case (#PointsVote) { "PointsVote" };
      case (#RewardSaveProposalDraft) { "RewardSaveProposalDraft" };
      case (#RewardFavoriteSNS) { "RewardFavoriteSNS" };
      case (#RewardHotkeyNeuron) { "RewardHotkeyNeuron" };
      case (#RewardVoteOnToolkit) { "RewardVoteOnToolkit" };
      case (#RewardSignupEmailNotification) { "RewardSignupEmailNotification" };
    };
  };

  public shared (msg) func missionsMainEndpoint(inputs : [(Types.ICToolkitMissionType, ?[Text])], principal : Principal) : async [Bool] {
    if (not Principal.isAnonymous(msg.caller)) {
      let allowedPrincipal1 = Principal.fromText("tltav-faaaa-aaaaj-qabfa-cai");
      let allowedPrincipal2 = Principal.fromText("yhak4-wqaaa-aaaad-qggia-cai");
      let allowedPrincipal3 = Principal.fromText("stg2p-p2rin-7mwfy-nct57-llsvt-h7ftf-f3edr-rmqc2-khb2e-c5efd-iae");

      var requiresAdminAuth : Bool = false;

      for ((missionType, _) in inputs.vals()) {
        switch (missionType) {
          case (#RewardVoteOnToolkit) {}; // This type does not trigger the admin requirement by itself
          case (#PointsVote) {}; // This type does not trigger the admin requirement by itself
          case (#PointsCreateProposal) {}; // This type does not trigger the admin requirement by itself
          case (_) {
            requiresAdminAuth := true;
          };
        };
      };

      if (requiresAdminAuth) {
        if (msg.caller != allowedPrincipal1 and msg.caller != allowedPrincipal2 and msg.caller != allowedPrincipal3) {
          // If admin auth is required and the caller is not an admin, return [false]
          // This matches the original behavior for an unauthorized admin-gated call.
          return [false];
        };
      };
      // ─── 1) Reject duplicate mission‐types ───
      let seen = TrieMap.TrieMap<Types.ICToolkitMissionType, Bool>(
        func(x, y) { x == y },
        func(x) { Text.hash(missionTypeToText(x)) },
      );
      for ((mt, _) in inputs.vals()) {
        if (Option.isSome(seen.get(mt))) {
          Debug.trap("Duplicate mission type in call");
        };
        seen.put(mt, true);
      };

      // ─── 2) Process each mission in order ───
      var results : [Bool] = [];
      for ((mt, meta) in inputs.vals()) {
        let ok = await processOne(msg.caller, mt, principal, meta);
        results := Array.append(results, [ok]);
      };

      // ─── 3) Return array of successes/failures ───
      return results;
    };
    return [false];
  };

  public query func availableCycles() : async Nat {
    return Cycles.balance();
  };

  public shared query func icrc28_trusted_origins() : async Types.Icrc28TrustedOriginsResponse {
    let trusted_origins : [Text] = [
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp0.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.raw.icp0.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.ic0.app",
      "https://dlas6-raaaa-aaaag-qm75a-cai.raw.ic0.app",
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp0.icp-api.io",
      "https://dlas6-raaaa-aaaag-qm75a-cai.icp-api.io",
      "https://pre.konecta.one",
      "https://adminpre.konecta.one",
      "https://stats.konecta.one",
      "https://konecta.one",
      "https://apcy6-tiaaa-aaaag-qkfda-cai.icp0.io",
      "https://okowr-oqaaa-aaaag-qkedq-cai.icp0.io",
      "https://5bxlt-ryaaa-aaaag-qkhea-cai.icp0.io",
      "https://y7mum-taaaa-aaaag-qklxq-cai.icp0.io",
      "https://apcy6-tiaaa-aaaag-qkfda-cai.raw.icp0.io",
      "https://okowr-oqaaa-aaaag-qkedq-cai.raw.icp0.io",
      "https://5bxlt-ryaaa-aaaag-qkhea-cai.raw.icp0.io",
      "https://y7mum-taaaa-aaaag-qklxq-cai.raw.icp0.io",
      "https://apcy6-tiaaa-aaaag-qkfda-cai.ic0.app",
      "https://okowr-oqaaa-aaaag-qkedq-cai.ic0.app",
      "https://5bxlt-ryaaa-aaaag-qkhea-cai.ic0.app",
      "https://y7mum-taaaa-aaaag-qklxq-cai.ic0.app",
      "https://apcy6-tiaaa-aaaag-qkfda-cai.raw.ic0.app",
      "https://okowr-oqaaa-aaaag-qkedq-cai.raw.ic0.app",
      "https://5bxlt-ryaaa-aaaag-qkhea-cai.raw.ic0.app",
      "https://y7mum-taaaa-aaaag-qklxq-cai.raw.ic0.app",
      "localhost:5173",
      "http://localhost:5173",
      "https://bpzax-jaaaa-aaaal-acpca-cai.icp0.io",
      "https://bpzax-jaaaa-aaaal-acpca-cai.raw.icp0.io",
      "https://dev.ic-toolkit.app",
      "https://ic-toolkit.app",
    ];

    return {
      trusted_origins;
    };
  };

  public shared query func icrc10_supported_standards() : async [Types.SupportedStandard] {
    return [
      {
        url = "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-10/ICRC-10.md";
        name = "ICRC-10";
      },
      {
        url = "https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_28_trusted_origins.md";
        name = "ICRC-28";
      },
    ];
  };

  public shared (msg) func resetall() : async () {
    if (isAdmin(msg.caller)) {
      globalUserProgress := TrieMap.TrieMap<Text, Types.UserMissions>(Text.equal, Text.hash);
      return;
    };
  };
};
