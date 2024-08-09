import './App.css';
import { useEffect, useState } from 'react';
import { backend } from './declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, Identity } from "@dfinity/agent";
import KWA from './assets/KWAF LT.mp4'
import { useQueryCall, useUpdateCall } from '@ic-reactor/react';

function App() {

  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principalId, setPrincipalId] = useState<string>(''); // Type annotation for principalId
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const init = async (): Promise<void> => {
      const client: AuthClient = await AuthClient.create();
      setAuthClient(client);
    };
    init();
  }, []);

  function handleSuccess(): void {
    if (!authClient) {
      throw new Error("AuthClient not initialized");
    }
    const identity: Identity = authClient.getIdentity();
    const principalId: string = authClient.getIdentity().getPrincipal().toText();
    setPrincipalId(principalId);
    backend.registerid(principalId);
    const agent = Actor.agentOf(backend);
    if (agent && typeof agent.replaceIdentity === 'function') {
      agent.replaceIdentity(identity);
    }
  };

  const handleOpenModal = (): void => {
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
  };

  const { data: count, call: refetchCount } = useQueryCall({
    functionName: 'get',
  });

 /* const { call: increment, loading } = useUpdateCall({
    functionName: 'inc',
    onSuccess: () => {
      refetchCount();
    },
  });
*/

const handleLogin = async (): Promise<void> => {
  if (!authClient) throw new Error("AuthClient not initialized");

  authClient.login({
    onSuccess: handleSuccess,
  });
};

const handleLogin2 = async (): Promise<void> => {
  if (!authClient) throw new Error("AuthClient not initialized");

  const APP_NAME = "Konectª Points Airdrop";
  const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
  const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

  const identityProvider = `https://nfid.one/authenticate${CONFIG_QUERY}`;

  authClient.login({
    identityProvider,
    onSuccess: handleSuccess,
    windowOpenerFeatures: `
    left=${window.screen.width / 2 - 525 / 2},
    top=${window.screen.height / 2 - 705 / 2},
    toolbar=0,location=0,menubar=0,width=525,height=705
  `,
  });
};

const principalIdElement = document.getElementById("principalId");
if (principalIdElement) {
  principalIdElement.innerText = `Your PrincipalId: ${principalId}`;
}

return (
  <main>
    <div className="contVid">
      <video className='videoTag' autoPlay loop muted>
        <source src={KWA} type='video/mp4' />
      </video>
    </div>
    {showModal && (
      <div className={`overlay ${showModal ? 'show' : ''}`}></div>
    )}
    <div className="midd">
      <h1>Join the Konectª Army</h1>
      <br />
      <button className="btn-grad" onClick={handleOpenModal}>Click Here to Pre-Register and earn points</button>
      {principalId && (
        <div id="principalId">Registration Success with ID: {principalId}</div>
      )}
    </div>
    {showModal && (
      <div className={`modal ${showModal ? 'show' : ''}`}>
        <div className="modal-content">
          <span className="close" onClick={handleCloseModal}>&times;</span>
          <br />
          <p>Enter to claim your points</p>
          <br />
          <button id="login" onClick={handleLogin} className="identityButton">Log in with Internet Identity</button>
          <button id="nflogin" onClick={handleLogin2} className="nfButton">Log in with NFID</button>
        </div>
      </div>
    )}
  </main>
);
}

export default App;
