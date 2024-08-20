import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import KWA from './assets/KWAF LT.mp4';
import { initialise } from '@open-ic/openchat-xframe';
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';


function App() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principalId, setPrincipalId] = useState<string>('');
  const [sec, setSec] = useState<number>(0);
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
    const existingSecsArray = await backend.getSeconds(principalId, 0) as unknown[] as number[];
    const existingSecs = existingSecsArray[0]; // Extract the first element from the array
    console.log(principalId, existingSecs);
    if (existingSecs === undefined) {
      const generatedSec = getRandomNumberOfSeconds();
      await backend.addUser(principalId, BigInt(generatedSec));
      setSec(generatedSec);
      setMessage(`Your principalId is: ${principalId}. You have got ${formatTime(generatedSec)}`);
    } else {
      setSec(Number(existingSecs));
      setMessage(`Your principalId is: ${principalId}. You already have got ${formatTime(Number(existingSecs))}`);
    }

    setShowFollowButton(true);
    setShowVerifyButton(true);
  };

  // Function that generates a random number of time, in seconds, between 1 hour and 6 hours
  function getRandomNumberOfSeconds(): number {
    return Math.floor(Math.random() * (21600 - 3600 + 1)) + 3600;
  }

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

  // Initialize OpenChat iframe
  useEffect(() => {
    const initOpenChat = async () => {
      const iframe = document.getElementById('openchat-iframe') as HTMLIFrameElement;
      if (!iframe) {
        console.error('Iframe element not found');
        return;
      }

      try {
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
          },
          onUserIdentified: (userId: string) => {
            console.log(`User identified: ${userId}`);
          },
          settings: {
            disableLeftNav: true
          }
        });

      } catch (error) {
        console.error('Error initializing OpenChat:', error);
      }
    };

    initOpenChat();
  }, []);

  return (
    <main>
      <div className="contVid">
        <video className='videoTag' autoPlay loop muted>
          <source src={KWA} type='video/mp4' />
        </video>
      </div>
      <div className="midd">
        <h1>Join the Konectª Army</h1>
        <br />
        < NFIDAuth showButton={true} onSuccess={(principalId) => handleSuccess(principalId)} nfid={nfid} />
        <p>{message}</p>
        {showFollowButton && (
          <>
            <br />
            <button className="btn-grad">Follow Konecta_Dao</button>
          </>
        )}
        {showVerifyButton && (
          <>
            <br />
            <button className="btn-grad">Verify</button>
          </>
        )}
        <br />
        <p>Share this with friends</p>
        <br />
        <iframe id="openchat-iframe" title="OpenChat"></iframe>
      </div>
      <footer className="footer">
        <div className="tooltip">
          What is Konecta?
          <span className="tooltiptext">Konecta Webapp is a Placeholder</span>
        </div>
        <div className="tooltip">
          What are the seconds?
          <span className="tooltiptext">It is a secret to be revealed soon</span>
        </div>
      </footer>
    </main>
  );

}

export default App;
