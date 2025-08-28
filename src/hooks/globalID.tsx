// src/hooks/globalID.tsx

import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";
import type { Principal } from "@dfinity/principal";
import type { HttpAgent } from "@dfinity/agent";

// Keep WalletLinkInfo if its structure is stable and defined
// For now, assuming it's imported. If it also changes with NewTypes, it needs an update.
import type { WalletLinkInfo } from "./fetchData.tsx"; // Or its actual definition location
import { SerializedGlobalUser } from "../declarations/index/index.did.js";
import {
  SerializedMission,
  SerializedUserMissionProgress,
} from "../declarations/test_backend/test_backend.did.js";
import { SerializedProjectDetails } from "../frontend/types.ts";

export interface GlobalIDType {
  principalId: Principal | null;
  setPrincipal: (value: Principal | null) => void;
  agent: HttpAgent | null;
  setAgent: (agent: HttpAgent | null) => void;

  // Unified Project Data
  projects: SerializedProjectDetails[];
  setProjects: (projects: SerializedProjectDetails[]) => void;
  isLoadingProjects: boolean;
  setIsLoadingProjects: (loading: boolean) => void;

  // Unified Mission Data
  missions: Map<string, Map<bigint, SerializedMission>>; // Key: projectCanisterId.toText(), then missionId
  setMissionsForProject: (
    projectId: string,
    missionsForThisProject: Map<bigint, SerializedMission>
  ) => void;
  clearMissionsForProject: (projectId: string) => void;
  clearAllMissions: () => void;

  // Unified User Progress Data
  userProgress: Map<string, Map<bigint, SerializedUserMissionProgress>>; // Key: projectCanisterId.toText(), then missionId
  setUserProgressForMission: (
    projectId: string,
    missionId: bigint,
    progress: SerializedUserMissionProgress
  ) => void;
  clearUserProgressForMission: (projectId: string, missionId: bigint) => void;
  clearAllUserProgress: () => void;

  // Currently Selected/Viewed Project
  activeProjectCanisterId: string | null;
  setActiveProjectCanisterId: (id: string | null) => void;

  // Global User Profile
  userGlobalProfile: SerializedGlobalUser | null;
  setUserGlobalProfile: (profile: SerializedGlobalUser | null) => void;

  // Wallet Link Info
  walletLinkInfos: WalletLinkInfo[];
  setWalletLinkInfos: React.Dispatch<React.SetStateAction<WalletLinkInfo[]>>;

  // Streak related info (Assuming these are still global features)
  // TODO: Resolve 'any' for totalUserStreak and confirm source/relevance of streak data
  timerText: string; // Display for aggregated points/time
  setTimerText: (text: string) => void;
  userStreakAmount: bigint;
  setUserStreakAmount: (value: bigint) => void;
  userLastTimeStreak: bigint;
  setUserLastTimeStreak: (value: bigint) => void;
  streakResetTime: bigint;
  setStreakResetTime: (value: bigint) => void;
  totalUserStreak: any | null; // Placeholder - Needs proper type from NewTypes or backend
  setTotalUserStreak: (value: any | null) => void;
  userStreakPercentage: bigint;
  setUserStreakPercentage: (value: bigint) => void;
}

const initialState: GlobalIDType = {
  principalId: null,
  setPrincipal: () =>
    console.warn("setPrincipal called before GlobalProvider mounted"),
  agent: null,
  setAgent: () => console.warn("setAgent called before GlobalProvider mounted"),
  projects: [],
  setProjects: () =>
    console.warn("setProjects called before GlobalProvider mounted"),
  isLoadingProjects: true,
  setIsLoadingProjects: () =>
    console.warn("setIsLoadingProjects called before GlobalProvider mounted"),
  missions: new Map(),
  setMissionsForProject: () =>
    console.warn("setMissionsForProject called before GlobalProvider mounted"),
  clearMissionsForProject: () =>
    console.warn(
      "clearMissionsForProject called before GlobalProvider mounted"
    ),
  clearAllMissions: () =>
    console.warn("clearAllMissions called before GlobalProvider mounted"),
  userProgress: new Map(),
  setUserProgressForMission: () =>
    console.warn(
      "setUserProgressForMission called before GlobalProvider mounted"
    ),
  clearUserProgressForMission: () =>
    console.warn(
      "clearUserProgressForMission called before GlobalProvider mounted"
    ),
  clearAllUserProgress: () =>
    console.warn("clearAllUserProgress called before GlobalProvider mounted"),
  activeProjectCanisterId: null,
  setActiveProjectCanisterId: () =>
    console.warn(
      "setActiveProjectCanisterId called before GlobalProvider mounted"
    ),
  userGlobalProfile: null,
  setUserGlobalProfile: () =>
    console.warn("setUserGlobalProfile called before GlobalProvider mounted"),
  walletLinkInfos: [],
  setWalletLinkInfos: () =>
    console.warn("setWalletLinkInfos called before GlobalProvider mounted"),
  timerText: "00:00:00",
  setTimerText: () =>
    console.warn("setTimerText called before GlobalProvider mounted"),
  userStreakAmount: 0n,
  setUserStreakAmount: () =>
    console.warn("setUserStreakAmount called before GlobalProvider mounted"),
  userLastTimeStreak: 0n,
  setUserLastTimeStreak: () =>
    console.warn("setUserLastTimeStreak called before GlobalProvider mounted"),
  streakResetTime: 0n,
  setStreakResetTime: () =>
    console.warn("setStreakResetTime called before GlobalProvider mounted"),
  totalUserStreak: null,
  setTotalUserStreak: () =>
    console.warn("setTotalUserStreak called before GlobalProvider mounted"),
  userStreakPercentage: 0n,
  setUserStreakPercentage: () =>
    console.warn(
      "setUserStreakPercentage called before GlobalProvider mounted"
    ),
};

