import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent.tsx';
import OpenChatDF from '../../../components/OpenChatComponentDFINITY.tsx';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import useFetchData from '../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/backend/index.js';
import { idlFactory as idlFactoryNFID, canisterId as canisterIdNFID } from '../../../declarations/nfid/index.js';
import { idlFactory as idlFactoryDFINITY } from '../../../declarations/dfinity_backend/index.js';
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
import TermsModal from './Components/TermsModal/TermsModal.tsx';
import OpenChatSuccessOverlay from '../../components/OpenChatSuccessOverlay/OpenChatSuccessOverlay.tsx';

import NFIDVerification from './Components/NFIDVerification/NFIDVerification.tsx';

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
    isProfileModalOpen: boolean;
};

const canisterIdDFINITY = "2mg2s-uqaaa-aaaag-qna5a-cai";

const Missions: React.FC = () => {
    const globalID = useGlobalID();
    const { user, identity } = useIdentityKit();
    const navigate = useNavigate();
    const fetchData = useFetchData();
    const [dataloaded, setDataloaded] = useState(false);
    const { loadingPercentage, loadingComplete } = useLoadingProgress({ totalTime: 4000 });
    const { disconnect } = useIdentityKit();
    const [modalState, setModalState] = useState<ModalState>({
        isHistoryModalOpen: false,
        isKonectaModalOpen: false,
        isInfoModalOpen: false,
        isOpenChatModalOpen: false,
        isProfileModalOpen: false
    });
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
    const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });
    const [acceptedTerms, setAcceptedTerms] = useState(true);
    const [isVerified, setIsVerified] = useState(true);
    const [isTermsModalVisible, setIsTermsModalVisible] = useState<boolean>(false);
    const [isVerifyModalVisible, setIsVerifyModalVisible] = useState<boolean>(false);
    const [showOverlay, setShowOverlay] = useState(false);

    const handleCloseOverlay = () => {
        setShowOverlay(false);
        globalID.setocS('');
    };

    const handleAccept = async () => {

        const agent = HttpAgent.createSync({ identity });
        const actor = Actor.createActor(idlFactory, {
            agent: agent,
            canisterId,
        });
        await actor.acceptTerms(globalID.principalId);
        setIsTermsModalVisible(false);
    };

    useEffect(() => {
        if (!acceptedTerms) {
            setIsTermsModalVisible(true);
        }
    }, [acceptedTerms]);

    useEffect(() => {
        if (!isVerified) {
            setIsVerifyModalVisible(true);
        }
    }, [isVerified]);

    useEffect(() => {
        if (globalID.ocS != '') {
            const actor = Actor.createActor(idlFactory, {
                agent: globalID.agent!,
                canisterId,
            });

            const actorNFID = Actor.createActor(idlFactoryNFID, {
                agent: globalID.agent!,
                canisterId: canisterIdNFID,
            });

            const actorDfinity = Actor.createActor(idlFactoryDFINITY, {
                agent: globalID.agent!,
                canisterId: canisterIdDFINITY,
            })
            fetchData.fetchUserProgress(actor, actorNFID, actorDfinity, globalID.principalId!);
            setShowOverlay(true);
        }
    }, [globalID.ocS]);

    useEffect(() => {
        let isMounted = true;

        // Introduce a delay before checking authentication state
        const timeoutId = setTimeout(() => {
            if (!isMounted) return;

            if (
                identity &&
                user?.principal &&
                user?.principal.toText() !== '2vxsx-fae' &&
                identity?.getPrincipal().toText() !== '2vxsx-fae'
            ) {
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
                //  navigate('/'); AQUIIIIIIIIIIIII
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

                const actorNFID = Actor.createActor(idlFactoryNFID, {
                    agent: agent,
                    canisterId: canisterIdNFID,
                });

                const actorDfinity = Actor.createActor(idlFactoryDFINITY, {
                    agent: agent,
                    canisterId: canisterIdDFINITY,
                })

                await fetchData.isVerifiedNfid(actorNFID, principal, setIsVerified);
                await fetchData.hasAccepted(actor, principal, setAcceptedTerms);
                await fetchData.fetchAll(actor, actorNFID, actorDfinity, principal, setDataloaded, setAcceptedTerms, setIsVerified);
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
            !isMobileOnly && !(isTablet && isPortrait) ?
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
        isProfileModalOpen: (
            /*<ProfileModal closeModal={() => toggleModal('isProfileModalOpen')} /> */
            null
        ),
    };

    return (
        <>
            {showOverlay && (
                <OpenChatSuccessOverlay message={globalID.ocS} onClose={handleCloseOverlay} />
            )}
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
                        <TermsModal isVisible={isTermsModalVisible} onAccept={handleAccept} />
                        <NFIDVerification isVisible={isVerifyModalVisible} identity={identity} setIsVisible={setIsVerifyModalVisible} setIsVerified={setIsVerified} />
                        <div className={styles.TopBarWrapper}>
                            <TopBar
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

                            {/*<div className={styles.OpenChatWrapper}>
                                <OpenChatDF />
                            </div>*/}

                        </div>
                    </div>

                    /* Mobile */

                ) : isMobileOnly ? (
                    <>
                        {isPortrait && (
                            <div className={styles.MissionsContainer}>
                                <TermsModal isVisible={isTermsModalVisible} onAccept={handleAccept} />
                                <NFIDVerification isVisible={isVerifyModalVisible} identity={identity} setIsVisible={setIsVerifyModalVisible} setIsVerified={setIsVerified} />
                                <div className={styles.TopBarWrapperMobile}>
                                    <TopBar
                                        toggleModal={toggleModal}
                                    />
                                </div>
                                <div className={styles.MissionsBody2nfid}>
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
                                <ActionButtons
                                    buttonList={buttonList}
                                    toggleModal={toggleModal}
                                />
                            </div>
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
                            <div className={styles.MissionsContainer}>
                                <TermsModal isVisible={isTermsModalVisible} onAccept={handleAccept} />
                                <NFIDVerification isVisible={isVerifyModalVisible} identity={identity} setIsVisible={setIsVerifyModalVisible} setIsVerified={setIsVerified} />
                                <div className={styles.TopBarWrapperMobile}>
                                    <TopBar
                                        toggleModal={toggleModal}
                                    />
                                </div>
                                <div className={styles.MissionsBody2nfid}>
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
                                <ActionButtons
                                    buttonList={buttonList}
                                    toggleModal={toggleModal}
                                />
                            </div>
                        )}
                        {isLandscape && (
                            <div className={styles.MissionsContainer}>
                                <TermsModal isVisible={isTermsModalVisible} onAccept={handleAccept} />
                                <NFIDVerification isVisible={isVerifyModalVisible} identity={identity} setIsVisible={setIsVerifyModalVisible} setIsVerified={setIsVerified} />
                                <div className={styles.TopBarWrapper}>
                                    <TopBar
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

                                    {/*<div className={styles.OpenChatWrapper}>
                                                        <OpenChatDF />
                                                    </div>*/}

                                </div>
                            </div>
                        )}
                    </>
                )
            }
        </>
    );
};

export default Missions;
