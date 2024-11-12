import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent.tsx';
import OpenChatDF from '../../../components/OpenChatComponentDFINITY.tsx';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import useFetchData from '../../../hooks/fetchData.tsx';
import { MissionPage, useGlobalID } from '../../../hooks/globalID.tsx';
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

import LottieAnimationComponent1 from './LottieAnimationComponent1.tsx';
import LottieAnimationComponent2 from './LottieAnimationComponent2.tsx';
import LottieAnimationComponent3 from './LottieAnimationComponent3.tsx';
import NFIDVerification from './Components/NFIDVerification/NFIDVerification.tsx';
import ToggleMissionsComponent from './Components/ToggleMissionsComponent/ToggleMissionsComponent.tsx';

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
        if (!acceptedTerms && globalID.currentMissionPage === MissionPage.MAIN) {
            setIsTermsModalVisible(true);
        }
    }, [acceptedTerms, globalID.currentMissionPage]);

    useEffect(() => {
        if (!isVerified && globalID.currentMissionPage === MissionPage.NFID) {
            setIsVerifyModalVisible(true);
        }
    }, [isVerified, globalID.currentMissionPage]);

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
                            {globalID.currentMissionPage === MissionPage.MAIN ? (
                                <div className={styles.OpenChatWrapper}>
                                    <OpenChat />
                                </div>
                            ) : globalID.currentMissionPage === MissionPage.NFID ? (
                                <div className={styles.NFIDWrapper}>
                                    <div className={styles.customRow}>
                                        <div className={styles.customImage} >
                                            <LottieAnimationComponent1 />
                                        </div>
                                        <div>
                                            <p className={styles.lightP}>1/3</p>
                                            <p className={styles.mediumP}>Join the Airdrop</p>
                                            <p className={styles.lastP}>Connect your NFID Wallet and join the Community</p>
                                        </div>
                                    </div>

                                    <div className={styles.customRow}>
                                        <div>
                                            <p className={styles.lightP}>2/3</p>
                                            <p className={styles.mediumP}>Do Missions</p>
                                            <p className={styles.lastP}>Follow the Instructions on the cards to complete each on-chain task</p>
                                        </div>
                                        <div className={styles.customImage} >
                                            <LottieAnimationComponent2 />
                                        </div>
                                    </div>

                                    <div className={styles.customRow}>
                                        <div className={styles.customImage} >
                                            <LottieAnimationComponent3 />
                                        </div>
                                        <div>
                                            <p className={styles.lightP}>3/3</p>
                                            <p className={styles.mediumP}>Earn Tokens</p>
                                            <p className={styles.lastP}>Accumulating points raises your chances to join the 1,000 winners</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.OpenChatWrapper}>
                                    <OpenChatDF />
                                </div>
                            )}
                        </div>
                    </div>

                    /* Mobile */

                ) : isMobileOnly ? (
                    <>
                        {isPortrait && (
                            <>
                                <div className={styles.MissionsContainer}>
                                    <TermsModal isVisible={isTermsModalVisible} onAccept={handleAccept} />
                                    <NFIDVerification isVisible={isVerifyModalVisible} identity={identity} setIsVisible={setIsVerifyModalVisible} setIsVerified={setIsVerified} />
                                    <div className={styles.TopBarWrapperMobile}>
                                        <TopBar
                                            buttonList={buttonList}
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
                                    {(globalID.currentMissionPage === MissionPage.MAIN) && (
                                        <ActionButtons
                                            buttonList={buttonList}
                                            toggleModal={toggleModal}
                                        />
                                    )}
                                    <div className={globalID.currentMissionPage === MissionPage.NFID ? styles.ToggleMissionWrapperL : styles.ToggleMissionWrapperR}>
                                        <ToggleMissionsComponent />
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
                                    <TermsModal isVisible={isTermsModalVisible} onAccept={handleAccept} />
                                    <NFIDVerification isVisible={isVerifyModalVisible} identity={identity} setIsVisible={setIsVerifyModalVisible} setIsVerified={setIsVerified} />
                                    <div className={styles.TopBarWrapperMobile}>
                                        <TopBar
                                            buttonList={buttonList}
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
                                    {(globalID.currentMissionPage) && (
                                        <ActionButtons
                                            buttonList={buttonList}
                                            toggleModal={toggleModal}
                                        />
                                    )}
                                    <div className={globalID.currentMissionPage === MissionPage.NFID ? styles.ToggleMissionWrapperL : styles.ToggleMissionWrapperR}>
                                        <ToggleMissionsComponent />
                                    </div>
                                </div>
                            </>
                        )}
                        {isLandscape && (
                            <div className={styles.MissionsContainer}>
                                <TermsModal isVisible={isTermsModalVisible} onAccept={handleAccept} />
                                <NFIDVerification isVisible={isVerifyModalVisible} identity={identity} setIsVisible={setIsVerifyModalVisible} setIsVerified={setIsVerified} />
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
                                    {globalID.currentMissionPage === MissionPage.MAIN ? (
                                        <div className={styles.OpenChatWrapper}>
                                            <OpenChat />
                                        </div>
                                    ) : globalID.currentMissionPage === MissionPage.NFID ? (
                                        <div className={styles.NFIDWrapper}>
                                            <div className={styles.customRow}>
                                                <div className={styles.customImage} >
                                                    <LottieAnimationComponent1 />
                                                </div>
                                                <div>
                                                    <p className={styles.lightP}>1/3</p>
                                                    <p className={styles.mediumP}>Join the Airdrop</p>
                                                    <p className={styles.lastP}>Connect your NFID Wallet and join the Community</p>
                                                </div>
                                            </div>

                                            <div className={styles.customRow}>
                                                <div>
                                                    <p className={styles.lightP}>2/3</p>
                                                    <p className={styles.mediumP}>Do Missions</p>
                                                    <p className={styles.lastP}>Follow the Instructions on the cards to complete each on-chain task</p>
                                                </div>
                                                <div className={styles.customImage} >
                                                    <LottieAnimationComponent2 />
                                                </div>
                                            </div>

                                            <div className={styles.customRow}>
                                                <div className={styles.customImage} >
                                                    <LottieAnimationComponent3 />
                                                </div>
                                                <div>
                                                    <p className={styles.lightP}>3/3</p>
                                                    <p className={styles.mediumP}>Earn Tokens</p>
                                                    <p className={styles.lastP}>Accumulating points raises your chances to join the 1,000 winners</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.OpenChatWrapper}>
                                            <OpenChatDF />
                                        </div>
                                    )}
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
