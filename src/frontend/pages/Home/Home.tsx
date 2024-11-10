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
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, SerializedUser } from '../../../declarations/backend/backend.did.js';
import { canisterId } from '../../../declarations/backend/index.js';
import { idlFactory as idlFactoryNFID, canisterId as canisterIdNFID } from '../../../declarations/nfid/index.js';
import { idlFactory as idlFactoryDFINITY } from '../../../declarations/dfinity_backend/index.js';
import KonectaModal from '../Missions/Components/KonectaModal/KonectaModal.tsx';
import InfoModal from '../Missions/Components/InfoModal/InfoModal.tsx';
import LoadingOverlay from '../../../components/LoadingOverlay.tsx';
import { Usergeek } from 'usergeek-ic-js';

const canisterIdDFINITY = "2mg2s-uqaaa-aaaag-qna5a-cai";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleContent, setBubbleContent] = useState('');
  const { identity, user, disconnect } = useIdentityKit();
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
  const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });
  const globalID = useGlobalID();
  const [isKonectaModalOpen, setIsKonectaModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isnfiding, setIsnfiding] = useState(false);
  const [userId, setUserId] = useState('');


  const setData = async (agent: HttpAgent) => {
    if (agent) {
      const actor = Actor.createActor(idlFactory, {
        agent: agent!,
        canisterId,
      });
      const actornfid = Actor.createActor(idlFactoryNFID, {
        agent: agent!,
        canisterId: canisterIdNFID,
      });
      const actordfinity = Actor.createActor(idlFactoryDFINITY, {
        agent: agent!,
        canisterId: canisterIdDFINITY,
      });

      setIsnfiding(true);

      agent.getPrincipal().then((a) => {
        globalID.setPrincipal(a);

        (actor.getUser(a) as Promise<SerializedUser[]>).then(async (b) => {
          if (Array.isArray(b) && b.length !== 0) {
            if (userId !== '' && b[0].ocProfile.length > 0) {
              actor.addOCProfile(a, userId);
            }
            globalID.setPrincipal(a);

            // Check if user exists in actornfid canister
            const nfiduser = await actornfid.getUser(a);
            if (Array.isArray(nfiduser) && nfiduser.length !== 0) {
              // User exists in actornfid canister
            } else {
              // Add user to actornfid canister
              await actornfid.addUser(a);
            }

            // Check if user exists in actordfinity canister
            const dfinityUser = await actordfinity.getUser(a);
            if (Array.isArray(dfinityUser) && dfinityUser.length !== 0) {
              // User exists in actordfinity canister
            } else {
              // Add user to actordfinity canister
              await actordfinity.addUser(a);
            }

            globalID.setUser(b);
            navigate('/Missions');
          } else {
            const identityAny = identity as any;
            const delegation = identityAny._delegation;

            if (
              delegation &&
              delegation.delegations &&
              delegation.delegations.length > 0
            ) {
              const firstDelegation = delegation.delegations[0];
              const targets = firstDelegation.delegation.targets;

              if (targets && targets.length > 0) {
                (actor.addUser(a) as Promise<SerializedUser[]>).then(
                  async (newUser) => {
                    if (userId !== '') {
                      actor.addOCProfile(a, userId);
                    }
                    globalID.setPrincipal(a);
                    globalID.setUser(newUser);

                    // Check if user exists in actornfid canister
                    const nfiduser = await actornfid.getUser(a);
                    if (
                      Array.isArray(nfiduser) &&
                      nfiduser.length !== 0
                    ) {
                      // User exists in actornfid canister
                    } else {
                      // Add user to actornfid canister
                      await actornfid.addUser(a);
                    }

                    // Check if user exists in actordfinity canister
                    const dfinityUser = await actordfinity.getUser(a);
                    if (
                      Array.isArray(dfinityUser) &&
                      dfinityUser.length !== 0
                    ) {
                      // User exists in actordfinity canister
                    } else {
                      // Add user to actordfinity canister
                      await actordfinity.addUser(a);
                    }

                    Usergeek.trackEvent('Mission 0: Registered');
                    navigate('/Missions');
                  }
                );
              } else {
                alert('You have to use a Non-Anonymous NFID account');
                disconnect();
                setIsnfiding(false);
              }
            }
          }
        });
      });
    }
  };


  useEffect(() => {
    const extractQueryParams = () => {
      const queryString = window.location.search;


      const urlParams = new URLSearchParams(queryString);

      const ocUserId = urlParams.get('oc_userid');

      if (ocUserId) {
        setUserId(ocUserId);
      }
    };
    extractQueryParams();
  }, []);

  useEffect(() => {
    const fetchData = async () => {

      const isUserPrincipalValid =
        user?.principal &&
        user.principal.toText() !== "2vxsx-fae" &&
        identity &&
        identity.getPrincipal().toText() !== "2vxsx-fae";

      if (isUserPrincipalValid) {
        const agent = HttpAgent.createSync({ identity });

        if (process.env.NODE_ENV !== "production") {
          agent.fetchRootKey();
        }

        await setData(agent);
      } else {
        disconnect();
      };
    };

    fetchData();
  }, [user, identity]);
  // Bubble Content Handlers

  const handleKonectaClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("Welcome to Konecta Pre-Register! I’m Kami, your guide in this adventure. Konecta is a platform built on ICP to connect users securely, for offering or requesting services via streaming.");
      setShowBubble(true);
    }, 0);
  };

  const connectWalletRef = useRef<HTMLDivElement>(null);

  const handleHelpClick = () => {
    setShowBubble(false); // Bubble Restart
    setTimeout(() => {
      setBubbleContent("The adventure begins here, brave traveler! Your journey starts with the Time Capsule—where time is gold. Complete missions to earn seconds, which will convert to KTA tokens, Konecta’s native currency. Every second counts toward your next epic adventure. Let’s make it count!");
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

  return (
    <div className={styles.HomeContainer}>
      {
        isnfiding &&
        <div className={styles.loadingOverlayWrapper}>
          <LoadingOverlay loadingPercentage={"LOADING"} />
        </div>
      }
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
                  <div className={styles.MobileMessage}>
                    <p>Please rotate your phone</p>
                  </div>
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
