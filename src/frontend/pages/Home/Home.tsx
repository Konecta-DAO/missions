import React from 'react';
import styles from './Home.module.scss'; // Import the styles
import HomeBackgroundOverlay from './HomeBackgroundOverlay';
import useIsMobile from '../../hooks/useIsMobile';
import Plataforma from '../../components/Plataforma';
import Kami from '../../../../public/assets/Kami.svg';

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
            <Plataforma />
            <div className={styles.KamiWrapper}>
              <img src={Kami} alt="Kami" />
            </div>
          </div>
          <div className={styles.BottomPlataformaWrapper}>
            <div className={styles.PlataformaContainer}>
              <Plataforma />
            </div>
          </div>
        </>
      )}
      <h1>{isMobile ? 'HOME (Mobile)' : 'HOME'}</h1>
    </div>
  );
};

export default Home;
