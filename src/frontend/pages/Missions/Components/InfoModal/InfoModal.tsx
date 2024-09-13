import React, { useState } from 'react';
import styles from './InfoModal.module.scss';
import KamiKonecta from '../../../../../../public/assets/KamiKonecta.svg';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo Icon.svg';
interface InfoModalProps {
    closeModal: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ closeModal }) => {
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
                <div className={styles.VerticalLine}></div>
                <div className={styles.VerticalLine2}></div>
                <div className={styles.VerticalLine3}></div>
                <div className={styles.Container}>
                    <div className={styles.Pacman}></div>

                    <div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div>
                    <div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div><div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div><div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div><div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div><div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div><div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div><div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div><div className={styles.Path}>
                        <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
