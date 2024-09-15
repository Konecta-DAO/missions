import React, { useState } from 'react';
import styles from './TopBar.module.scss';
import KonectaLogo from '../../../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../../../public/assets/Time Capsule.svg';
import useLoadingProgress from '../../../../../utils/useLoadingProgress.ts';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
import HexagonButton from '../../../../components/HexagonButton/hexagonButton.tsx';
import { isMobileOnly, isTablet } from 'react-device-detect';
          
interface ButtonItem {
    name: string;
    src: string;
    onClick?: () => void;
    type?: string;
}
                       
interface TopBarProps {
    buttonList: ButtonItem[];
    toggleModal: (modalName : keyof ModalState) => void;
}

type ModalState = {
    isHistoryModalOpen: boolean;
    isKonectaModalOpen: boolean;
    isInfoModalOpen: boolean;
    isOpenChatModalOpen: boolean;
  };

const TopBar: React.FC<TopBarProps> = ({ buttonList, toggleModal }) => {
    const globalID = useGlobalID();
    const { disconnect } = useIdentityKit();

    const modalMap: { [key: string]: keyof ModalState } = {
        History: 'isHistoryModalOpen',
        Konecta: 'isKonectaModalOpen',
        Info: 'isInfoModalOpen',
    };
    
    return (
        <>
                {
                    !isMobileOnly && !isTablet ? (
                        <nav className={styles.topbar}>
                                <div className={styles.topbarLeft}>
                                    <div className={styles.timeCapsuleWrapper}>
                                        <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
                                        <div className={styles.TimerText}>{globalID.timerText}</div>
                                    </div>
                                </div>
                                <div className={styles.topbarCenter}>
                                    <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
                                </div>
                                <ul className={styles.topbarRight}>
                                    {
                                        buttonList
                                        ?.filter((item) => item.type !== 'mobile')
                                        .map((item) => {
                                            const modalName = modalMap[item.name];
                                            return <li className={styles.topbarButton}>
                                                <HexagonButton name={item.name} src={item.src} onClick={ item.onClick ? item.onClick : () => { toggleModal(modalName)} } />
                                            </li>
                                        })
                                    }
                                </ul>
                        </nav>
                    ) : (
                        <nav className={styles.topbarMobile}>
                            <div className={styles.topbarTop}>
                                <div className={styles.topbarLeftMobile}>
                                    <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogoMobile} />
                                </div>
                                <div className={styles.topbarRightMobile}>
                                    <div className={styles.hexagonButtonWrapper}>
                                        <HexagonButton name="Log Out" src="/assets/logout_button.svg" onClick={disconnect || (() => {})} />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.topbarBottom}>
                                <div className={styles.timeCapsuleWrapper}>
                                    <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsuleMobile} />
                                    <div className={styles.TimerTextMobile}>{globalID.timerText}</div>
                                </div>
                            </div>
                        </nav>
                    )
                }
        </>
    );
};

export default TopBar;
