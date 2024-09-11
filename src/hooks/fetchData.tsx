import { ActorSubclass } from '@dfinity/agent';
import { SerializedMission, SerializedProgress, SerializedUser } from '../declarations/backend/backend.did.js';
import { useGlobalID } from './globalID.tsx';
import { Principal } from '@dfinity/principal';

export const FetchData = () => {
    const globalID = useGlobalID();

    // Fetch missions
    const fetchMissions = async (actor: ActorSubclass) => {
        console.log("???1");
        const missions: SerializedMission[] = await actor.getAllMissions() as SerializedMission[];
        globalID.setMissions(missions);
        console.log("missions", missions);
    };

    // Fetch user progress
    const fetchUserProgress = async (actor: ActorSubclass, ae: Principal) => {
        console.log("???2");
        const userProgress: [bigint, SerializedProgress][] = await actor.getUserProgress(ae) as [bigint, SerializedProgress][];
        globalID.setUserProgress(userProgress);
        console.log("userProgress", userProgress);
    };

    // Fetch user details
    const fetchUser = async (actor: ActorSubclass, ae: Principal) => {
        console.log("???3");
        const user: SerializedUser[] = await actor.getUser(ae) as SerializedUser[];
        globalID.setPrincipal(await ae);
        globalID.setUser(user);
        console.log("user", user);
    };

    // Fetch user seconds

    const fetchUserSeconds = async (actor: ActorSubclass, ae: Principal) => {
        console.log("???4");
        const userSeconds: bigint = await actor.getTotalSecondsForUser(ae) as bigint;
        globalID.setTimerText(userSeconds.toString());
        console.log("userSeconds", userSeconds);
    };

    const fetchUserPFPstatus = async (actor: ActorSubclass, ae: Principal) => {
        const userPFPstatus: string = await actor.getPFPProgress(ae) as string;
        globalID.setPFPstatus(userPFPstatus);
        return userPFPstatus;
    };


    const fetchall = (actor: ActorSubclass, ae: Principal) => {
        console.log("???");
        fetchMissions(actor);
        fetchUserProgress(actor, ae);
        fetchUser(actor, ae);
        fetchUserSeconds(actor, ae);
    };

    return {
        fetchMissions,
        fetchUserProgress,
        fetchUser,
        fetchUserSeconds,
        fetchUserPFPstatus,
        fetchall,
    };
};
