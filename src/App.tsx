import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, Identity, HttpAgent } from "@dfinity/agent";
import KWA from './assets/KWAF LT.mp4';
import { initialise } from '@open-ic/openchat-xframe';
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';

function App() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principalId, setPrincipalId] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [trustedOrigins, setTrustedOrigins] = useState<string[]>([]);
  const [sec, setSec] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isNFIDAuthLoaded, setIsNFIDAuthLoaded] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [tweetStatus, setTweetStatus] = useState<string>('');
  const [twitterHandle, setTwitterHandle] = useState<string>('');
  const [showTweetInput, setShowTweetInput] = useState<boolean>(false);
  const [earnedSecs, setEarnedSecs] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [hasTweeted, setHasTweeted] = useState<boolean>(false);
  const { nfid, isInitialized } = useNFID();

  // Initialize AuthClient on App Start
  useEffect(() => {
    const init = async (): Promise<void> => {
      const client: AuthClient = await AuthClient.create();
      setAuthClient(client);
      setIsNFIDAuthLoaded(true);
    };
    init();
  }, []);

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Fetch trusted origins from the backend (For NFID Auth)
  useEffect(() => {
    const fetchTrustedOrigins = async () => {
      const origins = await backend.get_trusted_origins() as string[];
      setTrustedOrigins(origins);
    };
    fetchTrustedOrigins();
  }, [backend]);

  // Function that generates a random number of time, in seconds, between 1 hour and 6 hours
  function getRandomNumberOfSeconds(): number {
    return Math.floor(Math.random() * (21600 - 3600 + 1)) + 3600;
  }

  // Function to format time from Seconds to Hours, Minutes and Seconds
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60); // Round the seconds

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

  // Handle successful authentication
  const handleSuccess = useCallback(async (principalId: string): Promise<void> => {
    if (!authClient) {
      throw new Error("AuthClient not initialized");
    }
    const identity: Identity = authClient.getIdentity();
    const existingSecs = await backend.getSecs(principalId) as unknown as bigint;
    setPrincipalId(principalId); // Ensure principalId is set here
    if (existingSecs > 0) {
      setMessage(`Principal: ${principalId} already registered! You already have got ${formatTime(Number(existingSecs))} on this Pre-Register`);
      setSec(Number(existingSecs));

      // Check if the user has a timestamp
      const backendTimestamp = await backend.getTimestamp(principalId) as unknown as bigint;
      if (backendTimestamp > 0) {
        const backendTimestampMs = backendTimestamp / BigInt(1_000_000); // Convert nanoseconds to milliseconds
        const currentTimestamp = BigInt(Date.now());
        const elapsedTime = Number(currentTimestamp - backendTimestampMs) / 1000; // Convert to seconds
        const remainingTime = Math.max(600 - elapsedTime, 0); // 10 minutes in seconds

        if (remainingTime > 0) {
          setRemainingTime(remainingTime);
          setTweetStatus(`Get back in ${formatTime(remainingTime)} to earn more.`);
          setShowTweetInput(false);

          // Start the countdown timer
          const timer = setInterval(() => {
            setRemainingTime((prevTime) => {
              const newTime = prevTime - 1;
              if (newTime <= 0) {
                clearInterval(timer);
                setTweetStatus('');
                setShowTweetInput(true);
                return 0;
              }
              setTweetStatus(`Get back in ${formatTime(newTime)} to earn more.`);
              return newTime;
            });
          }, 1000);
        } else {
          setShowTweetInput(true);
        }
      } else {
        setShowTweetInput(true);
      }
    } else {
      const generatedSec = getRandomNumberOfSeconds();
      setPrincipalId(principalId);
      setSec(generatedSec);
      await backend.registerid(principalId, BigInt(generatedSec));
      const agent = Actor.agentOf(backend);
      if (agent && typeof agent.replaceIdentity === 'function') {
        agent.replaceIdentity(identity);
      }
      setMessage('');
      setShowTweetInput(true);
    }
    setIsAuthenticated(true);
    setShowModal(false);
  }, [authClient, backend]);

  // Open and close modal handlers
  const handleOpenModal = useCallback((): void => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setShowModal(false);
  }, []);

  // Handle Internet Identity login
  const handleLogin = useCallback(async (): Promise<void> => {
    if (!authClient) throw new Error("AuthClient not initialized");
    const principalId: string = authClient.getIdentity().getPrincipal().toText();
    authClient.login({
      onSuccess: () => handleSuccess(principalId),
    });
  }, [authClient, handleSuccess]);

  // Handle tweet
  const handleTweet = useCallback((): void => {
    const tweetText = encodeURIComponent("Join the Konectª Army and earn points! #KonectArmy");
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank");
    setHasTweeted(true); // Set hasTweeted to true
  }, []);

  // Validate and format Twitter handle
  const validateTwitterHandle = (handle: string): string => {
    if (!handle) {
      alert("Twitter handle cannot be empty");
      throw new Error("Twitter handle cannot be empty");
    }

    // Remove "@" if present
    if (handle.startsWith("@")) {
      handle = handle.slice(1);
    }

    // Extract handle from URL if it's a link from twitter.com or x.com
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/;
    const match = handle.match(urlPattern);
    if (match) {
      handle = match[1];
    }

    return handle;
  };

  // Handle tweet verification
  const handleCheckTweet = useCallback(async (): Promise<void> => {
    try {
      const formattedHandle = validateTwitterHandle(twitterHandle);
      const tweetVerified = await backend.check_tweet(principalId, formattedHandle) as boolean;
      if (tweetVerified) {
        const randomSecs = getRandomNumberOfSeconds();
        const newSecs = sec + randomSecs;
        setSec(newSecs);
        setEarnedSecs(randomSecs);
        setHasChecked(true); // Set hasChecked to true

        // Fetch the timestamp from the backend
        const backendTimestamp = await backend.getTimestamp(principalId) as unknown as bigint;
        const backendTimestampMs = backendTimestamp / BigInt(1_000_000); // Convert nanoseconds to milliseconds
        const currentTimestamp = BigInt(Date.now());
        const elapsedTime = Number(currentTimestamp - backendTimestampMs) / 1000; // Convert to seconds
        const remainingTime = Math.max(600 - elapsedTime, 0); // 10 minutes in seconds

        setRemainingTime(remainingTime);
        setTweetStatus(`You have earned ${formatTime(randomSecs)}. Now you have ${formatTime(newSecs)} in total! Get back in ${formatTime(remainingTime)} to earn more.`);
        setShowTweetInput(false);

        // Start the countdown timer
        const timer = setInterval(() => {
          setRemainingTime((prevTime) => {
            const newTime = prevTime - 1;
            if (newTime <= 0) {
              clearInterval(timer);
              setTweetStatus('');
              setShowTweetInput(true);
              return 0;
            }
            setTweetStatus(`Get back in ${formatTime(newTime)} to earn more.`);
            return newTime;
          });
        }, 1000);
      } else {
        alert("Tweet not found");
      }
    } catch (error) {
      console.error("Error verifying tweet:", error);
      alert("Error verifying tweet");
    }
  }, [backend, principalId, sec, twitterHandle]);

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

        // Example usage of client
        // client.changePath('/new/path');
        // client.logout();
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
      {showModal && (
        <div className={`overlay ${showModal ? 'show' : ''}`}></div>
      )}
      <div className="midd">
        <h1>Join the Konectª Army</h1>
        <br />
        {!isAuthenticated && (
          <button className="btn-grad" onClick={handleOpenModal}>Click Here to Pre-Register and earn points</button>
        )}
        <br />
        <iframe id="openchat-iframe" title="OpenChat"></iframe>
        {isAuthenticated && (
          <>
            {message && !tweetStatus ? (
              <p id="principalId">{message}</p>
            ) : (
              <p id="principalId">Your PrincipalId: {principalId}. You have got {formatTime(sec)}</p>
            )}
            {tweetStatus ? (
              <p>{hasChecked ? tweetStatus : `Your PrincipalId: ${principalId}. You have got ${formatTime(sec)}. Get back in ${formatTime(remainingTime)} to earn more.`}</p>
            ) : (
              <>
                <p>Want to earn more seconds? Tweet about this to get more!</p>
                <button className="btn-grad" onClick={handleTweet}>Tweet</button>
                {hasTweeted && showTweetInput && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter your Twitter handle"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                    />
                    <button className="btn-grad" onClick={handleCheckTweet}>Check</button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      {showModal && (
        <div className={`modal ${showModal ? 'show' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>×</span>
            <br />
            <p className="sera">Enter to claim your points</p>
            <br />
            <button id="login" onClick={handleLogin} className="identityButton">Log in with Internet Identity</button>
            {isNFIDAuthLoaded && (
              <NFIDAuth showButton={showModal} onSuccess={(principalId) => handleSuccess(principalId)} nfid={nfid} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;