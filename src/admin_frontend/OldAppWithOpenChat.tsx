import React, { useState, useEffect } from 'react';
import styles from './AdminPanel.module.scss';
import KonectaLogo from '../../public/assets/Konecta Logo.svg';
import { useIdentityKit, ConnectWallet } from "@nfid/identitykit/react";
import { Principal } from '@dfinity/principal';
import { Actor, AnonymousIdentity, HttpAgent } from '@dfinity/agent';
import { canisterId, idlFactory } from '../declarations/backend/index.js';
import { SerializedProgress, SerializedUser } from '../declarations/backend/backend.did.js';
import { idlFactory as ocIdl, canisterId as canisterId2 } from '../declarations/oc/index.js';

type UserArgs = {
  user_id?: Principal[];
  username?: string[];
};

type DiamondMembershipStatus =
  | { Inactive: null }
  | { Active: null }
  | { Lifetime: null };

type UserSummary = {
  user_id: Principal;
  username: string;
  display_name?: string;
  avatar_id?: bigint;
  is_bot: boolean;
  suspended: boolean;
  diamond_member: boolean;
  diamond_membership_status: DiamondMembershipStatus;
  total_chit_earned: number;
  chit_balance: number;
  streak: number;
  is_unique_person: boolean;
};

type UserResponse =
  | { Success: UserSummary }
  | { UserNotFound: null };

