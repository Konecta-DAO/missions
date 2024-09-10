import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatTimeRemaining } from '../../../components/Utilities.tsx';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent.tsx';
import KonectaLogo from '../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../public/assets/Time Capsule.svg';
import { getGradientStartColor, getGradientEndColor } from '../../../utils/colorUtils.ts';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import MissionModal from './MissionModal.tsx';
import KonectaInfoButton from '../../components/KonectaInfoButton/KonectaInfoButton.tsx';
import HelpButton from '../../components/HelpButton/HelpButton.tsx';
import HistoryButton from '../../components/HistoryButton/HistoryButton.tsx';
import HistoryModal from './HistoryModal.tsx';
import { useFetchData } from '../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import { Actor } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/backend/index.js';

const BASE_URL = "https://onpqf-diaaa-aaaag-qkeda-cai.raw.icp0.io";

const Missions: React.FC = () => {
    const { connectedAccount, agent } = useIdentityKit()
    const globalID = useGlobalID();
    const navigate = useNavigate();
    const fetchData = useFetchData();
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    // const { missionId } = useParams();
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [hovering, setHovering] = useState<boolean>(false);
    const { loadingPercentage, loadingComplete } = useLoadingProgress();

    useEffect(() => {
        if (connectedAccount != undefined) {
            fetchUserData();
        }
    }, [connectedAccount, globalID.principalId]);

    const fetchUserData = async () => {
        if (fetchData) {
            const actor = Actor.createActor(idlFactory, {
                agent: agent!,
                canisterId,
            })
            const data = await fetchData;
            if (data) {
                await data.fetchall(actor, agent);
            }
            console.log("aaaaaaaaaaaaa", globalID.principalId);
        }
    };


    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, content: string | null) => {
        if (content) {
            setHovering(true);

            const { clientX, clientY } = e;

            const tooltipWidth = 200;
            const tooltipHeight = 50;
            const buffer = 10;

            let top = clientY + 10;
            let left = clientX + 10;

            // Prevent tooltip from overflowing the right edge of the screen
            if (left + tooltipWidth > window.innerWidth) {
                left = window.innerWidth - tooltipWidth - buffer;
            }

            // Prevent tooltip from overflowing the bottom of the screen
            if (top + tooltipHeight > window.innerHeight) {
                top = window.innerHeight - tooltipHeight - buffer;
            }

            setTooltipPosition({ top, left });
            setTooltipContent(content);
        }
    };

    const handleMouseLeave = () => {
        setHovering(false);
        setTooltipPosition(null);
        setTooltipContent(null);
    };

    const toggleHistoryModal = () => {
        setShowHistoryModal(!showHistoryModal);
    };

    // // Click handler for mission cards
    // const handleCardClick = (missionId: string) => {
    //     console.log('Mission clicked:', missionId);
    //     navigate(`/Missions/${missionId}`);
    // };

    // Close modal handler
    const closeModal = () => {
        navigate('/Missions');
    };

    if (!loadingComplete) {
        return <LoadingOverlay loadingPercentage={loadingPercentage} />;
    }

    return (

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
                    <HistoryButton onClick={toggleHistoryModal} />
                </div>
            </div>

            {/* {showHistoryModal && (
                <HistoryModal closeModal={closeModal} />
            )} */}

            <div className={styles.MissionsContainer}>

            </div>
        </>
    );
};

export default Missions;
