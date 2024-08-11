import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { NFID } from '@nfid/embed';
import useSWRImmutable from 'swr/immutable';
import { Identity } from '@dfinity/agent';

const NFID_PROVIDER_URL = 'https://nfid.one'; // NFID provider URL
const targetCanisterIds = ['xtnc2-uaaaa-aaaab-qadaq-cai']; // Backend Canister ID

type ResponseType = Identity | { error: string } | null;

interface NFIDAuthProps {
    onSuccess: (principalId: string) => void;
}

const NFIDAuth: React.FC<NFIDAuthProps> = ({ onSuccess }) => {
    const [response, setResponse] = useState<ResponseType>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const nfidConfig = useMemo(() => ({
        origin: NFID_PROVIDER_URL,
        application: {
          name: 'Konectª Pre-Register',
          logo: 'https://dev.nfid.one/static/media/id.300eb72f3335b50f5653a7d6ad5467b3.svg',
        },
      }), []);
    
      // Initialize NFID using SWR
      const { data: nfid } = useSWRImmutable('nfid', () => NFID.init(nfidConfig));
    
      // Set initialization state when NFID is ready
      useEffect(() => {
        if (nfid) {
          setIsInitialized(true);
        }
      }, [nfid]);

    // Handle authentication
    const handleAuthenticate = useCallback(async () => {
        if (!nfid) return;

        try {
            const identity = await nfid.getDelegation(
                targetCanisterIds.length ? { targets: targetCanisterIds } : undefined
            );

            setResponse(identity);
            const principalId = identity.getPrincipal().toText();
            onSuccess(principalId);
        } catch (error) {
            setResponse({ error: (error as Error).message });
        }
    }, [nfid, onSuccess]);

    /* const handleUpdateDelegation = useCallback(async () => {
      if (!nfid) return;
        const identity = await nfid.updateGlobalDelegation({
        targets: targetCanisterIds,
        maxTimeToLive: BigInt(24 * 60 * 60 * 1000000000), // Optional: Set max time to live (e.g., 24 hours)
        derivationOrigin: NFID_PROVIDER_URL, // Optional: Set derivation origin
      });
      setResponse(identity);

    }, [nfid]); */

    return (
        <div>
            <button onClick={handleAuthenticate} disabled={!isInitialized}>Authenticate</button>
            <br />
        </div>
    );
};

export default NFIDAuth;