import React, { useState } from 'react';
import HexagonButton from '../../../../components/HexagonButton/hexagonButton.tsx';
import styles from './ActionButtons.module.scss';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';

interface ButtonItem {
  name: string;
  src: string;
  onClick?: () => void;
  type?: string;
}

interface ActionButtonsProps {
  buttonList: ButtonItem[];
  toggleModal: (modalName: keyof ModalState) => void;
}

type ModalState = {
  isHistoryModalOpen: boolean;
  isKonectaModalOpen: boolean;
  isInfoModalOpen: boolean;
  isOpenChatModalOpen: boolean;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ buttonList, toggleModal }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const modalMap: { [key: string]: keyof ModalState } = {
    History: 'isHistoryModalOpen',
    Konecta: 'isKonectaModalOpen',
    Info: 'isInfoModalOpen',
    OpenChat: 'isOpenChatModalOpen',
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Start closing animation
      setIsAnimating(true);
      setMenuOpen(false);

      // Calculate total animation duration
      const totalAnimationDuration = (buttonList.length - 1) * 0.1 + 0.3;

      // Set a timeout to end animation
      setTimeout(() => {
        setIsAnimating(false);
      }, totalAnimationDuration * 1000);
    } else {
      // Open the menu
      setMenuOpen(true);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isMenuOpen || isAnimating ? styles.active : ''}`}
        onClick={toggleMenu}
      ></div>

      {/* Action Buttons */}
      <div className={styles.collapseWrapperNfid}>
        <ul
          className={`${styles.collapsedButtons} ${isMenuOpen || isAnimating ? styles.active : ''
            }`}
        >
          {buttonList
            ?.filter((item) => item.type !== 'desktop')
            .map((item, index) => {
              const modalName = modalMap[item.name];
              const delay = isMenuOpen
                ? index * 0.1
                : (buttonList.length - index - 1) * 0.1;

              return (
                <li
                  className={`${styles.collapsedButton} ${isMenuOpen ? styles.buttonVisible : ''
                    }`}
                  key={item.name}
                  style={{ transitionDelay: `${delay}s` }}
                >
                  <HexagonButton
                    name={item.name}
                    src={item.src}
                    onClick={
                      item.onClick
                        ? item.onClick
                        : () => {
                          toggleModal(modalName);
                        }
                    }
                  />
                </li>
              );
            })}
        </ul>
        <div className={styles.HexagonButton}>
          <HexagonButton
            name={isMenuOpen ? 'Close' : 'Menu'}
            src={isMenuOpen ? '/assets/closeButton.svg' : '/assets/openButton.svg'}
            onClick={toggleMenu}
          />
        </div>
      </div>
    </>
  );
};

export default ActionButtons;
