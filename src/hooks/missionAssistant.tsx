import { useGlobalID } from './globalID.tsx';
import { useIdentityKit } from '@nfid/identitykit/react';
import { Actor } from '@dfinity/agent';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { useMemo } from 'react';
import { useFetchData } from './fetchData.tsx';

export const useMissionAssistant = () => {
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

    const addTwitterInfo = async (twitterId: bigint, twitterHandle: string) => {
        actor?.addTwitterInfo(principalId, twitterId, twitterHandle);
        useGlobalID().setTwitterHandle(twitterHandle);
        useFetchData().fetchall();
    };

    const setUserPFPLoading = async () => {
        actor?.setLoadingPFP();
        useFetchData().fetchall();
    };

    return {
        addTwitterInfo,
        setUserPFPLoading,
    };
};
