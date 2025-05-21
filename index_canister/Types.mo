import Vector "mo:vector";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";

module Types {

  public type Icrc28TrustedOriginsResponse = {
    trusted_origins : [Text];
  };

  public type ProjectMissions = {
    var canisterId : Principal;
    var name : Text;
    var creationTime : Int;
    var status : Text;
    var icon : Text;
  };

  public type SerializedProjectMissions = {
    canisterId : Principal;
    name : Text;
    creationTime : Int;
    status : Text;
    icon : Text;
  };

  public type UserV1 = {
    id : Principal; // Principal ID
    var twitterid : ?Nat; // Twitter ID
    var twitterhandle : ?Text; // Twitter Handle
    creationTime : Int; // Creation Time in Nanoseconds
    var pfpProgress : Text;
    var totalPoints : Nat;
    var ocProfile : ?Text;
    var ocCompleted : Bool;
  };

  public type SerializedUserV1 = {
    id : Principal;
    twitterid : ?Nat;
    twitterhandle : ?Text;
    creationTime : Int;
    pfpProgress : Text;
    totalPoints : Nat;
    ocProfile : ?Text;
    ocCompleted : Bool;
  };

  public type UserV2 = {
    id : Principal; // Principal ID
    var twitterid : ?Nat; // Twitter ID
    var twitterhandle : ?Text; // Twitter Handle
    creationTime : Int; // Creation Time in Nanoseconds
    var pfpProgress : Text;
    var totalPoints : Nat;
    var ocProfile : ?Text;
    var ocCompleted : Bool;
    var discordUser : ?Text;
    var telegramUser : ?Text;
    var nnsPrincipal : ?Principal;
  };

  public type SerializedUserV2 = {
    id : Principal;
    twitterid : ?Nat;
    twitterhandle : ?Text;
    creationTime : Int;
    pfpProgress : Text;
    totalPoints : Nat;
    ocProfile : ?Text;
    ocCompleted : Bool;
    discordUser : ?Text;
    telegramUser : ?Text;
    nnsPrincipal : ?Principal;
  };

  public type GlobalUser = {
    var twitterid : ?Nat; // Twitter ID
    var twitterhandle : ?Text; // Twitter Handle
    creationTime : Int; // Creation Time in Nanoseconds
    var pfpProgress : Text;
    var deducedPoints : Nat;
    var ocProfile : ?Text;
    var discordUser : ?Text;
    var telegramUser : ?Text;
    var nuanceUser : ?Text;
    var nnsPrincipal : ?Principal;
    var firstname : ?Text;
    var lastname : ?Text;
    var username : ?Text;
    var email : ?Text;
    var bio : ?Text;
    var categories : ?[Text];
    var profilepic : ?Text;
    var coverphoto : ?Text;
    var country : ?Text;
    var timezone : ?Text;
    var icrc1tokens : ?[Principal];
    var nft721 : ?[Principal];
  };

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