const GlobalID = createContext<GlobalIDType>(initialState);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [principalId, setPrincipal] = useState<Principal | null>(
    initialState.principalId
  );
  const [agent, setAgent] = useState<HttpAgent | null>(initialState.agent);
  const [projects, setProjects] = useState<SerializedProjectDetails[]>(
    initialState.projects
  );
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(
    initialState.isLoadingProjects
  );
  const [missions, setMissionsInternal] = useState<
    Map<string, Map<bigint, SerializedMission>>
  >(initialState.missions);
  const [userProgress, setUserProgressInternal] = useState<
    Map<string, Map<bigint, SerializedUserMissionProgress>>
  >(initialState.userProgress);
  const [activeProjectCanisterId, setActiveProjectCanisterId] = useState<
    string | null
  >(initialState.activeProjectCanisterId);
  const [userGlobalProfile, setUserGlobalProfile] =
    useState<SerializedGlobalUser | null>(initialState.userGlobalProfile);
  const [walletLinkInfos, setWalletLinkInfos] = useState<WalletLinkInfo[]>(
    initialState.walletLinkInfos
  );

  // Streak related state
  const [timerText, setTimerText] = useState<string>(initialState.timerText);
  const [userStreakAmount, setUserStreakAmount] = useState<bigint>(
    initialState.userStreakAmount
  );
  const [userLastTimeStreak, setUserLastTimeStreak] = useState<bigint>(
    initialState.userLastTimeStreak
  );
  const [streakResetTime, setStreakResetTime] = useState<bigint>(
    initialState.streakResetTime
  );
  const [totalUserStreak, setTotalUserStreak] = useState<bigint | null>(
    initialState.totalUserStreak
  );
  const [userStreakPercentage, setUserStreakPercentage] = useState<bigint>(
    initialState.userStreakPercentage
  );

  const setMissionsForProject = useCallback(
    (
      projectId: string,
      missionsForThisProject: Map<bigint, SerializedMission>
    ) => {
      setMissionsInternal((prev) =>
        new Map(prev).set(projectId, new Map(missionsForThisProject))
      ); // Ensure inner map is also new for deep immutability if needed
    },
    []
  );

  const clearMissionsForProject = useCallback((projectId: string) => {
    setMissionsInternal((prev) => {
      const newMap = new Map(prev);
      newMap.delete(projectId);
      return newMap;
    });
  }, []);

  const clearAllMissions = useCallback(() => {
    setMissionsInternal(new Map());
  }, []);

  const setUserProgressForMission = useCallback(
    (
      projectId: string,
      missionId: bigint,
      progress: SerializedUserMissionProgress
    ) => {
      setUserProgressInternal((prev) => {
        const newOuterMap = new Map(prev);
        const projectProgressMap = new Map(newOuterMap.get(projectId) || []); // Ensure project map exists
        projectProgressMap.set(missionId, progress);
        newOuterMap.set(projectId, projectProgressMap);
        return newOuterMap;
      });
    },
    []
  );

  const clearUserProgressForMission = useCallback(
    (projectId: string, missionId: bigint) => {
      setUserProgressInternal((prev) => {
        const newOuterMap = new Map(prev);
        const projectProgressMap = new Map(newOuterMap.get(projectId) || []);
        projectProgressMap.delete(missionId);
        if (projectProgressMap.size === 0) {
          newOuterMap.delete(projectId);
        } else {
          newOuterMap.set(projectId, projectProgressMap);
        }
        return newOuterMap;
      });
    },
    []
  );

  const clearAllUserProgress = useCallback(() => {
    setUserProgressInternal(new Map());
  }, []);

  const value = useMemo(
    () => ({
      principalId,
      setPrincipal,
      agent,
      setAgent,
      projects,
      setProjects,
      isLoadingProjects,
      setIsLoadingProjects,
      missions,
      setMissionsForProject,
      clearMissionsForProject,
      clearAllMissions,
      userProgress,
      setUserProgressForMission,
      clearUserProgressForMission,
      clearAllUserProgress,
      activeProjectCanisterId,
      setActiveProjectCanisterId,
      userGlobalProfile,
      setUserGlobalProfile,
      walletLinkInfos,
      setWalletLinkInfos,
      timerText,
      setTimerText,
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
    }),
    [
      principalId,
      agent,
      projects,
      isLoadingProjects,
      missions,
      userProgress,
      activeProjectCanisterId,
      userGlobalProfile,
      walletLinkInfos,
      timerText,
      userStreakAmount,
      userLastTimeStreak,
      streakResetTime,
      totalUserStreak,
      userStreakPercentage,
      // Setters are stable, but including them for completeness if needed or if not using useCallback for them
      setPrincipal,
      setAgent,
      setProjects,
      setIsLoadingProjects,
      setMissionsForProject,
      clearMissionsForProject,
      clearAllMissions,
      setUserProgressForMission,
      clearUserProgressForMission,
      clearAllUserProgress,
      setActiveProjectCanisterId,
      setUserGlobalProfile,
      setWalletLinkInfos,
      setTimerText,
      setUserStreakAmount,
      setUserLastTimeStreak,
      setStreakResetTime,
      setTotalUserStreak,
      setUserStreakPercentage,
    ]
  );

  return <GlobalID.Provider value={value}>{children}</GlobalID.Provider>;
};

export const useGlobalID = (): GlobalIDType => {
  const context = useContext(GlobalID);
  if (context === initialState || context === undefined) {
    // Check against initial/undefined more robustly
    throw new Error(
      "useGlobalID must be used within a GlobalProvider, or GlobalProvider is not yet fully initialized."
    );
  }
  return context;
};
