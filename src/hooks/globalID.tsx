import { Principal } from '@dfinity/principal';
import React, { createContext, useState, useContext, useMemo } from 'react';
import { SerializedMission, SerializedProgress, SerializedUser, SerializedUserStreak } from '../declarations/backend/backend.did.js';
import { SerializedMission as SerializedMissionDefault, SerializedProgress as SerializedProgressDefault, SerializedUser as SerializedUserDefault } from '../declarations/nfid/nfid.did.js';
import { HttpAgent } from '@dfinity/agent';

export interface ProjectData {
    id: string;
    name: string;
    icon: string;
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
    userMap: { [key: string]: SerializedUserDefault[] | null };
    setUserForProject: (projectId: string, user: SerializedUserDefault[] | null) => void;
    userProgressMap: { [key: string]: Array<[bigint, SerializedProgressDefault]> | null };
    setUserProgressForProject: (projectId: string, progress: Array<[bigint, SerializedProgressDefault]> | null) => void;
    pointsMap: { [key: string]: bigint };
    setPointsForProject: (projectId: string, points: bigint) => void;
}

const GlobalID = createContext<GlobalIDType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [principalId, setPrincipal] = useState<Principal | null>(null);
    const [missions, setMissions] = useState<SerializedMission[]>([]);
    const [userProgress, setUserProgress] = useState<Array<[bigint, SerializedProgressDefault]> | null>([]);
    const [user, setUser] = useState<SerializedUser[] | null>([]);
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
    const [userMap, setUserMap] = useState<{ [key: string]: SerializedUserDefault[] | null }>({});
    const [userProgressMap, setUserProgressMap] = useState<{ [key: string]: Array<[bigint, SerializedProgressDefault]> | null }>({});
    const [pointsMap, setPointsMap] = useState<{ [key: string]: bigint }>({});

    const setMissionsForProject = (projectId: string, missions: SerializedMissionDefault[]) => {
        setMissionsMap((prev) => ({ ...prev, [projectId]: missions }));
    };

    const setUserForProject = (projectId: string, user: SerializedUserDefault[] | null) => {
        setUserMap((prev) => ({ ...prev, [projectId]: user }));
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
        userMap,
        setUserForProject,
        userProgressMap,
        setUserProgressForProject,
        pointsMap,
        setPointsForProject
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
        userMap,
        userProgressMap,
        pointsMap,
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
