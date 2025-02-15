import { ActorSubclass } from '@dfinity/agent';
import { SerializedMissionV2, SerializedProgress, SerializedUser, SerializedUserStreak } from '../declarations/backend/backend.did.js';
import { SerializedMissionV2 as SerializedMissionDefault, SerializedProgress as SerializedProgressDefault, SerializedUser as SerializedUserDefault } from '../declarations/oisy_backend/oisy_backend.did.js';
import { useGlobalID } from './globalID.tsx';
import { Principal } from '@dfinity/principal';
import { convertSecondsToHMS } from '../components/Utilities.tsx';
import { useCallback } from 'react';

const useFetchData = () => {
    const {
        setMissions,
        setUserProgress,
        setUser,
        setNfidToIIStatus,
        setIIToNFIDStatus,
        setLinkedAccount,
        setOisyWallet,
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
        setUserForProject
    } = useGlobalID();

    const hasAccepted = useCallback(async (actor: ActorSubclass, ae: Principal, setTerms: React.Dispatch<React.SetStateAction<boolean>>) => {
        const hasAccepted = await actor.hasAcceptedTerms(ae) as boolean;
        if (!hasAccepted) {
            setTerms(false);
        }
    }, []);

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

    const fetchUserOisy = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        const oisyWalletPromise = actor.getUserOisyWallet(ae) as Promise<Principal[] | []>;
        const oisyWallet = await oisyWalletPromise;
        if (oisyWallet != null) {
            setOisyWallet(oisyWallet[0]);
        }
    }, [setOisyWallet]);

    // Fetch user details
    const fetchUser = useCallback(async (actor: ActorSubclass, actors: ActorSubclass[], targets: string[], ae: Principal) => {

        const userPromise = actor.getUser(ae) as Promise<SerializedUser[]>;
        const oisyWalletPromise = actor.getUserOisyWallet(ae) as Promise<Principal[] | []>;

        const linkedAccPromise = actor.getLinkedAccount(ae) as Promise<Principal | null>;
        const nfidToIIPromise = actor.isLinkingNFIDtoII(ae) as Promise<[boolean, Principal | null]>;
        const iiToNFIDPromise = actor.isLinkingIItoNFID(ae) as Promise<[boolean, Principal | null]>;

        const projectUserPromises = actors.map(async (a, index) => {
            const projectUser = await a.getUser(ae) as SerializedUserDefault[];
            const projectId = targets[index];
            setUserForProject(projectId, projectUser);
        });

        const user = await userPromise;
        const [nfidLinking, nfidtoIITarget] = await nfidToIIPromise;
        setNfidToIIStatus([nfidLinking, nfidtoIITarget!]);
        const [iiLinking, iitoNFIDTarget] = await iiToNFIDPromise;
        setIIToNFIDStatus([iiLinking, iitoNFIDTarget!]);
        const maybeLinked = await linkedAccPromise;
        if (maybeLinked != null) {
            setLinkedAccount(maybeLinked);
        }

        const oisyWallet = await oisyWalletPromise;
        await Promise.all(projectUserPromises);

        setUser(user);
        if (oisyWallet != null) {
            setOisyWallet(oisyWallet[0]);
        }
        setPFPstatus(user[0]?.pfpProgress || '');
        setTwitterHandle(user[0]?.twitterhandle?.length ? user[0]?.twitterhandle[0]?.toString() : '');
    }, [setUser, setPFPstatus, setTwitterHandle, setUserForProject]);

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

    const fetchAll = useCallback(async (actor: ActorSubclass, actors: ActorSubclass[], targets: string[], ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgress(actor, actors, targets, ae),
            fetchUserSeconds(actor, actors, targets, ae),
            fetchUserStreak(actor, ae),
            fetchMissions(actor, actors, targets),
            fetchUser(actor, actors, targets, ae),
        ]);
        setDataLoaded(true);
    }, [fetchMissions, fetchUserProgress, fetchUser, fetchUserSeconds, fetchUserStreak]);

    return {
        fetchMissions,
        fetchUserProgress,
        fetchUser,
        fetchUserOisy,
        fetchUserSeconds,
        fetchUserPFPstatus,
        fetchUserStreak,
        fetchAll,
        hasAccepted,
    };
};

export default useFetchData;
