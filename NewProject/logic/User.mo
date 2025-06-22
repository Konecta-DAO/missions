import Config "../Configuration";
import Act "../ActorTypes"

module User {

    public func getUserUUID(user : Principal) : async Text {
        let indexActor : Act.Index = actor (Config.indexCanisterId);
        let userUUID = await indexActor.getUUID(user);
        return userUUID;
    }

};
