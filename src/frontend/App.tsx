import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import KWA from './assets/KWAF LT.mp4';
import { initialise } from '@open-ic/openchat-xframe';
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';
import { Usergeek } from "usergeek-ic-js";
import { User, SerializedUser, Mission, Progress, SerializedProgress, Tweet, HttpRequestArgs, HttpHeader, HttpMethod, HttpResponsePayload, TransformRawResponseFunction, TransformArgs, CanisterHttpResponsePayload, TransformContext, IC, HttpRequest, HttpResponse } from './types';

function App() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principalId, setPrincipalId] = useState<string>('');
  const [sec, setSec] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [showFollowButton, setShowFollowButton] = useState<boolean>(false);
  const [showVerifyButton, setShowVerifyButton] = useState<boolean>(false);
  const { nfid, isNfidIframeInstantiated } = useNFID();

  // Initialize Usergeek
  useEffect(() => {
    Usergeek.init({
      apiKey: "<01430201F8439A7B36CA9DD48F411A95>", // replace <API_KEY> with your actual API key
    });
  }, []);

  // Initialize AuthClient on App Start
  useEffect(() => {
    const init = async (): Promise<void> => {
      const client: AuthClient = await AuthClient.create();
      setAuthClient(client);
      // Check for stored identity
      const storedIdentity = localStorage.getItem('identity');
      if (storedIdentity) {
        try {
          const identity = client.getIdentity();
          const actor = Actor.createActor(backend_idlFactory, {
            agent: new HttpAgent({
              identity,
            }),
            canisterId: backend_canisterId,
          });
          const principalId = identity.getPrincipal().toText();
          setPrincipalId(principalId);
          await handleSuccess(principalId); // Add await here
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

    // Set Usergeek Principal and track session
    Usergeek.setPrincipal(identity.getPrincipal());
    Usergeek.trackSession();

    await mainLogic(principalId);
  }, [authClient, backend]);

  // Main logic of the app
  const mainLogic = async (principalId: string) => {
    // Check if the User is already registered
    const existingSecs = await backend.getTotalSeconds(principalId) as unknown as BigInt;
    console.log(existingSecs); // Get existing seconds

    if (Number(existingSecs) === 0) { // If the user is not registered, register the user
      await backend.addUser(principalId);
      const baseseconds = await backend.getTotalSeconds(principalId) as unknown as BigInt; // Get the total seconds generated from the Backend
      setSec(Number(baseseconds)); // Set the seconds to the state
      setMessage(`Your principalId is: ${principalId}. You have got ${formatTime(Number(baseseconds))}`);
      Usergeek.trackEvent("User Registered");
    } else { // If the user is already registered, show the existing seconds
      setSec(Number(existingSecs)); // Set the seconds to the state
      setMessage(`Your principalId is: ${principalId}. You already have got ${formatTime(Number(existingSecs))}`); // Set the message
    }
    setShowFollowButton(true);
    setShowVerifyButton(true);
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
