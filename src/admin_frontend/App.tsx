import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { Actor, HttpAgent } from "@dfinity/agent";
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SerializedUser, SerializedMission } from './types';

function App() {
  const [principalId, setPrincipalId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Statistics');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(0);
  const [missions, setMissions] = useState<SerializedMission[]>([]);
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [searchHandle, setSearchHandle] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [newAdminId, setNewAdminId] = useState<string>('');

  // Callback function to set isInitialized to true
  const handleNfidIframeInstantiated = useCallback(() => {
    setIsInitialized(true);
  }, []);

  const { nfid } = useNFID(handleNfidIframeInstantiated);

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Handle successful authentication
  const handleSuccess = useCallback(async (pId: string): Promise<void> => {
    if (!nfid) {
      console.error("NFID is not initialized");
      return;
    }
    // Call the backend function to check authorization
    const authorized = await backend.isAdmin(pId) as boolean;
    if (!authorized) {
      alert("Unauthorized User");
      console.log(pId);
    } else {
      setIsAuthorized(true);
      fetchData();
    }

  }, [nfid, backend]);

  const fetchData = useCallback(async () => {
    const users = await backend.getUsers() as SerializedUser[];
    setUsers(users);

    const missions = await backend.getAllMissions() as SerializedMission[];
    setMissions(missions);

    const adminIds = await backend.getAdminIds() as string[];
    setAdminIds(adminIds);

    let totalCompleted = 0;
    for (const mission of missions) {
      const count = await backend.countCompletedUsers(mission.id) as number;
      totalCompleted += count;
    }
    setMissionsCompleted(totalCompleted);
  }, [backend]);

  // Function to switch tabs
  const openTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Function to handle sorting
  const handleSort = (key: keyof SerializedUser, order: 'asc' | 'desc') => {
    const sortedUsers = [...users].sort((a, b) => {
      if (order === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
    setUsers(sortedUsers);
  };

  // Function to handle filtering by twitter handle
  const handleSearchHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchHandle(event.target.value);
  };

  // Function to handle filtering by date range
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // Filtered and sorted users
  const filteredUsers = users.filter(user => {
    const matchesHandle = user.twitterhandle.toLowerCase().includes(searchHandle.toLowerCase());
    const matchesDate = (!startDate || new Date(Number(user.creationTime) / 1_000_000) >= startDate) && (!endDate || new Date(Number(user.creationTime) / 1_000_000) <= endDate);
    return matchesHandle && matchesDate;
  });

  // Function to handle adding a new admin
  const handleAddAdmin = async (newAdminId: string) => {
    const confirmed = window.confirm(`Are you sure that you want to give Administrative Rights to ${newAdminId}?`);
    if (confirmed) {
      await backend.addAdminId(newAdminId);
      fetchData();
    }
  };

  // Function to handle deleting an admin
  const handleDeleteAdmin = async (adminId: string) => {
    const confirmed = window.confirm(`Are you sure that you want to delete ${adminId}?`);
    if (confirmed) {
      await backend.removeAdminId(adminId);
      fetchData();
    }
  };

  useEffect(() => {
    if (principalId) {
      handleSuccess(principalId);
    }
  }, [principalId]);

  return (
    <main>
      <div className="container">
        {!isAuthorized && <h1>Login to access to the Konectª Admin Module</h1>}
        <br />
        {!isAuthorized && <NFIDAuth showButton={true} onSuccess={(principalId) => setPrincipalId(principalId)} nfid={nfid} isInitialized={isInitialized} />}
        <p>{message}</p>
        {isAuthorized && (
          <div>
            <div className="tab">
              <button className={`tablinks ${activeTab === 'Statistics' ? 'active' : ''}`} onClick={() => openTab('Statistics')}>Statistics</button>
              <button className={`tablinks ${activeTab === 'Administer' ? 'active' : ''}`} onClick={() => openTab('Administer')}>Administer</button>
            </div>
            <div id="Statistics" className={`tabcontent ${activeTab === 'Statistics' ? 'active' : ''}`}>
              <h3>Statistics</h3>
              <p>Users:</p>
              <input type="text" placeholder="Search by Twitter Handle" value={searchHandle} onChange={handleSearchHandle} />
              <DatePicker
                selected={startDate ?? undefined}
                onChange={handleDateChange}
                startDate={startDate ?? undefined}
                endDate={endDate ?? undefined}
                selectsRange
                inline
              />
              <button onClick={() => { setStartDate(null); setEndDate(null); }}>Reset</button>
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id', 'asc')}>ID</th>
                    <th onClick={() => handleSort('seconds', 'asc')}>Seconds</th>
                    <th onClick={() => handleSort('twitterid', 'asc')}>Twitter ID</th>
                    <th onClick={() => handleSort('twitterhandle', 'asc')}>Twitter Handle</th>
                    <th onClick={() => handleSort('creationTime', 'asc')}>Creation Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.seconds.toString()}</td>
                      <td>{user.twitterid.toString()}</td>
                      <td>{user.twitterhandle}</td>
                      <td>{new Date(Number(user.creationTime) / 1_000_000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>Total Amount of Missions Completed: {missionsCompleted}</p>
              {missions.length > 0 ? (
                <Bar
                  data={{
                    labels: missions.map(mission => mission.id.toString()),
                    datasets: [{
                      label: 'Number of Times Mission Completed',
                      data: missions.map(mission => backend.countCompletedUsers(mission.id)),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }]
                  }}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              ) : (
                <p>There are no missions</p>
              )}
            </div>
            <div id="Administer" className={`tabcontent ${activeTab === 'Administer' ? 'active' : ''}`}>
              <h3>Administer</h3>
              <p>Your principal Id is: {principalId}</p>
              <p>Principal IDs with Admin privileges:</p>
              <ul>
                {adminIds.map((id, index) => (
                  <li key={id}>
                    {id} {index !== 0 && <button onClick={() => handleDeleteAdmin(id)}>Delete</button>}
                  </li>
                ))}
              </ul>
              <p>Add a new Admin ID:</p>
              <input type="text" placeholder="New Admin ID" value={newAdminId} onChange={(e) => setNewAdminId(e.target.value)} />
              <button onClick={() => handleAddAdmin(newAdminId)}>Add</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
