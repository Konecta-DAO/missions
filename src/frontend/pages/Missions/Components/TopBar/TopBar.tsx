import React, { useEffect, useState } from 'react';
import styles from './TopBar.module.scss';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo.svg';
import NFIDLogo from '../../../../../../public/assets/NFID_Airdrop.svg';
import DFINITYLogo from '../../../../../../public/assets/DFINITYW.png';
import TimeCapsule from '../../../../../../public/assets/TimeCapsuleExtend.svg';

import NFIDPoints from '../../../../../../public/assets/NFIDpoints.svg';
import NFIDLogout from '../../../../../../public/assets/NFIDlogout.svg';
import DFINITYPoints from '../../../../../../public/assets/Dfinitypoints.svg';
import DFINITYLogout from '../../../../../../public/assets/DFINITYlogout.svg';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import HexagonButton from '../../../../components/HexagonButton/hexagonButton.tsx';
import { isMobileOnly, isTablet } from 'react-device-detect';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import DailyStreakButtonComponent from '../DailyStreakButton/DailyStreakButtonComponent.tsx';

import JackpotRoller from '../DailyStreakButton/JackpotRoller.tsx';

import JPBomb from '../DailyStreakButton/JackPotIcons/JPbomb.svg';
import JPcanister from '../DailyStreakButton/JackPotIcons/JPcanister.svg';
import JPicp from '../DailyStreakButton/JackPotIcons/JPicp.svg';
import JPkami from '../DailyStreakButton/JackPotIcons/JPkami.svg';
import JPkonectaToken from '../DailyStreakButton/JackPotIcons/JPkonectaToken.svg';
import JPnfid from '../DailyStreakButton/JackPotIcons/JPnfid.svg';
import JPnuance from '../DailyStreakButton/JackPotIcons/JPnuance.svg';
import JPopenchat from '../DailyStreakButton/JackPotIcons/JPopenchat.svg';
import JPvisor from '../DailyStreakButton/JackPotIcons/JPvisor.svg';

type JackpotState = 'DEFAULT' | 'WIN' | 'LOSE';

const svgList = [JPBomb, JPcanister, JPicp, JPkami, JPkonectaToken, JPnfid, JPnuance, JPopenchat, JPvisor];

interface TopBarProps {
    toggleModal: (modalName: keyof ModalState) => void;
}

type ModalState = {
    isHistoryModalOpen: boolean;
    isKonectaModalOpen: boolean;
    isInfoModalOpen: boolean;
    isOpenChatModalOpen: boolean;
};

