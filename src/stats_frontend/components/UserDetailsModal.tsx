import React from 'react';
import { SerializedUser, SerializedProgress } from '../../declarations/backend/backend.did.js';

interface UserDetailsModalProps {
  user: SerializedUser | null;
  progress: Array<{ progress: SerializedProgress; missionId: bigint }>;
  tweets: Array<[bigint, string]>;
  usedCodes: Array<{ code: string; isUsed: boolean }>;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, progress, tweets, usedCodes, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>User Details for {user.id.toString()}</h3>
        <h4>Mission Progress</h4>
        <ul>
          {progress?.map((p, index) => (
            <li key={index}>
              Mission ID: {p.missionId.toString()},

            </li>
          ))}
        </ul>

        <h4>Tweets</h4>
        <ul>
          {tweets?.map((tweet, index) => (
            <li key={index}>
              Tweet ID: <a href={`https://twitter.com/user/status/${tweet[1]?.toString() ?? ""}`} target="_blank" rel="noopener noreferrer">{tweet[1]}</a>,
              Timestamp: {new Date(Number(tweet[0]) / 1_000_000).toLocaleString()}
            </li>
          ))}
        </ul>

        <h4>Used Codes</h4>
        <ul>
          {usedCodes?.map((codeEntry, index) => (
            <li key={index} style={{ backgroundColor: codeEntry.isUsed ? 'green' : 'red', color: 'white' }}>
              Code: {codeEntry.code}, Used: {codeEntry.isUsed ? "True" : "False"}
            </li>
          ))}
        </ul>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default UserDetailsModal;
