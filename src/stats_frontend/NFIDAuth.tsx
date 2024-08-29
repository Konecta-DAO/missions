import React, { useState, useCallback, useEffect } from 'react';

const targetCanisterIds = ['onpqf-diaaa-aaaag-qkeda-cai']; // Backend Canister ID to get Truster Origins on NFID

interface NFIDAuthProps {
    onSuccess: (principalId: string) => void;
    showButton: boolean;
    nfid: any;
    isInitialized: boolean; // Add this prop
}

const NFIDAuth: React.FC<NFIDAuthProps> = ({ onSuccess, showButton, nfid, isInitialized }) => {
    const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false);

    useEffect(() => {
        if (isInitialized) {
            setIsButtonEnabled(true);
        }
    }, [isInitialized]);

    // Handle authentication
    const handleAuthenticate = useCallback(async () => {
        if (!nfid) return;
        const identity = await nfid.getDelegation(
            targetCanisterIds.length ? { targets: targetCanisterIds } : undefined
        );

        const principalId = identity.getPrincipal().toText();
        onSuccess(principalId);
    }, [nfid, onSuccess]);

    return (
        <div>
            {showButton && (
                <button onClick={handleAuthenticate} disabled={!isButtonEnabled}>Authenticate</button>
            )}
            <br />
        </div>
    );
};

export default NFIDAuth;
