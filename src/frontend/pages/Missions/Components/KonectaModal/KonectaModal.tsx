import React, { useState } from 'react';
import styles from './KonectaModal.module.scss';
import KamiKonecta from '../../../../../../public/assets/KamiKonecta.svg';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo Icon.svg';
interface KonectaModalProps {
    closeModal: () => void;
}


const KonectaModal: React.FC<KonectaModalProps> = ({ closeModal }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    return (
        <div className={styles.ModalOverlay}>
            <div className={`${styles.ModalContent} ${isClosing ? styles.hide : ''}`}>
                <button className={styles.CloseButton} onClick={handleCloseModal}>X</button>
                <div className={styles.KamiKonecta}>
                    <img src={KamiKonecta} alt="Kami Konecta" />
                </div>
                <div className={styles.KonectaLogo}>
                    <img src={KonectaLogo} alt="Konecta logo" />
                </div>
            </div>
        </div>
    );
};

export default KonectaModal;
