import React, { useEffect, useRef, useState } from 'react';
import styles from './KonectaModal.module.scss';
import KamiKonecta from '../../../../../../public/assets/KamiKonecta.svg';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo Icon.svg';
import KonectaSVG from './KonectaSVG/KonectaSVG.tsx';
import { isMobileOnly } from 'react-device-detect';
interface KonectaModalProps {
    closeModal: () => void;
}


const KonectaModal: React.FC<KonectaModalProps> = ({ closeModal }) => {
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            handleCloseModal();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.ModalOverlay}>

            {isMobileOnly ? (
                <>
                    <div className={`${styles.ModalContent2} ${isClosing ? styles.hide : ''}`}>
                        <div className={styles.Texto2}>
                            <p>
                                The Konecta WebApp is a versatile platform designed to make event management seamless and interactive.
                            </p>
                            <p>
                                Users can manage their calendars, organize events, and engage with others through integrated audio and video chat.
                            </p>
                            <p>
                                It offers advanced features like matchmaking based on shared interests, and integrates powerful tools like payments, NFTs, video on demand, and live streaming.
                            </p>
                            <p>
                                Additionally, the platform allows users to connect with service providers and access cross-app event management, making the entire process smooth and efficient​​.
                            </p>
                        </div>

                        <button className={styles.CloseButton2} onClick={handleCloseModal}>X</button>
                        <div className={styles.KonectaAnim2}>
                            <KonectaSVG />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={`${styles.ModalContent} ${isClosing ? styles.hide : ''}`}>
                        <div className={styles.Texto}>
                            <p>
                                The Konecta WebApp is a versatile platform designed to make event management seamless and interactive.
                            </p>
                            <p>
                                Users can manage their calendars, organize events, and engage with others through integrated audio and video chat.
                            </p>
                            <p>
                                It offers advanced features like matchmaking based on shared interests, and integrates powerful tools like payments, NFTs, video on demand, and live streaming.
                            </p>
                            <p>
                                Additionally, the platform allows users to connect with service providers and access cross-app event management, making the entire process smooth and efficient​​.
                            </p>
                        </div>

                        <button className={styles.CloseButton} onClick={handleCloseModal}>X</button>
                        <div className={styles.KamiKonecta}>
                            <img src={KamiKonecta} alt="Kami Konecta" />
                        </div>
                        <div className={styles.KonectaLogo}>
                            <img src={KonectaLogo} alt="Konecta logo" style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))' }}/>
                        </div>
                        <div className={styles.KonectaAnim}>
                            <KonectaSVG />
                        </div>
                    </div>
                </>
            )}
        </div >
    );
};

export default KonectaModal;
