import React, { act, useEffect, useRef, useState } from 'react';

import { ProjectData, useGlobalID } from '../../../../../hooks/globalID.tsx';
import { formatTimeRemaining } from '../../../../../components/Utilities.tsx';
import { canisterId, idlFactory } from '../../../../../declarations/backend/index.js';
import { idlFactory as idlFactoryDefault } from '../../../../../declarations/nfid/index.js';
import { Actor, HttpAgent } from '@dfinity/agent';
import { useIdentityKit } from '@nfid/identitykit/react';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { isMobileOnly, isTablet } from 'react-device-detect';
import { useMediaQuery } from 'react-responsive';
import { Usergeek } from 'usergeek-ic-js';
import { idlFactory as idlFactoryIndex, SerializedProjectMissions } from '../../../../../declarations/index/index.did.js';
import { useNavigate } from 'react-router-dom';

type DisplayState = 'CLAIM' | 'CLAIM_FINAL' | 'TIMER' | 'REVIVE';
type JackpotState = 'DEFAULT' | 'WIN' | 'LOSE';

interface DailyStreakButtonProps {
    setIsClaimClicked: React.Dispatch<React.SetStateAction<boolean>>;
    setJackpotState: React.Dispatch<React.SetStateAction<JackpotState>>;
}

const canisterIdDFINITY = "2mg2s-uqaaa-aaaag-qna5a-cai";

