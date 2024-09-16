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

  const getTodo = async () => {
    const actor = Actor.createActor(idlFactory, {
      agent: agent!,
      canisterId,
    });
    const progress = await actor.getAllUsersProgress();

    const jsonString = JSON.stringify(progress, (_, value) => {
      return typeof value === 'bigint' ? value.toString() : value;
    }, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'progress.json';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL after the download
    URL.revokeObjectURL(url);
  }

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
