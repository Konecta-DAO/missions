import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent.tsx';
import KonectaLogo from '../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../public/assets/Time Capsule.svg';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import MissionModal from './MissionModal.tsx';
import KonectaInfoButton from '../../components/KonectaInfoButton/KonectaInfoButton.tsx';
import HelpButton from '../../components/HelpButton/HelpButton.tsx';
import HistoryButton from '../../components/HistoryButton/HistoryButton.tsx';
import HistoryModal from './HistoryModal.tsx';
import { FetchData } from '../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import { Actor } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/backend/index.js';
import useIsMobile from '../../../hooks/useIsMobile.tsx';
import MissionGridComponent from './MissionGrid.tsx';

const Missions: React.FC = () => {
    const globalID = useGlobalID();
    const isMobile = useIsMobile();
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const { connectedAccount, agent } = useIdentityKit();
    const navigate = useNavigate();
    const fetchData = FetchData();
    const [isIdentityChecked, setIsIdentityChecked] = useState(false);
    const [dataloaded, setDataloaded] = useState(false);
    const { missionId } = useParams()
    const { loadingPercentage, loadingComplete } = useLoadingProgress();

    useEffect(() => {
        // Wait until the identity check is complete
        if (connectedAccount !== undefined && agent !== null) {
            fetchUserData();
            setIsIdentityChecked(true); // Identity is valid and checked
        } else if (isIdentityChecked && !connectedAccount && !agent) {
            navigate('/');
        }
    }, [connectedAccount, agent, isIdentityChecked]);

    // useEffect to simulate waiting for IdentityKit to initialize
    useEffect(() => {
        if (connectedAccount === undefined && agent === null) {
            setIsIdentityChecked(false);
        } else {
            setIsIdentityChecked(true);
        }
    }, [connectedAccount, agent]);

    const fetchUserData = async () => {
        if (fetchData) {
            const actor = Actor.createActor(idlFactory, {
                agent: agent!,
                canisterId,
            })
            if (agent !== null) {
                const ae = await agent.getPrincipal();
                await fetchData.fetchall(actor, ae, agent, setDataloaded);
            }
        }
    };

    // Click handler for mission cards
    const handleCardClick = (missionId: string) => {
        console.log('Mission clicked:', missionId);
        navigate(`/Missions/${missionId}`);
    };

    // Close modal handler

    const openHistoryModal = () => {
        setHistoryModalOpen(true);
    };

    const closeHistoryModal = () => {
        setHistoryModalOpen(false);
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
                        <div className={styles.CustomKonectaInfoButton}>
                            <KonectaInfoButton onClick={() => { }} />
                        </div>
                        <div className={styles.CustomHelpButton}>
                            <HelpButton onClick={() => { }} />
                        </div>
                        <div className={styles.CustomHistoryButton}>
                            <HistoryButton onClick={openHistoryModal} />
                        </div>
                    </div>

                    {isHistoryModalOpen && (
                        <HistoryModal closeModal={closeHistoryModal} />
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
                            globalID={globalID}
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
