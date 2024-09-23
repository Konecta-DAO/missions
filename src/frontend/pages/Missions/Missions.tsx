import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent.tsx';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import useFetchData from '../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/backend/index.js';
import { isMobileOnly, isTablet } from 'react-device-detect';
import MissionGridComponent from './MissionGrid.tsx';
import TopBar from './Components/TopBar/TopBar.tsx';
import ActionButtons from './Components/ActionButtons/ActionButtons.tsx';
import HistoryModal from './Components/HistoryModal/HistoryModal.tsx';
import HistoryModalMobile from './Components/HistoryModal/Mobile.tsx';
import KonectaModal from './Components/KonectaModal/KonectaModal.tsx';
import InfoModal from './Components/InfoModal/InfoModal.tsx';
import OpenChatModal from './Components/OpenChatModal/OpenChatModal.tsx';
import { useMediaQuery } from 'react-responsive';

interface ButtonItem {
    name: string;
    src: string;
    onClick?: () => void;
    type?: string;
}

type ModalState = {
    isHistoryModalOpen: boolean;
    isKonectaModalOpen: boolean;
    isInfoModalOpen: boolean;
    isOpenChatModalOpen: boolean;
};

const Missions: React.FC = () => {
    const globalID = useGlobalID();
    const { user, identity } = useIdentityKit();
    const navigate = useNavigate();
    const fetchData = useFetchData();
    const [dataloaded, setDataloaded] = useState(false);
    const { loadingPercentage, loadingComplete } = useLoadingProgress({ totalTime: 3000 });
    const { disconnect } = useIdentityKit();
    const [modalState, setModalState] = useState<ModalState>({
        isHistoryModalOpen: false,
        isKonectaModalOpen: false,
        isInfoModalOpen: false,
        isOpenChatModalOpen: false,
    });
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
    const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });

    useEffect(() => {
        let isMounted = true;

        // Introduce a delay before checking authentication state
        const timeoutId = setTimeout(() => {
            if (!isMounted) return;

            const isUserLoggedIn =
                identity &&
                user?.principal &&
                user.principal.toText() !== '2vxsx-fae';

            if (isUserLoggedIn) {
                // User is logged in; proceed to set up agent and fetch data
                const agent = HttpAgent.createSync({ identity });
                if (process.env.NODE_ENV !== 'production') {
                    agent.fetchRootKey();
                }
                globalID.setAgent(agent);
                globalID.setPrincipal(user.principal);
                fetchUserData(agent);
            } else {
                // User is not logged in; redirect to home page
                navigate('/');
            }
        }, 1000); // Wait for 1000ms before proceeding

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [user, identity]);


    const fetchUserData = async (agent: HttpAgent) => {
        try {
            if (fetchData) {
                const actor = Actor.createActor(idlFactory, {
                    agent: agent,
                    canisterId,
                });
                const principal = await agent.getPrincipal();
                await fetchData.fetchAll(actor, principal, setDataloaded);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Optionally, navigate to '/' or show an error message
            navigate('/');
        }
    };

    const handleCardClick = (missionId: string) => {
        navigate(`/Missions/${missionId}`);
    };

    const toggleModal = (modalName: keyof ModalState) => {
        setModalState((prevState) => ({
            ...prevState,
            [modalName]: !prevState[modalName],
        }));
    };

    const buttonList: ButtonItem[] = [
        {
            name: 'OpenChat',
            src: '/assets/ocButton.svg',
            type: 'mobile',
        },
        {
            name: 'History',
            src: '/assets/history_button.svg',
        },
        {
            name: 'Konecta',
            src: '/assets/konecta_button.svg',
        },
        {
            name: 'Kami',
            src: '/assets/kami_button.svg',
            onClick: () => { window.open('https://chatgpt.com/g/g-S0vONPiGL-kami', '_blank'); },
        },
        {
            name: 'Info',
            src: '/assets/question_button.svg',
        },
        {
            name: 'Log Out',
            src: '/assets/logout_button.svg',
            onClick: disconnect,
            type: 'desktop',
        },
    ];

    const modalComponents: { [key in keyof ModalState]: React.ReactNode } = {
        isHistoryModalOpen: (
            !isMobileOnly && !isPortrait?
                <HistoryModal closeModal={() => toggleModal('isHistoryModalOpen')} /> :
                <HistoryModalMobile closeModal={() => toggleModal('isHistoryModalOpen')} />
        ),
        isKonectaModalOpen: (
            <KonectaModal closeModal={() => toggleModal('isKonectaModalOpen')} />
        ),
        isInfoModalOpen: (
            <InfoModal closeModal={() => toggleModal('isInfoModalOpen')} />
        ),
        isOpenChatModalOpen: (
            <OpenChatModal closeModal={() => toggleModal('isOpenChatModalOpen')} />
        ),
    };

    return (
        <>
            {
                !loadingComplete &&
                <div className={styles.loadingOverlayWrapper}>
                    <LoadingOverlay loadingPercentage={loadingPercentage} />
                </div>
            }
            {
                Object.keys(modalState)?.map((key) => {
                    const modalKey = key as keyof ModalState;
                    return modalState[modalKey] ? modalComponents[modalKey] : null;
                })
            }
            {
                /* Desktop */

                !isMobileOnly && !isTablet ? (
                    <div className={styles.MissionsContainer}>
                        <div className={styles.TopBarWrapper}>
                            <TopBar
                                buttonList={buttonList}
                                toggleModal={toggleModal}
                            />
                        </div>
                        <div className={styles.MissionsBody}>
                            {dataloaded ? (
                                <div className={styles.MissionsGridWrapper}>
                                    <MissionGridComponent
                                        handleCardClick={handleCardClick}
                                    />
                                </div>
                            ) : (
                                <div>Loading missions...</div>
                            )}
                            <div className={styles.OpenChatWrapper}>
                                <OpenChat />
                            </div>
                        </div>
                    </div>

                    /* Mobile */

                ) : isMobileOnly ? (
                    <>
                        {isPortrait && (
                            <>
                                <div className={styles.MissionsContainer}>
                                    <div className={styles.TopBarWrapperMobile}>
                                        <TopBar
                                            buttonList={buttonList}
                                            toggleModal={toggleModal}
                                        />
                                    </div>
                                    <div className={styles.MissionsBody2}>
                                        {dataloaded ? (
                                            <div className={styles.MissionsGridWrapper}>
                                                <MissionGridComponent
                                                    handleCardClick={handleCardClick}
                                                />
                                            </div>
                                        ) : (
                                            <div>Loading missions...</div>
                                        )}
                                    </div>
                                    <div>
                                        <ActionButtons
                                            buttonList={buttonList}
                                            toggleModal={toggleModal}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {isLandscape && (
                            <>
                                <div className={styles.MobileMessage}>
                                    <p>Please rotate your phone</p>
                                </div>
                            </>
                        )}
                    </>

                    /* Tablet */

                ) : (
                    <>
                        {isPortrait && (
                            <>
                                <div className={styles.MissionsContainer}>
                                    <div className={styles.TopBarWrapperMobile}>
                                        <TopBar
                                            buttonList={buttonList}
                                            toggleModal={toggleModal}
                                        />
                                    </div>
                                    <div className={styles.MissionsBody2}>
                                        {dataloaded ? (
                                            <div className={styles.MissionsGridWrapper}>
                                                <MissionGridComponent
                                                    handleCardClick={handleCardClick}
                                                />
                                            </div>
                                        ) : (
                                            <div>Loading missions...</div>
                                        )}
                                    </div>
                                    <div>
                                        <ActionButtons
                                            buttonList={buttonList}
                                            toggleModal={toggleModal}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {isLandscape && (
                            <>
                                <div className={styles.MissionsContainer}>
                                    <div className={styles.TopBarWrapper}>
                                        <TopBar
                                            buttonList={buttonList}
                                            toggleModal={toggleModal}
                                        />
                                    </div>
                                    <div className={styles.MissionsBody}>
                                        {dataloaded ? (
                                            <div className={styles.MissionsGridWrapper}>
                                                <MissionGridComponent
                                                    handleCardClick={handleCardClick}
                                                />
                                            </div>
                                        ) : (
                                            <div>Loading missions...</div>
                                        )}
                                        <div className={styles.OpenChatWrapper}>
                                            <OpenChat />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )
            }
        </>
    );
};

export default Missions;
