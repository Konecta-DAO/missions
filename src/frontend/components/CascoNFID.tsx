import React, { useState, useEffect, useCallback } from 'react';
import { NFID } from '@nfid/embed';
import Casco from './Casco';

interface CascoNFIDProps {
    onIframeReady: () => void; // Callback to notify Home.tsx when the iframe is ready
    onPrincipalId: (principalId: string) => void; // Callback to pass the principalId to Home.tsx
}

const CascoNFID: React.FC<CascoNFIDProps> = ({ onIframeReady, onPrincipalId }) => {
    const [nfid, setNfid] = useState<any>(null);
    const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false);

    // Initialize NFID
    useEffect(() => {
        const initNFID = async () => {
            try {
                const nfidInstance = await NFID.init({
                    origin: 'https://nfid.one',
                    application: {
                        name: 'Konectª Pre-Register',
                        logo: 'https://dev.nfid.one/static/media/id.300eb72f3335b50f5653a7d6ad5467b3.svg',
                    },
                });

                console.log('NFID Initialized:', nfidInstance);
                setNfid(nfidInstance);

                // Polling to check if iframe is instantiated
                const checkIframeReady = setInterval(() => {
                    if (NFID.isIframeInstantiated) {
                        clearInterval(checkIframeReady);
                        setIsButtonEnabled(true);
                        onIframeReady();
                    }
                }, 100); // Polling every 100ms until iframe is ready
            } catch (error) {
                console.error('Error initializing NFID:', error);
            }
        };
        initNFID();
    }, []);

    // Handle authentication
    const handleAuthenticate = useCallback(async () => {
        if (!nfid || !NFID.isIframeInstantiated) {
            console.error('NFID iframe not instantiated yet');
            return;
        }
        try {
            const identity = await nfid.getDelegation({
                targets: ['onpqf-diaaa-aaaag-qkeda-cai'], // Backend Canister ID
            });
            const principalId = identity.getPrincipal().toText();
            console.log('Authenticated with principalId:', principalId);
            onPrincipalId(principalId);
            // Handle success (e.g., save or display principalId)
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    }, [nfid]);

    return (
        <div>
            <Casco onClick={handleAuthenticate} />
        </div>
    );
};

export default CascoNFID;
