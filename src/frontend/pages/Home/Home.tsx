import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import HomeBackgroundOverlay from './HomeBackgroundOverlay';
import useIsMobile from '../../hooks/useIsMobile';
import Plataforma from '../../components/Plataforma';
import CascoNFID from '../../components/CascoNFID';
import Kami from '../../../../public/assets/Kami.svg';
import KonectaLogo from '../../../../public/assets/Konecta Logo.svg';
import TimeCapsule from '../../../../public/assets/Time Capsule.svg';
import KonectaInfoButton from '../../components/KonectaInfoButton/KonectaInfoButton';
import HelpButton from '../../components/HelpButton/HelpButton';
import SpeechBubble from '../../components/SpeechBubble/SpeechBubble';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from '../../declarations/backend';
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { useEncryption } from '../../../components/EncryptionProvider';

const Home: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleContent, setBubbleContent] = useState('');
  const [iframeReady, setIframeReady] = useState(false);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const { decryptSession, saveSession } = useEncryption();

  const agent = new HttpAgent();
  const backendActor = Actor.createActor(backend_idlFactory, {
    agent,
    canisterId: backend_canisterId,
  });

  // Simulate loading text from 0% to 100% over 4 seconds
  useEffect(() => {

    const session = decryptSession();
    if (session?.principalId) {
      navigate('/Missions');
    }

    let interval: NodeJS.Timeout;

    if (!iframeReady) {
      let percentage = 0;
      interval = setInterval(() => {
        percentage += 1;
        setLoadingPercentage(percentage);
        if (percentage >= 100) {
          clearInterval(interval); // Stop once it reaches 100%
        }
      }, 40); // Loading Speed (1 second per 10ms)
    }

    return () => clearInterval(interval);
  }, [iframeReady]);

  // NFID Handlers

  const handleIframeReady = () => {
    setIframeReady(true);
  };

  const handlePrincipalId = async (principalId: Principal) => {
    saveSession(principalId.toText());

    try {
      // Fetch progress for the user
      const progress = await backendActor.getProgress(principalId, 0n);

      if (progress === null || (Array.isArray(progress) && progress.length === 0)) {
        // If user is not registered, add them
        await backendActor.addUser(principalId);
        console.log('User registered');
      } else {
        console.log('User already registered');
      }
    } catch (error) {
      console.error('Error calling with backend:', error);
    } finally {
      navigate('/Missions');
    }
  };

  // Bubble Content Handlers

  const handleKonectaClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("Konecta is your time-bending, event-managing sidekick. It turns planning into an adventure, making sure every second counts. With Konecta, you don’t just manage events—you master time like a pro.");
      setShowBubble(true); // Show the new content
    }, 0);
  };

  const handleHelpClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("Help mode activated! Here’s where you can find all the tips and tricks you need to navigate and use Konecta effectively. Let’s get you sorted!");
      setShowBubble(true); // Show the new content
    }, 0);
  };

  return (
    <div className={`${styles.HomeContainer} ${isMobile ? styles.mobile : ''}`}>

      {/* Loading Screen - Visible until the iFrame is ready */}
      {!iframeReady && (
        <div className={styles.LoadingOverlay}>
          <div className={styles.TimeCapsuleWrapper}>
            <img src={TimeCapsule} alt="Time Capsule" className={styles.TimeCapsule} />
            <div className={styles.LoadingText}>{loadingPercentage}%</div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div style={{ visibility: iframeReady ? 'visible' : 'hidden' }}>
        <div className={styles.OverlayWrapper}>
          <HomeBackgroundOverlay mobile={isMobile} />
        </div>
        <div className={styles.KonectaLogoWrapper}>
          <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
        </div>
        {!isMobile && (
          <>
            <div className={styles.SvgWrapper}>
              <Plataforma animationDelay="0s" />
              <div className={styles.KamiWrapper}>
                <img src={Kami} alt="Kami" />
              </div>
            </div>
            <div className={styles.TextWrapper}>
              <SpeechBubble
                visible={showBubble}
                onHide={() => setShowBubble(false)}
                content={bubbleContent}
              />
            </div>
            <div className={styles.BottomPlataformaWrapper}>
              <div className={styles.PlataformaContainer}>
                <div className={styles.Casco}>
                  <CascoNFID onIframeReady={handleIframeReady} onPrincipalId={handlePrincipalId} />
                </div>
                <Plataforma animationDelay="0.5s" />
              </div>
            </div>
            <div className={styles.HelpButtons}>
              <KonectaInfoButton onClick={handleKonectaClick} />
              <HelpButton onClick={handleHelpClick} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
