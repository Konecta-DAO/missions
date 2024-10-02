import React, { useEffect } from 'react';
import { Usergeek } from 'usergeek-ic-js';
import { useGlobalID } from '../hooks/globalID.tsx';
interface UsergeekProviderProps {
    children: React.ReactNode;

}
const usergeekApiKey = process.env.DEV_USERGEEK_API_KEY ?? '';


const UsergeekProvider: React.FC<UsergeekProviderProps> = ({ children }) => {
    const globalID = useGlobalID();

    useEffect(() => {
        if (globalID.principalId != null) {
            Usergeek.init({
                apiKey: usergeekApiKey,
            });
            Usergeek.setPrincipal(globalID.principalId)
            Usergeek.trackSession();
        } else {
            Usergeek.setPrincipal(undefined);
        };
    }, [globalID.principalId]);

    return <>{children}</>;
};

export default UsergeekProvider;