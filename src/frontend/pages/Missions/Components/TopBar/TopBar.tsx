import React, { useEffect, useState } from 'react';
import styles from './TopBar.module.scss';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo.svg';
import NFIDLogo from '../../../../../../public/assets/NFID_Airdrop.svg';
import DFINITYLogo from '../../../../../../public/assets/DFINITYW.png';
import TimeCapsule from '../../../../../../public/assets/Time Capsule.svg';
import NFIDPoints from '../../../../../../public/assets/NFIDpoints.svg';
import NFIDLogout from '../../../../../../public/assets/NFIDlogout.svg';
import DFINITYPoints from '../../../../../../public/assets/Dfinitypoints.svg';
import DFINITYLogout from '../../../../../../public/assets/DFINITYlogout.svg';
import { useGlobalID, MissionPage } from '../../../../../hooks/globalID.tsx';
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

interface ButtonItem {
    name: string;
    src: string;
    onClick?: () => void;
    type?: string;
}

interface TopBarProps {
    buttonList: ButtonItem[];
    toggleModal: (modalName: keyof ModalState) => void;
}

type ModalState = {
    isHistoryModalOpen: boolean;
    isKonectaModalOpen: boolean;
    isInfoModalOpen: boolean;
    isOpenChatModalOpen: boolean;
};

