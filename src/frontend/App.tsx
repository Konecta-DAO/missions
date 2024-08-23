import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { Actor, HttpAgent } from "@dfinity/agent";
import KWA from './assets/KWAF LT.mp4';
import { initialise } from '@open-ic/openchat-xframe';
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';
import { Usergeek } from "usergeek-ic-js";
import CryptoJS from 'crypto-js';
import { Principal } from '@dfinity/principal';

function App() {
  const [principalId, setPrincipalId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showFollowButton, setShowFollowButton] = useState<boolean>(false);
  const [showVerifyButton, setShowVerifyButton] = useState<boolean>(false);
  const [NFIDing, setNFIDing] = useState<boolean>(true);
  const [decrypting, setDecrypting] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Callback function to set NFIDing to false and isInitialized to true
  const handleNfidIframeInstantiated = useCallback(() => {
    setNFIDing(false);
    setIsInitialized(true);
  }, []);

  const { nfid } = useNFID(handleNfidIframeInstantiated);

  // Encryption and Decryption functions
  const phrase = 'Awesome-Ultra-Secret-Key-That-Definitely-Should-Not-Be-Here';

  // Ensure the key is exactly 32 bytes long
  const key = CryptoJS.enc.Utf8.parse(phrase).sigBytes > 32
    ? CryptoJS.enc.Utf8.parse(phrase.slice(0, 32))
    : CryptoJS.enc.Utf8.parse(phrase.padEnd(32));

  function encrypt(text: string): { iv: string, encryptedData: string } {
    const iv = CryptoJS.lib.WordArray.random(16); // Generate a new IV for each encryption
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return { iv: iv.toString(CryptoJS.enc.Hex), encryptedData: encrypted.toString() };
  }

  function decrypt(encryptedText: string, iv: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      throw new Error("Decryption resulted in an empty string.");
    }

    return decryptedText;
  }

  useEffect(() => {
    const encryptedData = localStorage.getItem('encryptedData');
    const iv = localStorage.getItem('iv');
    if (encryptedData && iv) {
      try {
        const decryptedData = decrypt(encryptedData, iv);
        if (decryptedData) {
          const parsedData = JSON.parse(decryptedData);
          const { principalId, expirationTime } = parsedData;

          if (Date.now() < expirationTime) {
            handleSuccess(principalId);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to decrypt session data:", error);
        localStorage.removeItem('encryptedData');
        localStorage.removeItem('iv');
      } finally {
        setDecrypting(false);
        console.log("Decrypt not loading");
      }
    }

  }, []);

  // Initialize Usergeek
  useEffect(() => {
    Usergeek.init({
      apiKey: "01430201F8439A7B36CA9DD48F411A95",
    });
  }, []);

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Handle successful authentication
  const handleSuccess = useCallback(async (pId: string): Promise<void> => {
    if (!nfid) {
      console.error("NFID is not initialized");
      return;
    }

    try {
      const expirationTime = Date.now() + 3600000; // 1 hour from now
      const dataToEncrypt = JSON.stringify({ principalId: pId, expirationTime });
      const { iv, encryptedData } = encrypt(dataToEncrypt);
      localStorage.setItem('encryptedData', encryptedData);
      localStorage.setItem('iv', iv);

      Usergeek.setPrincipal(Principal.fromText(pId));
      Usergeek.trackSession();
      await mainLogic(pId);
    } finally {
      setNFIDing(false); // Always hide the loading screen after handling success
      console.log("NFID not loading");
    }
  }, [nfid, backend]);

  // Main logic of the app
  const mainLogic = async (pId: string) => {
    const existingSecs = await backend.getTotalSeconds(pId) as unknown as BigInt;

    if (Number(existingSecs) === 0) { // If the user is not registered, register the user
      await backend.addUser(pId);
      const baseseconds = await backend.getTotalSeconds(pId) as unknown as BigInt; // Get the total seconds generated from the Backend
      setMessage(`Your principalId is: ${pId}. You have got ${formatTime(Number(baseseconds))}`);
      Usergeek.trackEvent("Mission 0: User Registered");
    } else { // If the user is already registered, show the existing seconds
      setMessage(`Your principalId is: ${pId}. You already have got ${formatTime(Number(existingSecs))}`); // Set the message
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
        await initialise(iframe, {
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

  // Use effect to trigger handleSuccess once principalId is ready
  useEffect(() => {
    if (principalId) {
      handleSuccess(principalId);
    }
  }, [principalId]);

  const verifyTweet = () => {
    console.log("Verify Tweet button clicked");
    // Add your logic to verify the tweet here
  };

  return (
    <main>
      {decrypting || NFIDing ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <div className="contVid">
            <video className='videoTag' autoPlay loop muted>
              <source src={KWA} type='video/mp4' />
            </video>
          </div>
          <div className="midd">
            {!principalId && (
              <>
                <h1>Join the Konectª Army</h1>
                <br />
                <NFIDAuth showButton={true} onSuccess={(principalId) => [setPrincipalId(principalId), setNFIDing(false)]} nfid={nfid} isInitialized={isInitialized} />
              </>
            )}
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
                <button className="btn-grad" onClick={verifyTweet}>Verify</button>
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
        </>
      )}
    </main>
  );
}

export default App;