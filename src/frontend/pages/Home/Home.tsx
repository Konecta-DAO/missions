import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import HomeBackgroundOverlay from './HomeBackground/HomeBackgroundOverlay.tsx';
import HomeBackgroundOverlayMobile from './HomeBackground/HomeBackgroundOverlayMobile.tsx';
import HomeBackgroundOverlayTablet from './HomeBackground/HomeBackgroundOverlayTablet.tsx';
import { useMediaQuery } from 'react-responsive';
import { isMobileOnly, isTablet } from 'react-device-detect';
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
import KonectaModal from '../Missions/Components/KonectaModal/KonectaModal.tsx';
import InfoModal from '../Missions/Components/InfoModal/InfoModal.tsx';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleContent, setBubbleContent] = useState('');
  const { identity, user, disconnect } = useIdentityKit();
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
  const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });
  const globalID = useGlobalID();
  const { loadingPercentage, loadingComplete } = useLoadingProgress();
  const [isKonectaModalOpen, setIsKonectaModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const setData = async (agent: HttpAgent) => {
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
            })
          }
        })
      })
    }
  };

  useEffect(() => {
    const fetchData = async () => {

      const isUserPrincipalValid = user?.principal
        ? user.principal.toText() !== "2vxsx-fae"
        : false;

      if (isUserPrincipalValid) {
        const agent = HttpAgent.createSync({ identity });

        if (process.env.NODE_ENV !== "production") {
          agent.fetchRootKey();
        }

        await setData(agent);
      } else {
        disconnect();
      }

    };

    fetchData();
  }, [user, identity]);


  // Bubble Content Handlers

  const handleKonectaClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("Konecta WebApp: Konecta is a Web app for Service providers to Offer and people to Request Services, in a Calendar-focus way.\nKonecta Protocol: Event Management protocol, for users to get their events cross-dApps.");
      setShowBubble(true);
    }, 0);
  };

  const connectWalletRef = useRef<HTMLDivElement>(null);

  const handleHelpClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("The adventure begins here, brave traveler! To unlock your first precious seconds, you must log in using your NFID. It’s your key to the Konecta Realm. Time waits for no one!");
      setShowBubble(true);
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


  const handleKonectaClickMobile = () => {
    setIsKonectaModalOpen(true); // Open the modal when the button is clicked
  };

  const handleKonectaCloseModal = () => {
    setIsKonectaModalOpen(false); // Close the modal
  };

  const handleInfoClickMobile = () => {
    setIsInfoModalOpen(true); // Open the modal when the button is clicked
  };

  const handleInfoCloseModal = () => {
    setIsInfoModalOpen(false); // Close the modal
  };

  if (user?.principal !== undefined) {
    return <LoadingOverlay loadingPercentage={loadingPercentage} />;
  }

  return (
    <div className={styles.HomeContainer}>

      {/* Page Content */}
      <div>
        {

          // DESKTOP

          !isMobileOnly && !isTablet ? (
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
          ) : isMobileOnly ? (

            // MOBILE

            <>
              {isPortrait && (
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
                      <KonectaInfoButton onClick={handleKonectaClickMobile} />
                    </div>
                    <div className={styles.HelpB2}>
                      <HelpButton onClick={handleInfoClickMobile} />
                    </div>
                  </div>

                  {isKonectaModalOpen && (
                    <KonectaModal closeModal={handleKonectaCloseModal} />
                  )}

                  {isInfoModalOpen && (
                    <InfoModal closeModal={handleInfoCloseModal} />
                  )}
                </>
              )}
              {isLandscape && (
                <>
                  <p>Please rotate your phone</p>
                </>
              )}
            </>
          ) : (

            // TABLET

            <>
              {isPortrait && (
                <>
                  <div className={styles.OverlayWrapper2}>
                    <HomeBackgroundOverlayTablet />
                  </div><div className={styles.KonectaLogoWrapper2}>
                    <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
                  </div><div className={styles.CascoLogin2}>
                    <CascoOtro onClick={handleConnect} />
                    <div ref={connectWalletRef} style={{ visibility: 'hidden' }}>
                      <ConnectWallet />
                    </div>
                  </div><div className={styles.HelpButtons3}>
                    <div className={styles.KonecB2}>
                      <KonectaInfoButton onClick={handleKonectaClickMobile} />
                    </div>
                    <div className={styles.HelpB2}>
                      <HelpButton onClick={handleInfoClickMobile} />
                    </div>
                  </div>

                  {isKonectaModalOpen && (
                    <KonectaModal closeModal={handleKonectaCloseModal} />
                  )}

                  {isInfoModalOpen && (
                    <InfoModal closeModal={handleInfoCloseModal} />
                  )}
                </>
              )}
              {isLandscape && (
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
              )}
            </>
          )
        }

      </div >
    </div >
  );
};

export default Home;
