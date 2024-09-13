import React, { useState, useEffect } from 'react';
import styles from './MissionsPanel.module.scss';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from '../declarations/backend/index.js';
import { Actor, HttpAgent } from "@dfinity/agent";
import MissionList from './MissionList.tsx';
import AddMissionForm from './AddMissionForm.tsx';
import { SerializedMission } from '../declarations/backend/backend.did.js';

interface MissionsPanelProps {
}

const MissionsPanel: React.FC<MissionsPanelProps> = () => {
    const [missions, setMissions] = useState<SerializedMission[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    const agent = new HttpAgent();
    const backendActor = Actor.createActor(backend_idlFactory, {
        agent,
        canisterId: backend_canisterId,
    });

    const fetchMissions = async () => {
        try {
            const fetchedMissions: SerializedMission[] = await backendActor.getAllMissions() as SerializedMission[];
            setMissions(fetchedMissions);
        } catch (error) {
            console.error('Error fetching missions:', error);
        }
    };

    const handleAddMission = async (mission: SerializedMission) => {
        try {
            await backendActor.addOrUpdateMission(mission);
            fetchMissions();
        } catch (error) {
            console.error('Error adding mission:', error);
        }
    };

    // Function to update a mission
    const onUpdateMission = async (updatedMission: SerializedMission) => {
        try {
            await backendActor.addOrUpdateMission(updatedMission); // Call backend to update mission
            // Update the state with the modified mission
            setMissions(missions.map((mission) =>
                mission.id === updatedMission.id ? updatedMission : mission
            ));
        } catch (error) {
            console.error('Error updating mission:', error);
        }
    };

    const handleImageUpload = async (file: File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const resultBlob = new Uint8Array(reader.result as ArrayBuffer); // Convert the file to Uint8Array
                    const imageUrl: string = await backendActor.uploadMissionImage(file.name, resultBlob) as string; // Call backend function and explicitly type imageUrl as string
                    resolve(imageUrl); // Resolve the promise with the URL
                } catch (error) {
                    reject(error); // Handle any errors
                }
            };
            reader.readAsArrayBuffer(file); // Start reading the file as ArrayBuffer
        });
    };

    if (isAdmin === false) {
        return null;
    }

    return (
        <div className={styles.MissionsPanel}>
            {isAdmin && (
                <>
                    <MissionList missions={missions} onImageUpload={handleImageUpload} onUpdateMission={onUpdateMission} />
                    <AddMissionForm onAddMission={handleAddMission} onImageUpload={handleImageUpload} />
                </>
            )}
        </div>
    );
};

export default MissionsPanel;
