import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import HomeBackgroundOverlay from './HomeBackgroundOverlay';
import useIsMobile from '../../hooks/useIsMobile';
import Plataforma from '../../components/Plataforma';
import CascoNFID from '../../components/CascoNFID';
import Kami from '../../../../public/assets/Kami.svg';
import KonectaLogo from '../../../../public/assets/Konecta Logo.svg';
import useLoadingProgress from '../../../utils/useLoadingProgress';
import LoadingOverlay from '../../../components/LoadingOverlay';
import KonectaInfoButton from '../../components/KonectaInfoButton/KonectaInfoButton';
import HelpButton from '../../components/HelpButton/HelpButton';
import SpeechBubble from '../../components/SpeechBubble/SpeechBubble';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from '../../../declarations/backend';
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { Usergeek } from 'usergeek-ic-js';
import { NFID } from '@nfid/embed';

const Home: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleContent, setBubbleContent] = useState('');
  const [iframeReady, setIframeReady] = useState(false);
  const { loadingPercentage } = useLoadingProgress();
  const agent = new HttpAgent();

  // Simulate loading text from 0% to 100% over 4 seconds
  const fetchData = async () => {
    const nfidInstance = NFID.init({
      origin: 'https://nfid.one',
      application: {
        name: 'Konectª Pre-Register',
        logo: 'https://dev.nfid.one/static/media/id.300eb72f3335b50f5653a7d6ad5467b3.svg',
      },
    });
  
    if ((await nfidInstance).getIdentity() !== null) {
      navigate('/Missions');
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [iframeReady]);

  // NFID Handlers

  const handleIframeReady = () => {
    setIframeReady(true);
  };

  const handlePrincipalId = async (principalId: Principal, identity: any) => {

    const agent = new HttpAgent({ identity: identity });
    const backendActor = Actor.createActor(backend_idlFactory, {
      agent,
      canisterId: backend_canisterId,
    });

    // Fetch progress for the user
    const progress = await backendActor.getProgress(principalId, 0n);

    if (progress === null || (Array.isArray(progress) && progress.length === 0)) {
      // If user is not registered, add them
      Usergeek.trackEvent('Mission 0: User Registered');
      await backendActor.addUser(principalId);
    }

    navigate('/Missions', { state: { backendActor } });

  };

  // Bubble Content Handlers

  const handleKonectaClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("Konecta WebApp: Konecta is a Web app for Service providers to Offer and people to Request Services, in a Calendar-focus way.\nKonecta Protocol: Event Management protocol, for users to get their events cross-dApps.");
      setShowBubble(true); // Show the new content
    }, 0);
  };

  const handleHelpClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("The adventure begins here, brave traveler! To unlock your first precious seconds, you must log in using your NFID. It’s your key to the Konecta Realm. Time waits for no one!");
      setShowBubble(true); // Show the new content
    }, 0);
  };

  return (
    <div className={styles.HomeContainer}>

      {/* Loading Screen - Visible until the iFrame is ready */}
      {!iframeReady && (
        <LoadingOverlay loadingPercentage={loadingPercentage} />
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
                  <CascoNFID onIframeReady={handleIframeReady} onPrincipalId={handlePrincipalId} agent={agent} />
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
