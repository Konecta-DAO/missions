import React, { useEffect } from 'react';
import { Usergeek } from 'usergeek-ic-js';
import { useGlobalID } from '../hooks/globalID.tsx';
interface UsergeekProviderProps {
    children: React.ReactNode;
}

const UsergeekProvider: React.FC<UsergeekProviderProps> = ({ children }) => {
    const globalID = useGlobalID();

    useEffect(() => {
        if (globalID.principalId != null) {
            Usergeek.init({
                apiKey: "01430201F8439A7B36CA9DD48F411A95"
            });
            Usergeek.trackSession();
        } else {
            Usergeek.setPrincipal(undefined);
        };
    }, [globalID]);

    return <>{children}</>;
};

export default UsergeekProvider;
