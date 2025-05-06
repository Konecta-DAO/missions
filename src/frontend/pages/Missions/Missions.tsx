import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Missions.module.scss';
import OpenChat from '../../../components/OpenChatComponent.tsx';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import useFetchData from '../../../hooks/fetchData.tsx';
import { ProjectData, useGlobalID } from '../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/backend/index.js';
import { idlFactory as idlFactoryDefault } from '../../../declarations/dfinity_backend/index.js';
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
import { idlFactory as idlFactoryIndex, SerializedProjectMissions } from '../../../declarations/index/index.did.js';
import ProfileModal from './Components/ProfileModal/ProfileModal.tsx';
import { IndexCanisterId } from '../../main.tsx';

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

const Missions: React.FC = () => {
    const globalID = useGlobalID();
    const { user, identity } = useIdentityKit();
    const navigate = useNavigate();
    const location = useLocation();

    const fetchData = useFetchData();
    const [dataloaded, setDataloaded] = useState(false);
    const { loadingPercentage } = useLoadingProgress({ totalTime: 5000 });
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
    const [isTermsModalVisible, setIsTermsModalVisible] = useState<boolean>(false);

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
        let isMounted = true;

        // Introduce a delay before checking authentication state
        const timeoutId = setTimeout(async () => {
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

                const actorIndex = Actor.createActor(idlFactoryIndex, {
                    agent: agent!,
                    canisterId: IndexCanisterId,
                });

                const projects = await actorIndex.getAllProjectMissions() as SerializedProjectMissions[];
                const targets: string[] = projects.map(project => project.canisterId.toText());

                if (JSON.stringify(targets) !== JSON.stringify(globalID.canisterIds) && globalID.canisterIds != null && globalID.canisterIds.length > 0) {
                    disconnect();
                    window.location.href = '/konnect';
                } else {
                    const mappedProjects: ProjectData[] = projects.map((project) => ({
                        id: project.canisterId.toText(),
                        name: project.name,
                        icon: project.icon,
                    }));

                    globalID.setProjects(mappedProjects);
                    globalID.setAgent(agent);
                    globalID.setPrincipal(user.principal);
                    fetchUserData(agent);
                }

            } else {
                window.location.href = '/konnect';
            }
        }, 1000); // Wait for 1000ms before proceeding

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [user, identity]);

    const fetchUserData = async (agent: HttpAgent) => {
        if (fetchData) {
            const actor = Actor.createActor(idlFactory, {
                agent: agent,
                canisterId,
            });
            const actorIndex = Actor.createActor(idlFactoryIndex, {
                agent: agent!,
                canisterId: IndexCanisterId,
            });
            const principal = await agent.getPrincipal();

            const [_, projects] = await Promise.all([
                fetchData.hasAccepted(actor, principal, setAcceptedTerms),
                actorIndex.getAllProjectMissions() as Promise<SerializedProjectMissions[]>
            ]);

            const targets: string[] = projects.map(project => project.canisterId.toText());
            const mappedProjects: ProjectData[] = projects.map((project) => ({
                id: project.canisterId.toText(),
                name: project.name,
                icon: project.icon,
            }));

            globalID.setProjects(mappedProjects);
            globalID.setCanisterIds(targets);

            const actors = targets.map(targetCanisterId => {
                return Actor.createActor(idlFactoryDefault, {
                    agent: agent!,
                    canisterId: targetCanisterId,
                });
            });
            await fetchData.fetchAll(actor, actors, actorIndex, targets, principal, setDataloaded, setAcceptedTerms);
        }
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
        isProfileModalOpen: (
            <ProfileModal closeModal={() => toggleModal('isProfileModalOpen')} />
        ),
        isOpenChatModalOpen: (
            <OpenChatModal closeModal={() => toggleModal('isOpenChatModalOpen')} />
        ),
    };

    useEffect(() => {
        if (!dataloaded) {
            const timer = setTimeout(() => {
                if (!dataloaded) {
                    disconnect();
                    window.location.href = '/konnect';
                }
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [dataloaded]);


    return (
        <>
            {
                !dataloaded &&
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
                        <div className={styles.TopBarWrapper}>
                            <TopBar
                                toggleModal={toggleModal}
                            />
                        </div>
                        <div className={styles.MissionsBody}>
                            {dataloaded ? (
                                <div className={styles.MissionsGridWrapper}>
                                    <MissionGridComponent />
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
                                <div className={styles.TopBarWrapperMobile}>
                                    <TopBar
                                        toggleModal={toggleModal}
                                    />
                                </div>
                                <div className={styles.MissionsBody2nfid}>
                                    {dataloaded ? (
                                        <div className={styles.MissionsGridWrapper}>
                                            <MissionGridComponent />
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
                                <div className={styles.TopBarWrapperMobile}>
                                    <TopBar
                                        toggleModal={toggleModal}
                                    />
                                </div>
                                <div className={styles.MissionsBody2nfid}>
                                    {dataloaded ? (
                                        <div className={styles.MissionsGridWrapper}>
                                            <MissionGridComponent />
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
                                <div className={styles.TopBarWrapper}>
                                    <TopBar
                                        toggleModal={toggleModal}
                                    />
                                </div>
                                <div className={styles.MissionsBody}>
                                    {dataloaded ? (
                                        <div className={styles.MissionsGridWrapper}>
                                            <MissionGridComponent />
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
