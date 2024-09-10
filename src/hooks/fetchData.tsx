import { useIdentityKit } from '@nfid/identitykit/react';
import { Actor } from '@dfinity/agent';
import { useCallback, useMemo } from 'react';
import { SerializedMission, SerializedProgress, SerializedUser } from '../declarations/backend/backend.did.js';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { useGlobalID } from './globalID.tsx';

export const useFetchData = () => {
    const { agent } = useIdentityKit(); // Get the agent from IdentityKit
    const { principalId } = useGlobalID();

    const actor = useMemo(() => {
        if (!agent) {
            console.error('No agent available, user might not be authenticated');
            return null; // Return null if no agent available
        }

        // Create the actor using the authenticated agent
        return Actor.createActor(idlFactory, {
            agent, // Use the authenticated agent from IdentityKit
            canisterId,
        });
    }, [agent]);

    // Fetch missions
    const fetchMissions = useCallback(async () => {
        const missions: SerializedMission[] = actor ? await actor.getMissions(principalId) as SerializedMission[] : [];
        useGlobalID().setMissions(missions);
    }, [actor]);

    // Fetch user progress
    const fetchUserProgress = useCallback(async () => {
        const userProgress: [bigint, SerializedProgress][] = actor ? await actor.getUserProgress(principalId) as [bigint, SerializedProgress][] : [];
        useGlobalID().setUserProgress(userProgress);
    }, [actor]);

    // Fetch user details
    const fetchUser = useCallback(async () => {
        const user: SerializedUser[] = actor ? await actor.getUserDetails(principalId) as SerializedUser[] : [];
        if (agent) {
            useGlobalID().setPrincipal(await agent.getPrincipal());
        }
        useGlobalID().setUser(user);
    }, [actor]);

    // Fetch user seconds

    const fetchUserSeconds = useCallback(async () => {
        const userSeconds: bigint = actor ? await actor.getUserSeconds(principalId) as bigint : 0n;
        useGlobalID().setTimerText(userSeconds.toString());
    }, [actor]);

    const fetchUserPFPstatus = useCallback(async () => {
        const userPFPstatus: string = actor ? await actor.getPFPProgress(principalId) as string : "";
        useGlobalID().setPFPstatus(userPFPstatus);
    }, [actor]);


    const fetchall = useCallback(async () => {
        await fetchMissions();
        await fetchUserProgress();
        await fetchUser();
        await fetchUserSeconds();
    }, [fetchMissions, fetchUserProgress, fetchUser, fetchUserSeconds]);

    return {
        fetchMissions,
        fetchUserProgress,
        fetchUser,
        fetchUserSeconds,
        fetchall,
        fetchUserPFPstatus
    };
};
