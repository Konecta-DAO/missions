import { useIdentityKit } from '@nfid/identitykit/react';
import { ActorSubclass, Agent } from '@dfinity/agent';
import { useCallback, useMemo } from 'react';
import { SerializedMission, SerializedProgress, SerializedUser } from '../declarations/backend/backend.did.js';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { useGlobalID } from './globalID.tsx';

export const useFetchData = async (actor: ActorSubclass) => {
    const globalID = useGlobalID();
    // const actor = useMemo(() => {
    //     if (!agent) {
    //         console.error('E');
    //         return null;
    //     } else {
    //         console.log("Agent is available");
    //     }

    //     return Actor.createActor(idlFactory, {
    //         agent,
    //         canisterId,
    //     });
    // }, [agent]);

    // Fetch missions
    const fetchMissions = async (actor: ActorSubclass) => {
        const missions: SerializedMission[] = await actor.getAllMissions() as SerializedMission[];
        globalID.setMissions(missions);
        console.log("missions", missions);
    };

    // Fetch user progress
    const fetchUserProgress = async (actor: ActorSubclass, agent: Agent) => {
        const userProgress: [bigint, SerializedProgress][] = await actor.getUserProgress(agent.getPrincipal()) as [bigint, SerializedProgress][];
        globalID.setUserProgress(userProgress);
        console.log("userProgress", userProgress);
    };

    // Fetch user details
    const fetchUser = async (actor: ActorSubclass, agent: Agent) => {
        const user: SerializedUser[] = await actor.getUser(agent?.getPrincipal()) as SerializedUser[];
        if (agent) {
            globalID.setPrincipal(await agent.getPrincipal());
        }
        globalID.setUser(user);
        console.log("user", user);
    };

    // Fetch user seconds

    const fetchUserSeconds = async (actor: ActorSubclass, agent: Agent) => {
        const userSeconds: bigint = await actor.getTotalSecondsForUser(agent.getPrincipal()) as bigint;
        globalID.setTimerText(userSeconds.toString());
        console.log("userSeconds", userSeconds);
    };

    const fetchUserPFPstatus = async (actor: ActorSubclass, agent: Agent) => {
        const userPFPstatus: string = await actor.getPFPProgress(agent.getPrincipal()) as string;
        globalID.setPFPstatus(userPFPstatus);
        return userPFPstatus;
    };


    const fetchall = async (actor: ActorSubclass, agent: Agent) => {
        await fetchMissions(actor);
        await fetchUserProgress(actor, agent);
        await fetchUser(actor, agent);
        await fetchUserSeconds(actor, agent);
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
