import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { Actor, HttpAgent } from "@dfinity/agent";
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SerializedUser, SerializedMission, SerializedProgress } from './types';

function App() {
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(0);
  const [missionCounts, setMissionCounts] = useState<number[]>([]);
  const [missions, setMissions] = useState<SerializedMission[]>([]);
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [searchHandle, setSearchHandle] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [missionDetails, setMissionDetails] = useState<Array<any>>([]);

  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SerializedUser | null>(null);
  const [userProgress, setUserProgress] = useState<Array<any>>([]);
  const [userTweets, setUserTweets] = useState<Array<any>>([]);
  const [userUsedCodes, setUserUsedCodes] = useState<Array<{ code: string; isUsed: boolean }>>([]);

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Register all necessary components, including scales
  Chart.register(...registerables);

  useEffect(() => {
    const fetchMissionDetails = async () => {
      const details = await Promise.all(
        missions.map(async (mission) => {
          const objectDetails = await formatObjectDetails(mission);
          return {
            ...mission,
            objectDetails
          };
        })
      );
      setMissionDetails(details);
    };

    fetchMissionDetails();
  }, [missions]);

  // Fetch data from the backend
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

  const fetchUserDetails = useCallback(async (user: SerializedUser) => {
    const numberOfMissions = await backend.getNumberOfMissions() as number;
    const progressList: Array<{
      missionId: number;
      done: boolean | null;
      totalearned: bigint | null;
      amountOfTimes: bigint | null;
      timestamp: bigint | null;
    }> = [];

    let usedCodesMap: Record<string, boolean> = {};

    for (let i = 0; i < numberOfMissions; i++) {
      const progressArray = await backend.getProgress(user.id, BigInt(i)) as SerializedProgress[] | null;

      if (progressArray && progressArray.length > 0) {
        const progress = progressArray[0]; // Extract the first (and only) item
        progressList.push({
          missionId: i,
          done: progress.done,
          totalearned: progress.totalearned,
          amountOfTimes: progress.amountOfTimes,
          timestamp: progress.timestamp,
        });

        // Build the used codes map from this mission's progress
        if (progress.usedCodes && Array.isArray(progress.usedCodes)) {
          progress.usedCodes.forEach(([code, isUsed]) => {
            usedCodesMap[code] = isUsed;
          });
        }
      } else {
        progressList.push({
          missionId: i,
          done: null,
          totalearned: null,
          amountOfTimes: null,
          timestamp: null
        });
      }
    }
    setUserProgress(progressList);

    const tweets = await backend.getTweets(user.id);
    if (tweets && Array.isArray(tweets)) {
      setUserTweets(tweets);
    } else {
      setUserTweets([]);  // If tweets is not an array or is null, set to an empty array
    }

    const allCodes = await backend.getCodes() as string[];
    const usedCodesList = allCodes.map(code => ({
      code,
      isUsed: usedCodesMap[code] ?? false,  // Check if the code is used; default to false
    }));
    setUserUsedCodes(usedCodesList);

  }, [backend]);

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

  // Function to format seconds into hours, minutes, and seconds
  const formatTime = (seconds: bigint) => {
    const hours = Number(seconds / 3600n);
    const minutes = Number((seconds % 3600n) / 60n);
    const remainingSeconds = Number(seconds % 60n);
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}, and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  };

  // Function to format object details
  const formatObjectDetails = async (mission: SerializedMission) => {
    switch (BigInt(mission.mode)) {
      case 0n:
        return `Button Name: ${mission.obj1}, Button function: ${mission.functionName1}`;
      case 1n:
        return `First Button Name: ${mission.obj1}, function: ${mission.functionName1}<br />Second Button Name: ${mission.obj2}, function: ${mission.functionName1}`;
      case 2n:
        const codes = await backend.getCodes() as string[];
        return `Input Placeholder: ${mission.obj1}<br />Button Name: ${mission.obj2}, function: ${mission.functionName1}<br />Codes:<br />${codes.map(code => `- ${code}`).join('<br />')}`;
      default:
        return "Unknown Object Details";
    }
  };

  const handleOpenModal = (user: SerializedUser) => {
    setSelectedUser(user);
    fetchUserDetails(user);
    setShowUserModal(true); // Open User Details Modal
  };

  return (
    <main>
      <div className="container">
        <br />
        <h3>User Statistics</h3>
        <br />
        <div className="search-container">
          <div className="search-left">
            <input type="text" placeholder="Search by Twitter Handle" value={searchHandle} onChange={handleSearchHandle} />
          </div>
          <div className="search-right">
            <button onClick={() => setShowCalendar(!showCalendar)}>Select Date Range</button>
            {showCalendar && (
              <DatePicker
                selected={startDate ?? undefined}
                onChange={handleDateChange}
                startDate={startDate ?? undefined}
                endDate={endDate ?? undefined}
                selectsRange
                inline
                onClickOutside={() => setShowCalendar(false)}
              />
            )}
            <button onClick={() => { setStartDate(null); setEndDate(null); }}>Reset</button>
          </div>
        </div>

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
                <td>{user.seconds.toString()} ({formatTime(BigInt(user.seconds))})</td>
                <td>{user.twitterid.toString()}</td>
                <td>{user.twitterhandle}</td>
                <td>{new Date(Number(user.creationTime) / 1_000_000).toLocaleString()}</td>
                <td><button onClick={() => handleOpenModal(user)}>In Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />
        <p>Total Amount of Missions Completed by All Users: {missionsCompleted}</p>

        {showUserModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>User Details for {selectedUser?.id}</h3>
              <h4>Mission Progress</h4>
              <ul>
                {userProgress?.map((progress, index) => (
                  <li key={index}>
                    Mission ID: {progress.missionId ?? "N/A"},
                    Done: {progress.done !== null && progress.done !== undefined ? progress.done.toString() : "N/A"},
                    Total Earned: {progress.totalearned !== null && progress.totalearned !== undefined ? progress.totalearned.toString() : "N/A"},
                    Times Completed: {progress.amountOfTimes !== null && progress.amountOfTimes !== undefined ? progress.amountOfTimes.toString() : "N/A"},
                    Timestamp: {progress.timestamp !== null && progress.timestamp !== undefined ? new Date(Number(progress.timestamp) / 1_000_000).toLocaleString() : "N/A"}
                  </li>
                ))}
              </ul>

              <h4>Tweets</h4>
              <ul>
                {userTweets.map((tweet, index) => (
                  <li key={index}>
                    Tweet ID: <a href={`https://twitter.com/user/status/${tweet[1]?.toString() ?? ""}`} target="_blank" rel="noopener noreferrer">{tweet[1] !== null && tweet[1] !== undefined ? tweet[1].toString() : "Unknown"}</a>,
                    Timestamp: {tweet[0] !== null && tweet[0] !== undefined ? new Date(Number(tweet[0]) / 1_000_000).toLocaleString() : "Unknown"}
                  </li>
                ))}
              </ul>

              <br />
              <h4>Used Codes</h4>
              <ul>
                {userUsedCodes.map((codeEntry, index) => (
                  <li key={index} style={{ backgroundColor: codeEntry.isUsed ? 'green' : 'red', color: 'white' }}>
                    Code: {codeEntry.code}, Used: {codeEntry.isUsed ? "True" : "False"}
                  </li>
                ))}
              </ul>

              <button onClick={() => setShowUserModal(false)}>Close</button> {/* Close User Modal */}
            </div>
          </div>
        )}

        {missions.length > 0 ? (
          <div className="chart-container">
            <Bar
              data={{
                labels: missions.map(mission => mission.id.toString()),
                datasets: [{
                  label: 'Number of Times Mission Completed',
                  data: missionCounts,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        ) : (
          <p>There are no missions</p>
        )}
      </div>
    </main>
  );
}

export default App;
