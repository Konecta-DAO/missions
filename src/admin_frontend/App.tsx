import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';

function App() {
  const [principalId, setPrincipalId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Statistics');
  const { nfid, isNfidIframeInstantiated } = useNFID();

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Handle successful authentication
  const handleSuccess = useCallback(async (principalId: string): Promise<void> => {
    if (!nfid) {
      console.error("NFID is not initialized");
      return;
    }

    setPrincipalId(principalId);

    // Call the backend function to check authorization
    const authorized = await backend.isAdmin(principalId);
    if (!authorized) {
      alert("Unauthorized User");
    } else {
      setIsAuthorized(true);
    }

    await mainLogic(principalId);
  }, [backend]);

  // Main logic of the app
  const mainLogic = async (principalId: string) => {
  };

  // Function to switch tabs
  const openTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <main>
      <div className="container">
        {!isAuthorized && <h1>Login to access to the Konectª Admin Module</h1>}
        <br />
        {!isAuthorized && <NFIDAuth showButton={true} onSuccess={(principalId) => handleSuccess(principalId)} nfid={nfid} />}
        <p>{message}</p>
        {isAuthorized && (
          <div>
            <div className="tab">
              <button className={`tablinks ${activeTab === 'Statistics' ? 'active' : ''}`} onClick={() => openTab('Statistics')}>Statistics</button>
              <button className={`tablinks ${activeTab === 'Administer' ? 'active' : ''}`} onClick={() => openTab('Administer')}>Administer</button>
            </div>
            <div id="Statistics" className={`tabcontent ${activeTab === 'Statistics' ? 'active' : ''}`}>
              <h3>Statistics</h3>
              <p>Users:</p>
            </div>
            <div id="Administer" className={`tabcontent ${activeTab === 'Administer' ? 'active' : ''}`}>
              <h3>Administer</h3>
              <p>Missions:</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
