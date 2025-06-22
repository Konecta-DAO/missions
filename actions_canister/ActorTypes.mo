module Actor {

    public type Generic = actor {
        getUUID : shared query (Principal) -> async Text;
    };

};
