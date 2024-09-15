import React, { useState } from 'react';
import styles from '../HistoryModal/HistoryModalMobile.module.scss';
import OpenChat from '../../../../../components/OpenChatComponent.tsx';

interface HistoryModalProps {
    closeModal: () => void;
}

const OpenChatModal: React.FC<HistoryModalProps> = ({ closeModal }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    return (
        <div className={styles.MobileModalOverlay}>
            <div className={`${styles.MobileModalContent} ${isClosing ? styles.hide : ''}`}>
                {/* Close Button (X) */}
                <button className={styles.CloseButton} onClick={handleCloseModal}>X</button>
                <OpenChat />
            </div>
        </div>
    );
};

export default OpenChatModal;
