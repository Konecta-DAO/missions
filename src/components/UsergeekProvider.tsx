import React, { useEffect } from 'react';
import { Usergeek } from 'usergeek-ic-js';
import { useEncryption } from '../components/EncryptionProvider';

interface UsergeekProviderProps {
    children: React.ReactNode;
}

const UsergeekProvider: React.FC<UsergeekProviderProps> = ({ children }) => {
    const { identity } = useEncryption();

    useEffect(() => {
        // Initialize Usergeek with your API key
        Usergeek.init({
            apiKey: "01430201F8439A7B36CA9DD48F411A95"
        });

        // Set the user's principal and track session if the user is logged in and principalId is available
        if (identity) {
            Usergeek.setPrincipal(identity.getPrincipal());
            Usergeek.trackSession();
        }

        // Cleanup function to unset principal on logout or app unload
        return () => {
            if (!identity) {
                Usergeek.setPrincipal(undefined);
            }
        };
    }, [identity]);

    return <>{children}</>;
};

export default UsergeekProvider;
