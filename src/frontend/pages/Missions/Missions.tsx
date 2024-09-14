import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent.tsx';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import { FetchData } from '../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/backend/index.js';
import { isMobileOnly, isTablet } from 'react-device-detect';
import MissionGridComponent from './MissionGrid.tsx';
import TopBar from './Components/TopBar/TopBar.tsx';

const Missions: React.FC = () => {
    const globalID = useGlobalID();
    const { user, identity } = useIdentityKit();
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
                const agent = HttpAgent.createSync({ identity });
                if (process.env.NODE_ENV !== "production") {
                    agent.fetchRootKey();
                }
                globalID.setAgent(agent);
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

    if (!loadingComplete) {
        return <LoadingOverlay loadingPercentage={loadingPercentage} />;
    }

    return (
        <>
            {/* {!isMobileOnly ? (
                <> */}
            <TopBar />
            {
                !isMobileOnly && !isTablet &&
                <div className={styles.OpenChatWrapper}>
                    <OpenChat />
                </div>
            }
            {dataloaded ? (
                <MissionGridComponent
                    handleCardClick={handleCardClick}
                />
            ) : (
                <div>Loading missions...</div>
            )}
            {/* </>
            ) : (
                <div style={{ display: 'none' }}>
                    <div className={styles.TimeCapsuleWrapperMobile}>
                        <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                        <div className={styles.TimerText}>{globalID.timerText}</div>
                    </div>
                    <OpenChat />

                </div>

            )} */}

        </>
    );
};

export default Missions;
