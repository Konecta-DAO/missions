import { useCallback } from "react";
import { Actor, ActorSubclass } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

import { useGlobalID } from "./globalID.tsx";
import {
  idlFactory as indexIdlFactory,
  canisterId as indexCanisterIdString,
} from "../declarations/index/index.js";
import {
  idlFactory as projectBackendIdlFactory,
  SerializedMission,
} from "../declarations/test_backend/test_backend.did.js";
import {
  idlFactory as backendIdlFactory,
} from "../declarations/backend/backend.did.js";
import {
  canisterId as backendCanisterIdString
} from "../declarations/backend/index.js";
import {
  LinkRequest,
  SerializedGlobalUser,
} from "../declarations/index/index.did.js";
import {
  SerializedUserMissionProgress,
  SerializedProjectDetails as BackendSerializedProjectDetails,
  ActionResultFromActions,
  Result_1,
  Result_2,
  Result_5,
} from "../declarations/test_backend/test_backend.did.js";
import { SerializedProjectDetails } from "../frontend/types.ts";

export interface WalletLinkInfo {
  walletType: string;
  linkedPrincipal?: string;
  pendingRequest?: { requester: string; requesterType: string };
  cooldown: number;
  inputValue: string;
}

const useFetchData = () => {
  const {
    agent,
    projects, // Get current projects to update the list
    setProjects,
    setIsLoadingProjects, // You might want a specific loading state for single project view
    // ... other setters from useGlobalID
    setMissionsForProject,
    setUserProgressForMission,
    setUserGlobalProfile,
    setWalletLinkInfos,
    setStreakResetTime,
    setUserStreakAmount,
    setUserStreakPercentage,
    setUserLastTimeStreak,
  } = useGlobalID();

  const getIndexActor = useCallback((): ActorSubclass | null => {
    if (!agent) {
      console.error("Agent not initialized in getIndexActor");
      return null;
    }
    return Actor.createActor(indexIdlFactory, {
      agent,
      canisterId: indexCanisterIdString,
    });
  }, [agent]);

  const getProjectBackendActor = useCallback(
    (projectCanisterId: string | Principal): ActorSubclass | null => {
      if (!agent) {
        console.error("Agent not initialized in getProjectBackendActor");
        return null;
      }
      if (!projectCanisterId) {
        console.error(
          "Project canister ID is missing in getProjectBackendActor"
        );
        return null;
      }
      return Actor.createActor(projectBackendIdlFactory, {
        agent,
        canisterId: projectCanisterId,
      });
    },
    [agent]
  );

  const getBackendActor = useCallback(
    (backendCanisterId: string | Principal): ActorSubclass | null => {
      if (!agent) {
        console.error("Agent not initialized in getBackendActor");
        return null;
      }
      if (!backendCanisterId) {
        console.error(
          "Backend canister ID is missing in getBackendActor"
        );
        return null;
      }
      return Actor.createActor(backendIdlFactory, {
        agent,
        canisterId: backendCanisterId,
      });
    },
    [agent]
  );

  // --- PROJECT DATA FETCHING ---
  const fetchAllProjectDetailsAndSet = useCallback(async () => {
    const indexActor = getIndexActor();
    if (!indexActor) {
      setIsLoadingProjects(false); // Ensure loading state is reset
      return;
    }

    setIsLoadingProjects(true);
    try {
      const projectPrincipals = (await indexActor.getProjects()) as Principal[];

      if (!projectPrincipals || projectPrincipals.length === 0) {
        setProjects([]);
        setIsLoadingProjects(false);
        return;
      }
      projectPrincipals.forEach((p) =>
        console.log("Principal to process:", p.toText())
      );

      const projectDetailsPromises = projectPrincipals.map(
        async (principal) => {
          const projectActor = getProjectBackendActor(principal);
          if (!projectActor) {
            console.error(
              `WorkspaceAllProjectDetailsAndSet: Could not create projectActor for ${principal.toText()}`
            );
            return null;
          }
          try {
            const details =
              (await projectActor.getProjectDetails()) as BackendSerializedProjectDetails;
            if (!details) {
              return null;
            }
            return {
              ...details,
              canisterId: principal.toText(),
            } as SerializedProjectDetails;
          } catch (e) {
            console.error(
              `WorkspaceAllProjectDetailsAndSet: Failed to fetch details for project ${principal.toText()}:`,
              e
            );
            return null;
          }
        }
      );

      const settledResults = await Promise.allSettled(projectDetailsPromises);
      const successfullyFetchedDetails: SerializedProjectDetails[] = [];
      settledResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          if (result.value.isVisible) {
            // Client-side filter
            successfullyFetchedDetails.push(result.value);
          }
        } else if (result.status === "rejected") {
          console.error(
            "fetchAllProjectDetailsAndSet: A project detail fetch promise was rejected:",
            result.reason
          );
        } else if (result.status === "fulfilled" && !result.value) {
          console.warn(
            "fetchAllProjectDetailsAndSet: A project detail fetch promise was fulfilled but returned null."
          );
        }
      });

      setProjects(successfullyFetchedDetails);
    } catch (error) {
      console.error(
        "Error in fetchAllProjectDetailsAndSet (authenticated call):",
        error
      );
      setProjects([]); // Clear projects on error
    } finally {
      setIsLoadingProjects(false);
    }
  }, [
    agent,
    getIndexActor,
    getProjectBackendActor,
    setProjects,
    setIsLoadingProjects,
  ]);

  // --- NEW FUNCTION TO FETCH SINGLE PROJECT DETAILS ---
  const fetchSingleProjectDetailsAndSet = useCallback(
    async (
      projectCanisterId: string
    ): Promise<SerializedProjectDetails | null> => {
      console.log(
        `WorkspaceSingleProjectDetailsAndSet: Called for ${projectCanisterId}`
      );
      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) {
        console.error(
          `WorkspaceSingleProjectDetailsAndSet: Could not create projectActor for ${projectCanisterId}`
        );
        return null;
      }

      try {
        const details =
          (await projectActor.getProjectDetails()) as BackendSerializedProjectDetails;
        if (!details) {
          console.warn(
            `WorkspaceSingleProjectDetailsAndSet: Details for ${projectCanisterId} are null/undefined from backend.`
          );
          return null;
        }

        const projectDataWithId = {
          ...details,
          canisterId: projectCanisterId,
        } as SerializedProjectDetails;

        // Compute the new projects array based on the current 'projects' state
        // 'projects' is from the useGlobalID() hook and is in the dependency array of this useCallback
        const currentProjects = projects;
        const existingProjectIndex = currentProjects.findIndex(
          (p) => p.canisterId === projectCanisterId
        );

        let newProjectsArray: SerializedProjectDetails[];

        if (existingProjectIndex !== -1) {
          // Update existing project
          newProjectsArray = [...currentProjects];
          newProjectsArray[existingProjectIndex] = projectDataWithId;
        } else {
          // Add new project to the list
          newProjectsArray = [...currentProjects, projectDataWithId];
        }

        // Call setProjects with the directly computed new array
        setProjects(newProjectsArray);

        console.log(
          `WorkspaceSingleProjectDetailsAndSet: Successfully fetched and updated/added project ${projectCanisterId}`
        );
        return projectDataWithId;
      } catch (e) {
        console.error(
          `WorkspaceSingleProjectDetailsAndSet: Failed to fetch details for project ${projectCanisterId}:`,
          e
        );
        return null;
      }
    },
    [agent, getProjectBackendActor, setProjects, projects]
  );

  // --- MISSION DATA FETCHING ---
  const fetchMissionsForProjectAndSet = useCallback(
    async (projectCanisterId: string) => {
      if (!projectCanisterId) return;
      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) return;

      try {
        // VERIFY: Method name and return type from ProjectBackendActorInterface
        const missionsResult = (await projectActor.getAllMissions()) as Array<
          [bigint, SerializedMission]
        >;

        const missionsMap = new Map<bigint, SerializedMission>();
        if (missionsResult) {
          // Ensure missionsResult is not null/undefined
          missionsResult.forEach(([id, mission]) => {
            missionsMap.set(id, mission);
          });
        }
        setMissionsForProject(projectCanisterId, missionsMap);
      } catch (error) {
        console.error(
          `Error fetching missions for project ${projectCanisterId}:`,
          error
        );
      }
    },
    [getProjectBackendActor, setMissionsForProject]
  );

  // --- USER PROGRESS FETCHING ---
  const fetchUserProgressForProjectAndSet = useCallback(
    async (projectCanisterId: string, userPrincipal: Principal) => {
      if (!projectCanisterId || !userPrincipal) return;
      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) return;

      try {
        // VERIFY: Method name, parameters, and return type from ProjectBackendActorInterface
        // Assuming it returns an optional array: `[] | [Array<[bigint, SerializedUserMissionProgress]>]`
        const progressResultOpt =
          (await projectActor.getAllUserMissionsProgress(userPrincipal)) as [
            Array<[bigint, SerializedUserMissionProgress]>
          ];

        if (progressResultOpt && progressResultOpt.length > 0) {
          const progressArray = progressResultOpt[0];
          progressArray.forEach(([missionId, progress]) => {
            setUserProgressForMission(projectCanisterId, missionId, progress);
          });
        } else {
          // No progress for this project, or an empty array was returned.
          // Clear any existing progress for this project for this user.
          // This requires knowing which missions *had* progress to clear them individually,
          // or a function in useGlobalID to clear all progress for a project.
          // For simplicity, if there's a `clearMissionsForProject` like function for progress:
          // useGlobalID().clearUserProgressForProject(projectCanisterId); // Assuming such a function
          // Or iterate through known missions for the project and clear progress for each.
          // For now, we're only adding/updating progress.
          const currentProjectProgress =
            useGlobalID().userProgress.get(projectCanisterId);
          if (currentProjectProgress && currentProjectProgress.size > 0) {
            // If you want to clear, you'd iterate and call clearUserProgressForMission, or add a bulk clear.
            // For now, if backend says "no progress", we ensure no stale progress is shown by effectively replacing it.
            // The current setUserProgressForMission will overwrite individual entries. If the backend sends empty, nothing gets overwritten with new data.
            // A robust way is to clear prior progress for this project before setting new, or have the backend guarantee full state.
            // Let's assume if progressResultOpt is empty, we should clear out the existing progress map for this project.
            const emptyProgressMap = new Map<
              bigint,
              SerializedUserMissionProgress
            >();
            // If useGlobalID had `setUserProgressForEntireProject(projectId, map)`, that would be cleaner here.
            // For now, if the backend returns nothing, no new calls to setUserProgressForMission occur.
            // The `clearAllUserProgressForProject(projectId)` might be a good addition to global state.
          }
        }
      } catch (error) {
        console.error(
          `Error fetching user progress for project ${projectCanisterId}:`,
          error
        );
      }
    },
    [getProjectBackendActor, setUserProgressForMission, useGlobalID]
  ); // Added useGlobalID for state access example

  const fetchUserMissionProgressAndSet = useCallback(
    async (
      projectCanisterId: string,
      missionId: bigint,
      userPrincipal: Principal
    ): Promise<SerializedUserMissionProgress | null> => {
      // Explicitly define return type
      if (!projectCanisterId || !missionId || !userPrincipal) {
        console.warn("fetchUserMissionProgressAndSet: Missing parameters.");
        return null; // Return null if parameters are missing
      }
      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) {
        console.error(
          "fetchUserMissionProgressAndSet: Could not create projectActor."
        );
        return null; // Return null if actor creation fails
      }

      try {
        // Assuming backend returns: [] for None (not found), or [SerializedUserMissionProgress] for Some (found)
        const progressResultArray = (await projectActor.getUserMissionProgress(
          userPrincipal,
          missionId
        )) as SerializedUserMissionProgress[];

        if (progressResultArray && progressResultArray.length > 0) {
          const progress = progressResultArray[0];
          setUserProgressForMission(projectCanisterId, missionId, progress);
          return progress; // <-- Return the fetched progress
        } else {
          // No progress for this specific mission.
          // You might want to explicitly clear it from global state if that's the desired behavior
          // e.g., useGlobalID().clearUserProgressForMission(projectCanisterId, missionId);
          return null; // <-- Return null if no progress is found
        }
      } catch (error) {
        console.error(
          `Error fetching user progress for mission ${missionId.toString()} in project ${projectCanisterId}:`,
          error
        );
        return null; // <-- Return null on error
      }
    },
    [getProjectBackendActor, setUserProgressForMission]
  );

  // --- MISSION INTERACTION ---
  const executeBackendActionStep = useCallback(
    async (
      projectCanisterId: string,
      missionId: bigint,
      stepIdToExecute: bigint,
      userInputJson: string,
      userPrincipal: Principal
    ): Promise<ActionResultFromActions | null> => {
      if (!projectCanisterId || !userPrincipal) {
        console.error(
          "Missing projectCanisterId or userPrincipal for executeBackendActionStep"
        );
        return null;
      }
      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) return null;

      try {
        console.log(
          "Executing backend action step with the following parameters:",
          {
            projectCanisterId,
            missionId,
            stepIdToExecute,
            userInputJson,
            userPrincipal,
          }
        );

        // VERIFY: Method name and parameters from ProjectBackendActorInterface
        const result = (await projectActor.executeActionStep(
          missionId,
          stepIdToExecute,
          userInputJson,
          userPrincipal
        )) as Result_5;

        console.log("executeBackendActionStep result:", result);

        if ("ok" in result) {
          const actionResult = result.ok;
          // After a successful action, re-fetch the progress for this specific mission to update the UI
          await fetchUserMissionProgressAndSet(
            projectCanisterId,
            missionId,
            userPrincipal
          );
          return actionResult;
        } else {
          console.error("Error executing action step:", result.err);
          return null;
        }
      } catch (error) {
        console.error("Network or other error executing action step:", error);
        // throw error;
        return null;
      }
    },
    [getProjectBackendActor, fetchUserMissionProgressAndSet]
  );

  const startBackendMission = useCallback(
    async (
      projectCanisterId: string,
      missionId: bigint,
      userPrincipal: Principal
    ): Promise<SerializedUserMissionProgress | null> => {
      if (!projectCanisterId || !userPrincipal) return null;
      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) return null;

      try {
        // VERIFY: Method name and parameters (startMission likely takes missionId, userPrincipal is implicit msg.caller on backend)
        const result = (await projectActor.startMission(missionId)) as Result_2;

        if ("ok" in result) {
          const progress = result.ok;
          setUserProgressForMission(projectCanisterId, missionId, progress);
          return progress;
        } else {
          console.error("Error starting mission:", result.err);
          return null;
        }
      } catch (error) {
        console.error("Network or other error starting mission:", error);
        return null;
      }
    },
    [getProjectBackendActor, setUserProgressForMission]
  );

  // --- USER GLOBAL PROFILE ---
  const fetchUserGlobalProfileAndSet = useCallback(
    async (userPrincipal: Principal) => {
      if (!userPrincipal) return;
      const indexActor = getIndexActor();
      if (!indexActor) return;

      try {
        // VERIFY: Method name and return type from IndexCanisterActorInterface
        // Assuming getUserProfileByPrincipal or similar, returning an optional or array with one element
        const profileResult = (await indexActor.getUserByPrincipal(
          userPrincipal
        )) as [SerializedGlobalUser];

        if (profileResult && profileResult.length > 0) {
          setUserGlobalProfile(profileResult[0]);
        } else {
          setUserGlobalProfile(null);
        }
      } catch (error) {
        console.error(
          `Error fetching global user profile for principal ${userPrincipal.toText()}:`,
          error
        );
        setUserGlobalProfile(null);
      }
    },
    [getIndexActor, setUserGlobalProfile]
  );

  // --- FETCH WALLET LINK INFO (Example adaptation - VERIFY IndexCanister methods) ---
  const fetchWalletLinkInfoAndSet = useCallback(
    async (userPrincipal: Principal) => {
      if (!userPrincipal) return;
      const indexActor = getIndexActor();
      if (!indexActor) return;

      try {
        const signerIdForBackend = "ic"; // Or however this is determined
        const allowedTypes =
          (await indexActor.getAllowedAccountTypes()) as string[]; // VERIFY
        const walletTypesToFetch = allowedTypes.filter(
          (type) => type !== signerIdForBackend
        );

        const [linkedAccountsResult, pendingRequestsResult] = await Promise.all(
          [
            indexActor.getLinkedAccountsForPrincipal(userPrincipal) as Promise<
              Array<[string, Principal]>
            >, // VERIFY
            indexActor.getPendingLinkRequestsForTarget(
              userPrincipal
            ) as Promise<LinkRequest[]>, // VERIFY, define LinkRequest
          ]
        );

        const linkedMap: { [key: string]: string } = {};
        if (linkedAccountsResult)
          linkedAccountsResult.forEach(([type, principal]) => {
            linkedMap[type] = principal.toText();
          });

        const pendingMap: {
          [key: string]: { requester: string; requesterType: string };
        } = {};
        if (pendingRequestsResult)
          pendingRequestsResult.forEach((req: any) => {
            // Replace 'any' with actual LinkRequest type
            if (req.status === "pending") {
              pendingMap[req.requesterType] = {
                requester: req.requester.toText(),
                requesterType: req.requesterType,
              };
            }
          });

        const cooldownPromises = walletTypesToFetch.map(async (walletType) => {
          const cooldownBigInt: bigint =
            (await indexActor.getLinkCooldownForPrincipal(
              userPrincipal,
              walletType
            )) as bigint; // VERIFY
          return {
            walletType,
            linkedPrincipal: linkedMap[walletType],
            pendingRequest: pendingMap[walletType],
            cooldown: Number(cooldownBigInt),
            inputValue: "",
          } as WalletLinkInfo;
        });

        const walletInfos = await Promise.all(cooldownPromises);
        setWalletLinkInfos(walletInfos);
      } catch (error) {
        console.error("Error fetching wallet link info:", error);
        setWalletLinkInfos([]);
      }
    },
    [getIndexActor, setWalletLinkInfos]
  );

  // --- FETCH DAILY STREAK INFORMATION ---
  const fetchDailyStreakInfoAndSet = useCallback(
    async (userPrincipal: Principal) => {
      if (!userPrincipal) {
        console.error("User Principal is invalid");
        return;
      };
      if (!backendCanisterIdString) {
        console.error("Backend Canister ID is invalid");
        return;
      };
      const backendActor = getBackendActor(backendCanisterIdString);
      if (!backendActor) {
        console.error("Backend Actor is null");
        return;
      };

      // User Streak Amount
      try {
        const userStreakAmount = await backendActor.getUserStreakAmount(userPrincipal) as bigint;
        setUserStreakAmount(userStreakAmount);
      } catch (error) {
        console.error("Error fetching user streak amount:", error);
        setUserStreakAmount(0n);
      }

      // Streak Reset Time
      /*
      try {
        const streakResetTime = await backendActor.getStreakResetTime() as bigint;
        setStreakResetTime(streakResetTime);
      } catch (error) {
        console.error("Error fetching streak reset time:", error);
        setStreakResetTime(0n);
      }
      */

      // User Last Time Streak
      try {
        const userLastTimeStreak = await backendActor.getUserAllStreak(userPrincipal) as [bigint, bigint][];
        setUserLastTimeStreak(userLastTimeStreak[0][0]);
      } catch (error) {
        console.error("Error fetching user last time streak info:", error);
        setUserLastTimeStreak(0n);
      }

      // User Streak Percentage
      try {
        const userStreakPercentage = await backendActor.getUserStreakPercentage(userPrincipal) as bigint;
        setUserStreakPercentage(userStreakPercentage);
      } catch (error) {
        console.error("Error fetching user streak percentage:", error);
        setUserStreakPercentage(0n);
      }
    },
    [getBackendActor, setUserStreakAmount, setStreakResetTime, setUserLastTimeStreak, setUserStreakPercentage]
  );

  // --- MASTER FETCH FUNCTION ---
  const fetchInitialPlatformData = useCallback(
    async (userPrincipal: Principal | null) => {
      if (!userPrincipal) {
        // Handle logout: clear user-specific data
        setUserGlobalProfile(null);
        // useGlobalID().clearAllUserProgress(); // Assuming you add this to global state
        // setWalletLinkInfos([]);
        // ... reset other user-specific states
        setIsLoadingProjects(true); // Prepare for potential next login
        setProjects([]); // Clear projects if they shouldn't persist across users
        return;
      }

      // For login
      setIsLoadingProjects(true);
      try {
        // Fetch global user profile first
        await fetchUserGlobalProfileAndSet(userPrincipal);
        // Then fetch all project details
        await fetchAllProjectDetailsAndSet();
        // Potentially fetch wallet link info
        // await fetchWalletLinkInfoAndSet(userPrincipal);

        // Fetch global streak info
        await fetchDailyStreakInfoAndSet(userPrincipal);

      } catch (error) {
        console.error("Error during initial platform data fetch:", error);
        // Potentially set a global error state
      } finally {
        // setIsLoadingProjects(false); // fetchAllProjectDetailsAndSet handles its own for projects
      }
    },
    [
      fetchUserGlobalProfileAndSet,
      fetchAllProjectDetailsAndSet,
      // fetchWalletLinkInfoAndSet, // Add if used
      setUserGlobalProfile,
      // useGlobalID, // For clearAllUserProgress etc.
      fetchDailyStreakInfoAndSet,
      setIsLoadingProjects,
      setProjects,
    ]
  );

  const verifyUserIsAdmin = useCallback(
    async (projectCanisterId: string, userPrincipal: Principal | null) => {
      try {
        if (!userPrincipal) {
          console.error("No use principal provided for the verification.");
          return false;
        }
        const projectActor = getProjectBackendActor(projectCanisterId);
        if (!projectActor) {
          console.error("No project actor available for the verification.");
          return false;
        }

        // Verify if the user is an admin on the project canister backend
        const result = (await projectActor.verifyUserIsAdmin(
          userPrincipal
        )) as boolean;

        return result;
      } catch (error) {
        console.error("Network or other error on the verification.", error);
        return false;
      }
    },
    [getProjectBackendActor]
  );

  const cooldownRemainingForNewCompletion = useCallback(
    async (
      projectCanisterId: string,
      completionTime: number, // Milliseconds
      recursiveCooldown: number // Milliseconds
    ): Promise<number> => {
      if (!projectCanisterId) {
        console.error("No project canister ID provided for cooldown check.");
        return 0;
      }
      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) {
        console.error("No project actor available for cooldown check.");
        return 0;
      }

      try {
        // Assuming the method returns the time remaining in seconds
        const timeRemaining =
          (await projectActor.getTimeRemainingForNewCompletion(
            completionTime,
            recursiveCooldown
          )) as number;
        return timeRemaining;
      } catch (error) {
        console.error("Error fetching cooldown time remaining:", error);
        return 0; // Return 0 or some default value on error
      }
    },
    [getProjectBackendActor]
  );

  const checkUserCompletions = useCallback(
    async (
      projectCanisterId: string,
      missionId: bigint,
      userPrincipal: Principal | null
    ) => {
      if (!userPrincipal) {
        console.error("No user principal available for completion check.");
        return;
      }

      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) {
        console.error("No project actor available for completion check.");
        return;
      }

      try {
        const completionsCount = await projectActor.getUserCompletionsCount(
          userPrincipal,
          missionId
        );
        return completionsCount;
      } catch (error) {
        console.error("Error fetching user completions:", error);
      }
    },
    [getProjectBackendActor]
  );

  const checkMissionCompletions = useCallback(
    async (projectCanisterId: string, missionId: bigint) => {
      const projectActor = getProjectBackendActor(projectCanisterId);
      if (!projectActor) {
        console.error("No project actor available for completion check.");
        return;
      }

      try {
        const completionsCount = await projectActor.getMissionCompletionsCount(
          missionId
        );
        return completionsCount;
      } catch (error) {
        console.error("Error fetching mission completions:", error);
      }
    },
    [getProjectBackendActor]
  );

  const updateUserProfile = useCallback(
    async (userId: Principal, user: SerializedGlobalUser): Promise<void> => {
      const indexActor = getIndexActor();
      if (!indexActor) {
        console.error("No index actor available for updating user profile.");
        return;
      }

      try {
        const result = (await indexActor.updateUser(userId, user)) as Result_1;
        if ("ok" in result) {
          console.log("User profile updated successfully.");
        } else {
          console.error("Error updating user profile:", result.err);
        }
      } catch (error) {
        console.error("Network or other error updating user profile:", error);
      }
    },
    [getIndexActor]
  );

  const handleClaimStreak = useCallback(
    async (userPrincipal: Principal) => {
      if (!userPrincipal) {
        console.error("User Principal is invalid");
        return;
      };
      if (!backendCanisterIdString) {
        console.error("Backend Canister ID is invalid");
        return;
      };

      const backendActor = getBackendActor(backendCanisterIdString);
      if (!backendActor) {
        console.error("Backend Actor is null");
        return;
      };

      try {
        const result = await backendActor.claimStreak(userPrincipal) as [string, bigint];
        return result;
      } catch (error) {
        console.error("Network or other error when claiming streak:", error);
      }
    },
    []
  );

  return {
    fetchInitialPlatformData,
    fetchDailyStreakInfoAndSet,
    fetchAllProjectDetailsAndSet,
    fetchSingleProjectDetailsAndSet,
    fetchMissionsForProjectAndSet,
    fetchUserProgressForProjectAndSet,
    fetchUserMissionProgressAndSet,
    executeBackendActionStep,
    startBackendMission,
    fetchUserGlobalProfileAndSet,
    fetchWalletLinkInfoAndSet,
    verifyUserIsAdmin,
    cooldownRemainingForNewCompletion,
    checkUserCompletions,
    checkMissionCompletions,
    updateUserProfile,
    handleClaimStreak
  };
};

export default useFetchData;
