import React, { useEffect, useState } from 'react';
import styles from './TopBar.module.scss';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../../../public/assets/Time Capsule.svg';
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
            {
                !isMobileOnly && !isTablet ? (
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
                ) : isMobileOnly ? (
                    <>
                        {isPortrait && (
                            <>
                                <nav className={styles.topbarMobile}>
                                    <div className={styles.topbarTop}>
                                        <div className={`${styles.topbarLeftMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                            <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogoMobile} />
                                        </div>
                                        <div className={`${styles.topbarRightMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                            <div className={styles.hexagonButtonWrapper}>
                                                <HexagonButton name="Log Out" src="/assets/logout_button.svg" onClick={handleDC} />
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
                                            <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogoMobile} />
                                        </div>
                                        <div className={`${styles.topbarRightMobile} ${isClaimClicked ? styles.darkened : ''}`}>
                                            <div className={styles.hexagonButtonWrapper}>
                                                <HexagonButton name="Log Out" src="/assets/logout_button.svg" onClick={handleDC} />
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
