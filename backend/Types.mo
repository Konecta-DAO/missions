module Types {

  // 1. Type that describes the Request arguments for an HTTPS outcall
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

  // 2. HTTPS outcalls have an optional "transform" key. These two types help describe it.
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

  // 3. Declaring the IC management canister which we use to make the HTTPS outcall
  public type IC = actor {
    http_request : HttpRequestArgs -> async HttpResponsePayload;
  };

  public type HttpRequest = {
    method : Text;
    url : Text;
    headers : [(Text, Text)];
    body : [Nat8];
  };

  public type HttpResponse = {
    status_code : Nat;
    headers : [(Text, Text)];
    body : [Nat8];
  };

};
