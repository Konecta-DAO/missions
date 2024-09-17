import React, { useState } from 'react';
import styles from './MissionsPanel.module.scss';
import ModifyMissionModal from './ModifyMissionModal.tsx';
import { SerializedMission } from '../declarations/backend/backend.did.js';

interface MissionListProps {
  missions: SerializedMission[];
  onUpdateMission: (mission: SerializedMission) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const MissionList: React.FC<MissionListProps> = ({ missions, onUpdateMission, onImageUpload }) => {
  const [selectedMission, setSelectedMission] = useState<SerializedMission | null>(null);

  const handleModifyClick = (mission: SerializedMission) => {
    setSelectedMission(mission); // Set the selected mission for modification
  };

  const closeModal = () => {
    setSelectedMission(null);
  };
  // Base URL for the image and icon resources
  const BASE_URL = process.env.DEV_IMG_CANISTER_ID;

  return (
    <div className={styles.MissionsList}>
      {missions?.map((mission) => (
        <div key={mission.id.toString()} className={styles.MissionItem}>
          <h3>{mission.title}</h3>
          <p>{mission.description}</p>

          {mission.image && (
            <img
              src={`${BASE_URL}${mission.image}`}
              alt={mission.title}
              className={styles.MissionImage}
            />
          )}

          <ul className={styles.MissionDetails}>
            <li><strong>ID:</strong> {mission.id.toString()}</li>
            <li><strong>Start Date:</strong> {new Date(Number(mission.startDate)).toLocaleString()}</li>
            <li><strong>End Date:</strong> {new Date(Number(mission.endDate)).toLocaleString()}</li>
            <li><strong>Min Time:</strong> {mission.mintime.toString()}</li>
            <li><strong>Max Time:</strong> {mission.maxtime.toString()}</li>
            <li><strong>Recursive:</strong> {mission.recursive ? 'Yes' : 'No'}</li>
            <li><strong>Mode:</strong> {mission.mode.toString()}</li>
            <li><strong>Previous Mission ID:</strong> {mission.requiredPreviousMissionId?.toString() ?? 'N/A'}</li>
          </ul>

          {mission.iconUrl && (
            <img
              src={`${BASE_URL}${mission.iconUrl}`}
              alt={mission.title}
              className={styles.IconImage}
            />
          )}

          <button onClick={() => handleModifyClick(mission)} className={styles.ModifyButton}>Modify</button>
        </div>
      ))}

      {/* Show the Modify Modal if a mission is selected */}
      {selectedMission && (
        <ModifyMissionModal
          mission={selectedMission}
          onUpdateMission={onUpdateMission}
          onClose={closeModal}
          onImageUpload={onImageUpload}
        />
      )}
    </div>
  );
};

export default MissionList;
