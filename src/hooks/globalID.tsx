import { Principal } from '@dfinity/principal';
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { SerializedMission, SerializedProgress, SerializedUser, SerializedUserStreak } from '../declarations/backend/backend.did.js';
import { SerializedMission as SerializedMissionNFID, SerializedProgress as SerializedProgressNFID, SerializedUser as SerializedUserNFID } from '../declarations/nfid/nfid.did.js';
import { HttpAgent } from '@dfinity/agent';

export enum MissionPage {
    MAIN = 'main',
    NFID = 'nfid',
    DFINITY = 'dfinity',
}

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
    agent: HttpAgent | null;
    setAgent: (agent: HttpAgent) => void;
    celebOverlay: boolean;
    setCelebOverlay: (value: boolean) => void;
    ocS: string;
    setocS: (text: string) => void;
    userStreakAmount: bigint;
    setUserStreakAmount: (value: bigint) => void;
    userLastTimeStreak: bigint;
    setUserLastTimeStreak: (value: bigint) => void;
    streakResetTime: bigint;
    setStreakResetTime: (value: bigint) => void;
    totalUserStreak: SerializedUserStreak | null;
    setTotalUserStreak: (value: SerializedUserStreak | null) => void;
    userStreakPercentage: bigint;
    setUserStreakPercentage: (value: bigint) => void;
    currentMissionPage: MissionPage;
    setCurrentMissionPage: (page: MissionPage) => void;
    previousMissionPage: MissionPage;
    setPreviousMissionPage: (page: MissionPage) => void;
    missionsnfid: SerializedMissionNFID[];
    setMissionsnfid: (missions: SerializedMissionNFID[]) => void;
    userProgressnfid: Array<[bigint, SerializedProgressNFID]> | null;
    setUserProgressnfid: (progress: Array<[bigint, SerializedProgressNFID]> | null) => void;
    usernfid: SerializedUserNFID[] | null;
    setUsernfid: (user: SerializedUserNFID[]) => void;
    pointsnfid: bigint;
    setPointsnfid: (value: bigint) => void;
    missionsdfinity: SerializedMissionNFID[];
    setMissionsdfinity: (missions: SerializedMissionNFID[]) => void;
    userProgressdfinity: Array<[bigint, SerializedProgressNFID]> | null;
    setUserProgressdfinity: (progress: Array<[bigint, SerializedProgressNFID]> | null) => void;
    userdfinity: SerializedUserNFID[] | null;
    setUserdfinity: (user: SerializedUserNFID[]) => void;
    pointsdfinity: bigint;
    setPointsdfinity: (value: bigint) => void;
}

const GlobalID = createContext<GlobalIDType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [principalId, setPrincipal] = useState<Principal | null>(null);
    const [missions, setMissions] = useState<SerializedMission[]>([]);
    const [userProgress, setUserProgress] = useState<Array<[bigint, SerializedProgress]> | null>([]);
    const [user, setUser] = useState<SerializedUser[] | null>([]);
    const [timerText, setTimerText] = useState<string>('00:00:00');
    const [twitterhandle, setTwitterHandle] = useState<string | null>('');
    const [userPFPstatus, setPFPstatus] = useState<string>('');
    const [agent, setAgent] = useState<HttpAgent | null>(null);
    const [celebOverlay, setCelebOverlay] = useState<boolean>(false);
    const [ocS, setocS] = useState<string>('');
    const [userStreakAmount, setUserStreakAmount] = useState<bigint>(0n);
    const [userLastTimeStreak, setUserLastTimeStreak] = useState<bigint>(0n);
    const [streakResetTime, setStreakResetTime] = useState<bigint>(0n);
    const [totalUserStreak, setTotalUserStreak] = useState<SerializedUserStreak | null>(null);
    const [userStreakPercentage, setUserStreakPercentage] = useState<bigint>(0n);

    const [currentMissionPage, setCurrentMissionPage] = useState<MissionPage>(() => {
        const storedPage = localStorage.getItem('currentMissionPage');
        return storedPage as MissionPage || MissionPage.MAIN;
    });

    const [previousMissionPage, setPreviousMissionPage] = useState<MissionPage>(() => {
        const storedPreviousPage = localStorage.getItem('previousMissionPage');
        return (storedPreviousPage as MissionPage) || MissionPage.MAIN;
    });

    useEffect(() => {
        try {
            localStorage.setItem('currentMissionPage', currentMissionPage);
        } catch (error) {
            console.error('Failed to set currentMissionPage in localStorage:', error);
        }
    }, [currentMissionPage]);

    const handleSetCurrentMissionPage = (page: MissionPage) => {
        setPreviousMissionPage(currentMissionPage);
        setCurrentMissionPage(page);
    };

    const [missionsnfid, setMissionsnfid] = useState<SerializedMissionNFID[]>([]);
    const [userProgressnfid, setUserProgressnfid] = useState<Array<[bigint, SerializedProgressNFID]> | null>([]);
    const [usernfid, setUsernfid] = useState<SerializedUserNFID[] | null>([]);
    const [pointsnfid, setPointsnfid] = useState<bigint>(0n);
    const [missionsdfinity, setMissionsdfinity] = useState<SerializedMissionNFID[]>([]);
    const [userProgressdfinity, setUserProgressdfinity] = useState<Array<[bigint, SerializedProgressNFID]> | null>([]);
    const [userdfinity, setUserdfinity] = useState<SerializedUserNFID[] | null>([]);
    const [pointsdfinity, setPointsdfinity] = useState<bigint>(0n);

    const value = useMemo(() => ({
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
        agent,
        setAgent,
        celebOverlay,
        setCelebOverlay,
        ocS,
        setocS,
        userStreakAmount,
        setUserStreakAmount,
        userLastTimeStreak,
        setUserLastTimeStreak,
        streakResetTime,
        setStreakResetTime,
        totalUserStreak,
        setTotalUserStreak,
        userStreakPercentage,
        setUserStreakPercentage,
        currentMissionPage,
        setCurrentMissionPage: handleSetCurrentMissionPage,
        previousMissionPage,
        setPreviousMissionPage,
        missionsnfid,
        setMissionsnfid,
        userProgressnfid,
        setUserProgressnfid,
        usernfid,
        setUsernfid,
        pointsnfid,
        setPointsnfid,
        missionsdfinity,
        setMissionsdfinity,
        userProgressdfinity,
        setUserProgressdfinity,
        userdfinity,
        setUserdfinity,
        pointsdfinity,
        setPointsdfinity
    }), [
        principalId,
        missions,
        userProgress,
        user,
        timerText,
        twitterhandle,
        userPFPstatus,
        agent,
        celebOverlay,
        ocS,
        userStreakAmount,
        userLastTimeStreak,
        streakResetTime,
        totalUserStreak,
        userStreakPercentage,
        currentMissionPage,
        previousMissionPage,
        missionsnfid,
        userProgressnfid,
        usernfid,
        pointsnfid,
        missionsdfinity,
        userProgressdfinity,
        userdfinity,
        pointsdfinity
    ]);

    return (
        <GlobalID.Provider value={value}>
            {children}
        </GlobalID.Provider>
    );
};



export const useGlobalID = () => {

    const context = useContext(GlobalID);
    if (!context) {
        throw new Error('useGlobalID must be used within a GlobalProvider');
    }
    return context;
};
