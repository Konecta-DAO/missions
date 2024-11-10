import { ActorSubclass } from '@dfinity/agent';
import { SerializedMission, SerializedProgress, SerializedUser, SerializedUserStreak } from '../declarations/backend/backend.did.js';
import { SerializedMission as SerializedMissionNFID, SerializedProgress as SerializedProgressNFID, SerializedUser as SerializedUserNFID } from '../declarations/nfid/nfid.did.js';
import { SerializedMission as SerializedMissionDfinity, SerializedProgress as SerializedProgressDfinity, SerializedUser as SerializedUserDfinity } from '../declarations/dfinity_backend/dfinity_backend.did.js';
import { useGlobalID } from './globalID.tsx';
import { Principal } from '@dfinity/principal';
import { convertSecondsToHMS } from '../components/Utilities.tsx';
import { useCallback } from 'react';
import { set } from 'react-datepicker/dist/date_utils.js';

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
        setPointsnfid,
        setMissionsdfinity,
        setUserProgressdfinity,
        setUserdfinity,
        setPointsdfinity
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
    const fetchMissions = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, actorDfinity: ActorSubclass) => {
        const [missions, nfidmissions, dfinitymissions] = await Promise.all([
            actor.getAllMissions() as Promise<SerializedMission[]>,
            actorNFID.getAllMissions() as Promise<SerializedMissionNFID[]>,
            actorDfinity.getAllMissions() as Promise<SerializedMissionDfinity[]>,
        ]);
        setMissions(missions);
        setMissionsnfid(nfidmissions);
        setMissionsdfinity(dfinitymissions);
    }, [setMissions, setMissionsnfid]);

    const fetchMissionsKonecta = useCallback(async (actor: ActorSubclass) => {
        const missions: SerializedMission[] = await actor.getAllMissions() as SerializedMission[];
        setMissions(missions);
    }, [setMissions]);

    const fetchMissionsNfid = useCallback(async (actorNFID: ActorSubclass) => {
        const nfidmissions: SerializedMissionNFID[] = await actorNFID.getAllMissions() as SerializedMissionNFID[];
        setMissionsnfid(nfidmissions);
    }, [setMissionsnfid]);

    const fetchMissionsDfinity = useCallback(async (actorDfinity: ActorSubclass) => {
        const dfinitymissions: SerializedMissionDfinity[] = await actorDfinity.getAllMissions() as SerializedMissionDfinity[];
        setMissionsdfinity(dfinitymissions);
    }, [setMissionsdfinity]);

    // Fetch user progress
    const fetchUserProgress = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, actorDfinity: ActorSubclass, ae: Principal) => {
        const [userProgress, userProgressNFID, userProgressdfinity] = await Promise.all([
            actor.getUserProgress(ae) as Promise<[bigint, SerializedProgress][]>,
            actorNFID.getUserProgress(ae) as Promise<[bigint, SerializedProgressNFID][]>,
            actorDfinity.getUserProgress(ae) as Promise<[bigint, SerializedProgressDfinity][]>
        ]);
        setUserProgress(userProgress);
        setUserProgressnfid(userProgressNFID);
        setUserProgressdfinity(userProgressdfinity);
    }, [setUserProgress, setUserProgressnfid, setUserProgressdfinity]);

    const fetchUserProgressKonecta = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        const userProgress: [bigint, SerializedProgress][] = await actor.getUserProgress(ae) as [bigint, SerializedProgress][];
        setUserProgress(userProgress);
    }, [setUserProgress]);

    const fetchUserProgressNfid = useCallback(async (actorNFID: ActorSubclass, ae: Principal) => {
        const userProgressNFID: [bigint, SerializedProgressNFID][] = await actorNFID.getUserProgress(ae) as [bigint, SerializedProgressNFID][];
        setUserProgressnfid(userProgressNFID);
    }, [setUserProgressnfid]);

    const fetchUserProgressDfinity = useCallback(async (actorDfinity: ActorSubclass, ae: Principal) => {
        const userProgressdfinity: [bigint, SerializedProgressDfinity][] = await actorDfinity.getUserProgress(ae) as [bigint, SerializedProgressDfinity][];
        setUserProgressdfinity(userProgressdfinity);
    }, [setUserProgressdfinity]);

    // Fetch user details
    const fetchUser = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, actorDfinity: ActorSubclass, ae: Principal) => {
        const [user, usernfid, userdfinity] = await Promise.all([
            actor.getUser(ae) as Promise<SerializedUser[]>,
            actorNFID.getUser(ae) as Promise<SerializedUserNFID[]>,
            actorDfinity.getUser(ae) as Promise<SerializedUserDfinity[]>
        ]);
        setUser(user);
        setUsernfid(usernfid);
        setUserdfinity(userdfinity);
        setPFPstatus(user[0]?.pfpProgress || '');
        setTwitterHandle(user[0]?.twitterhandle?.length ? user[0]?.twitterhandle[0]?.toString() : '');
    }, [setUser, setUsernfid, setPFPstatus, setTwitterHandle, setUserdfinity]);

    const fetchUserKonecta = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        const user: SerializedUser[] = await actor.getUser(ae) as SerializedUser[];
        setUser(user);
        setPFPstatus(user[0]?.pfpProgress || '');
        setTwitterHandle(user[0]?.twitterhandle?.length ? user[0]?.twitterhandle[0]?.toString() : '');
    }, [setUser, setPFPstatus, setTwitterHandle]);

    const fetchUserNfid = useCallback(async (actorNFID: ActorSubclass, ae: Principal) => {
        const usernfid: SerializedUserNFID[] = await actorNFID.getUser(ae) as SerializedUserNFID[];
        setUsernfid(usernfid);
    }, [setUsernfid]);

    const fetchUserDfinity = useCallback(async (actorDfinity: ActorSubclass, ae: Principal) => {
        const userdfinity: SerializedUserDfinity[] = await actorDfinity.getUser(ae) as SerializedUserDfinity[];
        setUserdfinity(userdfinity);
    }, [setUserdfinity]);

    // Fetch user seconds
    const fetchUserSeconds = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, actorDfinity: ActorSubclass, ae: Principal) => {
        const [userSeconds, points, pointsDfinity] = await Promise.all([
            actor.getTotalSecondsForUser(ae) as Promise<bigint>,
            actorNFID.getTotalSecondsForUser(ae) as Promise<bigint>,
            actorDfinity.getTotalSecondsForUser(ae) as Promise<bigint>
        ]);
        setTimerText(convertSecondsToHMS(Number(userSeconds)));
        setPointsnfid(points);
        setPointsdfinity(pointsDfinity);
    }, [setTimerText, setPointsnfid, setPointsdfinity]);

    const fetchUserSecondsKonecta = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        const userSeconds: bigint = await actor.getTotalSecondsForUser(ae) as bigint;
        setTimerText(convertSecondsToHMS(Number(userSeconds)));
    }, [setTimerText]);

    const fetchUserSecondsNfid = useCallback(async (actorNFID: ActorSubclass, ae: Principal) => {
        const points: bigint = await actorNFID.getTotalSecondsForUser(ae) as bigint;
        setPointsnfid(points);
    }, [setPointsnfid]);

    const fetchUserSecondsDfinity = useCallback(async (actorDfinity: ActorSubclass, ae: Principal) => {
        const points: bigint = await actorDfinity.getTotalSecondsForUser(ae) as bigint;
        setPointsdfinity(points);
    }, [setPointsdfinity]);

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

    const fetchAll = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, actorDFINITY: ActorSubclass, ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>, setVerified: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgress(actor, actorNFID, actorDFINITY, ae),
            fetchUserSeconds(actor, actorNFID, actorDFINITY, ae),
            fetchUserStreak(actor, ae),
            fetchMissions(actor, actorNFID, actorDFINITY),
            fetchUser(actor, actorNFID, actorDFINITY, ae),
        ]);
        setDataLoaded(true);
    }, [fetchMissions, fetchUserProgress, fetchUser, fetchUserSeconds, fetchUserStreak]);

    const fetchAllKonecta = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>, setVerified: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgressKonecta(actor, ae),
            fetchUserSecondsKonecta(actor, ae),
            fetchUserStreak(actor, ae),
            fetchMissionsKonecta(actor),
            fetchUserKonecta(actor, ae),
        ]);
        setDataLoaded(true);
    }, [fetchMissionsKonecta, fetchUserProgressKonecta, fetchUserKonecta, fetchUserSecondsKonecta, fetchUserStreak]);

    const fetchAllNfid = useCallback(async (actor: ActorSubclass, actorNFID: ActorSubclass, ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>, setVerified: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgressNfid(actorNFID, ae),
            fetchUserSecondsNfid(actorNFID, ae),
            fetchMissionsNfid(actorNFID),
            fetchUserNfid(actorNFID, ae),
        ]);
        setDataLoaded(true);
    }, [fetchMissionsNfid, fetchUserProgressNfid, fetchUserNfid, fetchUserSecondsNfid]);

    const fetchAllDfinity = useCallback(async (actorDfinity: ActorSubclass, ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>) => {
        await Promise.all([
            fetchUserProgressDfinity(actorDfinity, ae),
            fetchUserSecondsDfinity(actorDfinity, ae),
            fetchMissionsDfinity(actorDfinity),
            fetchUserDfinity(actorDfinity, ae),
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
        fetchAllNfid,
        fetchAllDfinity
    };
};

export default useFetchData;
