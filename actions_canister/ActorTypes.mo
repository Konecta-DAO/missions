import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
module Actor {

    public type Generic = actor {
        existWallet : shared query (walletId: Principal, date: Nat) -> async Bool;
        isTransactionDone : shared query (walletId: Principal, date: Nat, amount: Nat) -> async Bool;
        istrackedReferrals : shared query (walletId: Principal) -> async Bool;
        hasAmountNecessary : shared query (walletId: Principal, date: Nat, amount: Nat) -> async Bool;
    };

};
