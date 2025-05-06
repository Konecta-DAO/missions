import { Principal } from '@dfinity/principal';
import React, { createContext, useState, useContext, useMemo } from 'react';
import { SerializedMissionV2, SerializedProgress, SerializedUserStreak } from '../declarations/backend/backend.did.js';
import { SerializedMissionV2 as SerializedMissionDefault, SerializedProgress as SerializedProgressDefault } from '../declarations/oisy_backend/oisy_backend.did.js';
import { HttpAgent } from '@dfinity/agent';
import { SerializedGlobalUser } from '../declarations/index/index.did.js';
import { WalletLinkInfo } from './fetchData.tsx';

export interface ProjectData {
    id: string;
    name: string;
    icon: string;
}

export interface GlobalIDType {
    principalId: Principal | null;
    setPrincipal: (value: Principal) => void;
    missions: SerializedMissionV2[];
    setMissions: (missions: SerializedMissionV2[]) => void;
    userProgress: Array<[bigint, SerializedProgress]> | null;
    setUserProgress: (progress: Array<[bigint, SerializedProgress]> | null) => void;
    user: SerializedGlobalUser[] | null;
    setUser: (user: SerializedGlobalUser[]) => void;
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
    isOisy: boolean;
    setIsOisy: (value: boolean) => void;
    canisterIds: string[] | null;
    setCanisterIds: (canisterIds: string[]) => void;
    projects: ProjectData[];
    setProjects: React.Dispatch<React.SetStateAction<ProjectData[]>>;
    missionsMap: { [key: string]: SerializedMissionDefault[] };
    setMissionsForProject: (projectId: string, missions: SerializedMissionDefault[]) => void;
    userProgressMap: { [key: string]: Array<[bigint, SerializedProgressDefault]> | null };
    setUserProgressForProject: (projectId: string, progress: Array<[bigint, SerializedProgressDefault]> | null) => void;
    pointsMap: { [key: string]: bigint };
    setPointsForProject: (projectId: string, points: bigint) => void;
    walletLinkInfos: WalletLinkInfo[];
    setWalletLinkInfos: React.Dispatch<React.SetStateAction<WalletLinkInfo[]>>;
}

const GlobalID = createContext<GlobalIDType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [principalId, setPrincipal] = useState<Principal | null>(null);

    const [missions, setMissions] = useState<SerializedMissionV2[]>([]);
    const [userProgress, setUserProgress] = useState<Array<[bigint, SerializedProgressDefault]> | null>([]);
    const [user, setUser] = useState<SerializedGlobalUser[] | null>([]);
    const [timerText, setTimerText] = useState<string>('00:00:00');
    const [twitterhandle, setTwitterHandle] = useState<string | null>('');
    const [userPFPstatus, setPFPstatus] = useState<string>('');
    const [agent, setAgent] = useState<HttpAgent | null>(null);
    const [celebOverlay, setCelebOverlay] = useState<boolean>(false);
    const [userStreakAmount, setUserStreakAmount] = useState<bigint>(0n);
    const [userLastTimeStreak, setUserLastTimeStreak] = useState<bigint>(0n);
    const [streakResetTime, setStreakResetTime] = useState<bigint>(0n);
    const [totalUserStreak, setTotalUserStreak] = useState<SerializedUserStreak | null>(null);
    const [userStreakPercentage, setUserStreakPercentage] = useState<bigint>(0n);

    const [isOisy, setIsOisy] = useState<boolean>(false);
    const [canisterIds, setCanisterIds] = useState<string[] | null>([]);
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [missionsMap, setMissionsMap] = useState<{ [key: string]: SerializedMissionDefault[] }>({});
    const [userProgressMap, setUserProgressMap] = useState<{ [key: string]: Array<[bigint, SerializedProgressDefault]> | null }>({});
    const [pointsMap, setPointsMap] = useState<{ [key: string]: bigint }>({});

    const [walletLinkInfos, setWalletLinkInfos] = useState<WalletLinkInfo[]>([]);

    const setMissionsForProject = (projectId: string, missions: SerializedMissionDefault[]) => {
        setMissionsMap((prev) => ({ ...prev, [projectId]: missions }));
    };

    const setUserProgressForProject = (projectId: string, progress: Array<[bigint, SerializedProgressDefault]> | null) => {
        setUserProgressMap((prev) => ({ ...prev, [projectId]: progress }));
    };

    const setPointsForProject = (projectId: string, points: bigint) => {
        setPointsMap((prev) => ({ ...prev, [projectId]: points }));
    };

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
        isOisy,
        setIsOisy,
        canisterIds,
        setCanisterIds,
        projects,
        setProjects,
        missionsMap,
        setMissionsForProject,
        userProgressMap,
        setUserProgressForProject,
        pointsMap,
        setPointsForProject,
        walletLinkInfos,
        setWalletLinkInfos,
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
        userStreakAmount,
        userLastTimeStreak,
        streakResetTime,
        totalUserStreak,
        userStreakPercentage,
        isOisy,
        canisterIds,
        projects,
        missionsMap,
        userProgressMap,
        pointsMap,
        walletLinkInfos,
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
