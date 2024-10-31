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
import { idlFactory as idlFactoryNFID, canisterId as canisterIdNFID } from '../../../declarations/nfid/index.js';
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

import SVG1 from '../../../../public/assets/NFIDlogin.svg';
import SVG3 from '../../../../public/assets/NFIDearn.svg';
import LottieAnimationComponent2 from './LottieAnimationComponent2.tsx';
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
};

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

    const isNfid = globalID.nfid === true;

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
        console.log("isVerified:", isVerified, "isNfid:", isNfid);
    }, [isVerified, isNfid]);

    useEffect(() => {
        if (!isVerified && isNfid) {
            setIsVerifyModalVisible(true);
        }
    }, [isVerified, isNfid]);

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

            fetchData.fetchUserProgress(actor, actorNFID, globalID.principalId!);
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

                await fetchData.fetchAll(actor, actorNFID, principal, setDataloaded, setAcceptedTerms, setIsVerified);
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
                        <NFIDVerification isVisible={isVerifyModalVisible} identity={identity} setIsVisible={setIsVerifyModalVisible}/>
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
                            {!isNfid ? (
                                <div className={styles.OpenChatWrapper}>
                                    <OpenChat />
                                </div>
                            ) : (
                                <div className={styles.NFIDWrapper}>
                                    <div className={styles.customRow}>
                                        <img src={SVG1} alt="SVG1" className={styles.customImage} />
                                        <div>
                                            <p className={styles.lightP}>1/3</p>
                                            <p className={styles.mediumP}>Join the Airdrop</p>
                                            <p className={styles.lastP}>Login with NFID and start participating</p>
                                        </div>
                                    </div>

                                    <div className={styles.customRow}>
                                        <div>
                                            <p className={styles.lightP}>2/3</p>
                                            <p className={styles.mediumP}>Do Missions</p>
                                            <p className={styles.lastP}>Click on the cards and follow the instructions to earn points</p>
                                        </div>
                                        <div className={styles.customImage} >
                                            <LottieAnimationComponent2 />
                                        </div>
                                    </div>

                                    <div className={styles.customRow}>
                                        <img src={SVG3} alt="SVG3" className={styles.customImage} />
                                        <div>
                                            <p className={styles.lightP}>3/3</p>
                                            <p className={styles.mediumP}>Earn Tokens</p>
                                            <p className={styles.lastP}>Accumulating points raises your chances to join the 1,000 winners</p>
                                        </div>
                                    </div>
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
                                        {!isNfid && (
                                            <div className={styles.OpenChatWrapper}>
                                                <OpenChat />
                                            </div>
                                        )}
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
