import React, { useState, useEffect } from 'react';
import styles from './AdminPanel.module.scss';
import KonectaLogo from '../../public/assets/Konecta Logo.svg';
// import AdminPanel from './AdminPanel.tsx';
// import MissionsPanel from './MissionsPanel.tsx';
import { useIdentityKit, ConnectWallet } from "@nfid/identitykit/react";
import { useGlobalID } from '../hooks/globalID.tsx';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { canisterId, idlFactory } from '../declarations/backend/index.js';
import { SerializedProgress } from '../declarations/backend/backend.did.js';

function App() {

  const { identity, user, agent, disconnect } = useIdentityKit();
  const globalID = useGlobalID();
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [actor, setActor] = useState<any>(null);

  const setData = async (agent: HttpAgent) => {
    if (agent) {
      console.log("canisterId:", canisterId);
      console.log("agent:", agent);
      const actor = Actor.createActor(idlFactory, {
        agent: agent!,
        canisterId,
      });
      setActor(actor);
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


  useEffect(() => {
    const fetchData = async () => {
      if (user?.principal && user?.principal !== Principal.fromText("2vxsx-fae") && identity !== undefined) {
        if (identity.getPrincipal().toText() !== "2vxsx-fae") {
          const actor = Actor.createActor(idlFactory, {
            agent: agent!,
            canisterId,
          });

        } else {
          disconnect();
        }

      }
    };
    fetchData();
  }, [user?.principal, agent]);

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

  interface ProgressActor {
    getAllUsersProgress: (offset: number, limit: number) => Promise<GetAllUsersProgressResponse>;
  }

  const getTodo = async () => {
    // Define the Canister ID

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonString = e.target?.result as string;

          // Reviver function to handle BigInts and Principals
          const reviverFunction = (key: any, value: any) => {
            // Convert stringified BigInts and 'nat' back to BigInt
            if (typeof value === 'string' && /^\d+n$/.test(value)) {
              return BigInt(value.slice(0, -1)); // Remove the 'n' and convert back to BigInt
            }

            // Convert numeric strings back to numbers
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
          const CHUNK_SIZE = 1; // Number of records per chunk

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

          // Send each chunk to the backend
          for (const chunk of chunks) {
            // Send parsed chunk to the canister
            await actor.restoreAllUserProgress(chunk);
            console.log("Chunk successfully sent.");
          }

          console.log("All data successfully sent.");

          // Optionally retrieve the progress and convert BigInts to strings for display
          const progress = await actor.getAllUsersProgress();
          console.log("Progress successfully retrieved.");

          const jsonString2 = JSON.stringify(
            progress,
            (_, value) => {
              return typeof value === 'bigint' ? value.toString() : value;
            },
            2
          );

          console.log(jsonString2);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      // Read the file as a text string (assuming it is a JSON file)
      reader.readAsText(file);
    }
  };


  const handleButtonClick = () => {
    const input = document.getElementById('hiddenFileInput') as HTMLInputElement;
    input.click(); // Trigger the hidden input's click event
  };

  return (
    <div className={`${styles.HomeContainer}`}>
      <div>
        <div className={styles.KonectaLogoWrapper}>
          <>
            <img src={KonectaLogo} alt="Konecta Logo" className={styles.KonectaLogo} />
            <button onClick={getTodo}>Guardar Progreso de todo el mundo</button>
            <input
              id="hiddenFileInput"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }} // Hide the file input
            />

            <button onClick={handleButtonClick}>Upload JSON File</button>

            {/* Image upload section */}

            <input
              id="hiddenImageInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button onClick={handleImageButtonClick}>Upload Image</button>

            {/* Display Success text */}

            {uploadSuccess && <p>{imageURL}</p>}
          </>
        </div>
        <div>
          <ConnectWallet />
        </div>
      </div>
    </div>
  );
}

export default App;
