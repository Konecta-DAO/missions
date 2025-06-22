module Actor {

    public type Index = actor {
        getUUID : shared query (Principal) -> async Text;
    };

};