const DailyStreakButtonComponent: React.FC<DailyStreakButtonProps> = ({ setIsClaimClicked, setJackpotState }) => {
    const globalID = useGlobalID();
    const { identity, disconnect } = useIdentityKit();
    const fetchData = useFetchData();
    const navigate = useNavigate();
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
    const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });

    const [isMoved, setIsMoved] = useState(false);
    const [showContinueButton, setShowContinueButton] = useState(false);
    const [showSeparators, setShowSeparators] = useState(false);
    const [remainingTime, setRemainingTime] = useState<bigint>(0n);
    const [displayState, setDisplayState] = useState<DisplayState>('CLAIM');
    const [responseState, setResponseState] = useState<string>('');
    const [messageResponse, setMessageResponse] = useState<string>('');
    const [endDate, setEndDate] = useState<bigint>(0n);

    const [tick, setTick] = useState(0);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    const [isLoading, setIsLoading] = useState(false);

    const autoContinueTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    const clearExistingTimers = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
            messageTimeoutRef.current = null;
        }
    };


    const isVertical = isMobileOnly || (isTablet && isPortrait);

    const determineDisplayState = () => {
        clearExistingTimers();

        const nowNsInitial = BigInt(Date.now()) * 1_000_000n;
        const streakResetTimeNs: bigint = globalID.streakResetTime;
        const userLastTimeStreakNs: bigint = globalID.userLastTimeStreak;

        let newDisplayState: DisplayState = 'CLAIM';
        let nextChangeInNs: bigint | null = null;
        let newEndDate: bigint | null = null;

        if (globalID.userStreakAmount === 0n) {
            newDisplayState = 'CLAIM';
            newEndDate = streakResetTimeNs + userLastTimeStreakNs;
            nextChangeInNs = streakResetTimeNs;
        } else {

            const t1 = userLastTimeStreakNs + streakResetTimeNs;         // StreakResetTime + LastStreak
            const t2 = userLastTimeStreakNs + 2n * streakResetTimeNs;    // 2 * StreakResetTime + LastStreak
            const t3 = userLastTimeStreakNs + 3n * streakResetTimeNs;     // 3 * StreakResetTime + LastStreak

            if (nowNsInitial >= t3) {
                // State: CLAIM_FINAL
                newDisplayState = 'CLAIM_FINAL';
                newEndDate = 0n;
            } else if (nowNsInitial >= t2) {
                // State: REVIVE
                newDisplayState = 'REVIVE';
                newEndDate = t3;
                nextChangeInNs = t3 - nowNsInitial; // Next state change after (t3 - nowNs)
                setReviveRemainingTime(t3);
            } else if (nowNsInitial >= t1) {
                // State: CLAIM
                newDisplayState = 'CLAIM';
                newEndDate = t2;
                nextChangeInNs = t2 - nowNsInitial;// Next state change after (t2 - nowNs)
            } else {
                // State: TIMER
                newDisplayState = 'TIMER';
                newEndDate = t1;
                nextChangeInNs = t1 - nowNsInitial;
            }
        }

        setDisplayState(newDisplayState);
        setEndDate(newEndDate);

        // Schedule next state change
        if (nextChangeInNs !== null && nextChangeInNs > 0n) {
            // Convert nanoseconds to milliseconds for setTimeout
            const nextChangeInMs = Number(nextChangeInNs / 1_000_000n);
            timeoutRef.current = setTimeout(() => {
                determineDisplayState();
            }, nextChangeInMs);
        }

        // If in TIMER state, start interval to update remaining time every second
        if (newDisplayState === 'TIMER' || newDisplayState === 'REVIVE') {
            if (!intervalRef.current) { // Prevent multiple intervals
                intervalRef.current = setInterval(() => {
                    const nowNs = BigInt(Date.now()) * 1_000_000n; // Update current time each second
                    if (newEndDate) {
                        const newRemaining = newEndDate - nowNs;
                        if (newDisplayState === 'REVIVE') {
                            // Update tick to trigger re-render
                            setTick(t => t + 1);
                            if (newRemaining <= 0n) {
                                determineDisplayState();
                            }
                        } else {
                            setRemainingTime(newRemaining > 0n ? newRemaining : 0n);
                            if (newRemaining <= 0n) {
                                determineDisplayState();
                            }
                        }
                    }
                }, 1000);
            }
        } else {
            // Clear interval if not in TIMER or REVIVE
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current); // For display state changes
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        determineDisplayState();

        return () => {
            clearExistingTimers();
        };
    }, [globalID.userLastTimeStreak, globalID.streakResetTime]);

    const isRevive = displayState === 'REVIVE';
    const [reviveRemainingTime, setReviveRemainingTime] = useState<bigint>(0n);

    const isClickable = !isMoved && displayState !== 'TIMER';

    const handleClick = async () => {
        setIsMoved(true);
        setIsLoading(true);

        try {
            const agent = HttpAgent.createSync({ identity });
            const actor = Actor.createActor(idlFactory, {
                agent: agent,
                canisterId,
            });

            const actorIndex = Actor.createActor(idlFactoryIndex, {
                agent: agent!,
                canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
            });

            const projects = await actorIndex.getAllProjectMissions() as SerializedProjectMissions[];
            const targets: string[] = projects.map(project => project.canisterId.toText());

            if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null) {
                disconnect();
                navigate('/konnect');
            } else {

                const mappedProjects: ProjectData[] = projects.map((project) => ({
                    id: project.canisterId.toText(),
                    name: project.name,
                    icon: project.icon,
                }));

                globalID.setProjects(mappedProjects);

                const actors = targets.map(targetCanisterId => {
                    return Actor.createActor(idlFactoryDefault, {
                        agent: agent!,
                        canisterId: targetCanisterId,
                    });
                });



                const b = await actor.claimStreak(globalID.principalId) as [string, bigint];

                const message = b[0]; // string part

                if (message.startsWith("You have earned")) {
                    Usergeek.trackEvent("Daily Streak: Default");
                    await fetchData.fetchUserSeconds(actor, actors, targets, globalID.principalId!);
                    await fetchData.fetchUserStreak(actor, globalID.principalId!);
                    setResponseState("SUCCESS");
                    setMessageResponse(message);
                    setShowContinueButton(true);

                } else if (message.startsWith("Your streak is ALIVE!")) {
                    Usergeek.trackEvent("Daily Streak: Survived");
                    setIsLoading(false);
                    setShowSeparators(true);
                    setJackpotState('WIN');
                    await fetchData.fetchUserSeconds(actor, actors, targets, globalID.principalId!);
                    await fetchData.fetchUserStreak(actor, globalID.principalId!);
                    messageTimeoutRef.current = setTimeout(() => {
                        setMessageResponse(message);
                        setShowContinueButton(true);
                    }, 6000);

                } else if (message.startsWith("Too bad, your past streak")) {
                    Usergeek.trackEvent("Daily Streak: Died");
                    setIsLoading(false);
                    setShowSeparators(true);
                    setJackpotState('LOSE');
                    await fetchData.fetchUserSeconds(actor, actors, targets, globalID.principalId!);
                    await fetchData.fetchUserStreak(actor, globalID.principalId!);
                    messageTimeoutRef.current = setTimeout(() => {
                        setMessageResponse(message);
                        setShowContinueButton(true);
                    }, 6000);

                } else if (message.startsWith("You have lost your past streak")) {
                    Usergeek.trackEvent("Daily Streak: Forgot");
                    await fetchData.fetchUserSeconds(actor, actors, targets, globalID.principalId!);
                    await fetchData.fetchUserStreak(actor, globalID.principalId!);
                    setResponseState("CLAIMED");
                    setMessageResponse(message);
                    setShowContinueButton(true);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        // Clear the auto-continue timer if it's still active
        if (autoContinueTimeoutRef.current) {
            clearTimeout(autoContinueTimeoutRef.current);
            autoContinueTimeoutRef.current = null;
        }

        // Reset states
        setIsMoved(false);
        setIsClaimClicked(false);
        setShowContinueButton(false);
        setResponseState('');
        setIsLoading(false);
        determineDisplayState();
        setShowSeparators(false);
        setJackpotState('DEFAULT');
    };

    useEffect(() => {
        if (showContinueButton) {
            // Start a 30-second timer to auto-continue
            autoContinueTimeoutRef.current = setTimeout(() => {
                handleContinue();
            }, 45000); // 45,000 milliseconds = 45 seconds
        }

        // Cleanup the timer if showContinueButton changes or component unmounts
        return () => {
            if (autoContinueTimeoutRef.current) {
                clearTimeout(autoContinueTimeoutRef.current);
                autoContinueTimeoutRef.current = null;
            }
        };
    }, [showContinueButton]);



    const displayStreakAmount =
        displayState === 'CLAIM_FINAL'
            ? 0
            : Number(globalID.userStreakAmount);

    const renderDisplayState =
        displayState === 'CLAIM_FINAL'
            ? 'CLAIM'
            : displayState;


    return (
        <>
            <svg
                version="1.1"
                id="Kami"
                className={isMoved ? 'moved' : ''}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 1564.6 1080"
                xmlSpace="preserve"
                onClick={isClickable ? handleClick : undefined}
                style={{
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'transform 0.3s ease',
                }}
            >
                <defs>
                    {/* Gradients */}
                    <linearGradient
                        id="SVGID_1_"
                        gradientUnits="userSpaceOnUse"
                        x1="1024.2115"
                        y1="1344.0686"
                        x2="1024.4215"
                        y2="-1211.6086"
                        gradientTransform="matrix(1 0 0 -1 0 1652.6738)"
                    >
                        <stop offset="0" style={{ stopColor: '#34AADC' }} />
                        <stop offset="1" style={{ stopColor: '#337FF5' }} />
                    </linearGradient>

                    <radialGradient
                        id="SVGID_00000129193077446094284200000010306523065072325052_"
                        cx="1040.2905"
                        cy="1431.5928"
                        r="141.59"
                        fx="1043.3195"
                        fy="1482.7776"
                        gradientTransform="matrix(0.9985 -5.547298e-02 -9.985136e-02 -1.7972 128.6987 2733.6365)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0.11" style={{ stopColor: '#4D4E66' }} />
                        <stop offset="0.41" style={{ stopColor: '#29283C' }} />
                        <stop offset="0.49" style={{ stopColor: '#222132' }} />
                        <stop offset="0.82" style={{ stopColor: '#09090D' }} />
                        <stop offset="1" style={{ stopColor: '#000000' }} />
                    </radialGradient>

                    <linearGradient
                        id="SVGID_00000156560162543221377760000009584901684244609462_"
                        gradientUnits="userSpaceOnUse"
                        x1="1024.45"
                        y1="865.0588"
                        x2="1024.45"
                        y2="558.4088"
                        gradientTransform="matrix(1 0 0 -1 0 1652.6738)"
                    >
                        <stop offset="0.34" style={{ stopColor: '#34AADC' }} />
                        <stop offset="0.58" style={{ stopColor: '#3394E8' }} />
                        <stop offset="0.8" style={{ stopColor: '#337FF5' }} />
                    </linearGradient>

                    <linearGradient
                        id="SVGID_00000016038861446462578450000011637805086623395245_"
                        gradientUnits="userSpaceOnUse"
                        x1="529.7"
                        y1="446.15"
                        x2="1343.5"
                        y2="446.15"
                        gradientTransform="matrix(1 0 0 -1 0 1080)"
                    >
                        <stop offset="0" style={{ stopColor: '#34AADC' }} />
                        <stop offset="1" style={{ stopColor: '#337FF5' }} />
                    </linearGradient>

                    <radialGradient
                        id="Tab_00000181085521850192996330000012133393721873589662_"
                        cx="1025.2649"
                        cy="584.4236"
                        r="514.8461"
                        fx="1028.1758"
                        fy="69.5857"
                        gradientTransform="matrix(0.96 0 0 0.144 41.3145 418.492)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="2.514619e-03" style={{ stopColor: '#4D4E66' }} />
                        <stop offset="0.1013" style={{ stopColor: '#3A394F' }} />
                        <stop offset="0.1967" style={{ stopColor: '#2D2C41' }} />
                        <stop offset="0.2774" style={{ stopColor: '#29283C' }} />
                        <stop offset="0.3717" style={{ stopColor: '#232233' }} />
                        <stop offset="0.7802" style={{ stopColor: '#0A090E' }} />
                        <stop offset="0.9972" style={{ stopColor: '#000000' }} />
                    </radialGradient>

                    <radialGradient
                        id="SVGID_00000078729366130487523830000005742619019277415816_"
                        cx="1024.6"
                        cy="1813.6613"
                        r="818.7729"
                        fx="1023.3162"
                        fy="2632.4331"
                        gradientTransform="matrix(1 0 0 -0.26 0 1105.402)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0.13" style={{ stopColor: '#FFFFFF' }} />
                        <stop offset="0.34" style={{ stopColor: '#DEDEE1' }} />
                        <stop offset="0.66" style={{ stopColor: '#A6A5AE' }} />
                        <stop offset="1" style={{ stopColor: '#797985' }} />
                    </radialGradient>

                    <radialGradient
                        id="SVGID_00000074424352097243448040000001515703629981409440_"
                        cx="1025.6"
                        cy="1373.9697"
                        r="586.6444"
                        fx="1025.3749"
                        fy="1817.5912"
                        gradientTransform="matrix(1 0 0 -0.44 0 1235.8812)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0.1" style={{ stopColor: '#39394F' }} />
                        <stop offset="0.2" style={{ stopColor: '#2D2C40' }} />
                        <stop offset="0.28" style={{ stopColor: '#29283C' }} />
                        <stop offset="0.37" style={{ stopColor: '#222132' }} />
                        <stop offset="0.78" style={{ stopColor: '#09090D' }} />
                        <stop offset="1" style={{ stopColor: '#000000' }} />
                    </radialGradient>

                    <linearGradient id="SVGID_00000098199394142717416970000012108736271955527825_" gradientUnits="userSpaceOnUse" x1="873.2117" y1="504.8047" x2="873.2117" y2="781.7878">
                        <stop offset="0.1318" style={{ stopColor: '#FFFFFF' }} />
                        <stop offset="0.3399" style={{ stopColor: '#DFDEE2' }} />
                        <stop offset="0.6596" style={{ stopColor: '#A6A5AE' }} />
                        <stop offset="1" style={{ stopColor: '#797985' }} />
                    </linearGradient>

                    <linearGradient id="SVGID_00000041975678334081140710000015335286131432326575_" gradientUnits="userSpaceOnUse" x1="1177.9917" y1="522.6" x2="1177.9917" y2="767.805">
                        <stop offset="0.1318" style={{ stopColor: '#FFFFFF' }} />
                        <stop offset="0.3399" style={{ stopColor: '#DFDEE2' }} />
                        <stop offset="0.6596" style={{ stopColor: '#A6A5AE' }} />
                        <stop offset="1" style={{ stopColor: '#797985' }} />
                    </linearGradient>
                    <linearGradient id="SVGID_00000154385756331280414030000011338415581356711597_" gradientUnits="userSpaceOnUse" x1="1025.6" y1="-792.7515" x2="1025.6" y2="48.8583" gradientTransform="matrix(1 0 0 0.44 0 760.6812)">
                        <stop offset="7.783933e-02" style={{ stopColor: '#A73B45' }} />
                        <stop offset="0.3866" style={{ stopColor: '#6F2F3E' }} />
                        <stop offset="0.6603" style={{ stopColor: '#442639' }} />
                        <stop offset="0.8734" style={{ stopColor: '#2A2135' }} />
                        <stop offset="1" style={{ stopColor: '#201F34' }} />
                    </linearGradient>
                </defs>
                <style type="text/css">
                    {`
	                .st0{fill:url(#SVGID_1_);}
	                .st1{fill:#0E2B96;}
	                .st2{fill:url(#SVGID_00000170974756921016437950000000072773451131360146_);}
	                .st3{fill:url(#SVGID_00000114792231774494472650000006361652473961520771_);}
	                .st4{fill:url(#SVGID_00000016075241698164719430000008229864531647385483_);}
	                .st5{fill:url(#Tab_00000030484798892273547770000016362419768172079019_);stroke:#000000;stroke-width:6;stroke-miterlimit:10;}
	                .st6{fill:url(#SVGID_00000035500236349502016320000015274666057866703746_);}
	                .st7{fill:#545454;}
	                .st8{fill:url(#SVGID_00000170249079002779539360000004815873600335111092_);}
	                .st9{fill:url(#SVGID_00000140694187131473290260000001317304001888830103_);}
	                .st10{fill:url(#SVGID_00000160884978552857435960000003002379912207291525_);}
                    #Streak {
                        transition: transform 0.3s ease;
                    }

                    #Kami:not(.moved):hover #Streak {
                    transform: translateX(-31%);
                    }

                    text {
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    }

                    .loadingText {
                        animation: pulseOpacity 2s infinite;
                    }

                    @keyframes pulseOpacity {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}
                </style>
                <g id="KamiArriba_00000178892341235780403320000013665810626276377230_">
                    <g
                        id="AzulT"
                        style={{
                            opacity: isMoved ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                        }}
                    >
                        <path
                            className="st0"
                            d="M678.7,430.4c-1.1,0-2.1-0.6-2.6-1.5c-0.5-1-0.5-2.1,0.1-3c28.1-43,63.6-80.1,105.3-110.1
			c42.4-30.5,89.4-52.5,139.7-65.3c0.2-0.1,0.5-0.1,0.7-0.1c0.7,0,1.4,0.2,1.9,0.7c0.7,0.6,1.1,1.6,1,2.6l-0.7,5.8
			c0,0.4-0.1,0.7-0.3,1.1l-0.7,1.3v6.4c0,0.1,0,0.3,0,0.4l-0.3,2v2.3c0,36.9,41.7,62.7,101.5,62.7c59.8,0,101.5-25.8,101.5-62.7
			v-2.4l-0.3-2c0-0.1,0-0.2,0-0.4v-5.8l-0.6-1.2c-0.2-0.3-0.2-0.6-0.3-1l-0.7-6.3c-0.1-1,0.3-1.9,1-2.6c0.5-0.5,1.2-0.7,1.9-0.7
			c0.2,0,0.5,0,0.7,0.1c50.4,12.8,97.5,34.8,139.8,65.3c41.7,30.1,77.2,67.1,105.3,110.1c0.6,0.9,0.6,2.1,0.1,3
			c-0.5,1-1.5,1.5-2.6,1.5L678.7,430.4L678.7,430.4z"
                        />
                        <path
                            className="st1"
                            d="M1127,253.2c101.3,25.8,187.7,89,243.3,174.2H678.7c55.7-85.1,142-148.4,243.3-174.2l-0.7,5.8l-1,1.9v7.1
			l-0.3,2.2v2.5c0,38.7,42.9,65.7,104.4,65.7s104.5-27,104.5-65.7V270l-0.3-2.2l-0.1-6.5l-0.9-1.8L1127,253.2 M922,253.2L922,253.2
			 M1127,247.3c-1.4,0-2.8,0.5-3.9,1.5c-1.5,1.3-2.2,3.2-2,5.1l0.7,6.3c0.1,0.7,0.3,1.4,0.6,2l0.3,0.6v5.1c0,0.2,0,0.5,0,0.7
			l0.2,1.8v2.2c0,16.8-9.1,31.5-26.4,42.3c-17.9,11.2-43.5,17.4-72.2,17.4c-58,0-98.5-24.6-98.5-59.8v-2l0.2-1.8
			c0-0.3,0.1-0.5,0.1-0.8v-5.6l0.3-0.6c0.4-0.7,0.6-1.4,0.6-2.1l0.6-5.6c0-0.3,0.1-0.6,0.1-0.9c0-3.2-2.6-5.9-5.9-5.9l0,0l0,0
			c0,0,0,0-0.1,0c-0.1,0-0.1,0-0.2,0l0,0l0,0c-0.5,0-0.9,0.1-1.4,0.2c-50.7,12.9-98,35.1-140.6,65.8c-42,30.3-77.7,67.6-106.1,110.9
			c-1.2,1.8-1.3,4.1-0.2,6c1,1.9,3,3.1,5.2,3.1H1370c2.2,0,4.2-1.2,5.2-3.1s0.9-4.2-0.2-6c-28.3-43.3-64-80.6-106-110.9
			c-42.6-30.7-90-52.8-140.8-65.8C1128,247.4,1127.5,247.3,1127,247.3L1127,247.3L1127,247.3z"
                        />
                    </g>
                    <g id="Pelito" style={{
                        opacity: isMoved ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                    }}>
                        <path
                            style={{
                                fill: 'url(#SVGID_00000129193077446094284200000010306523065072325052_)',
                            }}
                            d="M1024.5,305.3c-40,0-71.4-14.3-71.4-32.6
			c0-0.1,0-0.3,0-0.4c0.1-0.4,0.1-0.8,0.1-1.2s0.1-0.8,0.1-1.2c0-0.2,0-0.5,0.1-0.8c0.5-4.1,0.9-8.3,1.4-12.4
			c0.4-3.8,0.8-7.6,1.2-11.5c6.8-62.3,13.7-124.7,20.5-187.1c0.1-26.3,21.5-47.7,47.9-47.7s47.9,21.5,47.9,47.9v0.2l2.4,21.7
			c6,55,12.1,110.1,18.1,165.1c0.4,3.8,0.8,7.6,1.2,11.4c0.5,4.2,0.9,8.3,1.4,12.5c0.1,0.3,0.1,0.6,0.1,0.8c0,0.4,0.1,0.8,0.1,1.2
			c0,0.4,0.1,0.8,0.1,1.2c0,0.1,0,0.3,0,0.4C1095.9,291,1064.6,305.3,1024.5,305.3L1024.5,305.3z"
                        />
                        <path
                            d="M1024.5,13.4c24.8,0,45,20.1,45,44.9v0.4c6.8,62.3,13.7,124.6,20.5,186.9c0.9,8.1,1.7,16.2,2.6,24.2
			c0.1,0.1,0.1,0.2,0.1,0.4c0.1,0.9,0.2,1.7,0.3,2.6c0,16.4-30.7,29.6-68.5,29.6c-37.8,0-68.4-13.3-68.4-29.6
			c0.1-0.9,0.2-1.7,0.3-2.6c0-0.1,0-0.2,0.1-0.4c0.9-8,1.7-16.1,2.6-24.2c6.8-62.4,13.7-124.8,20.5-187.2
			C979.6,33.5,999.7,13.4,1024.5,13.4 M1024.5,7.5c-27.9,0-50.6,22.6-50.8,50.5c-6.8,62.3-13.7,124.7-20.5,186.9
			c-0.4,3.8-0.8,7.7-1.3,11.5c-0.4,4.1-0.9,8.1-1.3,12.2c-0.1,0.4-0.1,0.7-0.1,1c0,0.4-0.1,0.8-0.1,1.2c0,0.4-0.1,0.8-0.1,1.1
			c0,0.3,0,0.5,0,0.8c0,10.4,8.4,19.8,23.6,26.4c13.6,5.9,31.7,9.2,50.7,9.2c19,0,37.1-3.3,50.8-9.2c15.2-6.6,23.6-16,23.6-26.4
			c0-0.3,0-0.5,0-0.8c0-0.4-0.1-0.8-0.1-1.1c0-0.4-0.1-0.8-0.1-1.2c0-0.3,0-0.6-0.1-1c-0.5-4.1-0.9-8.2-1.3-12.4
			c-0.4-3.8-0.8-7.6-1.2-11.4c-5.8-52.8-11.6-105.6-17.4-158.4l-3.1-28.2l0,0C1075.3,30.2,1052.5,7.5,1024.5,7.5L1024.5,7.5
			L1024.5,7.5z"
                        />
                    </g>
                </g>
                <g id="KamiAbajo" style={{
                    opacity: isMoved ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                }}>
                    <path
                        style={{
                            fill: 'url(#SVGID_00000156560162543221377760000009584901684244609462_)',
                        }}
                        d="M1024.5,1069.6
		c-78.3,0-154.7-21.9-220.7-63.3C739.5,966,687.4,909,653.2,841.5c-0.5-0.9-0.4-2,0.1-2.9s1.5-1.4,2.5-1.4h737.3c1,0,2,0.5,2.5,1.4
		s0.6,2,0.1,2.9c-34.1,67.5-86.2,124.5-150.5,164.8C1179.2,1047.7,1102.9,1069.6,1024.5,1069.6L1024.5,1069.6z"/>
                    <path className="st1" d="M1393.1,840.1c-68.1,134.4-207.6,226.5-368.6,226.5s-300.6-92.1-368.6-226.5H1393.1 M1393.1,834.2H655.9
		c-2.1,0-4,1.1-5,2.8c-1.1,1.8-1.2,3.9-0.2,5.8c34.4,68,86.9,125.4,151.6,166c66.5,41.7,143.4,63.8,222.3,63.8s155.8-22,222.3-63.8
		c64.7-40.6,117.2-98,151.6-166c0.9-1.8,0.8-4-0.2-5.8S1395.2,834.2,1393.1,834.2L1393.1,834.2L1393.1,834.2z M1393.1,846.1
		L1393.1,846.1L1393.1,846.1z"/>
                </g>
                <g id="Streak" style={{
                    transition: 'transform 0.3s ease, fill 0.5s ease',
                }}>
                    <path
                        style={{
                            fill: 'url(#SVGID_00000016038861446462578450000011637805086623395245_)',
                        }}
                        d="M644.2,806.7
		c-63.1,0-114.5-51.4-114.5-114.5V575.4c0-63.1,51.4-114.5,114.5-114.5H1229c63.1,0,114.5,51.4,114.5,114.5v116.9
		c0,63.1-51.4,114.5-114.5,114.5H644.2V806.7z"/>
                    <path className="st1" d="M1229,463.4c61.8,0,112,50.1,112,112v116.9c0,61.8-50.1,112-112,112H644.2c-61.8,0-112-50.1-112-112V575.4
		c0-61.8,50.1-112,112-112L1229,463.4 M1229,458.4H644.2c-31.2,0-60.6,12.2-82.7,34.3c-22.1,22.1-34.3,51.5-34.3,82.7v116.9
		c0,31.2,12.2,60.6,34.3,82.7c22.1,22.1,51.5,34.3,82.7,34.3H1229c31.2,0,60.6-12.2,82.7-34.3c22.1-22.1,34.3-51.5,34.3-82.7V575.4
		c0-31.2-12.2-60.6-34.3-82.7C1289.6,470.6,1260.2,458.4,1229,458.4L1229,458.4z"/>
                    <text
                        x="765"
                        y="655"
                        fontSize="230"
                        fill="#FFFFFF"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="Inter, sans-serif"
                        fontWeight="bold"
                    >
                        {displayStreakAmount}
                    </text>
                </g>


                <g id="Tab" style={{
                    fill: 'url(#Tab_00000181085521850192996330000012133393721873589662_)',
                    transform: displayState === 'REVIVE' ? 'translateY(-8%)' : 'translateY(0%)',
                    transition: 'transform 0.3s ease',
                }}>
                    <path id="Tab"
                        style={{
                            fill: 'url(#Tab_00000181085521850192996330000012133393721873589662_)',
                            stroke: '#000000',
                            strokeWidth: 6,
                            strokeMiterlimit: 10
                        }}

                        d="M1224.3,461.9H826.9c-27.5,0-53.8,6.2-72.9,17.3l-111.5,64.2h766.2l-111.5-64.2C1278,468.2,1251.7,461.9,1224.3,461.9z" />

                    {isRevive && !isMoved && (
                        <text
                            x="1023"
                            y="507"
                            fontSize="70px"
                            fill="#FFFFFF"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontFamily="Inter, sans-serif"
                            fontWeight="bold"
                        >
                            {formatTimeRemaining(endDate)}
                        </text>
                    )}

                    {isRevive && isMoved && (
                        <text
                            x="1023"
                            y="507"
                            fontSize="50px"
                            fill="#FFFFFF"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontFamily="Inter, sans-serif"
                            fontWeight="bold"
                        >
                            Revive Chance: {Number(globalID.userStreakPercentage)}%
                        </text>
                    )}

                </g>


                <g id="VisorBlanco">
                    <path
                        style={{
                            fill: 'url(#SVGID_00000078729366130487523830000005742619019277415816_)',
                        }}
                        d="M645.2,807.1c-1.9-0.1-3.9-0.1-5.9-0.3
		c-29.1-1.8-56.5-14.5-77.1-35.5c-19.9-20.4-31.8-47.1-33.5-75.3h-2.4c-17.4,0-31.6-14.1-31.6-31.5v-56.6
		c0-17.4,14.2-31.5,31.6-31.5h2.3c1.4-64.1,53.9-115.8,118.4-115.8h755.1c64.4,0,117,51.7,118.4,115.8h2.5
		c17.4,0,31.5,14.1,31.5,31.5v56.6c0,17.4-14.1,31.5-31.5,31.5h-2.7c-1.7,28.2-13.5,54.8-33.5,75.2c-20.6,21.1-48,33.7-77.1,35.6
		c-2,0.2-4,0.2-5.8,0.3h-0.1H645.2z"/>
                    <path className="st7" d="M1402,463.5c63.5,0,115.4,51.9,115.4,115.4v0.4h5.4c15.7,0,28.6,12.8,28.6,28.6v56.6
		c0,15.7-12.8,28.6-28.6,28.6h-5.5c-2.2,59-49.3,107.1-107.9,110.8c-1.9,0.2-3.8,0.2-5.7,0.3H645.2c-1.9-0.1-3.8-0.1-5.6-0.3
		c-58.7-3.7-105.8-51.9-108-110.9h-5.2c-15.8,0-28.6-12.8-28.6-28.6v-56.6c0-15.7,12.9-28.6,28.6-28.6h5.1v-0.4
		c0-63.5,51.9-115.4,115.4-115.4L1402,463.5 M1402,457.6H646.9c-32.3,0-62.7,12.6-85.7,35.6c-21.7,21.7-34.1,49.9-35.5,80.2
		c-18.7,0.3-33.9,15.6-33.9,34.4v56.6c0,18.9,15.3,34.3,34.2,34.5c2.3,27.9,14.3,54.1,34.1,74.4c21.1,21.6,49.1,34.5,79,36.4
		c2,0.2,4,0.3,5.9,0.3c0.1,0,0.1,0,0.2,0h758.5c0.1,0,0.1,0,0.2,0c1.9-0.1,3.9-0.1,6-0.3c29.8-1.9,57.8-14.8,78.9-36.4
		c19.8-20.3,31.8-46.5,34.1-74.4c19,0,34.4-15.5,34.4-34.5v-56.6c0-18.9-15.3-34.3-34.1-34.5c-1.4-30.2-13.8-58.5-35.5-80.2
		C1464.8,470.2,1434.3,457.5,1402,457.6L1402,457.6L1402,457.6z"/>
                </g>
                <g id="VisorNegro">
                    <path
                        style={{
                            fill: isMoved
                                ? 'url(#SVGID_00000074424352097243448040000001515703629981409440_)'
                                : isRevive
                                    ? 'url(#SVGID_00000154385756331280414030000011338415581356711597_)'
                                    : 'url(#SVGID_00000074424352097243448040000001515703629981409440_)',
                            transition: 'fill 0.5s ease',
                        }}
                        d="M655.5,498.9h740.2
		c48.1,0,87.1,39,87.1,87.1v95.6c0,48.1-39,87.1-87.1,87.1H655.5c-48.1,0-87.1-39-87.1-87.1V586C568.4,538,607.5,498.9,655.5,498.9
		L655.5,498.9z"/>
                    {!isMoved ? (
                        displayState === 'TIMER' ? (
                            <text
                                x="1025"
                                y="655"
                                fontSize="175"
                                fill="#FFFFFF"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontFamily="Inter, sans-serif"
                                fontWeight="bold"
                            >
                                {formatTimeRemaining(endDate)}
                            </text>
                        ) : (
                            <text
                                x="1025"
                                y="655"
                                fontSize="230"
                                fill="#FFFFFF"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontFamily="Inter, sans-serif"
                                fontWeight="bold"
                            >
                                {renderDisplayState}
                            </text>
                        )
                    ) : isLoading ? (
                        <text
                            x="1025"
                            y="655"
                            fontSize="180"
                            fill="#FFFFFF"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontFamily="Inter, sans-serif"
                            fontWeight="bold"
                            className="loadingText"
                        >
                            LOADING
                        </text>
                    ) : (
                        <text
                            x="1025"
                            y="655"
                            fontSize="180"
                            fill="#FFFFFF"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontFamily="Inter, sans-serif"
                            fontWeight="bold"
                        >
                            {responseState}
                        </text>
                    )}
                </g>
                <g
                    id="SeparadorIzq"
                    style={{
                        opacity: showSeparators ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                    }}
                >
                    <rect x="868.4" y="518.8"
                        style={{
                            fill: 'url(#SVGID_00000098199394142717416970000012108736271955527825_)',
                        }}
                        width="9.7" height="229.7" />
                </g>
                <g
                    id="SeparadorDer"
                    style={{
                        opacity: showSeparators ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                    }}
                >
                    <rect x="1173.2" y="518.8"
                        style={{
                            fill: 'url(#SVGID_00000041975678334081140710000015335286131432326575_)',
                        }}
                        width="9.7" height="229.7" />
                </g>
            </svg>

            {showContinueButton && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: isVertical ? '-14.5vw' : '-4.5vw',
                        left: '50%',
                        transform: isVertical ? 'translateX(-32%)' : 'translateX(-40%)',
                        width: isVertical ? '36vw' : '23vw',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            color: '#fff',
                            overflowWrap: 'break-word',
                            marginBottom: '10px',
                            fontSize: isVertical ? '1.5vw' : '0.67vw',
                            lineHeight: isVertical ? '12px' : '20px',
                        }}
                    >
                        {messageResponse}
                    </div>
                    <button
                        style={{
                            transform: 'translateY(6%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isVertical ? '1.75vw' : '0.75vw',
                            color: '#fff',
                            background: 'linear-gradient(to right, #34AADC, #337FF5)',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: isMoved ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                            width: '100%',
                            height: '2vw',
                        }}
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                </div>
            )}

        </>
    );
};

export default DailyStreakButtonComponent;
