import { ActorSubclass } from '@dfinity/agent';
import { SerializedMission, SerializedProgress, SerializedUser, SerializedUserStreak } from '../declarations/backend/backend.did.js';
import { SerializedMission as SerializedMissionNFID, SerializedProgress as SerializedProgressNFID, SerializedUser as SerializedUserNFID, SerializedUserStreak as SerializedUsedStreakNFID } from '../declarations/nfid/nfid.did.js';
import { useGlobalID } from './globalID.tsx';
import { Principal } from '@dfinity/principal';
import { convertSecondsToHMS } from '../components/Utilities.tsx';
import { useCallback } from 'react';

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
        setMissionsnfid,
        setUserProgressnfid,
        setUsernfid,
        setPointsnfid
    } = useGlobalID();

    const hasAccepted = useCallback(async (actor: ActorSubclass, ae: Principal, setTerms: React.Dispatch<React.SetStateAction<boolean>>) => {
        const hasAccepted = await actor.hasAcceptedTerms(ae) as boolean;
        if (!hasAccepted) {
            setTerms(false);
        }
    }, []);

    const isVerifiedNfid = useCallback(async (actorNfid: ActorSubclass, ae: Principal, setVerified: React.Dispatch<React.SetStateAction<boolean>>) => {
        const isVerifiedNfid = await actorNfid.hasVerified(ae) as boolean;
        if (!isVerifiedNfid) {
            setVerified(false);
        }
    }, []);

    // Fetch missions
    const fetchMissions = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass) => {
        const [missions, nfidmissions] = await Promise.all([
            actor.getAllMissions() as Promise<SerializedMission[]>,
            actorNFID.getAllMissions() as Promise<SerializedMissionNFID[]>,
        ]);
        setMissions(missions);
        setMissionsnfid(nfidmissions);
    }, [setMissions, setMissionsnfid]);

    const fetchMissionsKonecta = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass) => {
        const missions: SerializedMission[] = await actor.getAllMissions() as SerializedMission[];
        setMissions(missions);
    }, [setMissions]);

    const fetchMissionsNfid = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass) => {
        const nfidmissions: SerializedMissionNFID[] = await actorNFID.getAllMissions() as SerializedMissionNFID[];
        setMissionsnfid(nfidmissions);
    }, [setMissionsnfid]);

    // Fetch user progress
    const fetchUserProgress = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const [userProgress, userProgressNFID] = await Promise.all([
            actor.getUserProgress(ae) as Promise<[bigint, SerializedProgress][]>,
            actorNFID.getUserProgress(ae) as Promise<[bigint, SerializedProgressNFID][]>,
        ]);
        setUserProgress(userProgress);
        setUserProgressnfid(userProgressNFID);
    }, [setUserProgress, setUserProgressnfid]);

    const fetchUserProgressKonecta = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const userProgress: [bigint, SerializedProgress][] = await actor.getUserProgress(ae) as [bigint, SerializedProgress][];
        setUserProgress(userProgress);
    }, [setUserProgress]);

    const fetchUserProgressNfid = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const userProgressNFID: [bigint, SerializedProgressNFID][] = await actorNFID.getUserProgress(ae) as [bigint, SerializedProgressNFID][];
        setUserProgressnfid(userProgressNFID);
    }, [setUserProgressnfid]);

    // Fetch user details
    const fetchUser = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const [user, usernfid] = await Promise.all([
            actor.getUser(ae) as Promise<SerializedUser[]>,
            actorNFID.getUser(ae) as Promise<SerializedUserNFID[]>,
        ]);
        setUser(user);
        setUsernfid(usernfid);
        setPFPstatus(user[0]?.pfpProgress || '');
        setTwitterHandle(user[0]?.twitterhandle?.length ? user[0]?.twitterhandle[0]?.toString() : '');
    }, [setUser, setUsernfid, setPFPstatus, setTwitterHandle]);

    const fetchUserKonecta = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const user: SerializedUser[] = await actor.getUser(ae) as SerializedUser[];
        setUser(user);
        setPFPstatus(user[0]?.pfpProgress || '');
        setTwitterHandle(user[0]?.twitterhandle?.length ? user[0]?.twitterhandle[0]?.toString() : '');
    }, [setUser, setPFPstatus, setTwitterHandle]);

    const fetchUserNfid = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const usernfid: SerializedUserNFID[] = await actorNFID.getUser(ae) as SerializedUserNFID[];
        setUsernfid(usernfid);
    }, [setUsernfid]);

    // Fetch user seconds
    const fetchUserSeconds = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const [userSeconds, points] = await Promise.all([
            actor.getTotalSecondsForUser(ae) as Promise<bigint>,
            actorNFID.getTotalSecondsForUser(ae) as Promise<bigint>,
        ]);
        setTimerText(convertSecondsToHMS(Number(userSeconds)));
        setPointsnfid(points);
    }, [setTimerText, setPointsnfid]);

    const fetchUserSecondsKonecta = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const userSeconds: bigint = await actor.getTotalSecondsForUser(ae) as bigint;
        setTimerText(convertSecondsToHMS(Number(userSeconds)));
    }, [setTimerText]);

    const fetchUserSecondsNfid = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal) => {
        const points: bigint = await actorNFID.getTotalSecondsForUser(ae) as bigint;
        setPointsnfid(points);
    }, [setPointsnfid]);

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

    const fetchAll = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>, setVerified: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgress(actor, actorNFID, ae),
            fetchUserSeconds(actor, actorNFID, ae),
            fetchUserStreak(actor, ae),
            fetchMissions(actor, actorNFID),
            fetchUser(actor, actorNFID, ae),
        ]);
        setDataLoaded(true);
    }, [fetchMissions, fetchUserProgress, fetchUser, fetchUserSeconds, fetchUserStreak]);

    const fetchAllKonecta = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>, setVerified: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgressKonecta(actor, actorNFID, ae),
            fetchUserSecondsKonecta(actor, actorNFID, ae),
            fetchUserStreak(actor, ae),
            fetchMissionsKonecta(actor, actorNFID),
            fetchUserKonecta(actor, actorNFID, ae),
        ]);
        setDataLoaded(true);
    }, [fetchMissionsKonecta, fetchUserProgressKonecta, fetchUserKonecta, fetchUserSecondsKonecta, fetchUserStreak]);

    const fetchAllNfid = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>, setVerified: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgressNfid(actor, actorNFID, ae),
            fetchUserSecondsNfid(actor, actorNFID, ae),
            fetchMissionsNfid(actor, actorNFID),
            fetchUserNfid(actor, actorNFID, ae),
        ]);
        setDataLoaded(true);
    }, [fetchMissionsNfid, fetchUserProgressNfid, fetchUserNfid, fetchUserSecondsNfid]);

    return {
        fetchMissions,
        fetchUserProgress,
        fetchUser,
        fetchUserSeconds,
        fetchUserPFPstatus,
        fetchUserStreak,
        fetchAll,
        hasAccepted,
        isVerifiedNfid,
        fetchAllKonecta,
        fetchAllNfid
    };
};

export default useFetchData;
