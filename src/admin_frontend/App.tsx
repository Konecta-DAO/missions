import React, { useState, useEffect } from 'react';
import styles from './Home.module.scss';
import BotonNFID from '../frontend/components/BotonNFID';
import KonectaLogo from '../../public/assets/Konecta Logo.svg';
import { Principal } from '@dfinity/principal';
import { useEncryption } from '../components/EncryptionProvider';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from '../declarations/backend';
import AdminPanel from './AdminPanel';
import MissionsPanel from './MissionsPanel';
import { Actor, HttpAgent } from "@dfinity/agent";
import useLoadingProgress from '../utils/useLoadingProgress';
import LoadingOverlay from '../components/LoadingOverlay';

function App() {
  const [iframeReady, setIframeReady] = useState(false);
  const { loadingPercentage } = useLoadingProgress();
  const [principalId, setPrincipalId] = useState<Principal | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // Admin check starts as null
  const { decryptSession, saveSession } = useEncryption();

  const agent = new HttpAgent();
  const backendActor = Actor.createActor(backend_idlFactory, {
    agent,
    canisterId: backend_canisterId,
  });

  useEffect(() => {
    const session = decryptSession();
  }, [iframeReady]);

  const handleIframeReady = () => {
    setIframeReady(true);
  };

  const handlePrincipalId = async (principalId: Principal, identity: any) => {
    saveSession(identity);
    setPrincipalId(principalId); // Save the principal ID

    const agent = new HttpAgent({ identity: identity });

    const backendActor = Actor.createActor(backend_idlFactory, {
      agent,
      canisterId: backend_canisterId,
    });

    // Check if the user is an admin
    try {
      const isAdminResult = await backendActor.isAdmin(principalId);
      setIsAdmin(isAdminResult as boolean); // Update the isAdmin state
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false); // If there's an error, assume the user is not an admin
    }
  };

  return (
    <div className={`${styles.HomeContainer}`}>
      {!iframeReady && (
        <LoadingOverlay loadingPercentage={loadingPercentage} />
      )}
      <div style={{ visibility: iframeReady ? 'visible' : 'hidden' }}>
        <div className={styles.KonectaLogoWrapper}>
          <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
        </div>

        {/* Render the AdminPanel and MissionsPanel if user is authenticated and is admin */}
        {principalId && isAdmin && <AdminPanel principalId={principalId} />}
        {principalId && isAdmin && <MissionsPanel principalId={principalId} />}

        {/* Show the Authenticate button if isAdmin is null (initial state) or false */}
        {(isAdmin === null || isAdmin === false) && (
          <BotonNFID onIframeReady={handleIframeReady} onPrincipalId={handlePrincipalId} />
        )}
      </div>
    </div>
  );
}

export default App;
