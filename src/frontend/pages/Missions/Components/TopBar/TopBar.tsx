import React, { useEffect, useState } from 'react';
import styles from './TopBar.module.scss';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo.svg';
import NFIDLogo from '../../../../../../public/assets/NFID_Airdrop.svg';
import TimeCapsule from '../../../../../../public/assets/Time Capsule.svg';
import NFIDPoints from '../../../../../../public/assets/NFIDpoints.svg';
import NFIDLogout from '../../../../../../public/assets/NFIDlogout.svg';
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
    const isNfid = globalID.nfid;
    const { nfid, setNfid } = globalID;
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
                                id="Degradado_sin_nombre_2_blue"
                                data-name="Degradado sin nombre 2"
                                cx="951.11"
                                cy="1122.79"
                                fx="951.11"
                                fy="1423.75"
                                r="368.92"
                                gradientTransform="translate(0 -958)"
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
                                cx="951.11"
                                cy="1122.79"
                                fx="951.11"
                                fy="1423.75"
                                r="368.92"
                                gradientTransform="translate(0 -958)"
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
                                id="Degradado_sin_nombre_3"
                                data-name="Degradado sin nombre 3"
                                cx="832.44"
                                cy="1490.31"
                                fx="832.44"
                                fy="1362.27"
                                r="162.94"
                                gradientTransform="translate(0 -944.85) scale(1 .66)"
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
                                cx="1089.1"
                                cy="1469.13"
                                fx="1089.1"
                                fy="1365.57"
                                r="168.85"
                                gradientTransform="translate(0 -952.03) scale(1 .66)"
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
                        </defs>
                        <g id="Navbar">
                            <path
                                id="Border"
                                d="M1920.4,14.9v3h-656.1c-18.5,0-34.6,11.9-40.2,29.5l-11.9,37.8c-6.4,20.3-24.9,33.9-46.2,33.9h-412c-21.3,0-39.8-13.6-46.2-33.9l-11.9-37.8c-5.5-17.6-21.7-29.5-40.2-29.5H0v-3s1920.4,0,1920.4,0Z"
                                fill={`url(#${nfid ? 'Degradado_sin_nombre_green' : 'Degradado_sin_nombre_blue'})`}
                                strokeWidth="0"
                            />
                            <path
                                id="Shape"
                                d="M1920,0v14.9h-655.7c-19.7,0-37.1,12.8-43,31.6l-11.9,37.8c-5.9,18.9-23.5,31.8-43.3,31.8h-412.1c-19.8,0-37.4-12.9-43.3-31.8l-11.9-37.8c-5.9-18.8-23.3-31.6-43-31.6H0V0h1920Z"
                                fill={`url(#${nfid ? 'Degradado_sin_nombre_2_green' : 'Degradado_sin_nombre_2_blue'})`}
                                strokeWidth="0"
                            />
                        </g>
                        {(!nfid || isHoveringOverKonectaLogo) && (
                            <path
                                id="BlueGradient"
                                d="M1920,0v14.9h-655.7c-19.7,0-37.1,12.8-43,31.6l-11.9,37.8c-5.9,18.9-23.5,31.8-43.3,31.8h-412.1c-19.8,0-37.4-12.9-43.3-31.8l-11.9-37.8c-5.9-18.8-23.3-31.6-43-31.6H0V0h1920Z"
                                fill="url(#Degradado_sin_nombre_3)"
                                strokeWidth="0"
                            />
                        )}
                        {(nfid || isHoveringOverNFIDLogo) && (
                            <path
                                id="GreenGradient"
                                d="M1920,0v14.9h-655.7c-19.7,0-37.1,12.8-43,31.6l-11.9,37.8c-5.9,18.9-23.5,31.8-43.3,31.8h-412.1c-19.8,0-37.4-12.9-43.3-31.8l-11.9-37.8c-5.9-18.8-23.3-31.6-43-31.6H0V0h1920Z"
                                fill="url(#Degradado_sin_nombre_4)"
                                strokeWidth="0"
                            />
                        )}
                        <path
                            id="Divider"
                            d="M959.7,9.8h0c1.1,0,1.9.9,1.9,1.9v94.4c0,1.1-.9,1.9-1.9,1.9h0c-1.1,0-1.9-.9-1.9-1.9V11.7c0-1,.9-1.9,1.9-1.9Z"
                            fill={`url(#${nfid ? 'Degradado_sin_nombre_6_green' : 'Degradado_sin_nombre_6_blue'})`}
                            strokeWidth="0"
                        />
                    </svg>

                    <div className={styles.topbarLeft}>
                        {!nfid ? (
                            <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                                <div className={styles.TimerText}>{globalID.timerText}</div>
                            </div>
                        ) : (
                            <div className={`${styles.timeCapsuleWrapper} ${isClaimClicked ? styles.darkened : ''}`}>
                                <img src={NFIDPoints} alt="Nfid Points" className={styles.PointsNfidSVG} />
                                <div className={styles.PointsNfid}>Points: {Number(globalID.pointsnfid)}</div>
                            </div>
                        )}
                    </div>
                    <div className={`${styles.topbarCenter} ${isClaimClicked ? styles.darkened : ''}`}>
                        <img
                            src={KonectaLogo}
                            alt="Konecta Logo"
                            className={styles.KonectaLogo}
                            style={{ cursor: nfid ? 'pointer' : 'default' }}
                            onClick={nfid ? () => setNfid(false) : undefined}
                            onMouseEnter={() => setIsHoveringOverKonectaLogo(true)}
                            onMouseLeave={() => setIsHoveringOverKonectaLogo(false)}
                        />
                        <img
                            src={NFIDLogo}
                            alt="NFID Logo"
                            className={styles.KonectaLogo}
                            style={{ cursor: !nfid ? 'pointer' : 'default' }}
                            onClick={!nfid ? () => setNfid(true) : undefined}
                            onMouseEnter={() => setIsHoveringOverNFIDLogo(true)}
                            onMouseLeave={() => setIsHoveringOverNFIDLogo(false)}
                        />
                    </div>
                    <ul className={styles.topbarRight}>

                        {!nfid ? (
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
                        ) : (

                            <div className={styles.nfidDisconnect}>
                                <img src={NFIDLogout} alt="Logout" className={`${styles.NFIDLogout} ${isPressed ? styles.pressed : ''}`} onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave} />
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
                                        <img src={isNfid ? NFIDLogo : KonectaLogo} alt="Logo" className={styles.KonectaLogoMobile} />
                                    </div>
                                    <div className={`${styles.topbarRightMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                        <div className={styles.hexagonButtonWrapper}>
                                            <HexagonButton
                                                name="Log Out"
                                                src={isNfid ? "/assets/NFIDlogout.svg" : "/assets/logout_button.svg"}
                                                onClick={handleDC}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={isNfid ? styles.topbarBottomNfid : styles.topbarBottom}>

                                    {!nfid ? (
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

                                    {!nfid && (
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
                                        <img src={isNfid ? NFIDLogo : KonectaLogo} alt="Logo" className={styles.KonectaLogoMobile} />
                                    </div>
                                    <div className={`${styles.topbarRightMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                        <div className={styles.hexagonButtonWrapper}>
                                            <HexagonButton
                                                name="Log Out"
                                                src={isNfid ? "/assets/NFIDlogout.svg" : "/assets/logout_button.svg"}
                                                onClick={handleDC}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={isNfid ? styles.topbarBottomNfid : styles.topbarBottom}>

                                    {!nfid ? (
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

                                    {!nfid && (
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
