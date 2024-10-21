import { ActorSubclass } from '@dfinity/agent';
import { SerializedMission, SerializedProgress, SerializedUser, SerializedUserStreak } from '../declarations/backend/backend.did.js';
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
        setUserStreakPercentage
    } = useGlobalID();

    const hasAccepted = useCallback(async (actor: ActorSubclass, ae: Principal, setTerms: React.Dispatch<React.SetStateAction<boolean>>) => {
        const hasAccepted = await actor.hasAcceptedTerms(ae) as boolean;
        if (!hasAccepted) {
            setTerms(false);
        }
    }, []);

    // Fetch missions
    const fetchMissions = useCallback(async (actor: ActorSubclass) => {
        const missions: SerializedMission[] = await actor.getAllMissions() as SerializedMission[];
        setMissions(missions);
    }, [setMissions]);


    // Fetch user progress
    const fetchUserProgress = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        const userProgress: [bigint, SerializedProgress][] = await actor.getUserProgress(ae) as [bigint, SerializedProgress][];
        setUserProgress(userProgress);
    }, [setUserProgress]);

    // Fetch user details
    const fetchUser = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        if (setUser) {
            const user: SerializedUser[] = await actor.getUser(ae) as SerializedUser[];
            setUser(user);
            setPFPstatus(user[0]?.pfpProgress || '');
            setTwitterHandle(user[0]?.twitterhandle?.length ? user[0]?.twitterhandle[0]?.toString() : '');
        }
    }, [setUser, setPFPstatus, setTwitterHandle]);

    // Fetch user seconds
    const fetchUserSeconds = useCallback(async (actor: ActorSubclass, ae: Principal) => {
        const userSeconds: bigint = await actor.getTotalSecondsForUser(ae) as bigint;

        setTimerText(convertSecondsToHMS(Number(userSeconds)));
    }, [setTimerText]);

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
    }, [setPFPstatus]);

    const fetchAll = useCallback(async (actor: ActorSubclass, ae: Principal, setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>, setTerms: React.Dispatch<React.SetStateAction<boolean>>) => {
        await hasAccepted(actor, ae, setTerms);
        await fetchMissions(actor);
        await fetchUserProgress(actor, ae);
        await fetchUser(actor, ae);
        await fetchUserSeconds(actor, ae);
        await fetchUserStreak(actor, ae);
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
    };
};

export default useFetchData;
