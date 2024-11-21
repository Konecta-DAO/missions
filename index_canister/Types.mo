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

};
