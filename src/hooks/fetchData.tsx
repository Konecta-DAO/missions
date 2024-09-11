import { ActorSubclass } from '@dfinity/agent';
import { SerializedMission, SerializedProgress, SerializedUser } from '../declarations/backend/backend.did.js';
import { useGlobalID } from './globalID.tsx';
import { Principal } from '@dfinity/principal';
import { convertSecondsToHMS } from '../components/Utilities.tsx';
import { useState } from 'react'; // Add this line to import useState

export const FetchData = () => {
    const globalID = useGlobalID();

    // Fetch missions
    const fetchMissions = async (actor: ActorSubclass) => {
        const missions: SerializedMission[] = await actor.getAllMissions() as SerializedMission[];
        globalID.setMissions(missions);
    };

    // Fetch user progress
    const fetchUserProgress = async (actor: ActorSubclass, ae: Principal, agent: any) => {
        const userProgress: [bigint, SerializedProgress][] = await actor.getUserProgress(ae) as [bigint, SerializedProgress][];
        globalID.setUserProgress(userProgress);
    };

    // Fetch user details
    const fetchUser = async (actor: ActorSubclass, ae: Principal, agent: any) => {
        if (globalID.user !== null) {
            const user: SerializedUser[] = await actor.getUser(ae) as SerializedUser[];
            globalID.setPrincipal(ae);
            globalID.setUser(user);
        };
    };

    // Fetch user seconds

    const fetchUserSeconds = async (actor: ActorSubclass, ae: Principal, agent: any) => {
        const userSeconds: bigint = await actor.getTotalSecondsForUser(ae) as bigint;
        globalID.setTimerText(convertSecondsToHMS(Number(userSeconds)));
    };

    const fetchUserPFPstatus = async (actor: ActorSubclass, ae: Principal) => {
        const userPFPstatus: string = await actor.getPFPProgress(ae) as string;
        globalID.setPFPstatus(userPFPstatus);
        return userPFPstatus;
    };

    const fetchall = async (actor: ActorSubclass, ae: Principal, agent: any, setDataloaded: React.Dispatch<React.SetStateAction<boolean>>) => {

        await fetchMissions(actor);
        await fetchUserProgress(actor, ae, agent);
        await fetchUser(actor, ae, agent);
        await fetchUserSeconds(actor, ae, agent)
        setDataloaded(true);

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