  // HTTP Request Types
  public type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    headers : [HttpHeader];
    body : ?[Nat8];
    method : HttpMethod;
    transform : ?TransformRawResponseFunction;
  };

  public type HttpHeader = {
    name : Text;
    value : Text;
  };

  public type HttpMethod = {
    #get;
    #post;
    #head;
  };

  public type HttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  public type TransformRawResponseFunction = {
    function : shared query TransformArgs -> async HttpResponsePayload;
    context : Blob;
  };

  public type TransformArgs = {
    response : HttpResponsePayload;
    context : Blob;
  };

  public type CanisterHttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  public type TransformContext = {
    function : shared query TransformArgs -> async HttpResponsePayload;
    context : Blob;
  };

  public type IC = actor {
    http_request : HttpRequestArgs -> async HttpResponsePayload;
  };

  public type HttpRequest = {
    url : Text;
    method : Text;
    headers : [(Text, Text)];
    body : Blob;
    certificate : ?Blob;
  };

  public type HttpResponse = {
    status_code : Nat16;
    headers : [(Text, Text)];
    body : Blob;
  };

  public type FollowerRecord = {
    bio : Text;
    socialChannelsUrls : [Text];
    principal : Text;
    displayName : Text;
    followersCount : Text;
    website : Text;
    handle : Text;
    fontType : Text;
    avatar : Text;
  };

  public type MissionV2 = {
    var id : Nat; // Mission Number
    var title : Text; // Title of the Mission
    var description : Text; // Description of the Mission
    var obj1 : ?Text; // Text for First Button or Input (optional)
    var obj2 : Text; // Text for Second Button (optional)
    var inputPlaceholder : ?Text; // Placeholder text for the input field (optional)
    var startDate : Int; // Start date of the mission (Unix timestamp)
    var endDate : Int; // End date of the mission (Unix timestamp)
    var recursive : Bool; // If the mission is recursive
    var points : Int;
    var functionName1 : ?Text; // Function Name to call on First Button (optional)
    var functionName2 : Text; // Function Name to call on Second Button (optional)
    var image : Text; // Image for the mission
    var secretCodes : ?Text; // List of secret codes for the mission (optional)
    var mode : Nat; // 0: Description + Button , 1: Description + Two Buttons, 2: Description + Input + Button
    var requiredPreviousMissionId : ?Nat; // Optional ID of the required previous mission
    var iconUrl : Text;
    var token : Bool;
    var subAccount : ?[Int8];
    var subMissions : ?Vector.Vector<MissionV2>;
    var maxUsers : ?Nat;
    var usersThatCompleted : ?[(Principal, Int)];
    var status : Text;
    creationTime : Int;
  };

  public type SerializedMissionV2 = {
    id : Nat; // Mission Number
    title : Text; // Title of the Mission
    description : Text; // Description of the Mission
    obj1 : ?Text; // Text for First Button or Input (optional)
    obj2 : Text; // Text for Second Button (optional)
    inputPlaceholder : ?Text; // Placeholder text for the input field (optional)
    startDate : Int; // Start date of the mission (Unix timestamp)
    endDate : Int; // End date of the mission (Unix timestamp)
    recursive : Bool; // If the mission is recursive
    points : Int;
    functionName1 : ?Text; // Function Name to call on First Button (optional)
    functionName2 : Text; // Function Name to call on Second Button (optional)
    image : Text; // Image for the mission
    secretCodes : ?Text; // List of secret codes for the mission (optional)
    mode : Nat; // 0: Description + Button , 1: Description + Two Buttons, 2: Description + Input + Button
    requiredPreviousMissionId : ?Nat; // Optional ID of the required previous mission
    iconUrl : Text;
    token : Bool;
    subAccount : ?[Int8];
    subMissions : ?[SerializedMissionV2];
    maxUsers : ?Nat;
    usersThatCompleted : ?[(Principal, Int)];
    status : Text;
    creationTime : Int;
  };

  // Progress Types and Mission Related Types
  public type Progress = {
    var completionHistory : [MissionRecord]; // Array of records for each time the mission was completed
    var usedCodes : TrieMap.TrieMap<Text, Bool>; // Map of secret codes the user has used (for the secret code mission)
  };

  public type MissionRecord = {
    var timestamp : Int; // Timestamp when the mission was completed
    var pointsEarned : Nat; // Points earned in this completion
    var tweetId : ?Text; // Tweet ID for the completion
  };

  public type SerializedMissionRecord = {
    timestamp : Int;
    pointsEarned : Nat;
    tweetId : ?Text;
  };

  public type SerializedProgress = {
    completionHistory : [SerializedMissionRecord];
    usedCodes : [(Text, Bool)];
  };

  public type LinkRequest = {
    requester : Principal; // The account initiating the link request.
    requesterType : Text; // Account Type
    target : Principal; // The account to be linked.
    targetType : Text; // Account Type
    status : Text; // "pending", "accepted", or "rejected"
    requestedAt : Int; // Timestamp when the request was made.
  };

  public type SubAccount = Blob;

  public type Account = {
    owner : Principal;
    subaccount : ?SubAccount;
  };

  public type Icrc1Tokens = Nat;

  public type GetAccountTransactionsArgs = {
    account : Account;
    // The txid of the last transaction seen by the client.
    // If None then the results will start from the most recent
    // txid. If set then the results will start from the next
    // most recent txid after start (start won't be included).
    start : ?Nat;
    // Maximum number of transactions to fetch.
    max_results : Nat;
  };

  public type GetAccountIdentifierTransactionsResult = {
    #Ok : GetAccountIdentifierTransactionsResponse;
    #Err : GetAccountIdentifierTransactionsError;
  };

  public type GetAccountIdentifierTransactionsResponse = {
    balance : Nat64;
    transactions : [TransactionWithId];
    oldest_tx_id : ?Nat64;
  };

  public type TransactionWithId = {
    id : Nat64;
    transaction : Transaction;
  };

  public type TransferArg = {
    from_subaccount : ?SubAccount;
    to : Account;
    amount : Icrc1Tokens;
    fee : ?Icrc1Tokens;
    memo : ?Blob;
    created_at_time : ?Icrc1Timestamp;
  };

  public type Icrc1Timestamp = Nat64;

  public type Transaction = {
    memo : Nat64;
    icrc1_memo : ?[Nat8];
    operation : Operation;
    created_at_time : ?TimeStamp;
    timestamp : ?TimeStamp;
  };

  public type Operation = {
    #Approve : {
      fee : Tokens;
      from : Text;
      allowance : Tokens;
      expires_at : ?TimeStamp;
      spender : Text;
      expected_allowance : ?Tokens;
    };
    #Burn : { from : Text; amount : Tokens; spender : ?Text };
    #Mint : { to : Text; amount : Tokens };
    #Transfer : {
      to : Text;
      fee : Tokens;
      from : Text;
      amount : Tokens;
      spender : ?Text;
    };
  };

  public type TimeStamp = { timestamp_nanos : Nat64 };

  type Tokens = { e8s : Nat64 };

  public type GetAccountIdentifierTransactionsError = {
    message : Text;
  };

  public type Icrc1BlockIndex = Nat;

  public type Icrc1TransferError = {
    #BadFee : { expected_fee : Icrc1Tokens };
    #BadBurn : { min_burn_amount : Icrc1Tokens };
    #InsufficientFunds : { balance : Icrc1Tokens };
    #TooOld;
    #CreatedInFuture : { ledger_time : Nat64 };
    #TemporarilyUnavailable;
    #Duplicate : { duplicate_of : Icrc1BlockIndex };
    #GenericError : { error_code : Nat; message : Text };
  };

  public type Icrc1TransferResult = {
    #Ok : Icrc1BlockIndex;
    #Err : Icrc1TransferError;
  };

  public type TokenId = Nat64;

  public type TxReceipt = {
    #Ok : Nat;
    #Err : ApiError;
  };

  type ApiError = {
    #InvalidCollection;
    #InvalidTokenId;
    #Other;
    #SenderIsNotOwner;
    #TransactionIsNotVerified;
    #Unauthorized;
    #VestingIsNotFinishedYet;
    #ZeroAddress;
  };
};
