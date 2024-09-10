import { Principal } from '@dfinity/principal';
import React, { createContext, useState, useContext } from 'react';
import { SerializedMission, SerializedProgress, SerializedUser } from '../declarations/backend/backend.did.js';

interface GlobalIDType {
    principalId: Principal | null;
    setPrincipal: (value: Principal) => void;
    missions: SerializedMission[];
    setMissions: (missions: SerializedMission[]) => void;
    userProgress: Array<[bigint, SerializedProgress]> | null;
    setUserProgress: (progress: Array<[bigint, SerializedProgress]> | null) => void;
    user: SerializedUser[] | null;
    setUser: (user: SerializedUser[]) => void;
    timerText: string;
    setTimerText: (text: string) => void;
    twitterhandle: string | null;
    setTwitterHandle: (handle: string) => void;
    userPFPstatus: string;
    setPFPstatus: (status: string) => void;
}

const GlobalID = createContext<GlobalIDType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log('GlobalProvider');
    const [principalId, setPrincipal] = useState<Principal | null>(null);
    const [missions, setMissions] = useState<SerializedMission[]>([]);
    const [userProgress, setUserProgress] = useState<Array<[bigint, SerializedProgress]> | null>(null);
    const [user, setUser] = useState<SerializedUser[] | null>(null);
    const [timerText, setTimerText] = useState<string>('00:00:00');
    const [twitterhandle, setTwitterHandle] = useState<string | null>(null);
    const [userPFPstatus, setPFPstatus] = useState<string>('');

    console.log('Providing GlobalID context:', {
        principalId,
        missions,
        userProgress,
        user,
        timerText,
        twitterhandle,
        userPFPstatus,
    });



    return (
        <GlobalID.Provider
            value={{
                principalId,
                setPrincipal,
                missions,
                setMissions,
                userProgress,
                setUserProgress,
                user,
                setUser,
                timerText,
                setTimerText,
                twitterhandle,
                setTwitterHandle,
                userPFPstatus,
                setPFPstatus,
            }}
        >
            {children}
        </GlobalID.Provider>
    );
};



export const useGlobalID = () => {

    const context = useContext(GlobalID);
    console.log('GlobalID Context:', context);
    if (!context) {
        throw new Error('useGlobalID must be used within a GlobalProvider');
    }
    return context;
};
