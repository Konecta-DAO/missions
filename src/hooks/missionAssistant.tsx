import { useGlobalID } from './globalID.tsx';
import { useIdentityKit } from '@nfid/identitykit/react';
import { Actor, ActorSubclass } from '@dfinity/agent';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { useMemo } from 'react';
import { FetchData } from './fetchData.tsx';
import { Principal } from '@dfinity/principal';
// Add the missing import statement

export const missionAssistant = () => {

    // const addTwitterInfo = async (twitterId: bigint, twitterHandle: string) => {
    //     const actor = Actor.createActor(idlFactory, {
    //         agent: agent!,
    //         canisterId,
    //     })
    //     actor.addTwitterInfo(globalID.principalId, twitterId, twitterHandle);
    //     globalID.setTwitterHandle(twitterHandle);
    //     const fetchData = useFetchData();
    //     if (fetchData && agent !== null) {
    //         (await fetchData)?.fetchall(actor, agent);
    //     }
    // };

    // const setUserPFPLoading = async () => {
    //     const actor = Actor.createActor(idlFactory, {
    //         agent: agent!,
    //         canisterId,
    //     })
    //     actor.setLoadingPFP();
    //     const fetchData = useFetchData();
    //     if (fetchData) {
    //         const data = await fetchData;
    //         if (data && agent !== null) {
    //             data.fetchall(actor, agent);
    //         }
    //     }
    // };

    return {
        // addTwitterInfo,
        // setUserPFPLoading,
    };
};
