import React, { useState } from 'react';
import styles from './TopBar.module.scss';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../../../public/assets/Time Capsule.svg';
import useLoadingProgress from '../../../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../../../components/LoadingOverlay.tsx';
import HistoryModal from '../../Components/HistoryModal/HistoryModal.tsx';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import KonectaModal from '../../Components/KonectaModal/KonectaModal.tsx';
import InfoModal from '../../Components/InfoModal/InfoModal.tsx';
import HexagonButton from '../../../../components/HexagonButton/hexagonButton.tsx';

interface TopBarProps {
  isMobile: boolean;
}

const TopBarMobile: React.FC<TopBarProps> = ({ isMobile }) => {
    const globalID = useGlobalID();
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isKonectaModalOpen, setKonectaModalOpen] = useState(false);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const { disconnect } = useIdentityKit();
    const { loadingPercentage, loadingComplete } = useLoadingProgress();
    const [isMenuOpen, setMenuOpen] = useState(false);


    const toggleMenu = () => {
        setMenuOpen((prevState) => !prevState);
    };

    // Close modal handlers

    const openHistoryModal = () => {
        setHistoryModalOpen(true);
    };

    const closeHistoryModal = () => {
        setHistoryModalOpen(false);
    };

    const openKonectaModal = () => {
        setKonectaModalOpen(true);
    };

    const closeKonectaModal = () => {
        setKonectaModalOpen(false);
    };

    const openInfoModal = () => {
        setInfoModalOpen(true);
    };

    const closeInfoModal = () => {
        setInfoModalOpen(false);
    };

    if (!loadingComplete) {
        return <LoadingOverlay loadingPercentage={loadingPercentage} />;
    }

    const buttonList = [	
        {    
            name: 'History',	
            src: '/assets/history_button.svg',
            onClick: openHistoryModal,
        },	
        {	
            name: 'Konecta',	
            src: '/assets/konecta_button.svg',
            onClick: openKonectaModal,
        },	
        {
            name: 'Kami',
            src: '/assets/kami_button.svg',	
            onClick: () => { window.open('https://chatgpt.com/g/g-S0vONPiGL-kami', '_blank'); },
        },	
        {
            name: 'Help',	
            src: '/assets/question_button.svg',	
            onClick: openInfoModal,
        },	
        {	
            name: 'Log Out',
            src: '/assets/logout_button.svg',
            onClick: disconnect,
        },	
    ];

    return (
        <nav className={styles.topbar}>
            <div className={styles.topbarLeft}>
                <div className={styles.timeCapsuleWrapper}>
                    <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                    <div className={styles.TimerText}>{globalID.timerText}</div>
                </div>
            </div>
            <div className={styles.topbarCenter}>
                <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo}/>
            </div>

            {
                isMobile ? (
                <div className={styles.collapseWrapper}>
                    {/* Toggle between open and close button */}
                    <div className={styles.HexagonButton}>
                        <HexagonButton 
                            name={isMenuOpen ? "Close" : "Menu"} 
                            src={isMenuOpen ? "/assets/closeButton.svg" : "/assets/openButton.svg"} 
                            onClick={toggleMenu} 
                        />
                    </div>
                    {/* Show buttons only if the menu is open */}
                    {isMenuOpen && (
                        <ul className={styles.collapsedButtons}>
                            {
                                buttonList.map((item) => (
                                    <li className={styles.collapsedButton} key={item.name}>
                                        <HexagonButton name={item.name} src={item.src} onClick={item.onClick} />
                                    </li>
                                ))
                            }
                        </ul>
                    )}
                </div>
                ) : (
                    <ul className={styles.topbarRight}>
                        {
                            buttonList.map((item) => (
                                <li className={styles.topbarButton}>
                                    <HexagonButton name={item.name} src={item.src} onClick={item.onClick} />
                                </li>
                            ))
                        }
                    </ul>
                )
            }

            {isHistoryModalOpen && (
                <HistoryModal closeModal={closeHistoryModal} />
            )}

            {isKonectaModalOpen && (
                <KonectaModal closeModal={closeKonectaModal} />
            )}

            {isInfoModalOpen && (
                <InfoModal closeModal={closeKonectaModal} />
            )}
        </nav>
    );
};

export default TopBar;
