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
  const [authClient, setAuthClient] = useState<AuthClient | null>(null); // AuthClient for NFID Auth
  const [principalId, setPrincipalId] = useState<string>(''); // Principal ID for NFID Auth
  const [trustedOrigins, setTrustedOrigins] = useState<string[]>([]); // Trusted Origins for NFID Auth
  const [sec, setSec] = useState<number>(0); // Seconds earned by the user
  const [isNFIDAuthLoaded, setIsNFIDAuthLoaded] = useState<boolean>(false); // Flag to check if NFID Auth is loaded
  const [message, setMessage] = useState<string>(''); // Message to display to the user
  const [twitterHandle, setTwitterHandle] = useState<string>(''); // Twitter handle input
  const [remainingTime, setRemainingTime] = useState<number>(0); // Remaining time for the user to earn more points
  const [showAuthenticateButton, setShowAuthenticateButton] = useState<boolean>(true); // Flag to show Authenticate button
  const [EnableAuthenticateButton, setEnableAuthenticateButton] = useState<boolean>(true); // Flag to enable Authenticate button
  const [showTweetButton, setShowTweetButton] = useState<boolean>(false); // Flag to show Tweet button
  const [showCheckButton, setShowCheckButton] = useState<boolean>(false); // Flag to show Check button
  const [showInput, setShowInput] = useState<boolean>(false); // Flag to show Twitter handle input
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
  const [showFollowMessage, setShowFollowMessage] = useState<boolean>(false); // Flag to show Follow message
  const [showFollowButton, setShowFollowButton] = useState<boolean>(false); // Flag to show Follow button
  const [showFollowInput, setShowFollowInput] = useState<boolean>(false); // Flag to show Follow input
  const [showCheckFollowButton, setShowCheckFollowButton] = useState<boolean>(false); // Flag to show Check Follow button
  const { nfid, isNfidIframeInstantiated } = useNFID(); // NFID Auth

  // Initialize AuthClient on App Start
  useEffect(() => {
    const init = async (): Promise<void> => {
      const client: AuthClient = await AuthClient.create();
      setAuthClient(client);
      setIsNFIDAuthLoaded(true);

      // Check for stored identity
      const storedIdentity = localStorage.getItem('identity');
      if (storedIdentity) {
        try {
          const identity = await client.getIdentity(); // Properly instantiate the identity
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
          localStorage.removeItem('identity'); // Remove invalid identity from local storage
        }
      }
      setIsLoading(false); // Set loading state to false after initialization
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

  // Update showAuthenticateButton based on NFID Auth and iframe instantiation status
  useEffect(() => {
    if (isNFIDAuthLoaded && isNfidIframeInstantiated) {
      setEnableAuthenticateButton(true);
    }
  }, [isNFIDAuthLoaded, isNfidIframeInstantiated]);

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

    // Check delegation type
    const delegationType = nfid.getDelegationType();
    if (delegationType === 1) { // 1 corresponds to ANONYMOUS
      alert("Anonymous Delegations aren't allowed, please try again");
      await nfid.logout(); // Log out the user
      return;
    }

    const identity: Identity = authClient.getIdentity();
    setPrincipalId(principalId);
    // Store identity in local storage
    localStorage.setItem('identity', JSON.stringify(identity));

    // Call the main logic function
    await mainLogic(principalId);

  }, [authClient, backend, nfid]);

  const mainLogic = async (principalID: String) => {

    // Check if the user is following @KonectA_Dao
    const isFollowing = await backend.getFollow(principalId) as boolean;
    if (!isFollowing) {
      setShowFollowMessage(true);
      setShowFollowButton(true);
    }

    const existingSecs = await backend.getSecs(principalID) as unknown as bigint;
    if (existingSecs === 0n) {
      // Case 1: First time authenticating
      const generatedSec = getRandomNumberOfSeconds();
      await backend.registerid(principalID, BigInt(generatedSec));
      setSec(generatedSec);
      setMessage(`Your principalId is: ${principalID}. You have got ${formatTime(generatedSec)}`);
      setShowAuthenticateButton(false);
      setShowTweetButton(true);
    } else {
      // Case 2: User already has seconds
      setSec(Number(existingSecs));
      const backendTimestamp = await backend.getTimestamp(principalID) as unknown as bigint;
      if (backendTimestamp === 0n) {
        // Case 2.1: No previous timestamp
        setMessage(`Your principalId is: ${principalID}. You already have got ${formatTime(Number(existingSecs))}`);
        setShowAuthenticateButton(false);
        setShowTweetButton(true);
      } else {
        // Case 2.2: Has previous timestamp
        const currentTimestamp = BigInt(Date.now()) * BigInt(1_000_000); // Convert to nanoseconds
        const elapsedTime = Number(currentTimestamp - backendTimestamp) / 1_000_000_000; // Convert to seconds
        const remainingTime = Math.max(600 - elapsedTime, 0);

        if (remainingTime > 0) {
          // Case 2.2.2: Less than 10 minutes passed
          setRemainingTime(remainingTime);
          setMessage(`Your principalId is: ${principalID}. You have got ${formatTime(Number(existingSecs))}. Get back in ${formatTime(remainingTime)} to earn more.`);
          setShowAuthenticateButton(false);
          const timer = setInterval(() => {
            setRemainingTime((prevTime) => {
              const newTime = prevTime - 1;
              if (newTime <= 0) {
                clearInterval(timer);
                setMessage(`You already have got ${formatTime(Number(existingSecs))}`);
                setShowTweetButton(true);
                return 0;
              }
              setMessage(`Your principalId is: ${principalID}. You have got ${formatTime(Number(existingSecs))}. Get back in ${formatTime(newTime)} to earn more.`);
              return newTime;
            });
          }, 1000);
        } else {
          // Case 2.2.1: More than 10 minutes passed
          setMessage(`Your principalId is: ${principalID}. You have got ${formatTime(Number(existingSecs))}`);
          setShowAuthenticateButton(false);
          setShowTweetButton(true);
        }
      }
    }
  };

  // Handle tweet
  const handleTweet = useCallback((): void => {
    const tweetText = encodeURIComponent("Join the Konectª Army and earn points! #KonectArmy");
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank");
    setShowInput(true);
    setShowCheckButton(true);
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

        // Fetch the timestamp from the backend
        const backendTimestamp = await backend.getTimestamp(principalId) as unknown as bigint;
        const backendTimestampMs = backendTimestamp / BigInt(1_000_000); // Convert nanoseconds to milliseconds
        const currentTimestamp = BigInt(Date.now());
        const elapsedTime = Number(currentTimestamp - backendTimestampMs) / 1000; // Convert to seconds
        const remainingTime = Math.max(600 - elapsedTime, 0);

        setRemainingTime(remainingTime);
        setMessage(`You have earned ${formatTime(randomSecs)}. Now you have ${formatTime(newSecs)} in total! Get back in ${formatTime(remainingTime)} to earn more.`);
        setShowTweetButton(false);
        setShowCheckButton(false);
        setShowInput(false);

        // Start the countdown timer
        const timer = setInterval(() => {
          setRemainingTime((prevTime) => {
            const newTime = prevTime - 1;
            if (newTime <= 0) {
              clearInterval(timer);
              setMessage(`You already have got ${formatTime(newSecs)}`);
              setShowTweetButton(true);
              return 0;
            }
            setMessage(`You have earned ${formatTime(randomSecs)}. Now you have ${formatTime(newSecs)} in total! Get back in ${formatTime(newTime)} to earn more.`);
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

  // Handle follow
  const handleFollow = useCallback((): void => {
    const followUrl = `https://twitter.com/intent/follow?screen_name=KonectA_Dao`;
    window.open(followUrl, "_blank");
    setShowFollowInput(true);
    setShowCheckFollowButton(true);
  }, []);

  // Handle follow verification
  const handleCheckFollow = useCallback(async (): Promise<void> => {
    try {
      const formattedHandle = validateTwitterHandle(twitterHandle);
      const followVerified = await backend.check_if_following(principalId, formattedHandle) as boolean;
      if (followVerified) {
        const additionalSecs = 1800; // 30 minutes in seconds
        const newSecs = sec + additionalSecs;
        setSec(newSecs);
        setMessage(`Following done successfully, you have earned ${formatTime(additionalSecs)} more minutes. Now you have ${formatTime(newSecs)} in total!`);
        setShowFollowMessage(false);
        setShowFollowButton(false);
        setShowFollowInput(false);
        setShowCheckFollowButton(false);
      } else {
        alert("Not Following KonectA_Dao");
      }
    } catch (error) {
      console.error("Error verifying follow:", error);
      alert("Error verifying follow");
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

    if (!isLoading) {
      initOpenChat();
    }
  }, [isLoading]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

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
        {showAuthenticateButton && (
          < NFIDAuth showButton={true} onSuccess={(principalId) => handleSuccess(principalId)} nfid={nfid} />
        )}
        <p>{message}</p>
        {showFollowMessage && (
          <>
            <br />
            <p>Follow @KonectA_Dao to earn 30 more minutes</p>
            {showFollowButton && (
              <button className="btn-grad" onClick={handleFollow}>Follow</button>
            )}
            {showFollowInput && (
              <input
                type="text"
                placeholder="Enter your Twitter handle"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
              />
            )}
            {showCheckFollowButton && (
              <button className="btn-grad" onClick={handleCheckFollow}>Check if Following</button>
            )}
          </>
        )}
        {showTweetButton && (
          <>
            <br />
            <p>Tweet to earn some more minutes!</p>
            <button className="btn-grad" onClick={handleTweet}>Tweet</button>
          </>
        )}
        {showInput && (
          <input
            type="text"
            placeholder="Enter your Twitter handle"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
          />
        )}
        {showCheckButton && (
          <button className="btn-grad" onClick={handleCheckTweet}>Check</button>
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