function App() {

  const { identity, user, disconnect } = useIdentityKit();
  const [actor, setActor] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [inputText, setInputText] = useState<string>('');

  const setData = async (agent: HttpAgent) => {

    if (agent) {
      const actor = Actor.createActor(idlFactory, {
        agent: agent,
        canisterId,
      });
      setActor(actor);
      const b = await actor.trisAdmin(user?.principal!);
      if (b) {
        setLoaded(true);
      }
    }
  };

  useEffect(() => {

    const fetchData = async () => {
      console.log(identity?.getPrincipal())
      if (user?.principal && user?.principal !== Principal.fromText("2vxsx-fae") && identity !== undefined) {
        if (identity.getPrincipal().toText() !== "2vxsx-fae") {
          const agent = HttpAgent.createSync({ identity });
          if (process.env.NODE_ENV !== "production") {
            agent.fetchRootKey();
          }
          setData(agent);
        } else {
          disconnect();
        }
      }
    };
    fetchData();
  }, [user?.principal]);

  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {


    const file = event.target.files?.[0];

    if (file) {
      console.log('File name:', file.name);
      if (file.size > 2 * 1024 * 1024) { // Check if file is larger than 2MB
        alert('File size must be less than 2MB');
        return;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);



        console.log('Uint8Array size:', uint8Array.length, 'bytes');

        // Send parsed data to the canister
        const a = await actor.uploadMissionImage(file.name, uint8Array) as string;
        setImageURL(a);
        console.log("Data successfully set.");
        setUploadSuccess('Success');
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleImageButtonClick = () => {
    const input = document.getElementById('hiddenImageInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };


  type MissionEntry = [number, SerializedProgress];
  type UserEntry = [string, MissionEntry[]];

  interface GetAllUsersProgressResponse {
    data: UserEntry[];
    total: number;
  }

  const getUsers = async () => {
    const a = await actor.getUsers();

    // Serialize the data to JSON, handling bigint types
    const jsonString: string = JSON.stringify(
      a,
      (key: string, value: any): any => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      },
      2 // Indentation for readability
    );
    // Create a Blob from the JSON string
    const blob: Blob = new Blob([jsonString], { type: "application/json" });

    // Create a download URL for the Blob
    const url: string = URL.createObjectURL(blob);

    // Create a hidden anchor element and trigger the download
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = url;
    link.download = "users.json";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL after the download
    URL.revokeObjectURL(url);

    console.log("Download initiated successfully.");
  };

  const getTodo = async () => {

    const pageSize: number = 500; // Number of entries to fetch per request
    let offset: number = 0;        // Starting point for pagination
    let total: number = 0;         // Total number of entries
    let allProgress: UserEntry[] = []; // Aggregated user progress data

    console.log("Starting to fetch user progress...");

    try {
      do {
        console.log(`Fetching data from offset ${offset} to ${offset + pageSize}`);

        // Fetch a page of data from the backend
        const response: GetAllUsersProgressResponse = await actor.getAllUsersProgress(offset, pageSize);
        const { data, total: fetchedTotal } = response;

        // On the first fetch, set the total number of entries
        if (offset === 0) {
          total = fetchedTotal;
          console.log(`Total entries to fetch: ${total}`);
        }

        // Concatenate the fetched data to allProgress
        allProgress = allProgress.concat(data);
        console.log(`Fetched ${data.length} entries. Total fetched: ${allProgress.length}/${total}`);

        // Increment the offset for the next fetch
        offset += pageSize;
      } while (offset < total);

      console.log("All data fetched. Preparing download...");

      // Serialize the data to JSON, handling bigint types
      const jsonString: string = JSON.stringify(
        allProgress,
        (key: string, value: any): any => {
          if (typeof value === "bigint") {
            return value.toString();
          }
          return value;
        },
        2 // Indentation for readability
      );

      // Create a Blob from the JSON string
      const blob: Blob = new Blob([jsonString], { type: "application/json" });

      // Create a download URL for the Blob
      const url: string = URL.createObjectURL(blob);

      // Create a hidden anchor element and trigger the download
      const link: HTMLAnchorElement = document.createElement("a");
      link.href = url;
      link.download = "progress.json";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL after the download
      URL.revokeObjectURL(url);

      console.log("Download initiated successfully.");
    } catch (error) {
      console.error("An error occurred while fetching user progress:", error);
      alert("Failed to download progress data. Please try again later.");
    }
  };

  const handleUserFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonString = e.target?.result as string;

          // Reviver function to handle BigInts and Principals
          const reviverFunction = (key: any, value: any) => {
            // Convert stringified BigInts back to BigInt
            if (typeof value === 'string' && /^\d+$/.test(value)) {
              // Assuming all numeric strings are meant to be BigInt (Nat)
              return BigInt(value);
            }

            // Convert __principal__ values back to Principal objects
            if (value && typeof value === 'object' && '__principal__' in value) {
              return Principal.fromText(value.__principal__);
            }

            return value;
          };

          // Parse the uploaded JSON file using the reviver function
          const parsedData = JSON.parse(jsonString, reviverFunction);

          // Ensure parsedData is an array
          const dataArray: any[] = Array.isArray(parsedData)
            ? parsedData
            : Object.values(parsedData);

          // Validate and transform data to match SerializedUser type
          const serializedUsers: SerializedUser[] = dataArray.map((user) => ({
            id: user.id as Principal, // Assert that id is a Principal

            // Map 'twitterid' to [] | [bigint]
            twitterid: Array.isArray(user.twitterid) && user.twitterid.length > 0
              ? [BigInt(user.twitterid[0])]
              : [],

            // Map 'twitterhandle' to [] | [string]
            twitterhandle: Array.isArray(user.twitterhandle) && user.twitterhandle.length > 0
              ? [user.twitterhandle[0]]
              : [],

            creationTime: BigInt(user.creationTime),
            pfpProgress: String(user.pfpProgress),
            totalPoints: BigInt(user.totalPoints),

            // Map 'ocProfile' to [] | [string]
            ocProfile: Array.isArray(user.ocProfile) && user.ocProfile.length > 0
              ? [user.ocProfile[0]]
              : [],

            ocCompleted: Boolean(user.ocCompleted),
          }));


          // Upload the serialized users to the backend
          await actor.restoreUsers(serializedUsers);
          console.log('Users successfully uploaded.');

          // Optionally, retrieve and log the updated users
          const updatedUsers = await actor.getUsers();
          console.log('Updated Users:', updatedUsers);
        } catch (error) {
          console.error('Error parsing or uploading users JSON:', error);
        }
      };

      // Read the file as a text string (assuming it is a JSON file)
      reader.readAsText(file);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonString = e.target?.result as string;

          // Reviver function to handle BigInts and Principals
          const reviverFunction = (key: any, value: any) => {
            // Check for the tweetId key and ensure it's treated as a string
            if (key === "tweetId" && Array.isArray(value) && value.length > 0) {
              return [String(value[0])];
            }

            if (key === "usedCodes" && Array.isArray(value)) {
              return value.map(([text, bool]: [string, boolean]) => [String(text), bool]); // Convert text to string
            }

            // Convert stringified BigInts and 'nat' back to BigInt
            if (typeof value === 'string' && /^\d+n$/.test(value)) {
              return BigInt(value.slice(0, -1)); // Remove the 'n' and convert back to BigInt
            }

            // Convert numeric strings back to numbers (except for tweetId)
            if (typeof value === 'string' && /^\d+$/.test(value)) {
              return Number(value); // Convert plain numbers back from strings
            }

            // Convert __principal__ values back to Principal objects
            if (value && typeof value === 'object' && '__principal__' in value) {
              return Principal.fromText(value.__principal__);
            }

            return value;
          };

          // Parse the uploaded JSON file using the reviver function
          const parsedData = JSON.parse(jsonString, reviverFunction);

          // Ensure parsedData is an array of tuples
          const dataArray = Array.isArray(parsedData)
            ? parsedData
            : Object.entries(parsedData);

          // Define the chunk size (adjust based on your needs)
          const CHUNK_SIZE = 500; // Number of records per chunk

          // Function to split data into chunks
          const splitIntoChunks = (data: any[], chunkSize: number) => {
            const chunks = [];
            for (let i = 0; i < data.length; i += chunkSize) {
              chunks.push(data.slice(i, i + chunkSize));
            }
            return chunks;
          };

          // Split the parsedData into chunks
          const chunks = splitIntoChunks(dataArray, CHUNK_SIZE);
          const totalChunks = chunks.length; // Calculate total number of chunks

          await actor.resetallProgress();

          // Send each chunk to the backend
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            // Send parsed chunk to the canister
            await actor.restoreAllUserProgress(chunk);
            console.log(`Chunk ${i + 1} of ${totalChunks} successfully sent.`);
          }

          console.log("All data successfully sent.");

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      // Read the file as a text string (assuming it is a JSON file)
      reader.readAsText(file);
    }
  };

  const resetAll = () => {
    actor.resetall();
    console.log("All data successfully reset.");
  };

  const handleUserButtonClick = () => {
    const input = document.getElementById('hiddenUserFileInput') as HTMLInputElement;
    input.click();
  };


  const handleButtonClick = () => {
    const input = document.getElementById('hiddenFileInput') as HTMLInputElement;
    input.click();
  };

  const verifyOpenChat = async () => {
    console.log("Input Text:", inputText);
    const agent = HttpAgent.createSync({ identity });
    const actor2 = Actor.createActor(ocIdl, {
      agent: agent,
      canisterId: canisterId2,
    })
    console.log("Hay actor 2", actor2)

    try {
      const args: UserArgs = {
        user_id: [],
        username: [inputText],
      };

      const c: UserResponse = await actor2.user(args) as UserResponse;

      if ("Success" in c) {
        const d = await actor.setOCMissionEnabled(c.Success.user_id);
        if (d) {
          console.log("Done");
        } else {
          console.log("Not found");
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <>
      <div className={styles.HomeContainer}>
        {/* Konecta Logo Section */}
        <div className={styles.KonectaLogoWrapper}>
          <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
        </div>

        {/* ConnectWallet Section */}
        <div className={styles.ConnectWalletWrapper}>
          <ConnectWallet />
        </div>

        {/* Buttons Column */}
        {loaded && (
          <div className={styles.ButtonsColumn}>

            {/* <button onClick={resetAll}>Nuke Bomb</button> */}

            <button onClick={getUsers}>Save All Users</button>

            <button onClick={getTodo}>Save All Progress</button>

            {/* JSON File Upload */}
            <div>
              <input id="hiddenUserFileInput" type="file" accept=".json" onChange={handleUserFileUpload} style={{ display: 'none' }} />
              <button onClick={handleUserButtonClick}>Upload Users JSON File</button>
            </div>
            <div>
              <input id="hiddenFileInput" type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              <button onClick={handleButtonClick}>Upload Progress JSON File</button>
            </div>

            {/* Image Upload Section */}
            <div>
              <input
                id="hiddenImageInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button onClick={handleImageButtonClick}>Upload Image</button>
            </div>

            {/* Display Success Text */}
            {uploadSuccess && <p className={styles.UploadSuccessMessage}>{imageURL}</p>}

            <div>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="OpenChat Username"
                className={styles.TextInput}
              />
              <button onClick={verifyOpenChat}>Verify OpenChat</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
