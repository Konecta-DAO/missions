import React, { useState } from 'react';
import HexagonButton from '../../../../components/HexagonButton/hexagonButton.tsx';
import styles from './ActionButtons.module.scss';

interface ButtonItem {
    name: string;
    src: string;
    onClick?: () => void;
    type?: string;
}

interface ActionButtonsProps {
    buttonList: ButtonItem[];
    toggleModal: (modalName : keyof ModalState) => void;
}

type ModalState = {
    isHistoryModalOpen: boolean;
    isKonectaModalOpen: boolean;
    isInfoModalOpen: boolean;
    isOpenChatModalOpen: boolean;
  };

const ActionButtons: React.FC<ActionButtonsProps> = ({ buttonList, toggleModal }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const modalMap: { [key: string]: keyof ModalState } = {
        History: 'isHistoryModalOpen',
        Konecta: 'isKonectaModalOpen',
        Info: 'isInfoModalOpen',
        OpenChat: 'isOpenChatModalOpen',
    };
    
    const toggleMenu = () => {
        setMenuOpen((prevState: any) => !prevState);
    };

    return (
        <div className={styles.collapseWrapper}>
            {
                isMenuOpen &&
                <ul className={styles.collapsedButtons}>
                    {
                        buttonList
                        ?.filter((item) => item.type !== 'desktop')
                        .map((item) => {
                            const modalName = modalMap[item.name];
                            return <li className={styles.collapsedButton} key={item.name}>
                                    <HexagonButton name={item.name} src={item.src} onClick={ item.onClick ? item.onClick : () => { toggleModal(modalName)} } />
                            </li>
                        })
                    }
                </ul>
            }
            <div className={styles.HexagonButton}>
                <HexagonButton
                    name={isMenuOpen ? "Close" : "Menu"}
                    src={isMenuOpen ? "/assets/closeButton.svg" : "/assets/openButton.svg"}
                    onClick={toggleMenu}
                />
            </div>
        </div>
    );
};

export default ActionButtons;