import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, Identity, HttpAgent } from "@dfinity/agent";
import KWA from './assets/KWAF LT.mp4';
import { initialise } from '@open-ic/openchat-xframe';
import type { OpenChatXFrame, OpenChatXFrameOptions } from "./OpenChat/types";
import NFIDAuth from './NFIDAuth';

function App() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principalId, setPrincipalId] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [trustedOrigins, setTrustedOrigins] = useState<string[]>([]);
  const [sec, setSec] = useState<number>(0);
  // Initialize AuthClient on component mount
  useEffect(() => {
    const init = async (): Promise<void> => {
      const client: AuthClient = await AuthClient.create();
      setAuthClient(client);
    };
    init();
  }, []);

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Fetch trusted origins from the backend
  const getTrustedOrigins = useCallback(async (): Promise<string[]> => {
    const trustedOrigins = await backend.get_trusted_origins() as string[];
    return trustedOrigins;
  }, [backend]);

  useEffect(() => {
    const fetchTrustedOrigins = async () => {
      const origins = await getTrustedOrigins();
      setTrustedOrigins(origins);
    };

    fetchTrustedOrigins();
  }, [getTrustedOrigins]);


  function getRandomNumberOfSeconds(): number {
    return Math.floor(Math.random() * (21600 - 3600 + 1)) + 3600;
  }

  // Handle successful authentication
  const handleSuccess = useCallback((principalId: string): void => {
    if (!authClient) {
      throw new Error("AuthClient not initialized");
    }
    const identity: Identity = authClient.getIdentity();
    setPrincipalId(principalId);
    const generatedSec = getRandomNumberOfSeconds();
    setSec(generatedSec);
    backend.registerid(principalId, sec);
    const agent = Actor.agentOf(backend);
    if (agent && typeof agent.replaceIdentity === 'function') {
      agent.replaceIdentity(identity);
    }
  }, [authClient, backend]);

  // Open and close modal handlers
  const handleOpenModal = useCallback((): void => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setShowModal(false);
  }, []);

  // Handle login
  const handleLogin = useCallback(async (): Promise<void> => {
    if (!authClient) throw new Error("AuthClient not initialized");
    const principalId: string = authClient.getIdentity().getPrincipal().toText();
    authClient.login({
      onSuccess: () => handleSuccess(principalId),
    });
  }, [authClient, handleSuccess]);

  // Update principalId element
  useEffect(() => {
    const principalIdElement = document.getElementById("principalId");
    if (principalIdElement) {
      principalIdElement.innerText = `Your PrincipalId: ${principalId}. You have got ${sec} seconds`;
    }
  }, [principalId]);

  // Theme interfaces
  interface ThemeOverrides {
    primary: string;
    bd: string;
    bg: string;
    txt: string;
    placeholder: string;
    'txt-light': string;
    timeline: {
      txt: string;
    };
  }

  interface Theme {
    name: string;
    base: string;
    overrides: ThemeOverrides;
  }

  interface OpenChatXFrameOptions {
    theme?: Theme;
    targetOrigin: string;
    initialPath?: string;
    onUserIdentified?: (userId: string) => void;
    settings?: {
      disableLeftNav: boolean;
    };
  }

  // Initialize OpenChat iframe
  useEffect(() => {
    const initOpenChat = async () => {
      const iframe = document.getElementById('openchat-iframe') as HTMLIFrameElement;
      if (!iframe) {
        console.error('Iframe element not found');
        return;
      }

      const client = await initialise(iframe, {
        targetOrigin: 'https://oc.app',
        initialPath: '/community/rfeib-riaaa-aaaar-ar3oq-cai/channel/334961401678552956581044255076222828441',
        theme: {
          name: 'my-app-theme',
          base: 'dark',
          overrides: {
            primary: "green",
            bd: 'rgb(91, 243, 190)',
            bg: 'transparent',
            txt: "black",
            placeholder: "green",
            'txt-light': '#75c8af',
            timeline: {
              txt: "yellow"
            }
          }
        }
      });

      // client.changePath('/new/path');
      // client.logout();
    };

    document.addEventListener('DOMContentLoaded', initOpenChat);
  }, []);

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
        <iframe id="openchat-iframe" title="OpenChat"></iframe>
      </div>
      {showModal && (
        <div className={`modal ${showModal ? 'show' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>×</span>
            <br />
            <p>Enter to claim your points</p>
            <br />
            <button id="login" onClick={handleLogin} className="identityButton">Log in with Internet Identity</button>
            <NFIDAuth onSuccess={(principalId) => handleSuccess(principalId)} />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
