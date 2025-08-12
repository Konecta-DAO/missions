import Principal "mo:base/Principal";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Option "mo:base/Option";
import StableTrieMap "../StableTrieMap";

persistent actor class NFTCanister() {

  // --- TYPES ---
  public type TokenId = Nat64;
  public type DIP721Interface = {
    #DIP721;
  };
  public type TxReceipt = Result.Result<Nat, ApiError>;
  public type ApiError = {
    #Unauthorized;
    #InvalidTokenId;
    #ZeroAddress;
    #Other;
  };

  // --- HELPER ---
  private func hashNat64(n : Nat64) : Hash.Hash {
    return Hash.hash(Nat64.toNat(n));
  };

  // --- STATE ---
  var name : Text = "Test NFT";
  var symbol : Text = "TNFT";
  var logo : Text = "https://placehold.co/400x400.png";
  var tokenCounter : Nat64 = 0;

  // Maps a TokenId to its owner Principal
  var tokenOwners : StableTrieMap.StableTrieMap<TokenId, Principal> = StableTrieMap.new<TokenId, Principal>();

  // Maps a Principal to the list of TokenIds they own. This makes `getTokenIdsForUserDip721` efficient.
  var userTokens : StableTrieMap.StableTrieMap<Principal, [TokenId]> = StableTrieMap.new<Principal, [TokenId]>();

  // --- MINTING ---

  /**
    * @notice Creates a new NFT and assigns it to a recipient.
    * @param recipient The Principal to receive the newly minted NFT.
    * @dev Anyone can call this function for testing purposes.
    * @return The TokenId of the newly created NFT.
    */
  public shared (msg) func mint(recipient : Principal) : async TokenId {
    let tokenId = tokenCounter;
    tokenCounter += 1;

    // Update the owner for the new token
    StableTrieMap.put(tokenOwners, Nat64.equal, hashNat64, tokenId, recipient);

    // Add the token to the recipient's list of owned tokens
    let currentTokens = Option.get(StableTrieMap.get(userTokens, Principal.equal, Principal.hash, recipient), []);
    let updatedTokens = Array.append(currentTokens, [tokenId]);
    StableTrieMap.put(userTokens, Principal.equal, Principal.hash, recipient, updatedTokens);

    return tokenId;
  };

  // --- DIP-721 Standard Functions ---

  /**
    * @notice Returns the list of TokenIds owned by a given user.
    * @param user The Principal to query.
    * @return An array of TokenIds.
    */
  public shared query func getTokenIdsForUserDip721(user : Principal) : async [TokenId] {
    return Option.get(StableTrieMap.get(userTokens, Principal.equal, Principal.hash, user), []);
  };

  /**
    * @notice Returns the total number of NFTs in this collection.
    */
  public shared query func totalSupplyDip721() : async Nat64 {
    return tokenCounter;
  };

  /**
    * @notice Returns the owner of a specific NFT.
    * @param tokenId The ID of the token to query.
    * @return The Principal of the owner.
    */
  public shared query func ownerOfDip721(tokenId : TokenId) : async Result.Result<Principal, ApiError> {
    switch (StableTrieMap.get(tokenOwners, Nat64.equal, hashNat64, tokenId)) {
      case null { return #err(#InvalidTokenId) };
      case (?ownerPrincipal) { return #ok(ownerPrincipal) };
    };
  };

  /**
    * @notice Returns the number of NFTs owned by a Principal.
    * @param owner The Principal to query.
    * @return The count of NFTs.
    */
  public shared query func balanceOfDip721(owner : Principal) : async Nat64 {
    let tokens = Option.get(StableTrieMap.get(userTokens, Principal.equal, Principal.hash, owner), []);
    return Nat64.fromNat(Array.size(tokens));
  };

  /**
    * @notice Transfers an NFT from one Principal to another.
    * @param from The current owner of the NFT.
    * @param to The Principal to receive the NFT.
    * @param tokenId The ID of the token to transfer.
    * @return A transaction receipt.
    */
  public shared (msg) func safeTransferFromDip721(from : Principal, to : Principal, tokenId : TokenId) : async TxReceipt {
    // 1. Check ownership and authorization
    switch (StableTrieMap.get(tokenOwners, Nat64.equal, hashNat64, tokenId)) {
      case null { return #err(#InvalidTokenId) };
      case (?tokenOwner) {
        if (tokenOwner != from) {
          Debug.trap("The 'from' principal is not the owner of this token.");
        };
        if (msg.caller != from) {
          Debug.trap("The caller is not authorized to transfer this token.");
        };
      };
    };

    // 2. Remove token from the 'from' user's list
    let fromTokens = Option.get(StableTrieMap.get(userTokens, Principal.equal, Principal.hash, from), []);
    let updatedFromTokens = Array.filter<TokenId>(fromTokens, func(id) { id != tokenId });
    StableTrieMap.put(userTokens, Principal.equal, Principal.hash, from, updatedFromTokens);

    // 3. Add token to the 'to' user's list
    let toTokens = Option.get(StableTrieMap.get(userTokens, Principal.equal, Principal.hash, to), []);
    let updatedToTokens = Array.append(toTokens, [tokenId]);
    StableTrieMap.put(userTokens, Principal.equal, Principal.hash, to, updatedToTokens);

    // 4. Update the token's primary owner record
    StableTrieMap.put(tokenOwners, Nat64.equal, hashNat64, tokenId, to);

    return #ok(1); // Return a dummy transaction ID for success
  };

  /**
    * @notice Returns the name of the NFT collection.
    */
  public shared query func nameDip721() : async Text {
    return name;
  };

  /**
    * @notice Returns the symbol of the NFT collection.
    */
  public shared query func symbolDip721() : async Text {
    return symbol;
  };

  /**
    * @notice Returns the logo of the NFT collection.
    */
  public shared query func logoDip721() : async Text {
    return logo;
  };

  /**
    * @notice Returns the interfaces supported by this canister.
    */
  public shared query func supportedInterfacesDip721() : async [DIP721Interface] {
    return [#DIP721];
  };
};