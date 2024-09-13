import { useCallback, useEffect, useState } from 'react';
import { ActorSubclass } from "@dfinity/agent";
import { SerializedUser, SerializedMission } from '../../declarations/backend/backend.did.js';

export const useFetchData = (backend: ActorSubclass<any>) => {
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [missions, setMissions] = useState<SerializedMission[]>([]);
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(0);
  const [missionCounts, setMissionCounts] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    const users = await backend.getUsers() as SerializedUser[];
    setUsers(users);

    const missions = await backend.getAllMissions() as SerializedMission[];
    setMissions(missions);

    const adminIds = await backend.getAdminIds() as string[];
    setAdminIds(adminIds);

    let totalCompleted = 0;
    const missionCounts = await Promise.all(missions.map(async (mission) => {
      try {
        const count = await backend.countCompletedUsers(mission.id);
        totalCompleted += Number(count); // Convert BigInt to number
        return Number(count); // Convert BigInt to number
      } catch (error) {
        console.error(`Error fetching count for mission ${mission.id}:`, error);
        return 0; // Default to 0 in case of error
      }
    }));

    setMissionsCompleted(totalCompleted);
    setMissionCounts(missionCounts);
  }, [backend]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, missions, adminIds, missionsCompleted, missionCounts };
};
