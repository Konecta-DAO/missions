import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import HomeBackgroundOverlay from './HomeBackgroundOverlay.tsx';
import useIsMobile from '../../../hooks/useIsMobile.tsx';
import Plataforma from '../../components/Plataforma/Plataforma.tsx';
import Casco from '../../components/Casco.tsx';
import Kami from '../../../../public/assets/Kami.svg';
import KonectaLogo from '../../../../public/assets/Konecta Logo.svg';
import KonectaInfoButton from '../../components/KonectaInfoButton/KonectaInfoButton.tsx';
import HelpButton from '../../components/HelpButton/HelpButton.tsx';
import SpeechBubble from '../../components/SpeechBubble/SpeechBubble.tsx';
import "@nfid/identitykit/react/styles.css"
import { ConnectWallet, useIdentityKit } from "@nfid/identitykit/react"
import { useGlobalID } from '../../../hooks/globalID.tsx';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import useLoadingProgress from '../../../utils/useLoadingProgress.ts';
import { Actor } from '@dfinity/agent';
import { idlFactory, SerializedUser } from '../../../declarations/backend/backend.did.js';
import { canisterId } from '../../../declarations/backend/index.js';
import { Principal } from '@dfinity/principal';

const Home: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleContent, setBubbleContent] = useState('');
  const { connectedAccount, agent } = useIdentityKit();
  const globalID = useGlobalID();
  const { loadingPercentage, loadingComplete } = useLoadingProgress();

  const setData = async () => {
    if (agent) {
      const actor = Actor.createActor(idlFactory, {
        agent: agent!,
        canisterId,
      })
      const a = await agent.getPrincipal();
      globalID.setPrincipal(a);

      const b = await actor.getUser(a) as SerializedUser[];
      if (Array.isArray(b) && b.length !== 0) {
        globalID.setPrincipal(a);
        globalID.setUser(b);
        navigate('/Missions');
      } else {
        const b = await actor.addUser(a) as SerializedUser[];
        globalID.setPrincipal(a);
        globalID.setUser(b);
        navigate('/Missions');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (connectedAccount && agent) {
        setData();
      }
    };
    fetchData();
  }, [connectedAccount, agent]);

  // Bubble Content Handlers

  const handleKonectaClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("Konecta WebApp: Konecta is a Web app for Service providers to Offer and people to Request Services, in a Calendar-focus way.\nKonecta Protocol: Event Management protocol, for users to get their events cross-dApps.");
      setShowBubble(true); // Show the new content
    }, 0);
  };

  const connectWalletRef = useRef<HTMLDivElement>(null);

  const handleHelpClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("The adventure begins here, brave traveler! To unlock your first precious seconds, you must log in using your NFID. It’s your key to the Konecta Realm. Time waits for no one!");
      setShowBubble(true); // Show the new content
    }, 0);
  };

  const handleConnect = () => {
    if (connectWalletRef.current) {

      const button = connectWalletRef.current.querySelector('button');
      if (button) {
        button.click();
      }
    }
  };

  if (connectedAccount != undefined) {
    return <LoadingOverlay loadingPercentage={loadingPercentage} />;
  }

  return (
    <div className={styles.HomeContainer}>

      {/* Loading Screen - Visible until the iFrame is ready
      {!iframeReady && (
        <LoadingOverlay loadingPercentage={loadingPercentage} />
      )} */}

      {/* Page Content */}
      <div>
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
                  <Casco onClick={handleConnect} />
                  <div ref={connectWalletRef} style={{ visibility: 'hidden' }}>
                    <ConnectWallet />
                  </div>
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
