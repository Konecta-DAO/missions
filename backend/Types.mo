import TrieMap "mo:base/TrieMap";

module Types {
  // User Types
  public type User = {
    id : Text; // Principal ID
    var seconds : Nat; // Total Seconds Earned
    var twitterid : Nat; // Twitter ID
    var twitterhandle : Text; // Twitter Handle
    creationTime : Int; // Creation Time in Nanoseconds
  };

  public type SerializedUser = {
    id : Text;
    seconds : Nat;
    twitterid : Nat;
    twitterhandle : Text;
    creationTime : Int;
  };

  // Mission Types
  public type Mission = {
    id : Nat; // Mission Number
    var mode : Nat; // 0: Description + Button , 1: Description + Two Buttons, 2: Description + Input + Button
    var description : Text; // Description of the Mission
    var obj1 : Text; // Text for First Button or Input
    var obj2 : Text; // Text for Second Button
    var recursive : Bool; // If the mission is recursive
    var maxtime : Int; // Maximum time to earn on the mission
    var image : Text; // Image for the mission
    var functionName1 : Text; // Function Name to call on First Button
    var functionName2 : Text; // Function Name to call on Second Button
  };

  public type SerializedMission = {
    id : Nat;
    mode : Nat;
    description : Text;
    obj1 : Text;
    obj2 : Text;
    recursive : Bool;
    maxtime : Int;
    image : Text;
    functionName1 : Text;
    functionName2 : Text;
  };

  // Progress Types
  public type Progress = {
    var done : Bool; // If the mission is done
    var timestamp : Int; // Timestamp of the last time mission was done
    var totalearned : Nat; // Total seconds earned on the mission
    var amountOfTimes : Nat; // How many times the mission has been done (for recursive missions)
    var usedCodes : TrieMap.TrieMap<Text, Bool>; // Map of secret codes the user has used (for the secret code mission)
  };

  public type SerializedProgress = {
    done : Bool;
    timestamp : Int;
    totalearned : Nat;
    amountOfTimes : Nat;
    usedCodes : [(Text, Bool)];
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
};
