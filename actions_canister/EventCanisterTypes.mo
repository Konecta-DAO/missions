import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

module EventCanisterTypes {
  public type PaginatedScanCursor = Text;

  public type GetFilteredEventsPayload = {
    currentTimestamp : Nat;
    isFuture : Bool;
    eventType : ?Text;
    status : ?Text;
    userId : ?Principal;
    categories : ?[Text];
    recordingType : ?[Bool];
    limit : Nat;
    cursor : ?PaginatedScanCursor;
  };

  public type EventWithUserDataPayload = {
    event_id : Text;
  };

  public type PaginatedFilteredEventsResponse = {
    items : [EventWithUserDataPayload];
    totalRecords : Nat;
  };
};
