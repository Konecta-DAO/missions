import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

module EventCanisterTypes {
    // A simplified representation of the cursor for pagination.
    // For our call, we only need to know it's an option, so we can use a placeholder type.
    public type PaginatedScanCursor = Text;

    // The payload required for the getPaginatedFilteredEvents query
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

    // A simplified structure for what we expect back in the 'items' array.
    // We only care about the totalRecords, so this can be a minimal placeholder.
    public type EventWithUserDataPayload = {
      event_id: Text;
    };

    // The response structure from getPaginatedFilteredEvents
    public type PaginatedFilteredEventsResponse = {
        items : [EventWithUserDataPayload];
        totalRecords : Nat;
    };
};