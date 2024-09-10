import { useGlobalID } from './globalID.tsx';
import { useIdentityKit } from '@nfid/identitykit/react';
import { Actor } from '@dfinity/agent';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { useMemo } from 'react';
import { useFetchData } from './fetchData.tsx';
import { Principal } from '@dfinity/principal';

export const useMissionAssistant = () => {
    const { agent } = useIdentityKit(); // Get the agent from IdentityKit
    const globalID = useGlobalID();

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

    const addNewUser = async (principalId: Principal) => {
        actor?.addUser(principalId);
    };

    const addTwitterInfo = async (twitterId: bigint, twitterHandle: string) => {
        actor?.addTwitterInfo(globalID.principalId, twitterId, twitterHandle);
        globalID.setTwitterHandle(twitterHandle);
        const fetchData = useFetchData();
        if (fetchData) {
            (await fetchData)?.fetchall();
        }
    };

    const setUserPFPLoading = async () => {
        actor?.setLoadingPFP();
        const fetchData = useFetchData();
        if (fetchData) {
            const data = await fetchData;
            if (data) {
              data.fetchall();
            }
        }
    };

    return {
        addTwitterInfo,
        setUserPFPLoading,
        addNewUser,
    };
};
