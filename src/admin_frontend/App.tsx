import React, { useState, useEffect, useRef } from 'react';
import styles from './Home.module.scss';
import KonectaLogo from '../../public/assets/Konecta Logo.svg';
import { Principal } from '@dfinity/principal';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from '../declarations/backend/index.js';
import AdminPanel from './AdminPanel.tsx';
import MissionsPanel from './MissionsPanel.tsx';
import { Actor } from "@dfinity/agent";
import { useIdentityKit } from "@nfid/identitykit/react";
import "@nfid/identitykit/react/styles.css"
import { ConnectWallet } from "@nfid/identitykit/react"


function App() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(false); // Admin check starts as null
  const { selectSigner, disconnect, connectedAccount, selectedSigner } = useIdentityKit(); // Get agent from IdentityKit

  //const backendActor = Actor.createActor(backend_idlFactory, {
  //agent: agent!,
  //canisterId: backend_canisterId,
  //});

  const connectWalletRef = useRef<HTMLDivElement>(null);

  // Custom button handler to simulate ConnectWallet click
  const handleConnect = () => {
    if (connectWalletRef.current) {
      // Simulate the click event on the ConnectWallet button
      const button = connectWalletRef.current.querySelector('button');
      if (button) {
        button.click(); // Programmatically trigger click
      }
    }
  };

  // Check if the user is an admin
  //const checkAdminStatus = async () => {
  //try {
  //const isAdminResult = await backendActor.isAdmin(agent!.getPrincipal());
  //    setIsAdmin(isAdminResult as boolean); // Update the isAdmin state
  //  console.log(agent!.getPrincipal());
  //console.log("isAdmin:", isAdminResult);
  // } catch (error) {
  // console.error("Error checking admin status:", error);
  // setIsAdmin(false); // If there's an error, assume the user is not an admin
  // }
  //};

  // useEffect(() => {
  // checkAdminStatus();
  //}, []);

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
        {isAdmin && <AdminPanel />}
        {isAdmin && <MissionsPanel />}

        {/* Show the Authenticate button if isAdmin is null (initial state) or false */}
        {(isAdmin === null || isAdmin === false) && (
          <>
            <div ref={connectWalletRef}>
              <ConnectWallet />
            </div>
            <button onClick={handleConnect}>Connect Wallet</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
