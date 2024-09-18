import React, { useState } from 'react';
import styles from './InfoModal.module.scss';
import KamiKonecta from '../../../../../../public/assets/KamiKonecta.svg';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo Icon.svg';
import { isMobileOnly } from 'react-device-detect';
import TimeCapsule from '../../../../../../public/assets/Time Capsule.svg';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import MissionPlaceholder from '../Mission/MissionPlaceholder.tsx';
import AnimatedToken from './AnimatedToken/AnimatedToken.tsx';
import Arrow from '../../../../../../public/assets/Arrow.svg';
interface InfoModalProps {
    closeModal: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ closeModal }) => {
    const globalID = useGlobalID();
    const [isClosing, setIsClosing] = useState(false);
    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    return (
        <div className={styles.ModalOverlay}>


            {isMobileOnly ? (
                <>
                    <div className={`${styles.ModalContent2} ${isClosing ? styles.hide : ''}`}>
                        <div className={styles.Texto2}>
                            <p>
                                Welcome to the Konecta Pre-Register!
                            </p>
                            <p>
                                Complete tasks to earn seconds for your Time Capsule, with each mission offering a different time reward.
                            </p>
                            <p>
                                The more time you bank, the more KTA tokens you will get later!
                            </p>
                            <p>
                                Every second is a step towards your next big adventure—let's make them count!
                            </p>
                        </div>
                        <button className={styles.CloseButton2} onClick={handleCloseModal}>X</button>
                        <div className={styles.VerticalLine}></div>
                        <div className={styles.VerticalLine2}></div>
                        <div className={styles.VerticalLine3}></div>
                        <div className={styles.Container}>
                            <div className={styles.Pacman}></div>
                            {[...Array(9)].map((_, index) => (
                                <div className={styles.Path} key={index}>
                                    <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={`${styles.ModalContent} ${isClosing ? styles.hide : ''}`}>
                        <div className={styles.Texto}>
                            <p>
                                Welcome to the Konecta Pre-Register!
                            </p>
                            <p>
                                Complete tasks to earn seconds for your Time Capsule, with each mission offering a different time reward.
                            </p>
                            <p>
                                The more time you bank, the more KTA tokens you will get later!
                            </p>

                            <p>
                                Every second is a step towards your next big adventure—let's make them count!
                            </p>
                        </div>
                        <button className={styles.CloseButton} onClick={handleCloseModal}>X</button>
                        <div className={styles.KamiKonecta}>
                            <img src={KamiKonecta} alt="Kami Konecta" />
                        </div>
                        <div className={styles.KonectaLogo}>
                            <img src={KonectaLogo} alt="Konecta logo" style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))' }} />
                        </div>
                        <div className={styles.AllContainer}>
                            <div className={styles.MPH}>
                                <MissionPlaceholder />
                            </div>
                            <div className={styles.KonectaLogo2}>
                                <div className={styles.TimeCapsuleWrapper}>
                                    <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                                    <div className={styles.TimerText}>{globalID.timerText}</div>
                                </div>
                            </div>
                            <div className={styles.KonectaLogo3}>
                                <AnimatedToken />
                            </div>
                            <div className={styles.KonectaLogo4}>
                                <img src={Arrow} alt="Arrow" style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))' }} />
                            </div>
                            <div className={styles.KonectaLogo5}>
                                <img src={Arrow} alt="Arrow" style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))' }} />
                            </div>
                        </div>
                        <div className={styles.VerticalLine}></div>
                        <div className={styles.VerticalLine2}></div>
                        <div className={styles.VerticalLine3}></div>
                        <div className={styles.Container}>
                            <div className={styles.Pacman}></div>
                            {[...Array(9)].map((_, index) => (
                                <div className={styles.Path} key={index}>
                                    <img src={KonectaLogo} alt="Konecta logo" className={styles.Konectico} />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div >
    );
};

export default InfoModal;
