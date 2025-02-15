import React from 'react';
import { SerializedMissionV2 } from '../../declarations/backend/backend.did.js';

interface MissionListProps {
    missions: SerializedMissionV2[];
}

const MissionList: React.FC<MissionListProps> = ({ missions }) => {
    return (
        <div>
            {missions.length > 0 ? (
                <ul>
                    {missions?.map((mission) => {
                        const [title, desc] = mission.description.split('\0');
                        return (
                            <li key={mission.id.toString()}>
                                <strong>{title}</strong>: {desc}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No missions available</p>
            )}
        </div>
    );
};

export default MissionList;
