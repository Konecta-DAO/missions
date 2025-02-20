import { ActorSubclass } from '@dfinity/agent';
import { SerializedMissionV2, SerializedProgress, SerializedUserStreak } from '../declarations/backend/backend.did.js';
import { SerializedMissionV2 as SerializedMissionDefault, SerializedProgress as SerializedProgressDefault} from '../declarations/oisy_backend/oisy_backend.did.js';
import { useGlobalID } from './globalID.tsx';
import { Principal } from '@dfinity/principal';
import { convertSecondsToHMS } from '../components/Utilities.tsx';
import { useCallback } from 'react';
import { LinkRequest, SerializedGlobalUser } from '../declarations/index/index.did.js';

export interface WalletLinkInfo {
    walletType: string;
    linkedPrincipal?: string;
    pendingRequest?: { requester: string; requesterType: string };
    cooldown: number;
    inputValue: string;
}

const useFetchData = () => {
    const {
        setMissions,
        setUserProgress,
        setUser,
        setTimerText,
        setPFPstatus,
        setTwitterHandle,
        setUserStreakAmount,
        setUserLastTimeStreak,
        setStreakResetTime,
        setTotalUserStreak,
        setUserStreakPercentage,
        setMissionsForProject,
        setUserProgressForProject,
        setPointsForProject,
        setWalletLinkInfos
    } = useGlobalID();

    const hasAccepted = useCallback(async (actor: ActorSubclass, ae: Principal, setTerms: React.Dispatch<React.SetStateAction<boolean>>) => {
        const hasAccepted = await actor.hasAcceptedTerms(ae) as boolean;
        if (!hasAccepted) {
            setTerms(false);
        }
    }, []);

    const fetchWalletLinkInfo = useCallback(async (signerId: string, actorIndex: ActorSubclass, ae: Principal) => {
        try {
            // 1. Get allowed wallet types.
            const allowedTypes = await actorIndex.getAllowedAccountTypes() as string[];
            // Exclude the current account type (i.e. the one stored in signerId).
            const walletTypes = allowedTypes.filter((type) => type !== signerId);

            // 2. Get linked accounts for the current user.
            const linkedAccounts = await actorIndex.getLinkedAccountsForPrincipal(ae) as [string, Principal][];
            const linkedMap: { [key: string]: string } = {};
            linkedAccounts.forEach(([type, principal]) => {
                linkedMap[type] = principal.toText();
            });

            // 3. Get pending link requests for the current user (as target).
            const pendingRequests = await actorIndex.getPendingLinkRequestsForTarget(ae) as LinkRequest[];
            const pendingMap: { [key: string]: { requester: string; requesterType: string } } = {};
            pendingRequests.forEach((req: any) => {
                if (req.status === "pending") {
                    pendingMap[req.requesterType] = {
                        requester: req.requester.toText(),
                        requesterType: req.requesterType,
                    };
                }
            });

            // 4. For each wallet type, also get the cooldown (if any).
            const walletInfos: WalletLinkInfo[] = [];
            for (const walletType of walletTypes) {
                const cooldown = Number(await actorIndex.getLinkCooldownForPrincipal(ae, walletType) as bigint);
                walletInfos.push({
                    walletType,
                    linkedPrincipal: linkedMap[walletType],
                    pendingRequest: pendingMap[walletType],
                    cooldown,
                    inputValue: '',
                });
            }
            setWalletLinkInfos(walletInfos);
        } catch (error) {
            console.error("Error fetching wallet link info:", error);
        }
    }, [setWalletLinkInfos]);

    // Fetch missions
    const fetchMissions = useCallback(async (actor: ActorSubclass, actors: ActorSubclass[], targets: string[]) => {
        // Start fetching all missions from the primary actor
        const missionsPromise = actor.getAllMissions() as Promise<SerializedMissionV2[]>;

        // Start fetching missions for each actor
        const projectMissionsPromises = actors.map(async (a, index) => {
            const projectMissionsRaw = await a.getAllMissions();
            const projectMissions = projectMissionsRaw as SerializedMissionDefault[];
            const projectId = targets[index];

            setMissionsForProject(projectId, projectMissions);
        });

        // Wait for all missions to be fetched
        const missions = await missionsPromise;
        await Promise.all(projectMissionsPromises);

        // Update the state with the primary missions
        setMissions(missions);
    }, [setMissions, setMissionsForProject]);

    const fetchUserProgress = useCallback(async (actor: ActorSubclass, actors: ActorSubclass[], targets: string[], ae: Principal) => {
        // Start fetching user progress from the primary actor
        const userProgressPromise = actor.getUserProgress(ae) as Promise<[bigint, SerializedProgress][]>;

        // Start fetching user progress for each actor
        const projectUserProgressPromises = actors.map(async (a, index) => {
            const projectUserProgress = await a.getUserProgress(ae) as [bigint, SerializedProgressDefault][];
            const projectId = targets[index];
            setUserProgressForProject(projectId, projectUserProgress);
        });

        // Wait for all promises to resolve
        const userProgress = await userProgressPromise;
        await Promise.all(projectUserProgressPromises);

        // Update the state with the primary user progress
        setUserProgress(userProgress);
    }, [setUserProgress, setUserProgressForProject]);

    // Fetch user details
    const fetchUser = useCallback(async (actorIndex: ActorSubclass, ae: Principal) => {

        const userPromise = actorIndex.getUserByPrincipal(ae) as Promise<SerializedGlobalUser[]>;
        const user = await userPromise;

        setUser(user);
        setPFPstatus(user[0]?.pfpProgress || '');
        setTwitterHandle(user[0]?.twitterhandle?.length ? user[0]?.twitterhandle[0]?.toString() : '');
    }, [setUser, setPFPstatus, setTwitterHandle]);

    const fetchUserSeconds = useCallback(async (actor: ActorSubclass, actors: ActorSubclass[], targets: string[], ae: Principal) => {
        // Start fetching total seconds for user from the primary actor
        const userSecondsPromise = actor.getTotalSecondsForUser(ae) as Promise<bigint>;

        // Start fetching total seconds for each actor
        const projectUserSecondsPromises = actors.map(async (a, index) => {
            const projectUserSeconds = await a.getTotalSecondsForUser(ae) as bigint;
            const projectId = targets[index];
            setPointsForProject(projectId, projectUserSeconds);
        });

        // Wait for all promises to resolve
        const userSeconds = await userSecondsPromise;
        await Promise.all(projectUserSecondsPromises);

        // Update the state with the primary user's total seconds
        setTimerText(convertSecondsToHMS(Number(userSeconds)));
    }, [setTimerText, setPointsForProject]);

    // Fetch user PFP status
    const fetchUserPFPstatus = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        const userPFPstatus = await actor.setPFPProgressLoading(ae) as string;
        setPFPstatus(userPFPstatus);
        return userPFPstatus;
    }, [setPFPstatus]);

    const fetchUserStreak = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        const userStreak = await actor.getUserStreakAmount(ae) as bigint;
        setUserStreakAmount(userStreak);
        const streakResetTime = await actor.getStreakTime() as bigint;
        setStreakResetTime(streakResetTime);
        const userLastTimeStreak = await actor.getUserStreakTime(ae) as bigint;
        setUserLastTimeStreak(userLastTimeStreak);
        const totalUserStreak = await actor.getUserAllStreak(ae) as SerializedUserStreak;
        setTotalUserStreak(totalUserStreak);
        const userStreakPercentage = await actor.getUserStreakPercentage(ae) as bigint;
        setUserStreakPercentage(userStreakPercentage);
    }, [setUserStreakAmount, setStreakResetTime, setUserLastTimeStreak, setTotalUserStreak, setUserStreakPercentage]);

    const fetchAll = useCallback(async (actor: ActorSubclass, actors: ActorSubclass[], actorIndex: ActorSubclass, targets: string[], ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgress(actor, actors, targets, ae),
            fetchUserSeconds(actor, actors, targets, ae),
            fetchUserStreak(actor, ae),
            fetchMissions(actor, actors, targets),
            fetchUser(actorIndex, ae),
            fetchWalletLinkInfo('ic', actorIndex, ae), // PILAS
        ]);
        setDataLoaded(true);
    }, [fetchMissions, fetchUserProgress, fetchUser, fetchUserSeconds, fetchUserStreak]);

    return {
        fetchMissions,
        fetchUserProgress,
        fetchUser,
        fetchUserSeconds,
        fetchUserPFPstatus,
        fetchUserStreak,
        fetchAll,
        hasAccepted,
        fetchWalletLinkInfo
    };
};

export default useFetchData;
