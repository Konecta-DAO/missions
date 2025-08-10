import Types "Types";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import GovernanceTypes "GovernanceTypes";
import Helpers "Helpers";
import Json "mo:json";
import Option "mo:base/Option";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import EventCanisterTypes "EventCanisterTypes";

module Actions {

  type HandlerOk = {
    outcome : Types.ActionOutcome;
    returnedData : ?Types.ActionReturnedData;
    message : ?Text;
  };
  type HandlerErr = {
    status : Types.ActionStatus;
    outcome : Types.ActionOutcome;
    message : Text;
  };
  type HandlerResult = Result.Result<HandlerOk, HandlerErr>; // For synchronous handlers

  public func handleValidateCode(
    actionParams : Types.ActionParameters,
    userInputJson : ?Text,
  ) : HandlerResult {
    switch (actionParams) {
      case (#ValidateCodeParams(params)) {
        // params.codeListId is [Text]
        if (Array.size(params.codeListId) == 0) {
          return #err({
            status = #InvalidParameters;
            outcome = #Failed;
            message = "No code provided in 'codeListId' for validation.";
          });
        };

        let userInput : Text = Option.get<Text>(userInputJson, "");

        switch (Json.parse(userInput)) {
          case (#ok(parsed)) {
            switch (Json.getAsText(parsed, "codeToValidate")) {
              case (#ok(parsedValue)) {
                // For this example, we'll validate the first code in the list.
                // In a real scenario, you might iterate or have different logic.
                var codeToValidate : Text = "";
                var isValidCode : Bool = false;
                var validationMessage : Text = "Code is invalid.";
                var attemptsRemaining : ?Nat = null; // Example, could be fetched or managed elsewhere
                let userInputCode = parsedValue;

                // Simulate validation logic
                // Replace this with your actual validation (e.g., checking against a list, a pattern, etc.)
                for (code in params.codeListId.vals()) {
                  if (code == userInputCode) {
                    codeToValidate := code;
                    isValidCode := true;
                    validationMessage := "Code successfully validated!";
                    attemptsRemaining := ?3; // Example
                  };
                };

                let returnedData : Types.ActionReturnedData = #ValidateCodeResult({
                  code = codeToValidate;
                  isValid = isValidCode;
                  message = ?validationMessage;
                  attemptsRemaining = attemptsRemaining;
                });

                if (isValidCode) {
                  return #ok({
                    outcome = #Success;
                    returnedData = ?returnedData;
                    message = ?"Code validation process completed successfully."; // Overall message
                  });
                } else {
                  // Even if the code is invalid, the action "processed" correctly,
                  // but its business outcome is #Failed.
                  return #ok({
                    outcome = #Failed; // Business outcome
                    returnedData = ?returnedData;
                    message = ?"Code validation process completed; code was not valid."; // Overall message
                  });
                };
              };
              case (#err(_)) {
                return #err({
                  status = #Error; // Internal error
                  outcome = #Failed;
                  message = "Internal Error: getAsText failed to parse 'codeToValidate'.";
                });
              };
            };
          };

          case (#err(_)) {
            return #err({
              status = #Error; // Internal error
              outcome = #Failed;
              message = "Internal Error: parse function failed.";
            });
          };
        };
      };

      case (_) {
        // This case should ideally not be reached if buildConcreteActionParameters is correct
        return #err({
          status = #Error; // Internal error
          outcome = #Failed;
          message = "Internal Error: handleValidateCode received unexpected ActionParameters variant.";
        });
      };
    };
  };

  public func handleNftOwnership(actionParams : Types.ActionParameters) : async HandlerResult {
    type TokenId = Nat64;

    switch (actionParams) {
      case (#NftOwnershipParams(params)) {
        // Define the actor interface for the DIP721 canister we want to call
        let nftCanister = actor (Principal.toText(params.nftCanisterId)) : actor {
          getTokenIdsForUserDip721 : query (Principal) -> async ([TokenId]);
        };

        let requiredCount = Option.get<Nat>(params.requiredTokenCount, 1);

        try {
          let ownedTokens = await nftCanister.getTokenIdsForUserDip721(params.principalToCheck);
          let ownedCount = Array.size(ownedTokens);

          let hasEnoughNfts = ownedCount >= requiredCount;

          let resultData = #NftOwnershipResult({
            nftCanisterId = params.nftCanisterId;
            principalChecked = params.principalToCheck;
            hasRequiredNft = hasEnoughNfts;
            ownedTokenCount = ownedCount;
            verificationStatus = #Success; // The check itself was successful
            detailMessage = ?("User owns " # Nat.toText(ownedCount) # " NFT(s). Required: " # Nat.toText(requiredCount) # ".");
          });

          if (hasEnoughNfts) {
            return #ok({
              outcome = #Success;
              returnedData = ?resultData;
              message = ?"NFT ownership verified successfully.";
            });
          } else {
            return #ok({
              outcome = #Failed; // Business outcome is #Failed
              returnedData = ?resultData;
              message = ?"User does not own the required number of NFTs.";
            });
          };

        } catch (e) {
          return #err({
            status = #ApiError;
            outcome = #Failed;
            message = "An error occurred while calling the NFT canister. It may not be a valid DIP721 canister or is currently unavailable.";
          });
        };
      };
      case (_) {
        return #err({
          status = #Error;
          outcome = #Failed;
          message = "Internal Error: handleNftOwnership received unexpected ActionParameters variant.";
        });
      };
    };
  };

  public func handleSnsVote(actionParams : Types.ActionParameters) : async HandlerResult {
    switch (actionParams) {
      case (#VoteOnProposalParams(params)) {
        let snsGovernance = actor (Principal.toText(params.snsCanisterId)) : actor {
          get_proposal : shared query GovernanceTypes.GetProposal -> async GovernanceTypes.GetProposalResponse;
          list_neurons : shared query GovernanceTypes.ListNeurons -> async GovernanceTypes.ListNeuronsResponse;
        };
        var userNeuronIds : [Blob] = [];

        // 1. List neurons for the principalToCheck
        try {
          let listReq = {
            limit = Nat32.fromNat(100);
            of_principal = ?params.principalToCheck;
            start_page_at = null;
          };
          let neuronsResponse = await snsGovernance.list_neurons(listReq);

          for (neuronInfo in neuronsResponse.neurons.vals()) {
            switch (neuronInfo.id) {
              case (?idRecord) {
                userNeuronIds := Array.append(userNeuronIds, [(idRecord.id)]);
              };
              case null {};
            };
          };
        } catch (_e) {
          // Consider adding more detail from 'e' if possible, e.g., using Debug.error("...", e) for backend logging.
          return #err({
            status = #ApiError;
            outcome = #Failed;
            message = "Failed to list neurons from SNS. "; // Enhanced message
          });
        };

        if (Array.size(userNeuronIds) == 0) {
          let resultData = #VoteOnProposalResult({
            snsCanisterId = params.snsCanisterId;
            proposalId = params.proposalId;
            principalChecked = params.principalToCheck;
            hasVoted = false;
            voteCasted = null;
            verificationStatus = #Success; // Check completed, principal has no (found) neurons.
            detailMessage = ?"Principal does not control any (queried) neurons on this SNS.";
          });
          return #ok({
            outcome = #Success; // Or #NotApplicable if "no neurons" means the check can't proceed meaningfully for voting
            returnedData = ?resultData;
            message = ?"No neurons found for principal to check vote status.";
          });
        };

        // 2. Get proposal information
        var proposalInfoOpt : ?GovernanceTypes.GetProposalResponse = null;
        try {
          let proposalIdNat64 : Nat64 = Nat64.fromNat(params.proposalId);
          // Assuming GovernanceTypes.GetProposal is { proposal_id : ?{ id: Nat64 } }
          proposalInfoOpt := ?(await snsGovernance.get_proposal({ proposal_id = ?{ id = proposalIdNat64 } }));
        } catch (_e) {
          return #err({
            status = #ApiError;
            outcome = #Failed;
            message = "Failed to get proposal info from SNS."; // Enhanced message
          });
        };

        switch (proposalInfoOpt) {
          case null {
            // This case implies 'await snsGovernance.get_proposal' resolved to 'null' within the option,
            let resultData = #VoteOnProposalResult({
              snsCanisterId = params.snsCanisterId;
              proposalId = params.proposalId;
              principalChecked = params.principalToCheck;
              hasVoted = false;
              voteCasted = null;
              verificationStatus = #NotApplicable;
              detailMessage = ?"Proposal information could not be retrieved (null response).";
            });
            return #ok({
              // Or #err if this state is unexpected
              outcome = #Failed; // Business outcome could be failed if proposal info is essential and missing
              returnedData = ?resultData;
              message = ?"Could not retrieve proposal information from the specified SNS.";
            });
          };
          case (?propInfo) {
            switch (propInfo.result) {
              case null {
                let resultData = #VoteOnProposalResult({
                  snsCanisterId = params.snsCanisterId;
                  proposalId = params.proposalId;
                  principalChecked = params.principalToCheck;
                  hasVoted = false;
                  voteCasted = null;
                  verificationStatus = #NotApplicable;
                  detailMessage = ?"Proposal not found or no data in proposal response.";
                });
                return #ok({
                  outcome = #NotApplicable;
                  returnedData = ?resultData;
                  message = ?"Proposal not found or no data in response on the specified SNS.";
                });
              };
              case (?actualResultPayload) {
                switch (actualResultPayload) {
                  case (#Proposal(propData)) {
                    // 3. Check if any of the user's neuron IDs are in the proposal's ballots
                    for (userNeuronIdBlob in userNeuronIds.vals()) {
                      for ((ballotNeuronIdKey, actualVoteValue) in propData.ballots.vals()) {
                        if (ballotNeuronIdKey == Helpers.blobToHex(userNeuronIdBlob)) {
                          // Vote found for this user's neuron
                          let resultData = #VoteOnProposalResult({
                            hasVoted = true;
                            principalChecked = params.principalToCheck;
                            proposalId = params.proposalId;
                            snsCanisterId = params.snsCanisterId;
                            verificationStatus = (#Success : Types.ActionStatusOutcome);
                            voteCasted = switch (actualVoteValue.vote) {
                              case (1) { ?#Yes }; // Assuming 1 is Yes
                              case (2) { ?#No }; // Assuming 2 is No
                              case (_) { null }; // Or handle unexpected vote values
                            };
                          });
                          return #ok({
                            outcome = #Success;
                            returnedData = ?resultData;
                            message = ?"Vote status determined: User has voted.";
                          });
                        };
                      };
                    };
                    // If loops complete, no vote was found from any of the user's neurons for this proposal
                    let resultData = #VoteOnProposalResult({
                      snsCanisterId = params.snsCanisterId;
                      proposalId = params.proposalId;
                      principalChecked = params.principalToCheck;
                      hasVoted = false;
                      voteCasted = null;
                      verificationStatus = #Success; // The check was performed successfully.
                    });
                    return #ok({
                      outcome = #Success; // Business outcome: check was successful, user just hadn't voted
                      returnedData = ?resultData;
                      message = ?"Vote status determined: User has not voted on this proposal.";
                    });
                  };
                  case (#Error(_errData)) {
                    return #err({
                      outcome = #Failed;
                      status = #ApiError;
                      message = "SNS Governance returned an error for the proposal";
                    });
                  };
                };
              };
            };
          };
        };
      };
      case (_) {
        return #err({
          status = #Error;
          outcome = #Failed;
          message = "Internal Error: handleSnsVote received unexpected ActionParameters variant.";
        });
      };
    };
  };

  public func handleLeaderboard(actionParams : Types.ActionParameters) : HandlerResult {
    switch (actionParams) {
      case (#LeaderboardParams(params)) {
        if (params.endDate <= Time.now()) {
          return #err({
            status = #InvalidParameters;
            outcome = #Failed;
            message = "Leaderboard end date must be in the future.";
          });
        };

        if (Array.size(params.missionIds) == 0) {
          return #err({
            status = #InvalidParameters;
            outcome = #Failed;
            message = "At least one mission ID must be provided for the leaderboard.";
          });
        };

        // If parameters are valid, return a pending state.
        // The `executeActionStep` in Backend.mo will see this and schedule the timer task.
        return #ok({
          outcome = #PendingVerification; // This specific outcome signals a long-running/scheduled task.
          returnedData = ?#LeaderboardResult({
            status = #Pending;
            settlementTime = null;
            winners = null;
            detailMessage = ?"Leaderboard is now active. Results will be calculated after the end date.";
          });
          message = ?"Leaderboard action has been scheduled successfully.";
        });
      };
      case (_) {
        return #err({
          status = #Error;
          outcome = #Failed;
          message = "Internal Error: handleLeaderboard received unexpected ActionParameters variant.";
        });
      };
    };
  };

  public func handleEventJoin(actionParams : Types.ActionParameters) : async HandlerResult {
    switch (actionParams) {
      case (#EventJoinParams(params)) {
        let eventCanister = actor ("yhl4v-6iaaa-aaaag-qnhma-cai") : actor {
          checkIfAttendeeOrAcceptedUserExistsForEvent : query (Principal, Text) -> async Bool;
        };

        try {
          let hasJoined = await eventCanister.checkIfAttendeeOrAcceptedUserExistsForEvent(params.principalToCheck, params.eventId);

          let resultData : Types.ActionReturnedData = #EventJoinResult({
            eventId = params.eventId;
            principalChecked = params.principalToCheck;
            hasJoined = hasJoined;
            verificationStatus = #Success;
          });

          if (hasJoined) {
            return #ok({
              outcome = #Success;
              returnedData = ?resultData;
              message = ?"Successfully verified that the user has joined the event.";
            });
          } else {
            return #ok({
              outcome = #Failed;
              returnedData = ?resultData;
              message = ?"Verification complete: User has not joined the event.";
            });
          };

        } catch (e) {
          return #err({
            status = #ApiError;
            outcome = #Failed;
            message = "An error occurred while calling the event canister to verify participation.";
          });
        };
      };
      case (_) {
        return #err({
          status = #Error;
          outcome = #Failed;
          message = "Internal Error: handleEventJoin received unexpected ActionParameters variant.";
        });
      };
    };
  };

  public func handleEventCreateAny(actionParams : Types.ActionParameters) : async HandlerResult {
    switch (actionParams) {
      case (#EventCreateAnyParams(params)) {
        let eventCanister = actor ("yhl4v-6iaaa-aaaag-qnhma-cai") : actor {
          getPaginatedFilteredEvents : query (EventCanisterTypes.GetFilteredEventsPayload) -> async Result.Result<{ items : [EventCanisterTypes.EventWithUserDataPayload]; totalRecords : Nat }, [Text]>;
        };

        let now = Time.now();

        // Query for past/present events created by the user
        let pastPayload : EventCanisterTypes.GetFilteredEventsPayload = {
          currentTimestamp = Int.abs(now);
          isFuture = false;
          eventType = null;
          status = null;
          userId = ?params.principalToCheck;
          categories = null;
          recordingType = null;
          limit = 1;
          cursor = null;
        };

        // Query for future events created by the user
        let futurePayload : EventCanisterTypes.GetFilteredEventsPayload = {
          currentTimestamp = Int.abs(now);
          isFuture = true;
          eventType = null;
          status = null;
          userId = ?params.principalToCheck;
          categories = null;
          recordingType = null;
          limit = 1;
          cursor = null;
        };

        try {
          var totalEvents : Nat = 0;

          let pastResult = await eventCanister.getPaginatedFilteredEvents(pastPayload);
          switch (pastResult) {
            case (#ok(res)) {
              totalEvents += res.totalRecords;
            };
            case (#err(e)) {
              // Fail gracefully, maybe log the error, but continue to check future events
              Debug.print("Error checking past events for user " # Principal.toText(params.principalToCheck));
            };
          };

          let futureResult = await eventCanister.getPaginatedFilteredEvents(futurePayload);
          switch (futureResult) {
            case (#ok(res)) {
              totalEvents += res.totalRecords;
            };
            case (#err(e)) {
              Debug.print("Error checking future events for user " # Principal.toText(params.principalToCheck));
            };
          };

          let hasCreated = totalEvents > 0;

          let resultData : Types.ActionReturnedData = #EventCreateAnyResult({
            principalChecked = params.principalToCheck;
            hasCreatedEvents = hasCreated;
            createdEventsCount = totalEvents;
            verificationStatus = #Success;
          });

          if (hasCreated) {
            return #ok({
              outcome = #Success;
              returnedData = ?resultData;
              message = ?"Successfully verified that the user has created at least one event.";
            });
          } else {
            return #ok({
              outcome = #Failed;
              returnedData = ?resultData;
              message = ?"Verification complete: User has not created any events.";
            });
          };

        } catch (e) {
          return #err({
            status = #ApiError;
            outcome = #Failed;
            message = "An error occurred while calling the event canister to check for created events.";
          });
        };
      };
      case (_) {
        return #err({
          status = #Error;
          outcome = #Failed;
          message = "Internal Error: handleEventCreateAny received unexpected ActionParameters variant.";
        });
      };
    };
  };
};
