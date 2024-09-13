import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent.tsx';
import KonectaLogo from '../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../public/assets/Time Capsule.svg';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import KonectaInfoButton from '../../components/KonectaInfoButton/KonectaInfoButton.tsx';
import HelpButton from '../../components/HelpButton/HelpButton.tsx';
import HistoryButton from '../../components/HistoryButton/HistoryButton.tsx';
import HistoryModal from './Components/HistoryModal/HistoryModal.tsx';
import { FetchData } from '../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/backend/index.js';
import useIsMobile from '../../../hooks/useIsMobile.tsx';
import MissionGridComponent from './MissionGrid.tsx';
import KamiButton from '../../components/KamiButton/KamiButton.tsx';
import LogoutButton from '../../components/LogoutButton/LogoutButton.tsx';
import KonectaModal from './Components/KonectaModal/KonectaModal.tsx';
import InfoModal from './Components/InfoModal/InfoModal.tsx';

const Missions: React.FC = () => {
    const globalID = useGlobalID();
    const isMobile = useIsMobile();
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isKonectaModalOpen, setKonectaModalOpen] = useState(false);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const { user, identity, disconnect } = useIdentityKit();
    const navigate = useNavigate();
    const fetchData = FetchData();
    const [isIdentityChecked, setIsIdentityChecked] = useState(false);
    const [dataloaded, setDataloaded] = useState(false);
    const { loadingPercentage, loadingComplete } = useLoadingProgress();

    useEffect(() => {
        // Wait until the identity check is complete
        if (globalID.agent !== null && isIdentityChecked) {
            if (identity === undefined) {
                console.log('Entró a esta vaina x99', identity);
                navigate('/');
            } else {
                fetchUserData(globalID.agent);
            }
        }
    }, [isIdentityChecked, globalID.agent]);

    // useEffect to simulate waiting for IdentityKit to initialize
    useEffect(() => {
        const checkIdentity = async () => {
            console.log('Identity pre vaina', identity);
            if (user?.principal === undefined && identity === undefined) {
                console.log('Entró a esta vaina', identity);
                setIsIdentityChecked(false);
            } else {
                const a = HttpAgent.createSync({ identity });
                globalID.setAgent(a);
                setIsIdentityChecked(true);
            }
        };
        checkIdentity();
    }, [user, identity]);

    const fetchUserData = async (agent: HttpAgent) => {
        if (fetchData) {
            const actor = Actor.createActor(idlFactory, {
                agent: agent,
                canisterId,
            })
            const ae = await agent.getPrincipal();
            await fetchData.fetchall(actor, ae, setDataloaded);
        }
    };

    // Click handler for mission cards
    const handleCardClick = (missionId: string) => {
        navigate(`/Missions/${missionId}`);
    };

    // Close modal handler

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

    return (
        <>
            {!isMobile ? (
                <>
                    <div className={styles.KonectaLogoWrapper}>
                        <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
                    </div>
                    <div className={styles.MainDiv}>
                        <div className={styles.CustomHistoryButton}>
                            <HistoryButton onClick={openHistoryModal} />
                        </div>
                        <div className={styles.CustomKonectaInfoButton}>
                            <KonectaInfoButton onClick={openKonectaModal} />
                        </div>
                        <div className={styles.CustomKamiButton}>
                            <KamiButton onClick={() => { window.open('https://chatgpt.com/g/g-S0vONPiGL-kami', '_blank'); }} />
                        </div>
                        <div className={styles.CustomHelpButton}>
                            <HelpButton onClick={openInfoModal} />
                        </div>
                        <div className={styles.CustomLogOutButton}>
                            <LogoutButton onClick={disconnect} />
                        </div>
                    </div>

                    {isHistoryModalOpen && (
                        <HistoryModal closeModal={closeHistoryModal} />
                    )}

                    {isKonectaModalOpen && (
                        <KonectaModal closeModal={closeKonectaModal} />
                    )}

                    {isInfoModalOpen && (
                        <InfoModal closeModal={closeKonectaModal} />
                    )}

                    <div className={styles.MissionsContainer}>

                    </div>
                    <div className={styles.TimeCapsuleWrapper}>
                        <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                        <div className={styles.TimerText}>{globalID.timerText}</div>
                    </div>
                    <div className={styles.OpenChatWrapper}>
                        <OpenChat />
                    </div>
                    {dataloaded ? (
                        <MissionGridComponent
                            handleCardClick={handleCardClick}
                        />
                    ) : (
                        <div>Loading missions...</div>
                    )}
                </>
            ) : (
                <div style={{ display: 'none' }}>
                    <div className={styles.TimeCapsuleWrapperMobile}>
                        <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                        <div className={styles.TimerText}>{globalID.timerText}</div>
                    </div>
                    <OpenChat />

                </div>

            )}

        </>
    );
};

export default Missions;
