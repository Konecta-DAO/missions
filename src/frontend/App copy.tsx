import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { Actor, HttpAgent } from "@dfinity/agent";
import KWA from './assets/KWAF LT.mp4';
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';
import { Usergeek } from "usergeek-ic-js";
import CryptoJS from 'crypto-js';
import { Principal } from '@dfinity/principal';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import OpenChat from '../components/OpenChatComponent';

function App() {
  const [principalId, setPrincipalId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showFollowButton, setShowFollowButton] = useState<boolean>(false);
  const [showVerifyButton, setShowVerifyButton] = useState<boolean>(false);
  const [NFIDing, setNFIDing] = useState<boolean>(true);
  const [decrypting, setDecrypting] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [twitterAuthURL, setTwitterAuthURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();


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
    if (!nfid) {
      console.log('Waiting for NFID to initialize before decrypting principalId');
      return;
    }

    const encryptedData = localStorage.getItem('encryptedData');
    const iv = localStorage.getItem('iv');

    if (encryptedData && iv) {
      try {
        const decryptedData = decrypt(encryptedData, iv);
        console.log('Decrypted Data:', decryptedData);
        if (decryptedData) {
          const parsedData = JSON.parse(decryptedData);
          const { principalId, expirationTime } = parsedData;

          if (Date.now() < expirationTime) {
            console.log("Calling handleSuccess to set principalId");
            setPrincipalId(principalId); // Set principalId
          }
        }
      } catch (error) {
        console.error("Failed to decrypt session data:", error);
        localStorage.removeItem('encryptedData');
        localStorage.removeItem('iv');
      } finally {
        setDecrypting(false);
      }
    } else {
      setDecrypting(false);
    }
  }, [nfid]);


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

      console.log('Storing Encrypted Data:', encryptedData); // Debug
      console.log('Storing IV:', iv); // Debug

      localStorage.setItem('encryptedData', encryptedData);
      localStorage.setItem('iv', iv);

      Usergeek.setPrincipal(Principal.fromText(pId));
      Usergeek.trackSession();
      await mainLogic(pId);
    } finally {
      setNFIDing(false);
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

    // Once principalId is set, call handleSuccess
  useEffect(() => {
    if (principalId) {
      handleSuccess(principalId);
    }
  }, [principalId]);

  const startTwitterAuth = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://do.konecta.one/requestTwitterAuth');
      console.log('Twitter Auth Response:', response);

      if (response.data && response.data.authURL) {
        console.log('Redirecting to:', response.data.authURL);
        window.location.href = response.data.authURL;
      } else {
        console.error('Twitter Auth URL is missing');
      }
    } catch (error) {
      console.error('Error starting Twitter OAuth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowClick = async () => {
    await startTwitterAuth();
  };

  // Function to extract query parameters from the URL
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    const oauthToken = params.get('oauth_token');
    const oauthVerifier = params.get('oauth_verifier');
    console.log('OAuth Token:', oauthToken);
    console.log('OAuth Verifier:', oauthVerifier);
    return { oauthToken, oauthVerifier };
  };

  // Function to handle the Twitter callback (after user authenticates)
  const handleTwitterCallback = async (oauthToken: string, oauthVerifier: string) => {
    if (!principalId) {
      console.error('Principal ID is missing.');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending OAuth Token and Verifier to Middleman:', oauthToken, oauthVerifier);

      const response = await axios.post('https://do.konecta.one/getTwitterUser', {
        oauthToken,
        oauthVerifier,
      });

      // Log the full response for debugging
      console.log('Twitter user info response:', response);

      if (response.data && response.data.id_str && response.data.screen_name) {
        console.log('Twitter user info:', response.data);

        // Store Twitter info in the backend
        await backend.addTwitterInfo(principalId, BigInt(response.data.id_str), response.data.screen_name);

        // Redirect user to follow the Twitter account
        window.location.href = `https://twitter.com/intent/follow?screen_name=konecta_Dao`;
      } else {
        console.error('Twitter user information is missing');
      }
    } catch (error) {
      console.error('Error handling Twitter callback:', error);
    } finally {
      setLoading(false);
    }
  };


  // Extract OAuth tokens and store them
  useEffect(() => {
    const { oauthToken, oauthVerifier } = getQueryParams();

    if (oauthToken && oauthVerifier) {
      console.log('OAuth Token:', oauthToken);
      console.log('OAuth Verifier:', oauthVerifier);

      // Store OAuth tokens temporarily
      localStorage.setItem('oauth_token', oauthToken);
      localStorage.setItem('oauth_verifier', oauthVerifier);
    }
  }, [location.search]);

  useEffect(() => {
    if (principalId) {
      const storedToken = localStorage.getItem('oauth_token');
      const storedVerifier = localStorage.getItem('oauth_verifier');

      if (storedToken && storedVerifier) {
        console.log('PrincipalId:', principalId);
        console.log('Calling handleTwitterCallback with stored token and verifier');

        handleTwitterCallback(storedToken, storedVerifier);

        // Clear OAuth tokens after they are processed
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('oauth_verifier');
      }
    }
  }, [principalId, location.search]);

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
                <button className="btn-grad" onClick={handleFollowClick} disabled={loading}>
                  {loading ? 'Redirecting to Twitter...' : 'Follow Konecta_Dao'}
                </button>
              </>
            )}
            {showVerifyButton && (
              <>
                <br />
                <button className="btn-grad" >Verify</button>
              </>
            )}
            <br />
            <p>Share this with friends</p>
            <br />
            <OpenChat />
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