const TopBar: React.FC<TopBarProps> = ({ toggleModal }) => {
    const globalID = useGlobalID();
    const { disconnect } = useIdentityKit();
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
    const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });
    const [currentTime, setCurrentTime] = useState(BigInt(Date.now()) * 1_000_000n);
    const [jackpotState, setJackpotState] = useState<JackpotState>('DEFAULT');
    const [targetNumbers, setTargetNumbers] = useState<number[]>([]);
    const [showFirstRoller, setShowFirstRoller] = useState(false);
    const [showSecondRoller, setShowSecondRoller] = useState(false);
    const [showThirdRoller, setShowThirdRoller] = useState(false);

    const navigate = useNavigate();

    const [isClaimClicked, setIsClaimClicked] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(BigInt(Date.now()) * 1_000_000n);
        }, 1000); // Update every second

        return () => clearInterval(interval); // Clean up on unmount
    }, []);

    useEffect(() => {

        if (jackpotState === 'WIN') {
            const winNumbers = [3, 4, 5];
            const winNumber = winNumbers[Math.floor(Math.random() * winNumbers.length)];
            setTargetNumbers([winNumber, winNumber, winNumber]);
        };

        if (jackpotState === 'LOSE') {
            const numbers: React.SetStateAction<number[]> = [];
            while (numbers.length < 3) {
                const num = Math.floor(Math.random() * 9) + 1; // Random number between 1 and 9
                if (!numbers.includes(num)) {
                    numbers.push(num);
                }
            }
            setTargetNumbers(numbers);
        };

        if (jackpotState === 'WIN' || jackpotState === 'LOSE') {
            setShowFirstRoller(true);

            const secondRollerTimeout = setTimeout(() => {
                setShowSecondRoller(true);
            }, 1000); // Start second roller after 1 second

            const thirdRollerTimeout = setTimeout(() => {
                setShowThirdRoller(true);
            }, 2000); // Start third roller after 2 seconds

            // Clean up the timeouts when component unmounts or jackpotState changes
            return () => {
                clearTimeout(secondRollerTimeout);
                clearTimeout(thirdRollerTimeout);
            };
        } else {
            // Reset rollers if jackpotState is 'DEFAULT'
            setShowFirstRoller(false);
            setShowSecondRoller(false);
            setShowThirdRoller(false);
        }
    }, [jackpotState]);


    const handleClaimClick = () => {
        if (!isClaimClicked) {
            setIsClaimClicked(true);
        }
    };

    const isDisabled = currentTime < (globalID.userLastTimeStreak + globalID.streakResetTime);

    const modalMap: { [key: string]: keyof ModalState } = {
        History: 'isHistoryModalOpen',
        Konecta: 'isKonectaModalOpen',
        Info: 'isInfoModalOpen',
    };

    const handleDC = () => {
        disconnect(); // Call disconnect if it's defined
        navigate('/'); // Navigate to the home page
    };

    return (
        <>
            {!isMobileOnly && !isTablet ? (
                <nav className={styles.topbar}>

                    <svg
                        className={`${styles.topbarSvg} ${isClaimClicked ? styles.darkened : ''}`}
                        id="Capa_2"
                        data-name="Capa 2"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 1920 93.01"
                    >
                        <defs>
                            <radialGradient
                                id="Degradado_sin_nombre_67"
                                data-name="Degradado sin nombre 67G"
                                cx={960}
                                cy={45}
                                fx={960}
                                fy={-796.82}
                                r={960.66}
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset={0} stopColor="#337ff5" />
                                <stop offset={0.57} stopColor="#337ff5" stopOpacity={0} />
                            </radialGradient>
                            <linearGradient
                                id="Degradado_sin_nombre_87"
                                data-name="Degradado sin nombre 87"
                                x1={0.87}
                                y1={91.01}
                                x2={1920}
                                y2={91.01}
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset={0} stopColor="#1f2033" />
                                <stop offset={0.5} stopColor="#337ff5" />
                                <stop offset={1} stopColor="#1f2033" />
                            </linearGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_24"
                                data-name="Degradado sin nombre 24"
                                cx={1710.27}
                                cy={45}
                                fx={1710.27}
                                fy={-102.12}
                                r={147.12}
                                gradientTransform="translate(0 33.32) scale(1 .26)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset={0.13} stopColor="#fff" />
                                <stop offset={0.34} stopColor="#dedee1" />
                                <stop offset={0.66} stopColor="#a6a5ae" />
                                <stop offset={1} stopColor="#797985" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_109"
                                data-name="Degradado sin nombre 109"
                                cx={1689.8}
                                cy={45.03}
                                fx={1689.8}
                                fy={-92.87}
                                r={139.68}
                                gradientTransform="translate(-399.26 1.52) scale(1.25 .97)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset={0} stopColor="#337ff5" />
                                <stop offset={0.08} stopColor="#3078e8" />
                                <stop offset={0.22} stopColor="#2967c7" />
                                <stop offset={0.41} stopColor="#1e4b91" />
                                <stop offset={0.64} stopColor="#0f2548" />
                                <stop offset={0.84} stopColor="#000" />
                            </radialGradient>
                            <linearGradient
                                id="Degradado_sin_nombre_108"
                                data-name="Degradado sin nombre 108"
                                x1={1643.63}
                                y1={29.03}
                                x2={1643.63}
                                y2={61.89}
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset={0} stopColor="#1f2033" stopOpacity={0} />
                                <stop offset={0.06} stopColor="#223055" stopOpacity={0.18} />
                                <stop offset={0.15} stopColor="#274885" stopOpacity={0.42} />
                                <stop offset={0.23} stopColor="#2b5bad" stopOpacity={0.63} />
                                <stop offset={0.31} stopColor="#2e6bcc" stopOpacity={0.79} />
                                <stop offset={0.39} stopColor="#3176e2" stopOpacity={0.91} />
                                <stop offset={0.45} stopColor="#327cf0" stopOpacity={0.98} />
                                <stop offset={0.5} stopColor="#337ff5" />
                                <stop offset={0.56} stopColor="#327df1" stopOpacity={0.98} />
                                <stop offset={0.63} stopColor="#3178e8" stopOpacity={0.93} />
                                <stop offset={0.69} stopColor="#3070d8" stopOpacity={0.85} />
                                <stop offset={0.76} stopColor="#2d65c1" stopOpacity={0.73} />
                                <stop offset={0.82} stopColor="#2a57a4" stopOpacity={0.59} />
                                <stop offset={0.89} stopColor="#274680" stopOpacity={0.4} />
                                <stop offset={0.95} stopColor="#223157" stopOpacity={0.19} />
                                <stop offset={1} stopColor="#1f2033" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient
                                id="Degradado_sin_nombre_108-2"
                                data-name="Degradado sin nombre 108"
                                x1={1690.23}
                                y1={29.05}
                                x2={1690.23}
                                y2={61.82}
                                xlinkHref="#Degradado_sin_nombre_108"
                            />
                            <linearGradient
                                id="Degradado_sin_nombre_108-3"
                                data-name="Degradado sin nombre 108"
                                x1={1736.83}
                                y1={29.12}
                                x2={1736.83}
                                y2={61.82}
                                xlinkHref="#Degradado_sin_nombre_108"
                            />
                            <linearGradient
                                id="Degradado_sin_nombre_108-4"
                                data-name="Degradado sin nombre 108"
                                x1={1783.43}
                                y1={28.6}
                                x2={1783.43}
                                y2={61.32}
                                xlinkHref="#Degradado_sin_nombre_108"
                            />
                        </defs>
                        <g id="Navbar">
                            <g id="RectanguloBase">
                                <rect width={1920} height={90} fill="#1f2033" strokeWidth={0} />
                            </g>
                            <g id="RectanguloGradient">
                                <rect
                                    width={1920}
                                    height={90}
                                    fill="url(#Degradado_sin_nombre_67G)"
                                    strokeWidth={0}
                                />
                            </g>
                            <line
                                id="LineaRectangulo"
                                x1={0.87}
                                y1={91.01}
                                x2={1920}
                                y2={91.01}
                                fill="none"
                                stroke="url(#Degradado_sin_nombre_87)"
                                strokeMiterlimit={10}
                                strokeWidth={4}
                            />
                            <path
                                d="M1843.69,41.12v8.46c0,2.35-1.92,4.27-4.27,4.27h-.82c-.33,8.82-7.37,16-16.13,16.56-.29.02-.57.03-.85.04h-244.76c3.89-3.1,6.7-7.47,7.82-12.51,3.3-1.42,5.62-4.71,5.62-8.52v-8.46c0-3.76-2.24-7-5.46-8.45-.97-5.17-3.74-9.72-7.63-12.96h244.16c9.49,0,17.25,7.76,17.25,17.25v.05h.8c2.35,0,4.27,1.92,4.27,4.27Z"
                                fill="url(#Degradado_sin_nombre_24)"
                                stroke="#545454"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={0.66}
                            />
                            <g id="FondoBotones">
                                <rect
                                    x={1597.02}
                                    y={24.76}
                                    width={233.01}
                                    height={40.55}
                                    rx={15.01}
                                    ry={15.01}
                                    fill="url(#Degradado_sin_nombre_109)"
                                    strokeWidth={0}
                                />
                            </g>
                            <g id="Botones">
                                <g id="HistoryIcon" style={{ cursor: 'pointer' }} onClick={() => toggleModal('isHistoryModalOpen')}>
                                    <path
                                        d="M1610.37,35.33h18.02c.51,0,.94.43.94.94v19.44c0,.51-.43.94-.94.94h-18.02c-.51,0-.94-.43-.94-.94v-19.44c0-.51.43-.94.94-.94Z"
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth={1.14}
                                    />
                                    <path
                                        d="M1613.46,41.25h11.86"
                                        fill="none"
                                        stroke="#fff"
                                        strokeLinecap="round"
                                        strokeWidth={1.14}
                                    />
                                    <path
                                        d="M1613.46,44.32h11.86"
                                        fill="none"
                                        stroke="#fff"
                                        strokeLinecap="round"
                                        strokeWidth={1.14}
                                    />
                                    <path
                                        d="M1613.46,47.41h11.86"
                                        fill="none"
                                        stroke="#fff"
                                        strokeLinecap="round"
                                        strokeWidth={1.14}
                                    />
                                    <path
                                        d="M1613.46,50.48h11.86"
                                        fill="none"
                                        stroke="#fff"
                                        strokeLinecap="round"
                                        strokeWidth={1.14}
                                    />
                                    <path
                                        d="M1613.22,33.43h17.06c.51,0,.94.43.94.94v16.6"
                                        fill="none"
                                        stroke="#fff"
                                        strokeLinecap="round"
                                        strokeWidth={1.14}
                                    />
                                </g>
                                <g id="KonectaIcon" style={{ cursor: 'pointer' }} onClick={() => toggleModal('isKonectaModalOpen')}>

                                    <path
                                        d="M1679.75,45.43c.98.35,1,.38,1.02,1.35,0,.33,0,.67,0,1,0,.5.04.99-.46,1.35-.18.13-.25.46-.31.72-.63,2.34-3.06,4.61-6.14,4.59-4.62-.03-9.23.01-13.85-.01-2.87-.02-5.22-1.78-6.09-4.51-.12-.39-.24-.73-.54-1.04-.18-.18-.23-.54-.26-.83-.04-.4-.02-.8-.01-1.2.02-1,.08-1.08,1.06-1.44.85-1.75,2.17-3.02,4.1-3.53.73-.2,1.51-.29,2.27-.3,4.25-.03,8.5,0,12.75-.02,2.91-.01,5.08,1.18,6.47,3.87h0ZM1667.11,50.75h0c.7,0,1.41,0,2.11,0,.97,0,1.94.02,2.91,0,1.13-.03,2.07-.76,2.41-1.8.36-1.12.01-2.24-.9-2.96-.55-.43-1.2-.58-1.88-.58-1.04-.01-2.08,0-3.11,0-2.08,0-4.15,0-6.22,0-.94,0-1.8.25-2.41,1.02-.69.86-.77,1.85-.33,2.83.43.96,1.25,1.48,2.31,1.49,1.71.03,3.41,0,5.12,0h0Z"
                                        fill="#fff"
                                        strokeWidth={0}
                                    />
                                    <path
                                        d="M1661.01,39.66h-1.96c-.15-1.2.36-2.11,1.12-2.89.67-.69,1.52-1.11,2.5-1.12,2.84-.02,5.69-.03,8.53,0,1.96.02,3.8,1.94,3.65,4-.31.02-.63.04-.95.05-.33,0-.66,0-.97,0-.08-.1-.15-.14-.17-.19-.49-1.4-.93-1.72-2.43-1.73-.73,0-1.46,0-2.24,0-.02.4-.03.7-.06.99-.02.26-.04.52-.07.86h-2.07c-.03-.59-.06-1.17-.1-1.83-1.01,0-1.98-.05-2.94.02-.75.05-1.31.48-1.6,1.2-.09.21-.17.42-.26.66h0Z"
                                        fill="#fff"
                                        strokeWidth={0}
                                    />

                                </g>
                                <g id="QuestionMark" style={{ cursor: 'pointer' }} onClick={() => toggleModal('isInfoModalOpen')}>
                                    <text
                                        transform="translate(1704.59 57.89)"
                                        fill="#fff"
                                        fontFamily="Inter-Regular, Inter"
                                        fontSize={35.17}
                                        font-variation-settings="'opsz' 14, 'wght' 400"
                                    >
                                        <tspan x={0} y={0}>
                                            {"?"}
                                        </tspan>
                                    </text>
                                </g>
                                <g id="IconoPuerta" style={{ cursor: 'pointer' }} onClick={() => disconnect()}>
                                    <g>
                                        <path
                                            d="M1810.02,47.59h-3.13c0,.51,0,1.03,0,1.54,0,.56-.12,1.08-.47,1.53-.58.75-1.5,1.03-2.41.73-.85-.27-1.44-1.04-1.47-1.96-.02-.79,0-1.58,0-2.37,0-.57,0-1.14,0-1.72h0c0-1.39-.02-2.78,0-4.17.02-.86.43-1.53,1.22-1.88.8-.36,1.6-.29,2.31.27.62.49.83,1.19.83,1.96v1.23h3.13c0-.92,0-1.85,0-2.77,0-.62-.08-1.25-.24-1.85-.42-1.57-1.45-2.64-2.88-3.34-.29-.8-.35-.85-1.17-.87-.33,0-.66-.02-.98,0-.24.03-.53.06-.68.21-.25.25-.53.34-.85.44-2.22.71-3.66,2.62-3.67,4.96-.02,3.76.01,7.52-.01,11.28-.02,2.51,1.83,4.48,3.74,5,.21.06.47.11.58.25.3.4.69.38,1.1.37.27,0,.55,0,.82,0,.78-.01.81-.03,1.1-.83h0c2.18-1.13,3.16-2.9,3.15-5.27,0-.92,0-1.85,0-2.77Z"
                                            fill="#fff"
                                            strokeWidth={0}
                                        />
                                        <path
                                            d="M1798.38,40.38c-.19.08-.36.14-.54.21-.58.24-.93.7-.97,1.31-.05.78-.01,1.57-.01,2.39.54.03,1.01.06,1.49.08v1.68c-.27.02-.49.04-.7.06-.24.02-.48.03-.81.05,0,.64,0,1.24,0,1.83,0,1.22.27,1.58,1.41,1.98.05.02.08.07.16.13,0,.25,0,.52,0,.79,0,.26-.02.52-.04.77-1.68.12-3.24-1.38-3.26-2.97-.03-2.32-.02-4.63,0-6.95,0-.8.35-1.49.91-2.04.63-.62,1.37-1.03,2.35-.91v1.59s0,0,0,0Z"
                                            fill="#fff"
                                            strokeWidth={0}
                                        />
                                        <path
                                            d="M1818.41,45.39l-5.26,3.39c-.15.1-.34-.02-.34-.22v-1.57c0-.14-.1-.25-.23-.25h-7.83c-.13,0-.23-.11-.23-.25v-2.62c0-.14.1-.25.23-.25h7.83c.13,0,.23-.11.23-.25v-1.57c0-.2.19-.32.34-.22l5.26,3.39c.15.1.15.34,0,.44Z"
                                            fill="#fff"
                                            strokeWidth={0}
                                        />
                                    </g>
                                </g>
                                <g id="ProfileIcon" style={{ cursor: 'pointer' }}>
                                    <path
                                        d="M1765.75,34.85c-.45-.1-.92-.15-1.45-.15h-5.09c-1,0-2,0-2.99.01-.47,0-.96.05-1.43.15,1.35-1.49,3.31-2.43,5.49-2.43s4.13.94,5.47,2.42Z"
                                        fill="#fff"
                                        strokeWidth={0}
                                    />
                                    <path
                                        d="M1764.67,45.05h-.01c-1.08-.01-2.17-.01-3.24-.01h-5.54c-.35,0-.7-.04-1.03-.11,1.35,1.46,3.29,2.37,5.43,2.37s4.07-.9,5.42-2.36c-.33.08-.67.11-1.02.11Z"
                                        fill="#fff"
                                        strokeWidth={0}
                                    />
                                    <path
                                        d="M1773.14,57.64h-25.73c2.56-4.44,7.37-7.43,12.86-7.43s10.31,2.99,12.87,7.43Z"
                                        fill="#fff"
                                        strokeWidth={0}
                                    />
                                    <path
                                        d="M1769.04,39.74c0-.22.01-.42,0-.64,0-.61-.02-.63-.64-.85h0c-.4-.78-.91-1.37-1.52-1.76-.72-.48-1.58-.71-2.58-.7-2.7.01-5.39-.01-8.09.01-.48,0-.98.07-1.44.19-.41.11-.77.27-1.1.49-.65.41-1.14,1.01-1.5,1.75-.63.23-.66.27-.67.91,0,.25-.02.51.01.76.01.19.04.41.16.52.2.2.26.41.34.66.3.96.9,1.73,1.69,2.23.62.39,1.36.62,2.18.63,2.94.01,5.87-.01,8.79.01.82,0,1.56-.24,2.18-.65.86-.54,1.48-1.4,1.71-2.26.04-.16.09-.37.21-.46.32-.23.29-.53.28-.85ZM1765.09,40.48c-.21.65-.81,1.12-1.52,1.14-.61.01-1.23,0-1.84,0h-1.34c-1.09,0-2.17.01-3.25,0-.66-.02-1.19-.34-1.46-.95-.28-.63-.23-1.25.21-1.81.38-.48.93-.64,1.52-.64h5.92c.44.01.85.1,1.2.37.58.46.79,1.18.57,1.88Z"
                                        fill="#fff"
                                        strokeWidth={0}
                                    />
                                </g>
                            </g>
                            <rect
                                id="SeparadorBoton1"
                                x={1643.13}
                                y={28.25}
                                width={1}
                                height={33.88}
                                fill="url(#Degradado_sin_nombre_108)"
                                strokeWidth={0}
                            />
                            <rect
                                id="SeparadorBoton2"
                                x={1689.73}
                                y={28.48}
                                width={1}
                                height={33.88}
                                fill="url(#Degradado_sin_nombre_108-2)"
                                strokeWidth={0}
                            />
                            <rect
                                id="SeparadorBoton3"
                                x={1736.33}
                                y={28.48}
                                width={1}
                                height={33.88}
                                fill="url(#Degradado_sin_nombre_108-3)"
                                strokeWidth={0}
                            />
                            <rect
                                id="SeparadorBoton4"
                                x={1782.93}
                                y={27.89}
                                width={1}
                                height={33.88}
                                fill="url(#Degradado_sin_nombre_108-4)"
                                strokeWidth={0}
                            />
                        </g>
                    </svg>

                    <div className={styles.topbarLeft}>
                        <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                            <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                            <div className={styles.TimerText}>{globalID.timerText}</div>
                        </div>
                    </div>
                    <div className={`${styles.topbarCenter} ${isClaimClicked ? styles.darkened : ''}`}>
                        <img
                            src={KonectaLogo}
                            alt="Konecta Logo"
                            className={styles.KonectaLogo}
                        />
                    </div>
                    <div className={styles.topbarRight}>

                        <div
                            className={`${styles.topbarButtonClaim} ${isClaimClicked ? styles.claimClicked : ''}`}
                            onClick={!isDisabled ? handleClaimClick : undefined}
                        >
                            <DailyStreakButtonComponent setIsClaimClicked={setIsClaimClicked} setJackpotState={setJackpotState} />

                            {(jackpotState === 'WIN' || jackpotState === 'LOSE') && (
                                <>
                                    {showFirstRoller && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '115px',
                                                left: '134px',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <JackpotRoller targetNumber={targetNumbers[0]} svgList={svgList} size={50} />
                                        </div>
                                    )}
                                    {showSecondRoller && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '115px',
                                                left: '203px',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <JackpotRoller targetNumber={targetNumbers[1]} svgList={svgList} size={50} />
                                        </div>
                                    )}
                                    {showThirdRoller && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '115px',
                                                left: '270px',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <JackpotRoller targetNumber={targetNumbers[2]} svgList={svgList} size={50} />
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                        { /*
                                    buttonList
                                        ?.filter((item) => item.type !== 'mobile')
                                        .map((item) => {
                                            const modalName = modalMap[item.name];
                                            return <li className={`${styles.topbarButton} ${isClaimClicked ? styles.darkened : ''}`} >
                                                <HexagonButton name={item.name} src={item.src} onClick={item.onClick ? item.onClick : () => { toggleModal(modalName) }} />
                                            </li>
                                        })
                              */  }
                    </div>

                </nav >
            ) : isMobileOnly ? (
                <>
                    {isPortrait && (
                        <nav className={styles.topbarMobile}>
                            <div className={styles.topbarTop}>
                                <div className={`${styles.topbarLeftMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <img src={KonectaLogo} alt="Logo" className={styles.KonectaLogoMobile} />
                                </div>
                                <div className={`${styles.topbarRightMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <div className={styles.hexagonButtonWrapper}>
                                        <HexagonButton
                                            name="Log Out"
                                            src={"/assets/logout_button.svg"}
                                            onClick={handleDC}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.topbarBottom}>

                                <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsuleMobile} />
                                    <div className={styles.TimerTextMobile}>{globalID.timerText}</div>
                                </div>


                                <ul className={styles.topbarRightMobile}>
                                    <li
                                        className={`${styles.topbarButtonClaimMobile} ${isClaimClicked ? styles.claimClickedMobile : ''}`}
                                        onClick={!isDisabled ? handleClaimClick : undefined}
                                    >
                                        <DailyStreakButtonComponent setIsClaimClicked={setIsClaimClicked} setJackpotState={setJackpotState} />

                                        {(jackpotState === 'WIN' || jackpotState === 'LOSE') && (
                                            <>
                                                {showFirstRoller && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '58.5px',
                                                            left: '68px',
                                                            pointerEvents: 'none',
                                                        }}
                                                    >
                                                        <JackpotRoller targetNumber={targetNumbers[0]} svgList={svgList} size={25} />
                                                    </div>
                                                )}
                                                {showSecondRoller && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '58.5px',
                                                            left: '102px',
                                                            pointerEvents: 'none',
                                                        }}
                                                    >
                                                        <JackpotRoller targetNumber={targetNumbers[1]} svgList={svgList} size={25} />
                                                    </div>
                                                )}
                                                {showThirdRoller && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '58.5px',
                                                            left: '136px',
                                                            pointerEvents: 'none',
                                                        }}
                                                    >
                                                        <JackpotRoller targetNumber={targetNumbers[2]} svgList={svgList} size={25} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </li>
                                </ul>

                            </div>
                        </nav>
                    )}
                </>
            ) : (
                <>
                    {isPortrait && (
                        <nav className={styles.topbarMobile}>
                            <div className={styles.topbarTop}>
                                <div className={`${styles.topbarLeftMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <img src={KonectaLogo} alt="Logo" className={styles.KonectaLogoMobile} />
                                </div>
                                <div className={`${styles.topbarRightMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <div className={styles.hexagonButtonWrapper}>
                                        <HexagonButton
                                            name="Log Out"
                                            src={"/assets/logout_button.svg"}
                                            onClick={handleDC}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.topbarBottom}>

                                <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsuleMobile} />
                                    <div className={styles.TimerTextMobile}>{globalID.timerText}</div>
                                </div>


                                <ul className={styles.topbarRightMobile}>
                                    <li
                                        className={`${styles.topbarButtonClaimMobile} ${isClaimClicked ? styles.claimClickedMobile : ''}`}
                                        onClick={!isDisabled ? handleClaimClick : undefined}
                                    >
                                        <DailyStreakButtonComponent setIsClaimClicked={setIsClaimClicked} setJackpotState={setJackpotState} />

                                        {(jackpotState === 'WIN' || jackpotState === 'LOSE') && (
                                            <>
                                                {showFirstRoller && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '58.5px',
                                                            left: '68px',
                                                            pointerEvents: 'none',
                                                        }}
                                                    >
                                                        <JackpotRoller targetNumber={targetNumbers[0]} svgList={svgList} size={25} />
                                                    </div>
                                                )}
                                                {showSecondRoller && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '58.5px',
                                                            left: '102px',
                                                            pointerEvents: 'none',
                                                        }}
                                                    >
                                                        <JackpotRoller targetNumber={targetNumbers[1]} svgList={svgList} size={25} />
                                                    </div>
                                                )}
                                                {showThirdRoller && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '58.5px',
                                                            left: '136px',
                                                            pointerEvents: 'none',
                                                        }}
                                                    >
                                                        <JackpotRoller targetNumber={targetNumbers[2]} svgList={svgList} size={25} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </li>
                                </ul>

                            </div>
                        </nav>
                    )}
                    {isLandscape && (
                        <nav className={styles.topbar}>
                            <div className={styles.topbarLeft}>
                                <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                                    <div className={styles.TimerText}>{globalID.timerText}</div>
                                </div>
                            </div>
                            <div className={`${styles.topbarCenter} ${isClaimClicked ? styles.darkened : ''}`}>
                                <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
                            </div>
                            <ul className={styles.topbarRight}>
                                <li
                                    className={`${styles.topbarButtonClaim} ${isClaimClicked ? styles.claimClicked : ''}`}
                                    onClick={!isDisabled ? handleClaimClick : undefined}
                                >
                                    <DailyStreakButtonComponent setIsClaimClicked={setIsClaimClicked} setJackpotState={setJackpotState} />

                                    {(jackpotState === 'WIN' || jackpotState === 'LOSE') && (
                                        <>
                                            {showFirstRoller && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '115px',
                                                        left: '134px',
                                                        pointerEvents: 'none',
                                                    }}
                                                >
                                                    <JackpotRoller targetNumber={targetNumbers[0]} svgList={svgList} size={50} />
                                                </div>
                                            )}
                                            {showSecondRoller && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '115px',
                                                        left: '203px',
                                                        pointerEvents: 'none',
                                                    }}
                                                >
                                                    <JackpotRoller targetNumber={targetNumbers[1]} svgList={svgList} size={50} />
                                                </div>
                                            )}
                                            {showThirdRoller && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '115px',
                                                        left: '270px',
                                                        pointerEvents: 'none',
                                                    }}
                                                >
                                                    <JackpotRoller targetNumber={targetNumbers[2]} svgList={svgList} size={50} />
                                                </div>
                                            )}
                                        </>
                                    )}

                                </li>
                                {/*
                                    buttonList
                                        ?.filter((item) => item.type !== 'mobile')
                                        .map((item) => {
                                            const modalName = modalMap[item.name];
                                            return <li className={`${styles.topbarButton} ${isClaimClicked ? styles.darkened : ''}`} >
                                                <HexagonButton name={item.name} src={item.src} onClick={item.onClick ? item.onClick : () => { toggleModal(modalName) }} />
                                            </li>
                                        })
                                */}
                            </ul>
                        </nav>
                    )}
                </>
            )}

            {
                isClaimClicked && (
                    <div className={styles.overlayClaim}></div>
                )
            }
        </>
    );
};

export default TopBar;
