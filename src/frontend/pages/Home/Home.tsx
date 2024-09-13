import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import HomeBackgroundOverlay from './HomeBackground/HomeBackgroundOverlay.tsx';
import HomeBackgroundOverlayMobile from './HomeBackground/HomeBackgroundOverlayMobile.tsx';
import useIsMobile from '../../../hooks/useIsMobile.tsx';
import Plataforma from '../../components/Plataforma/Plataforma.tsx';
import Casco from '../../components/Casco.tsx';
import CascoOtro from '../../components/CascoOtro.tsx';
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
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, SerializedUser } from '../../../declarations/backend/backend.did.js';
import { canisterId } from '../../../declarations/backend/index.js';
import { Principal } from '@dfinity/principal';

const Home: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleContent, setBubbleContent] = useState('');
  const { identity, user, disconnect } = useIdentityKit();
  const globalID = useGlobalID();
  const { loadingPercentage, loadingComplete } = useLoadingProgress();

  const setData = (agent: HttpAgent) => {
    if (agent) {
      const actor = Actor.createActor(idlFactory, {
        agent: agent!,
        canisterId,
      });
      agent.getPrincipal().then((a) => {
        globalID.setPrincipal(a);

        (actor.getUser(a) as Promise<SerializedUser[]>).then((b) => {
          if (Array.isArray(b) && b.length !== 0) {
            globalID.setPrincipal(a);
            globalID.setUser(b);
            navigate('/Missions');
          } else {
            (actor.addUser(a) as Promise<SerializedUser[]>).then((newUser) => {
              globalID.setPrincipal(a);
              globalID.setUser(newUser);
              navigate('/Missions');
            }).catch((error) => {
              console.error("Error adding user: ", error);
            });
          }
        }).catch((error) => {
          console.error("Error getting user: ", error);
        });
      }).catch((error) => {
        console.error("Error getting principal: ", error);
      });
    }
  };



  useEffect(() => {
    console.log("User: ", user);
    console.log("Identity: ", identity);
    console.log("PRincipal", user?.principal.toText());
    console.log("Anonimo: ", user?.principal.isAnonymous());
    console.log("Agente: ", globalID.agent);
    const fetchData = async () => {
      console.log(identity?.getPrincipal())
      if (user?.principal && user?.principal !== Principal.fromText("2vxsx-fae") && identity !== undefined) {
        if (identity.getPrincipal().toText() !== "2vxsx-fae") {
          const agent = HttpAgent.createSync({ identity });
          setData(agent);
        } else {
          disconnect();
        }

      }
    };
    fetchData();
  }, [user?.principal]);

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
    console.log("CLICKEA");
  };

  if (user?.principal !== undefined) {
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
        {!isMobile ? (
          <>
            <div className={styles.OverlayWrapper}>
              <HomeBackgroundOverlay />
            </div>
            <div className={styles.KonectaLogoWrapper}>
              <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
            </div>
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
                <Plataforma animationDelay="3s" />
              </div>
            </div>
            <div className={styles.HelpButtons}>
              <div className={styles.KonecB}>
                <KonectaInfoButton onClick={handleKonectaClick} />
              </div>
              <div className={styles.HelpB}>
                <HelpButton onClick={handleHelpClick} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.OverlayWrapper}>
              <HomeBackgroundOverlayMobile />
            </div>
            <div className={styles.KonectaLogoWrapper2}>
              <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
            </div>
            <div className={styles.CascoLogin}>
              <CascoOtro onClick={handleConnect} />
              <div ref={connectWalletRef} style={{ visibility: 'hidden' }}>
                <ConnectWallet />
              </div>
            </div>
            <div className={styles.HelpButtons2}>
              <div className={styles.KonecB2}>
                <KonectaInfoButton onClick={handleKonectaClick} />
              </div>
              <div className={styles.HelpB2}>
                <HelpButton onClick={handleHelpClick} />
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Home;
