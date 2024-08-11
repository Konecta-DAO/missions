import React, { useState, useCallback, useEffect } from 'react';
import { Identity } from '@dfinity/agent';

const targetCanisterIds = ['5vsfh-biaaa-aaaab-qac3a-cai']; // Backend Canister ID

type ResponseType = Identity | { error: string } | null;

interface NFIDAuthProps {
    onSuccess: (principalId: string) => void;
    showButton: boolean;
    nfid: any;
}

const NFIDAuth: React.FC<NFIDAuthProps> = ({ onSuccess, showButton, nfid }) => {
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        if (nfid) {
            setIsInitialized(true);
        }
    }, [nfid]);

    // Handle authentication
    const handleAuthenticate = useCallback(async () => {
        if (!nfid) return;
        const identity = await nfid.getDelegation(
            targetCanisterIds.length ? { targets: targetCanisterIds } : undefined
        );

        const principalId = identity.getPrincipal().toText();
        onSuccess(principalId);
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
            {showButton && (
                <button onClick={handleAuthenticate} disabled={!isInitialized}>Authenticate</button>
            )}
            <br />
        </div>
    );
};

export default NFIDAuth;