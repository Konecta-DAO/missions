import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.scss';
import { isMobileOnly, isTablet } from 'react-device-detect';
import { useMediaQuery } from 'react-responsive';
import OpenChat from '../../../../../components/OpenChatComponent.tsx';
import HistoryModal from '../HistoryModal/HistoryModal.tsx';
import InfoModal from '../InfoModal/InfoModal.tsx';
import KonectaModal from '../KonectaModal/KonectaModal.tsx';
import OpenChatModal from '../OpenChatModal/OpenChatModal.tsx';
import ProfileModal from '../ProfileModal/ProfileModal.tsx';
import TopBar from '../TopBar/TopBar.tsx';
import chatIcon from '../../../../../../public/assets/ocButton.svg';

type ModalStateKeys = 'isHistoryModalOpen' | 'isKonectaModalOpen' | 'isInfoModalOpen' | 'isOpenChatModalOpen' | 'isProfileModalOpen';
type ModalState = {
    [key in ModalStateKeys]: boolean;
};

const MainLayout: React.FC = () => {
    const [modalState, setModalState] = useState<ModalState>({
        isHistoryModalOpen: false,
        isKonectaModalOpen: false,
        isInfoModalOpen: false,
        isOpenChatModalOpen: false,
        isProfileModalOpen: false,
    });

    // State to control the visibility of the global OpenChat component
    const [isChatVisible, setIsChatVisible] = useState(false);

    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });

    const toggleModal = (modalName: ModalStateKeys) => {
        setModalState((prevState) => ({
            ...prevState,
            [modalName]: !prevState[modalName],
        }));
    };

    // Function to toggle the chat window visibility
    const toggleChatVisibility = () => {
        setIsChatVisible(prevState => !prevState);
    };

    const modalComponents: { [key in ModalStateKeys]?: React.ReactNode } = {
        isHistoryModalOpen: (
            <HistoryModal closeModal={() => toggleModal('isHistoryModalOpen')} />
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
            <ProfileModal closeModal={() => toggleModal('isProfileModalOpen')} />
        ),
    };

    return (
        <div className={styles.layoutContainer}>
            <div className={isMobileOnly || (isTablet && isPortrait) ? styles.topBarWrapperMobile : styles.topBarWrapperDesktop}>
                <TopBar toggleModal={toggleModal} />
            </div>
            <main className={styles.contentArea}>
                <Outlet />
            </main>

            {/* Render active modals */}
            {Object.keys(modalState).map((key) => {
                const modalKey = key as ModalStateKeys;
                if (modalState[modalKey] && modalComponents[modalKey]) {
                    return <React.Fragment key={modalKey}>{modalComponents[modalKey]}</React.Fragment>;
                }
                return null;
            })}

            {/* Global OpenChat feature for desktop and tablet landscape */}
            {(!isMobileOnly && !(isTablet && isPortrait)) && (
                <>
                    {/* The Chat Window, rendered when isChatVisible is true */}
                    {isChatVisible && (
                        <div className={styles.openChatWrapperGlobalMainLayout}>
                            <OpenChat />
                        </div>
                    )}

                    {isChatVisible ? (
                        // If chat is visible, show a styled "X" button to close it
                        <button
                            className={styles.chatCloseButton}
                            onClick={toggleChatVisibility}
                            aria-label="Close Chat"
                        >
                            X
                        </button>
                    ) : (
                        // If chat is hidden, the image itself is the button
                        <img
                            src={chatIcon}
                            alt="Open Chat"
                            className={styles.chatImageButton}
                            onClick={toggleChatVisibility}
                            role="button"
                            aria-label="Open Chat"
                            tabIndex={0}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default MainLayout;