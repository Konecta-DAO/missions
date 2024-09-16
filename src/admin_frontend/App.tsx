import React, { useState, useEffect, useRef } from 'react';
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

    // Create the Actor
    const actor = Actor.createActor<ProgressActor>(idlFactory, {
      agent: agent!,
      canisterId,
    });

    const pageSize: number = 1; // Number of entries to fetch per request
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      // When the file is successfully read
      reader.onload = async (e) => {
        try {
          // Parse the uploaded JSON file
          const jsonString = e.target?.result as string;
          const parsedData = JSON.parse(jsonString, (key, value) => {
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
          });

          // Set the processed data to the state or handle it as needed
          setUploadedData(parsedData);
          console.log(parsedData);

          // Initialize the actor
          const actor = Actor.createActor(idlFactory, {
            agent: agent!,
            canisterId,
          });

          // Send parsed data to the canister
          await actor.restoreAllUserProgress(parsedData);
          console.log("Data successfully set.");

          // Retrieve the progress and convert BigInts to strings for display
          const progress = await actor.getAllUsersProgress();
          console.log("Progress successfully retrieved.");

          const jsonString2 = JSON.stringify(progress, (_, value) => {
            return typeof value === 'bigint' ? value.toString() : value;
          }, 2);

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
