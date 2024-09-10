import React from 'react';
import { SerializedMission } from '../types.ts';

interface MissionListProps {
    missions: SerializedMission[];
}

const MissionList: React.FC<MissionListProps> = ({ missions }) => {
    return (
        <div>
            {missions.length > 0 ? (
                <ul>
                    {missions.map((mission) => {
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
