import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';

function App() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principalId, setPrincipalId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showFollowButton, setShowFollowButton] = useState<boolean>(false);
  const [showVerifyButton, setShowVerifyButton] = useState<boolean>(false);
  const { nfid, isNfidIframeInstantiated } = useNFID();

  type User = {
    id: Text;
    mission: BigInt;
    seconds: BigInt;
    twitterid: BigInt;
    twitterhandle: Text;
    creationTime: BigInt;
  };

  type Mission = {
    id: BigInt;
    mode: BigInt;
    description: Text;
    obj1: Text;
    obj2: Text;
    recursive: Boolean;
  };

  // Initialize AuthClient on App Start
  useEffect(() => {
    const init = async (): Promise<void> => {
      const client: AuthClient = await AuthClient.create();
      setAuthClient(client);

      // Check for stored identity
      const storedIdentity = localStorage.getItem('identity');
      if (storedIdentity) {
        try {
          const identity = await client.getIdentity();
          const actor = Actor.createActor(backend_idlFactory, {
            agent: new HttpAgent({
              identity,
            }),
            canisterId: backend_canisterId,
          });
          const principalId = identity.getPrincipal().toText();
          setPrincipalId(principalId);
          handleSuccess(principalId);
        } catch (error) {
          console.error("Error restoring identity:", error);
          localStorage.removeItem('identity');
        }
      }
    };
    init();
  }, []);

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Handle successful authentication
  const handleSuccess = useCallback(async (principalId: string): Promise<void> => {
    if (!authClient) {
      throw new Error("AuthClient not initialized");
    }

    const identity = authClient.getIdentity();
    setPrincipalId(principalId);
    localStorage.setItem('identity', JSON.stringify(identity));

    await mainLogic(principalId);
  }, [authClient, backend]);

  // Main logic of the app
  const mainLogic = async (principalId: string) => {
  };

  // Function to format time from Seconds to Hours, Minutes and Seconds
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    const hoursDisplay = hours > 0 ? `${hours} hour${hours === 1 ? '' : 's'}` : '';
    const minutesDisplay = minutes > 0 ? `${minutes} minute${minutes === 1 ? '' : 's'}` : '';
    const secondsDisplay = secs > 0 ? `${secs} second${secs === 1 ? '' : 's'}` : '';

    const timeArray = [hoursDisplay, minutesDisplay, secondsDisplay].filter(Boolean);
    if (timeArray.length > 1) {
      const lastElement = timeArray.pop();
      return `${timeArray.join(', ')} and ${lastElement}`;
    }
    return timeArray[0];
  }

    return (
    <main>
      <div className="midd">
        <h1>Login to access to the Konectª Admin Module</h1>
        <br />
        < NFIDAuth showButton={true} onSuccess={(principalId) => handleSuccess(principalId)} nfid={nfid} />
        <p>{message}</p>
      </div>
    </main>
  );

}

export default App;
