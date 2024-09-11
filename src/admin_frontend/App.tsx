import React, { useState, useEffect, useRef } from 'react';
import styles from './Home.module.scss';
import KonectaLogo from '../../public/assets/Konecta Logo.svg';
// import AdminPanel from './AdminPanel.tsx';
// import MissionsPanel from './MissionsPanel.tsx';
import { useIdentityKit } from "@nfid/identitykit/react";
// import "@nfid/identitykit/react/styles.css"
import { ConnectWallet } from "@nfid/identitykit/react"
// import { useGlobalID } from '../hooks/globalID.tsx';
// import { useNavigate } from 'react-router-dom';
// import HomeBackgroundOverlay from '../../src/frontend/pages/Home/HomeBackgroundOverlay.tsx';
// import useIsMobile from '../../src/hooks/useIsMobile.tsx';
// import Plataforma from '../../src/frontend/components/Plataforma/Plataforma.tsx';
// import Casco from '../../src/frontend/components/Casco.tsx';
// import Kami from '../../../../public/assets/Kami.svg';
// import KonectaInfoButton from '../../src/frontend/components/KonectaInfoButton/KonectaInfoButton.tsx';
// import HelpButton from '../../src/frontend/components/HelpButton/HelpButton.tsx';
// import SpeechBubble from '../../src/frontend/components/SpeechBubble/SpeechBubble.tsx';

function App() {
  // const [isAdmin, setIsAdmin] = useState<boolean | null>(false);
  //const { connectedAccount, agent } = useIdentityKit(); // Get agent from IdentityKit
  // const globalID = useGlobalID();
  // const isMobile = useIsMobile();
  // const navigate = useNavigate();
  // const [showBubble, setShowBubble] = useState(false);
  // const [bubbleContent, setBubbleContent] = useState('');


  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (connectedAccount && agent && globalID) {
  //       try {
  //         const a = await agent.getPrincipal();
  //         globalID.setPrincipal(a);  // Use globalID within the effect
  //       } catch (error) {
  //         console.error('Failed to get principal', error);
  //       }
  //     }
  //   };

  //   fetchData();
  // }, [connectedAccount]);

  // const handleKonectaClick = () => {
  //   setShowBubble(false); // Bubble Restart
  //   setTimeout(() => {
  //     setBubbleContent("Konecta WebApp: Konecta is a Web app for Service providers to Offer and people to Request Services, in a Calendar-focus way.\nKonecta Protocol: Event Management protocol, for users to get their events cross-dApps.");
  //     setShowBubble(true); // Show the new content
  //   }, 0);
  // };

  // const connectWalletRef = useRef<HTMLDivElement>(null);

  // // Custom button handler to simulate ConnectWallet click

  // const handleConnect = () => {
  //   if (connectWalletRef.current) {
  //     // Simulate the click event on the ConnectWallet button
  //     const button = connectWalletRef.current.querySelector('button');
  //     if (button) {
  //       button.click(); // Programmatically trigger click
  //     }
  //   }
  // };

  // const handleHelpClick = () => {
  //   setShowBubble(false); // Bubble Restart
  //   setTimeout(() => {
  //     setBubbleContent("The adventure begins here, brave traveler! To unlock your first precious seconds, you must log in using your NFID. It’s your key to the Konecta Realm. Time waits for no one!");
  //     setShowBubble(true); // Show the new content
  //   }, 0);
  // };

  return (
    <div className={`${styles.HomeContainer}`}>
      <div>

        <div className={styles.KonectaLogoWrapper}>
          <>
            <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
            {/*    <button onClick={checkAdminStatus}>Check Admin Status</button>*/}
          </>
        </div>

        {/* Render the AdminPanel and MissionsPanel if user is authenticated and is admin */}
        {/* {isAdmin && <AdminPanel />}
        {isAdmin && <MissionsPanel />} */}

        {/* Show the Authenticate button if isAdmin is null (initial state) or false */}
        {/* {(isAdmin === null || isAdmin === false) && ( */}
        <>
          {/* <div ref={connectWalletRef}> */}
          {/* <ConnectWallet /> */}
          {/* </div> */}
          {/* <button onClick={handleConnect}>Connect Wallet</button> */}
        </>
        {/* )} */}
      </div>
    </div>
  );
}

export default App;
