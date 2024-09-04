import React from 'react';
import styles from './Home.module.scss';
import HomeBackgroundOverlay from './HomeBackgroundOverlay';
import useIsMobile from '../../hooks/useIsMobile';
import Plataforma from '../../components/Plataforma';
import Kami from '../../../../public/assets/Kami.svg';
import OpenChat from '../../../components/OpenChatComponent';

const Home: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`${styles.HomeContainer} ${isMobile ? styles.mobile : ''}`}>
      <div className={styles.OverlayWrapper}>
        <HomeBackgroundOverlay mobile={isMobile} />
      </div>
      {!isMobile && (
        <>
          <div className={styles.SvgWrapper}>
            <Plataforma animationDelay="0s" />
            <div className={styles.KamiWrapper}>
              <img src={Kami} alt="Kami" />
            </div>
          </div>
          <div className={styles.BottomPlataformaWrapper}>
            <div className={styles.PlataformaContainer}>
              <Plataforma animationDelay="0.5s" />
            </div>
          </div>
          <div className={styles.OpenChatWrapper}>
            <OpenChat />
          </div>
        </>
      )}
      <h1>{isMobile ? 'HOME (Mobile)' : 'HOME'}</h1>

    </div>
  );
};

export default Home;
