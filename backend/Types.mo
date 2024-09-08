import TrieMap "mo:base/TrieMap";

module Types {

  public type Icrc28TrustedOriginsResponse = {
    trusted_origins : [Text];
  };

  // User Types
  public type User = {
    id : Principal; // Principal ID
    var twitterid : ?Nat; // Twitter ID
    var twitterhandle : ?Text; // Twitter Handle
    creationTime : Int; // Creation Time in Nanoseconds
  };

  public type SerializedUser = {
    id : Principal;
    twitterid : ?Nat;
    twitterhandle : ?Text;
    creationTime : Int;
  };

  // Mission Types
  public type Mission = {
    var id : Nat; // Mission Number
    var title : Text; // Title of the Mission
    var description : Text; // Description of the Mission
    var obj1 : ?Text; // Text for First Button or Input (optional)
    var obj2 : Text; // Text for Second Button (optional)
    var inputPlaceholder : ?Text; // Placeholder text for the input field (optional)
    var startDate : Int; // Start date of the mission (Unix timestamp)
    var endDate : Int; // End date of the mission (Unix timestamp)
    var recursive : Bool; // If the mission is recursive
    var mintime : Int; // Minimum time to earn on the mission
    var maxtime : Int; // Maximum time to earn on the mission
    var functionName1 : ?Text; // Function Name to call on First Button (optional)
    var functionName2 : Text; // Function Name to call on Second Button (optional)
    var image : Text; // Image for the mission
    var secretCodes : ?Text; // List of secret codes for the mission (optional)
    var mode : Nat; // 0: Description + Button , 1: Description + Two Buttons, 2: Description + Input + Button
    var requiredPreviousMissionId : ?Nat; // Optional ID of the required previous mission
    var iconUrl : Text;
  };

  public type SerializedMission = {
    id : Nat; // Mission Number
    title : Text; // Title of the Mission
    description : Text; // Description of the Mission
    obj1 : ?Text; // Text for First Button or Input (optional)
    obj2 : Text; // Text for Second Button (optional)
    inputPlaceholder : ?Text; // Placeholder text for the input field (optional)
    startDate : Int; // Start date of the mission (Unix timestamp)
    endDate : Int; // End date of the mission (Unix timestamp)
    recursive : Bool; // If the mission is recursive
    mintime : Int; // Minimum time to earn on the mission
    maxtime : Int; // Maximum time to earn on the mission
    functionName1 : ?Text; // Function Name to call on First Button (optional)
    functionName2 : Text; // Function Name to call on Second Button (optional)
    image : Text; // Image for the mission
    secretCodes : ?Text; // List of secret codes for the mission (optional)
    mode : Nat; // 0: Description + Button , 1: Description + Two Buttons, 2: Description + Input + Button
    requiredPreviousMissionId : ?Nat; // Optional ID of the required previous mission
    iconUrl : Text;
  };

  // Progress Types
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

  // Mission Related functions
  public type UserMissions = TrieMap.TrieMap<Nat, Types.Progress>;

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
  
  public type UserResponse = {
    following : Bool;
    id : Nat;
    username : Text;
  };
};
