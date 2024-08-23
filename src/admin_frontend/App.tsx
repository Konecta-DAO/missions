import './App.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { idlFactory as backend_idlFactory, canisterId as backend_canisterId } from './declarations/backend';
import { Actor, HttpAgent } from "@dfinity/agent";
import NFIDAuth from './NFIDAuth';
import { useNFID } from './useNFID';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SerializedUser, SerializedMission, SerializedProgress } from './types';

function App() {
  const [principalId, setPrincipalId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Statistics');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(0);
  const [missionCounts, setMissionCounts] = useState<number[]>([]);
  const [missions, setMissions] = useState<SerializedMission[]>([]);
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [searchHandle, setSearchHandle] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [newAdminId, setNewAdminId] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [missionDetails, setMissionDetails] = useState<Array<any>>([]);
  const [selectedMissionType, setSelectedMissionType] = useState<string>('Single Button Mission');
  const [missionTitle, setMissionTitle] = useState<string>('');
  const [missionDescription, setMissionDescription] = useState<string>('');
  const [buttonText, setButtonText] = useState<string>('');
  const [buttonFunctionName, setButtonFunctionName] = useState<string>('');
  const [buttonText2, setButtonText2] = useState<string>('');
  const [buttonFunctionName2, setButtonFunctionName2] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [isRecursive, setIsRecursive] = useState<boolean>(false);
  const [secondsToEarn, setSecondsToEarn] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SerializedUser | null>(null);
  const [userProgress, setUserProgress] = useState<Array<any>>([]);
  const [userTweets, setUserTweets] = useState<Array<any>>([]);
  const [userUsedCodes, setUserUsedCodes] = useState<Array<{ code: string; isUsed: boolean }>>([]);


  // Callback function to set NFIDing to false and isInitialized to true
  const handleNfidIframeInstantiated = useCallback(() => {
    setIsInitialized(true);
  }, []);

  const { nfid } = useNFID(handleNfidIframeInstantiated);

  // Create an HttpAgent and backend actor
  const agent = useMemo(() => new HttpAgent(), []);
  const backend = useMemo(() => Actor.createActor(backend_idlFactory, { agent, canisterId: backend_canisterId }), [agent]);

  // Handle successful authentication
  const handleSuccess = useCallback(async (principalId: string): Promise<void> => {
    if (!nfid) {
      console.error("NFID is not initialized");
      return;
    }

    setPrincipalId(principalId);

    // Call the backend function to check authorization
    const authorized = await backend.isAdmin(principalId) as boolean;
    if (!authorized) {
      alert("Unauthorized User");
    } else {
      setIsAuthorized(true);
      fetchData();
    }

  }, [nfid, backend]);

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
      console.log(`Progress for mission ${i}:`, progressArray); // Debugging output

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
    console.log("Final Progress List:", progressList); // Debugging output
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




  const handleOpenModal = (user: SerializedUser) => {
    setSelectedUser(user);
    fetchUserDetails(user);
    setShowModal(true);
  };

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

  // Function to format seconds into hours, minutes, and seconds
  const formatTime = (seconds: bigint) => {
    const hours = Math.floor(Number(seconds) / 3600);
    const minutes = Math.floor((Number(seconds) % 3600) / 60);
    const remainingSeconds = Number(seconds) % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}, and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  };

  // Function to format mission type
  const formatMissionType = (mode: bigint) => {
    switch (BigInt(mode)) {
      case 0n:
        return "Single Button Mission";
      case 1n:
        return "Double Button Mission";
      case 2n:
        return "Input + Button Mission";
      default:
        return "Unknown Mission Type";
    }
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

  // Handling the mission type selection
  const handleMissionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMissionType(e.target.value);
    // Reset the form fields when changing mission types
    setMissionTitle('');
    setMissionDescription('');
    setButtonText('');
    setButtonFunctionName('');
    setButtonText2('');
    setButtonFunctionName2('');
    setInputText('');
    setIsRecursive(false);
    setSecondsToEarn('');
    setImageFile(null);
    setImageError(null);
  };

  // Handling image upload and validation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Only PNG and JPG images are allowed.');
      setImageFile(null);
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) { // 1.5MB
      setImageError('Image size must be less than 1.5MB.');
      setImageFile(null);
      return;
    }

    setImageFile(file);
    setImageError(null);
  };

  // Encode image to Nat8 array
  const encodeImageToNat8 = async (file: File): Promise<number[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    return Array.from(uint8Array);  // Keep the array as numbers, not BigInt
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate inputs
    if (!missionTitle || !missionDescription || !secondsToEarn ||
      (selectedMissionType === 'Single Button Mission' && (!buttonText || !buttonFunctionName)) ||
      (selectedMissionType === 'Double Button Mission' && (!buttonText || !buttonFunctionName || !buttonText2 || !buttonFunctionName2)) ||
      (selectedMissionType === 'Input + Button Mission' && (!inputText || !buttonText || !buttonFunctionName))) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isNaN(Number(secondsToEarn)) || Number(secondsToEarn) <= 0 || !Number.isInteger(Number(secondsToEarn))) {
      alert('Seconds to earn must be a positive integer.');
      return;
    }

    if (!imageFile) {
      alert('Please upload a valid image.');
      return;
    }

    // Encode the image
    const encodedImage = await encodeImageToNat8(imageFile);

    // Determine the ID for the new mission
    const newMissionId = missions.length > 0 ? BigInt(missions[missions.length - 1].id) + 1n : 0n;

    // Concatenate mission title and description with \0 separator
    const missionDescriptionFormatted = `${missionTitle}\0${missionDescription}`;

    // Construct the parameters based on the selected mission type
    let mode: bigint;
    let obj1: string;
    let obj2: string = '';
    let functionName1: string;
    let functionName2: string = '';

    switch (selectedMissionType) {
      case 'Single Button Mission':
        mode = 0n;
        obj1 = buttonText;
        functionName1 = buttonFunctionName;
        break;
      case 'Double Button Mission':
        mode = 1n;
        obj1 = buttonText;
        obj2 = buttonText2;
        functionName1 = buttonFunctionName;
        functionName2 = buttonFunctionName2;
        break;
      case 'Input + Button Mission':
        mode = 2n;
        obj1 = inputText;
        obj2 = buttonText;
        functionName1 = '';
        functionName2 = buttonFunctionName;
        break;
      default:
        return;
    }

    // Call the backend function to add the mission
    await backend.addMission(newMissionId, mode, missionDescriptionFormatted, obj1, obj2, isRecursive, BigInt(secondsToEarn), encodedImage, functionName1, functionName2);

    // Refresh the mission list
    fetchData();
  };

  return (
    <main>
      <div className="container">
        {!isAuthorized && <h1>Login to access to the Konectª Admin Module</h1>}
        <br />
        {!isAuthorized && <NFIDAuth showButton={true} onSuccess={(principalId) => handleSuccess(principalId)} nfid={nfid} isInitialized={isInitialized} />}
        <p>{message}</p>
        {isAuthorized && (
          <div>
            <div className="tab">
              <button className={`tablinks ${activeTab === 'Statistics' ? 'active' : ''}`} onClick={() => openTab('Statistics')}>User Statistics</button>
              <button className={`tablinks ${activeTab === 'Administer' ? 'active' : ''}`} onClick={() => openTab('Administer')}>Admin Privileges</button>
            </div>

            <div id="Statistics" className={`tabcontent ${activeTab === 'Statistics' ? 'active' : ''}`}>
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

              {showModal && (
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

                    <button onClick={() => setShowModal(false)}>Close</button>
                  </div>
                </div>
              )}

              <br />
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

            <div id="Administer" className={`tabcontent ${activeTab === 'Administer' ? 'active' : ''}`}>
              <h3>Admin Privileges</h3>
              <p className="left-align">Principal IDs with Admin privileges:</p>
              <br />
              <ul className="admin-list">
                {adminIds.map((id, index) => (
                  <li key={id}>
                    {id} {index !== 0 && <button className="delete-button" onClick={() => handleDeleteAdmin(id)}>Delete</button>}
                  </li>
                ))}
              </ul>
              <br />
              <p className="left-align">Add a new Admin ID:</p>
              <input type="text" placeholder="New Admin ID" value={newAdminId} onChange={(e) => setNewAdminId(e.target.value)} />
              <button className="small-button" onClick={() => handleAddAdmin(newAdminId)}>Add</button>
              <br />
              <h3>Missions</h3>
              {missionDetails.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Mission Type</th>
                      <th>Description</th>
                      <th>Object Details</th>
                      <th>Recursive</th>
                      <th>Max Time</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missionDetails.map((mission) => (
                      <tr key={mission.id}>
                        <td>{mission.id.toString()}</td>
                        <td>{formatMissionType(mission.mode)}</td>
                        <td>{mission.description}</td>
                        <td dangerouslySetInnerHTML={{ __html: mission.objectDetails }}></td>
                        <td>{mission.recursive ? 'Yes' : 'No'}</td>
                        <td>{formatTime(mission.maxtime)}</td>

                        <td>
                          <img src={`data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(mission.image)))}`} alt="Mission" width="200" height="200" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>There are no missions</p>
              )}

              {/* New Mission Module */}
              <br />
              <p>Add a new mission</p>
              <br />

              <div className="mission-form">
                <div>
                  <label htmlFor="missionType">Mission Type: </label>
                  <select id="missionType" value={selectedMissionType} onChange={handleMissionTypeChange}>
                    <option>Single Button Mission</option>
                    <option>Double Button Mission</option>
                    <option>Input + Button Mission</option>
                  </select>
                </div>
                <br />

                <div>
                  <input type="text" placeholder="Mission Title" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} />
                </div>
                <br />

                <div>
                  <input type="text" placeholder="Mission Description" value={missionDescription} onChange={(e) => setMissionDescription(e.target.value)} />
                </div>
                <br />

                {selectedMissionType === 'Single Button Mission' && (
                  <>
                    <input type="text" placeholder="Button Text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                    <br />
                    <input type="text" placeholder="Button Function Name" value={buttonFunctionName} onChange={(e) => setButtonFunctionName(e.target.value)} />
                    <br />
                  </>
                )}

                {selectedMissionType === 'Double Button Mission' && (
                  <>
                    <input type="text" placeholder="Button 1 Text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                    <br />
                    <input type="text" placeholder="Button 1 Function Name" value={buttonFunctionName} onChange={(e) => setButtonFunctionName(e.target.value)} />
                    <br />
                    <input type="text" placeholder="Button 2 Text" value={buttonText2} onChange={(e) => setButtonText2(e.target.value)} />
                    <br />
                    <input type="text" placeholder="Button 2 Function Name" value={buttonFunctionName2} onChange={(e) => setButtonFunctionName2(e.target.value)} />
                    <br />
                  </>
                )}

                {selectedMissionType === 'Input + Button Mission' && (
                  <>
                    <input type="text" placeholder="Input Text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
                    <br />
                    <input type="text" placeholder="Button Text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                    <br />
                    <input type="text" placeholder="Button Function Name" value={buttonFunctionName} onChange={(e) => setButtonFunctionName(e.target.value)} />
                    <br />
                  </>
                )}

                <input type="checkbox" checked={isRecursive} onChange={(e) => setIsRecursive(e.target.checked)} /> Is recursive
                <br />
                <input type="text" placeholder="Seconds to earn" value={secondsToEarn} onChange={(e) => setSecondsToEarn(e.target.value)} />
                <br />

                <input type="file" accept=".png,.jpg" onChange={handleImageUpload} />
                {imageError && <p style={{ color: 'red' }}>{imageError}</p>}
                <br />

                <button className="small-button" onClick={() => {
                  if (window.confirm("Are you sure you want to submit this mission?")) {
                    handleSubmit();
                  }
                }}>Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
