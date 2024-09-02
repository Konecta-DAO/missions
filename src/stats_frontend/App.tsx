import './App.css';
import { useEffect, useState, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { Actor, HttpAgent } from "@dfinity/agent";
import UserList from './components/UserList';
import UserDetailsModal from './components/UserDetailsModal';
import MissionList from './components/MissionList';
import MissionChart from './components/MissionChart';
import { useFetchData } from './hooks/useFetchData';
import { useFetchUserDetails } from './hooks/useFetchUserDetails';
import { SerializedUser } from './types';

// Import Chart.js components
import { Chart as ChartJS, LinearScale, BarElement, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(LinearScale, BarElement, CategoryScale, Title, Tooltip, Legend);

function App() {
  const [selectedUser, setSelectedUser] = useState<SerializedUser | null>(null);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Fetch data using the custom hook
  const { users, missions, missionsCompleted, missionCounts } = useFetchData(backend);

  // Fetch user details using the custom hook
  const { userProgress, userTweets, userUsedCodes, fetchUserDetails } = useFetchUserDetails(backend);

  useEffect(() => {
    if (selectedUser) {
      fetchUserDetails(selectedUser);
    }
  }, [selectedUser, fetchUserDetails]);

  const handleOpenModal = (user: SerializedUser) => {
    setSelectedUser(user);
    setShowUserModal(true); // Open User Details Modal
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  return (
    <main>
      <div className="container">
        <br />
        <h3>User Statistics</h3>
        <br />

        <UserList users={users} onUserSelect={handleOpenModal} />

        <br />
        <p>Total Amount of Missions Completed by All Users: {missionsCompleted}</p>

        {missions.length > 0 && (
          <MissionChart missions={missions} missionCounts={missionCounts} />
        )}

        {showUserModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            progress={userProgress.map((progress, index) => ({ progress, missionId: BigInt(index) }))}
            tweets={userTweets}
            usedCodes={userUsedCodes}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </main>
  );
}

export default App;