const TopBar: React.FC<TopBarProps> = ({ buttonList, toggleModal }) => {
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

    const [isHoveringOverNFIDLogo, setIsHoveringOverNFIDLogo] = useState(false);
    const [isHoveringOverDFINITYLogo, setIsHoveringOverDFINITYLogo] = useState(false);
    const [isHoveringOverKonectaLogo, setIsHoveringOverKonectaLogo] = useState(false);

    const [isPressed, setIsPressed] = useState(false);
    const handleMouseDown = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        if (event.button !== 0) return;
        setIsPressed(true);
        handleDC();
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    const handleMouseLeave = () => {
        setIsPressed(false);
    };


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
                        className={styles.topbarSvg}
                        id="Capa_2"
                        data-name="Capa 2"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 1920.4 119.1"
                    >
                        <defs>
                            <radialGradient
                                id="Degradado_sin_nombre_blue"
                                data-name="Degradado sin nombre blue"
                                cx="951.31"
                                cy="1120.81"
                                fx="951.31"
                                fy="1438.94"
                                r="368.9"
                                gradientTransform="translate(0 -958)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".41" stopColor="#6691ff" />
                                <stop offset=".48" stopColor="#5987ff" />
                                <stop offset=".66" stopColor="#4176ff" />
                                <stop offset=".82" stopColor="#326bff" />
                                <stop offset=".96" stopColor="#2e68ff" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_green"
                                data-name="Degradado sin nombre green"
                                cx="951.31"
                                cy="1120.81"
                                fx="951.31"
                                fy="1438.94"
                                r="368.9"
                                gradientTransform="translate(0 -958)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".41" stopColor="#2dd4bf" />
                                <stop offset=".52" stopColor="#22bfad" />
                                <stop offset=".68" stopColor="#16a798" />
                                <stop offset=".83" stopColor="#0f988c" />
                                <stop offset=".96" stopColor="#0d9488" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_purple"
                                data-name="Degradado sin nombre purple"
                                cx="951.31"
                                cy="1120.81"
                                fx="951.31"
                                fy="1438.94"
                                r="368.9"
                                gradientTransform="translate(0 -958)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".41" stopColor="#4D00F1" />
                                <stop offset=".52" stopColor="#4400D5" />
                                <stop offset=".68" stopColor="#4100CB" />
                                <stop offset=".83" stopColor="#3B00B9" />
                                <stop offset=".96" stopColor="#3500A7" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_blue"
                                data-name="Degradado sin nombre 2"
                                cx="960.2"
                                cy="58.125"
                                fx="960.7092"
                                fy="732.1002"
                                r="680.2068"
                                gradientTransform="matrix(1 0 0 1.0045 0 -0.2607)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#2e68ff" />
                                <stop offset=".29" stopColor="#2d65f7" />
                                <stop offset=".36" stopColor="#2a54ca" />
                                <stop offset=".43" stopColor="#2746a1" />
                                <stop offset=".51" stopColor="#253a7f" />
                                <stop offset=".6" stopColor="#233064" />
                                <stop offset=".69" stopColor="#21284e" />
                                <stop offset=".8" stopColor="#201f36" />
                                <stop offset=".96" stopColor="#201f34" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_blue_1"
                                data-name="Degradado sin nombre 2"
                                cx="703.548"
                                cy="60.7654"
                                fx="690.919"
                                fy="60.852"
                                r="99.7718"
                                gradientTransform="matrix(-1.219150e-02 -0.9997 0.2583 -1.259791e-02 822.6259 764.8698)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#2e68ff" />
                                <stop offset=".29" stopColor="#2d65f7" />
                                <stop offset=".36" stopColor="#2a54ca" />
                                <stop offset=".43" stopColor="#2746a1" />
                                <stop offset=".51" stopColor="#253a7f" />
                                <stop offset=".6" stopColor="#233064" />
                                <stop offset=".69" stopColor="#21284e" />
                                <stop offset=".8" stopColor="#201f36" />
                                <stop offset=".96" stopColor="#201f34" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_blue_2"
                                data-name="Degradado sin nombre 2"
                                cx="1225.5222"
                                cy="60.7654"
                                fx="1212.8932"
                                fy="60.852"
                                r="99.7718"
                                gradientTransform="matrix(-1.219150e-02 -0.9997 0.2583 -1.259791e-02 1089.9766 1286.6887)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#2e68ff" />
                                <stop offset=".29" stopColor="#2d65f7" />
                                <stop offset=".36" stopColor="#2a54ca" />
                                <stop offset=".43" stopColor="#2746a1" />
                                <stop offset=".51" stopColor="#253a7f" />
                                <stop offset=".6" stopColor="#233064" />
                                <stop offset=".69" stopColor="#21284e" />
                                <stop offset=".8" stopColor="#201f36" />
                                <stop offset=".96" stopColor="#201f34" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_green"
                                data-name="Degradado sin nombre 2"
                                cx="960.2"
                                cy="58.125"
                                fx="960.7092"
                                fy="732.1002"
                                r="680.2068"
                                gradientTransform="matrix(1 0 0 1.0045 0 -0.2607)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#2dd4bf" />
                                <stop offset=".29" stopColor="#2ab4a6" />
                                <stop offset=".36" stopColor="#278c88" />
                                <stop offset=".43" stopColor="#256a6e" />
                                <stop offset=".51" stopColor="#234f58" />
                                <stop offset=".6" stopColor="#213948" />
                                <stop offset=".69" stopColor="#202a3c" />
                                <stop offset=".8" stopColor="#202136" />
                                <stop offset=".96" stopColor="#201f34" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_green_1"
                                data-name="Degradado sin nombre 2"
                                cx="703.548"
                                cy="60.7654"
                                fx="690.919"
                                fy="60.852"
                                r="99.7718"
                                gradientTransform="matrix(-1.219150e-02 -0.9997 0.2583 -1.259791e-02 822.6259 764.8698)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#2dd4bf" />
                                <stop offset=".29" stopColor="#2ab4a6" />
                                <stop offset=".36" stopColor="#278c88" />
                                <stop offset=".43" stopColor="#256a6e" />
                                <stop offset=".51" stopColor="#234f58" />
                                <stop offset=".6" stopColor="#213948" />
                                <stop offset=".69" stopColor="#202a3c" />
                                <stop offset=".8" stopColor="#202136" />
                                <stop offset=".96" stopColor="#201f34" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_green_2"
                                data-name="Degradado sin nombre 2"
                                cx="1225.5222"
                                cy="60.7654"
                                fx="1212.8932"
                                fy="60.852"
                                r="99.7718"
                                gradientTransform="matrix(-1.219150e-02 -0.9997 0.2583 -1.259791e-02 1089.9766 1286.6887)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#2dd4bf" />
                                <stop offset=".29" stopColor="#2ab4a6" />
                                <stop offset=".36" stopColor="#278c88" />
                                <stop offset=".43" stopColor="#256a6e" />
                                <stop offset=".51" stopColor="#234f58" />
                                <stop offset=".6" stopColor="#213948" />
                                <stop offset=".69" stopColor="#202a3c" />
                                <stop offset=".8" stopColor="#202136" />
                                <stop offset=".96" stopColor="#201f34" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_purple"
                                data-name="Degradado sin nombre 2"
                                cx="960.2"
                                cy="58.125"
                                fx="960.7092"
                                fy="732.1002"
                                r="680.2068"
                                gradientTransform="matrix(1 0 0 1.0045 0 -0.2607)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#2E25B2" />
                                <stop offset=".29" stopColor="#2C24A1" />
                                <stop offset=".36" stopColor="#32009d" />
                                <stop offset=".43" stopColor="#282380" />
                                <stop offset=".51" stopColor="#252164" />
                                <stop offset=".6" stopColor="#23204F" />
                                <stop offset=".69" stopColor="#212040" />
                                <stop offset=".8" stopColor="#201F37" />
                                <stop offset=".96" stopColor="#201F34" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_purple_1"
                                data-name="Degradado sin nombre 2"
                                cx="703.548"
                                cy="60.7654"
                                fx="690.919"
                                fy="60.852"
                                r="99.7718"
                                gradientTransform="matrix(-1.219150e-02 -0.9997 0.2583 -1.259791e-02 822.6259 764.8698)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#3b00b9" />
                                <stop offset=".29" stopColor="#3500a7" />
                                <stop offset=".36" stopColor="#32009d" />
                                <stop offset=".43" stopColor="#290082" />
                                <stop offset=".51" stopColor="#4100cb" />
                                <stop offset=".6" stopColor="#4400d5" />
                                <stop offset=".69" stopColor="#4d00f1" />
                                <stop offset=".8" stopColor="#4d00f1" />
                                <stop offset=".96" stopColor="#4d00f1" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_2_purple_2"
                                data-name="Degradado sin nombre 2"
                                cx="1225.5222"
                                cy="60.7654"
                                fx="1212.8932"
                                fy="60.852"
                                r="99.7718"
                                gradientTransform="matrix(-1.219150e-02 -0.9997 0.2583 -1.259791e-02 1089.9766 1286.6887)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".25" stopColor="#3b00b9" />
                                <stop offset=".29" stopColor="#3500a7" />
                                <stop offset=".36" stopColor="#32009d" />
                                <stop offset=".43" stopColor="#290082" />
                                <stop offset=".51" stopColor="#4100cb" />
                                <stop offset=".6" stopColor="#4400d5" />
                                <stop offset=".69" stopColor="#4d00f1" />
                                <stop offset=".8" stopColor="#4d00f1" />
                                <stop offset=".96" stopColor="#4d00f1" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_3"
                                data-name="Degradado sin nombre 3"
                                cx="692.8792"
                                cy="23.7698"
                                fx="692.7229"
                                fy="-89.5898"
                                r="162.0266"
                                gradientTransform="matrix(1 0 0 0.661 0 8.0588)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".2" stopColor="#2e68ff" />
                                <stop offset=".3" stopColor="#2e68ff" stopOpacity=".77" />
                                <stop offset=".39" stopColor="#2e68ff" stopOpacity=".57" />
                                <stop offset=".48" stopColor="#2e68ff" stopOpacity=".39" />
                                <stop offset=".58" stopColor="#2e68ff" stopOpacity=".25" />
                                <stop offset=".68" stopColor="#2e68ff" stopOpacity=".14" />
                                <stop offset=".77" stopColor="#2e68ff" stopOpacity=".06" />
                                <stop offset=".87" stopColor="#2e68ff" stopOpacity=".02" />
                                <stop offset=".96" stopColor="#2e68ff" stopOpacity="0" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_4"
                                data-name="Degradado sin nombre 4"
                                cx="963.0492"
                                cy="22.5106"
                                fx="963.7968"
                                fy="-92.8114"
                                r="160.4552"
                                gradientTransform="matrix(1 0 0 0.661 0 7.6319)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".32" stopColor="#0d9488" />
                                <stop offset=".32" stopColor="#0d9488" stopOpacity=".99" />
                                <stop offset=".48" stopColor="#0d9488" stopOpacity=".64" />
                                <stop offset=".63" stopColor="#0d9488" stopOpacity=".36" />
                                <stop offset=".76" stopColor="#0d9488" stopOpacity=".16" />
                                <stop offset=".88" stopColor="#0d9488" stopOpacity=".04" />
                                <stop offset=".96" stopColor="#0d9488" stopOpacity="0" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_4_DF"
                                data-name="Degradado sin nombre 4"
                                cx="1232.3883"
                                cy="20.8544"
                                fx="1232.2583"
                                fy="-85.7569"
                                r="157.9582"
                                gradientTransform="matrix(1 0 0 0.6956 0 6.3478)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".2028" stopColor="#EBB351" />
                                <stop offset=".2043" stopColor="#EBB351" stopOpacity=".998" />
                                <stop offset=".9611" stopColor="#EBB351" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient
                                id="Degradado_sin_nombre_5"
                                data-name="Degradado sin nombre 5"
                                x1="1055.2"
                                y1="2045.16"
                                x2="1068.14"
                                y2="2064.02"
                                gradientTransform="translate(0 -1996)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0" stopColor="#cc5cdc" />
                                <stop offset=".24" stopColor="#7b66ff" />
                                <stop offset=".52" stopColor="#1f8af0" />
                                <stop offset=".76" stopColor="#00d1ff" />
                                <stop offset="1" stopColor="#3dedd7" />
                            </linearGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_6_blue"
                                data-name="Degradado sin nombre 6"
                                cx="6.92"
                                cy="15.61"
                                fx="-5.71"
                                fy="15.61"
                                r="99.77"
                                gradientTransform="translate(956.27 67.54) rotate(-90.7) scale(1 .26) skewX(.54)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".16" stopColor="#6691ff" />
                                <stop offset=".81" stopColor="#386fff" />
                                <stop offset=".96" stopColor="#2e68ff" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_6_green"
                                data-name="Degradado sin nombre 6"
                                cx="6.92"
                                cy="15.61"
                                fx="-5.71"
                                fy="15.61"
                                r="99.77"
                                gradientTransform="translate(956.27 67.54) rotate(-90.7) scale(1 .26) skewX(.54)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".16" stopColor="#2dd4bf" />
                                <stop offset=".74" stopColor="#16a698" />
                                <stop offset=".96" stopColor="#0d9488" />
                            </radialGradient>
                            <radialGradient
                                id="Degradado_sin_nombre_6_purple"
                                data-name="Degradado sin nombre 6"
                                cx="6.92"
                                cy="15.61"
                                fx="-5.71"
                                fy="15.61"
                                r="99.77"
                                gradientTransform="translate(956.27 67.54) rotate(-90.7) scale(1 .26) skewX(.54)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".16" stop-color="#3b00b9" />
                                <stop offset=".74" stop-color="#4400d5" />
                                <stop offset=".96" stop-color="#4d00f1" />
                            </radialGradient>
                        </defs>
                        <g id="Navbar">
                            <path
                                id="Border"
                                d="M1920.4,15v3h-500.2 c-17.6,0-33.5,11.1-39.6,27.6L1365,87.9c-6.9,18.8-25.1,31.4-45.1,31.4H599.7c-20,0-38.1-12.6-45.1-31.4L539,45.6 c-6.1-16.5-22-27.6-39.6-27.6H0v-3H1920.4z"
                                fill={`url(#${globalID.currentMissionPage === MissionPage.MAIN
                                    ? 'Degradado_sin_nombre_blue'
                                    : globalID.currentMissionPage === MissionPage.NFID
                                        ? 'Degradado_sin_nombre_green'
                                        : 'Degradado_sin_nombre_purple'
                                    })`}
                                strokeWidth="0"
                            />
                            <path
                                id="Shape"
                                d="M1920.4,0v15h-500.2 c-5.5,0-10.8,1-15.8,2.9c-12.1,4.5-22,14.1-26.6,26.7l-15.7,42.3c-6.5,17.7-23.4,29.4-42.2,29.4H599.7c-18.8,0-35.7-11.7-42.2-29.4 l-15.6-42.3c-4.7-12.6-14.5-22.2-26.6-26.7c-5-1.9-10.3-2.9-15.8-2.9H0V0H1920.4z"
                                fill={`url(#${globalID.currentMissionPage === MissionPage.MAIN
                                    ? 'Degradado_sin_nombre_2_blue'
                                    : globalID.currentMissionPage === MissionPage.NFID
                                        ? 'Degradado_sin_nombre_2_green'
                                        : 'Degradado_sin_nombre_2_purple'
                                    })`}
                                strokeWidth="0"
                            />
                        </g>
                        {(globalID.currentMissionPage === MissionPage.MAIN || isHoveringOverKonectaLogo) && (
                            <path
                                id="BlueGradient"
                                d="M1920.4,0v15h-500.2
	c-5.5,0-10.8,1-15.8,2.9c-12.1,4.5-22,14.1-26.6,26.7l-15.7,42.3c-6.5,17.7-23.4,29.4-42.2,29.4H599.7c-18.8,0-35.7-11.7-42.2-29.4
	l-15.6-42.3c-4.7-12.6-14.5-22.2-26.6-26.7c-5-1.9-10.3-2.9-15.8-2.9H0V0H1920.4z"
                                fill="url(#Degradado_sin_nombre_3)"
                                strokeWidth="0"
                            />
                        )}
                        {(globalID.currentMissionPage === MissionPage.NFID || isHoveringOverNFIDLogo) && (
                            <path
                                id="GreenGradient"
                                d="M1920.4,0v15h-500.2
	c-5.5,0-10.8,1-15.8,2.9c-12.1,4.5-22,14.1-26.6,26.7l-15.7,42.3c-6.5,17.7-23.4,29.4-42.2,29.4H599.7c-18.8,0-35.7-11.7-42.2-29.4
	l-15.6-42.3c-4.7-12.6-14.5-22.2-26.6-26.7c-5-1.9-10.3-2.9-15.8-2.9H0V0H1920.4z"
                                fill="url(#Degradado_sin_nombre_4)"
                                strokeWidth="0"
                            />
                        )}
                        {(globalID.currentMissionPage === MissionPage.DFINITY || isHoveringOverDFINITYLogo) && (
                            <path
                                id="PurpleGradient"
                                d="M1920.4,0v15h-500.2
	c-5.5,0-10.8,1-15.8,2.9c-12.1,4.5-22,14.1-26.6,26.7l-15.7,42.3c-6.1,16.6-21.3,27.9-38.7,29.3c-1.2,0.1-2.3,0.1-3.5,0.1H599.7
	c-18.8,0-35.7-11.7-42.2-29.4l-15.6-42.3c-4.7-12.6-14.5-22.2-26.6-26.7c-5-1.9-10.3-2.9-15.8-2.9H0V0H1920.4z"
                                fill="url(#Degradado_sin_nombre_4_DF)"
                                strokeWidth="0"
                            />
                        )}
                        <path
                            id="Divider1"
                            d="M829.3,108.2 L829.3,108.2c-1.1,0-1.9-0.9-1.9-1.9V11.8c0-1.1,0.9-1.9,1.9-1.9l0,0c1.1,0,1.9,0.9,1.9,1.9v94.4 C831.2,107.3,830.4,108.2,829.3,108.2z"
                            fill={`url(#${globalID.currentMissionPage === MissionPage.MAIN
                                ? 'Degradado_sin_nombre_2_blue_1'
                                : globalID.currentMissionPage === MissionPage.NFID
                                    ? 'Degradado_sin_nombre_2_green_1'
                                    : 'Degradado_sin_nombre_2_purple_1'
                                })`}
                            strokeWidth="0"
                        />
                        <path
                            id="Divider2"
                            d="M1090.3,108.2L1090.3,108.2c-1.1,0-1.9-0.9-1.9-1.9V11.8c0-1.1,0.9-1.9,1.9-1.9l0,0c1.1,0,1.9,0.9,1.9,1.9v94.4 C1092.2,107.3,1091.3,108.2,1090.3,108.2z"
                            fill={`url(#${globalID.currentMissionPage === MissionPage.MAIN
                                ? 'Degradado_sin_nombre_2_blue_2'
                                : globalID.currentMissionPage === MissionPage.NFID
                                    ? 'Degradado_sin_nombre_2_green_2'
                                    : 'Degradado_sin_nombre_2_purple_2'
                                })`}
                            strokeWidth="0"
                        />
                    </svg>

                    <div className={styles.topbarLeft}>
                        {
                            globalID.currentMissionPage === MissionPage.MAIN ? (
                                <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                                    <div className={styles.TimerText}>{globalID.timerText}</div>
                                </div>
                            ) : globalID.currentMissionPage === MissionPage.NFID ? (
                                <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <img src={NFIDPoints} alt="NFID Points" className={styles.PointsNfidSVG} />
                                    <div className={styles.PointsNfid}>Points: {Number(globalID.pointsnfid)}</div>
                                </div>
                            ) : (
                                <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                    <img src={DFINITYPoints} alt="DFINITY Points" className={styles.PointsNfidSVG} />
                                    <div className={styles.PointsNfid}>Points: {Number(globalID.pointsdfinity)}</div>
                                </div>
                            )
                        }
                    </div>
                    <div className={`${styles.topbarCenter} ${isClaimClicked ? styles.darkened : ''}`}>
                        <img
                            src={KonectaLogo}
                            alt="Konecta Logo"
                            className={styles.KonectaLogo}
                            style={{ cursor: globalID.currentMissionPage === MissionPage.MAIN ? 'default' : 'pointer' }}
                            onClick={globalID.currentMissionPage === MissionPage.MAIN ? undefined : () => globalID.setCurrentMissionPage(MissionPage.MAIN)}
                            onMouseEnter={() => setIsHoveringOverKonectaLogo(true)}
                            onMouseLeave={() => setIsHoveringOverKonectaLogo(false)}
                        />
                        <img
                            src={NFIDLogo}
                            alt="NFID Logo"
                            className={styles.KonectaLogo}
                            style={{ cursor: globalID.currentMissionPage === MissionPage.NFID ? 'default' : 'pointer' }}
                            onClick={globalID.currentMissionPage === MissionPage.NFID ? undefined : () => globalID.setCurrentMissionPage(MissionPage.NFID)}
                            onMouseEnter={() => setIsHoveringOverNFIDLogo(true)}
                            onMouseLeave={() => setIsHoveringOverNFIDLogo(false)}
                        />
                        <img
                            src={DFINITYLogo}
                            alt="DFINITY Logo"
                            className={styles.KonectaLogo}
                            style={{ cursor: globalID.currentMissionPage === MissionPage.DFINITY ? 'default' : 'pointer' }}
                            onClick={globalID.currentMissionPage === MissionPage.DFINITY ? undefined : () => globalID.setCurrentMissionPage(MissionPage.DFINITY)}
                            onMouseEnter={() => setIsHoveringOverDFINITYLogo(true)}
                            onMouseLeave={() => setIsHoveringOverDFINITYLogo(false)}
                        />
                    </div>
                    <ul className={styles.topbarRight}>

                        {globalID.currentMissionPage === MissionPage.MAIN ? (
                            <>
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
                                {
                                    buttonList
                                        ?.filter((item) => item.type !== 'mobile')
                                        .map((item) => {
                                            const modalName = modalMap[item.name];
                                            return <li className={`${styles.topbarButton} ${isClaimClicked ? styles.darkened : ''}`} >
                                                <HexagonButton name={item.name} src={item.src} onClick={item.onClick ? item.onClick : () => { toggleModal(modalName) }} />
                                            </li>
                                        })
                                }
                            </>
                        ) : globalID.currentMissionPage === MissionPage.NFID ? (

                            <div className={styles.nfidDisconnect}>
                                <img
                                    src={NFIDLogout}
                                    alt="Logout"
                                    className={`${styles.NFIDLogout} ${isPressed ? styles.pressed : ''}`}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                />
                            </div>

                        ) : (

                            <div className={styles.nfidDisconnect}>
                                <img
                                    src={DFINITYLogout}
                                    alt="DFINITY Logout"
                                    className={`${styles.NFIDLogout} ${isPressed ? styles.pressed : ''}`}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                />
                            </div>

                        )}
                    </ul>



                </nav>
            ) : isMobileOnly ? (
                <>
                    {isPortrait && (
                        <>
                            <nav className={styles.topbarMobile}>
                                <div className={styles.topbarTop}>
                                    <div className={`${styles.topbarLeftMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                        <img src={globalID.currentMissionPage === MissionPage.MAIN
                                            ? KonectaLogo
                                            : globalID.currentMissionPage === MissionPage.NFID
                                                ? NFIDLogo
                                                : DFINITYLogo
                                        } alt="Logo" className={styles.KonectaLogoMobile} />
                                    </div>
                                    <div className={`${styles.topbarRightMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                        <div className={styles.hexagonButtonWrapper}>
                                            <HexagonButton
                                                name="Log Out"
                                                src={globalID.currentMissionPage === MissionPage.NFID ? "/assets/NFIDlogout.svg"
                                                    : globalID.currentMissionPage === MissionPage.DFINITY
                                                        ? "/assets/DFINITYlogout.svg"
                                                        : "/assets/logout_button.svg"}
                                                onClick={handleDC}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={globalID.currentMissionPage === MissionPage.NFID ? styles.topbarBottomNfid : styles.topbarBottom}>

                                    {globalID.currentMissionPage === MissionPage.MAIN ? (
                                        <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                            <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsuleMobile} />
                                            <div className={styles.TimerTextMobile}>{globalID.timerText}</div>
                                        </div>
                                    ) : (
                                        <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                            <img src={NFIDPoints} alt="Nfid Points" className={styles.PointsNfidSVGMobile} />
                                            <div className={styles.PointsNfidMobile}>Points: {Number(globalID.pointsnfid)}</div>
                                        </div>
                                    )}

                                    {globalID.currentMissionPage === MissionPage.MAIN && (
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
                                    )}
                                </div>
                            </nav>
                        </>
                    )}
                </>
            ) : (
                <>
                    {isPortrait && (
                        <>
                            <nav className={styles.topbarMobile}>
                                <div className={styles.topbarTop}>
                                    <div className={`${styles.topbarLeftMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                        <img src={globalID.currentMissionPage === MissionPage.MAIN
                                            ? KonectaLogo
                                            : globalID.currentMissionPage === MissionPage.NFID
                                                ? NFIDLogo
                                                : DFINITYLogo
                                        } alt="Logo" className={styles.KonectaLogoMobile} />
                                    </div>
                                    <div className={`${styles.topbarRightMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                        <div className={styles.hexagonButtonWrapper}>
                                            <HexagonButton
                                                name="Log Out"
                                                src={globalID.currentMissionPage === MissionPage.NFID ? "/assets/NFIDlogout.svg"
                                                    : globalID.currentMissionPage === MissionPage.DFINITY
                                                        ? "/assets/DFINITYlogout.svg"
                                                        : "/assets/logout_button.svg"}
                                                onClick={handleDC}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={globalID.currentMissionPage === MissionPage.NFID ? styles.topbarBottomNfid : styles.topbarBottom}>

                                    {globalID.currentMissionPage === MissionPage.MAIN ? (
                                        <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                            <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsuleMobile} />
                                            <div className={styles.TimerTextMobile}>{globalID.timerText}</div>
                                        </div>
                                    ) : (
                                        <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                            <img src={NFIDPoints} alt="Nfid Points" className={styles.PointsNfidSVGMobile} />
                                            <div className={styles.PointsNfidMobile}>Points: {Number(globalID.pointsnfid)}</div>
                                        </div>
                                    )}

                                    {globalID.currentMissionPage === MissionPage.MAIN && (
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
                                    )}
                                </div>
                            </nav>
                        </>
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
                                {
                                    buttonList
                                        ?.filter((item) => item.type !== 'mobile')
                                        .map((item) => {
                                            const modalName = modalMap[item.name];
                                            return <li className={`${styles.topbarButton} ${isClaimClicked ? styles.darkened : ''}`} >
                                                <HexagonButton name={item.name} src={item.src} onClick={item.onClick ? item.onClick : () => { toggleModal(modalName) }} />
                                            </li>
                                        })
                                }
                            </ul>
                        </nav>
                    )}
                </>
            )}

            {isClaimClicked && (
                <div className={styles.overlayClaim}></div>
            )}
        </>
    );
};

export default TopBar;
