import React, { useState } from 'react';
import styles from './KonectaModal.module.scss';
import KamiKonecta from '../../../../../../public/assets/KamiKonecta.svg';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo Icon.svg';
import KonectaSVG from './KonectaSVG/KonectaSVG.tsx';
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
                <div className={styles.Texto}>
                    <p>
                        The Konecta WebApp is a versatile platform designed to make event management seamless and interactive.
                    </p>
                    <br />
                    <p>
                        Users can manage their calendars, organize events, and engage with others through integrated audio and video chat.
                    </p>
                    <br />
                    <p>
                        It offers advanced features like matchmaking based on shared interests, and integrates powerful tools like payments, NFTs, video on demand, and live streaming.
                    </p>
                    <br />
                    <p>
                        Additionally, the platform allows users to connect with service providers and access cross-app event management, making the entire process smooth and efficient​​.
                    </p>
                </div>

                <button className={styles.CloseButton} onClick={handleCloseModal}>X</button>
                <div className={styles.KamiKonecta}>
                    <img src={KamiKonecta} alt="Kami Konecta" />
                </div>
                <div className={styles.KonectaLogo}>
                    <img src={KonectaLogo} alt="Konecta logo" />
                </div>
                <div className={styles.KonectaAnim}>
                    <KonectaSVG />
                </div>
            </div>
        </div>
    );
};

export default KonectaModal;
