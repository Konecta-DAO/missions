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

  // State for Add Mission form
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonFunctionName, setButtonFunctionName] = useState('');
  const [buttonText2, setButtonText2] = useState('');
  const [buttonFunctionName2, setButtonFunctionName2] = useState('');
  const [inputText, setInputText] = useState('');
  const [isRecursive, setIsRecursive] = useState(false);
  const [secondsToEarn, setSecondsToEarn] = useState('');

  const [formattedTime, setFormattedTime] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SerializedUser | null>(null);
  const [userProgress, setUserProgress] = useState<Array<any>>([]);
  const [userTweets, setUserTweets] = useState<Array<any>>([]);
  const [userUsedCodes, setUserUsedCodes] = useState<Array<{ code: string; isUsed: boolean }>>([]);
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress

  const [editMissionFields, setEditMissionFields] = useState({
    title: '',
    description: '',
    obj1: '',
    obj2: '',
    functionName1: '',
    functionName2: '',
    maxtime: '',
    recursive: false,
  });

  const [missionToEdit, setMissionToEdit] = useState<SerializedMission | null>(null);

  const memoizedMissionToEdit = useMemo(() => missionToEdit, [missionToEdit]);

  const validateMissionForm = (mission: {
    mode: bigint;
    title: string;
    description: string;
    obj1: string;
    obj2: string;
    functionName1: string;
    functionName2: string;
    maxtime: bigint;
    recursive: boolean;
  }) => {

    // Validate title
    if (!mission.title || mission.title.trim() === '') {
      return { isValid: false, message: "Mission title is required." };
    }

    // Validate description
    if (!mission.description || mission.description.trim() === '') {
      return { isValid: false, message: "Mission description is required." };
    }

    // Validate different mission modes (Single Button, Double Button, Input + Button)
    if (mission.mode === 0n) { // Single Button Mission
      if (!mission.obj1 || !mission.functionName1) {
        return { isValid: false, message: "Button text and function name are required for Single Button Mission." };
      }
    } else if (mission.mode === 1n) { // Double Button Mission
      if (!mission.obj1 || !mission.obj2 || !mission.functionName1 || !mission.functionName2) {
        return { isValid: false, message: "Both button texts and function names are required for Double Button Mission." };
      }
    } else if (mission.mode === 2n) { // Input + Button Mission
      if (!mission.obj1 || !mission.obj2 || !mission.functionName2) {
        return { isValid: false, message: "Input text, button text, and function name are required for Input + Button Mission." };
      }
    }

    // Validate max time
    if (!mission.maxtime || isNaN(Number(mission.maxtime)) || Number(mission.maxtime) <= 0) {
      return { isValid: false, message: "Max time must be a positive number." };
    }

    return { isValid: true, message: "" };
  };


  // Handle form submission
  const handleUpdateMission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form behavior

    const formData = new FormData(e.target as HTMLFormElement);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const updatedMission = {
      id: memoizedMissionToEdit?.id ?? 0n, 
      mode: memoizedMissionToEdit?.mode ?? 0n, 
      title,
      description,
      obj1: formData.get("obj1") as string,
      obj2: formData.get("obj2") as string,
      functionName1: formData.get("functionName1") as string,
      functionName2: formData.get("functionName2") as string,
      maxtime: BigInt(formData.get("maxtime") as string), 
      recursive: formData.get("recursive") === "on", 
    };

    // Validate the mission data
    const validationResult = validateMissionForm(updatedMission);
    if (!validationResult.isValid) {
      alert(validationResult.message); 
      return;
    }

    try {
      // Concatenate title and description for backend submission
      const combinedDescription = `${updatedMission.title}\0${updatedMission.description}`;

      await backend.addMission(
        updatedMission.id,
        updatedMission.mode,
        combinedDescription, 
        updatedMission.obj1,
        updatedMission.obj2,
        updatedMission.recursive,
        Number(updatedMission.maxtime),
        memoizedMissionToEdit?.image ?? "", 
        updatedMission.functionName1,
        updatedMission.functionName2
      );

      setShowMissionModal(false);
      fetchData(); // Refresh the mission list
      alert('Mission updated successfully!');
    } catch (error) {
      console.error('Error updating mission:', error);
      alert('Failed to update mission.');
    }
  };

  const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
    const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
        onClose();
      }
    };

    return (
      <div className="modal-backdrop" onClick={handleClickOutside}>
        <div className="modal">
          <div className="modal-content">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // NFID iFrame Instantiated
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

  const parseMissionTitleAndDescription = (description: string) => {
    const parts = description.split('\0');
    return {
      title: parts[0] || '',
      description: parts[1] || ''
    };
  };

   // Function to switch tabs
  const openTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleOpenModal = (user: SerializedUser) => {
    setSelectedUser(user);
    fetchUserDetails(user);
    setShowUserModal(true); // Open User Details Modal
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

  const handleOpenModifyModal = (mission: SerializedMission) => {
    const { title, description } = parseMissionTitleAndDescription(mission.description);

    setMissionToEdit(mission);
    setEditMissionFields({
      title,
      description,
      obj1: mission.obj1,
      obj2: mission.obj2,
      functionName1: mission.functionName1,
      functionName2: mission.functionName2,
      maxtime: mission.maxtime.toString(),
      recursive: mission.recursive,
    });

    setShowMissionModal(true);
  };

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
    const hours = Number(seconds / 3600n);
    const minutes = Number((seconds % 3600n) / 60n);
    const remainingSeconds = Number(seconds % 60n);
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

  // Handle image upload and get the image URL
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Only PNG and JPG images are allowed.');
      setImageFile(null);
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setImageError('Image size must be less than 1.5MB.');
      setImageFile(null);
      return;
    }

    setIsImageUploading(true);  // Start image upload
    setUploadProgress(0);       // Reset progress bar

    try {
      const imageContent = new Uint8Array(await file.arrayBuffer());
      const imageName = file.name;

      // Simulating progress
      setUploadProgress(30);
      const imageUrl = await backend.uploadMissionImage(imageName, Array.from(imageContent)) as string;
      setUploadProgress(100);  // Upload completed

      setImageFile(imageUrl);  // Set uploaded image URL
      setImageError(null);     // Clear error state
    } catch (error) {
      console.error("Image upload failed:", error);
      setImageError("Image upload failed. Please try again.");
    } finally {
      setIsImageUploading(false);  // End image upload
    }
  };

  const handleDeleteMission = async (missionId: bigint) => {
    if (missionId >= 0n) {
      const confirmed = window.confirm("Are you sure you want to delete this mission?");
      if (confirmed) {
        try {
          await backend.deleteMission(missionId);  // Delete the mission using the passed missionId
          fetchData();  // Re-fetch the data to update the mission list
          alert('Mission deleted successfully!');
        } catch (error) {
          console.error("Failed to delete mission:", error);
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check if the image is still uploading
    if (isImageUploading) {
      alert("Image is still uploading. Please wait until the upload is complete.");
      return;
    }

    // Ensure all inputs are valid
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

    // Ensure imageFile is correctly set
    if (!imageFile) {
      alert('Please upload a valid image.');
      return;
    }

    try {
      // Use image URL from backend
      const imageUrl = imageFile;

      // Determine the ID for the new mission
      const newMissionId = missions.length > 0 ? BigInt(missions[missions.length - 1].id) + 1n : 0n;

      // Concatenate mission title and description with \0 separator
      const missionDescriptionFormatted = `${missionTitle}\0${missionDescription.trim()}`;

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
      await backend.addMission(newMissionId, mode, missionDescriptionFormatted, obj1, obj2, isRecursive, BigInt(secondsToEarn), imageUrl, functionName1, functionName2);

      // Refresh the mission list
      fetchData();
      alert('Mission added successfully!');
    } catch (error) {
      console.error("Mission submission failed:", error);
      alert('Mission submission failed. Please try again.');
    }
  }, [editMissionFields]);

  return (
    <main>
      <div className="container">
        {!isAuthorized && <h1>Login to access the Konecta Admin Module</h1>}
        <br />
        {!isAuthorized && <NFIDAuth showButton={true} onSuccess={(principalId) => handleSuccess(principalId)} nfid={nfid} isInitialized={isInitialized} />}
        {isAuthorized && (
          <div>
            <div className="tab">
              <button className={`tablinks ${activeTab === 'Statistics' ? 'active' : ''}`} onClick={() => openTab('Statistics')}>User Statistics</button>
              <button className={`tablinks ${activeTab === 'Administer' ? 'active' : ''}`} onClick={() => openTab('Administer')}>Administer WebApp</button>
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

            <div id="Administer" className={`tabcontent ${activeTab === 'Administer' ? 'active' : ''}`}>
              <h3>Admin Privileges</h3>
              <p className="left-align">Principal IDs with Admin privileges:</p>
              <ul className="admin-list">
                {adminIds.map((id, index) => (
                  <li key={id}>
                    {id} {index !== 0 && <button className="delete-button" onClick={() => handleDeleteAdmin(id)}>Delete</button>}
                  </li>
                ))}
              </ul>

              <p className="left-align">Add a new Admin ID:</p>
              <input type="text" placeholder="New Admin ID" value={newAdminId} onChange={(e) => setNewAdminId(e.target.value)} />
              <button className="small-button" onClick={() => handleAddAdmin(newAdminId)}>Add</button>

              <h3>Missions</h3>
              {missionDetails.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Mission Type</th>
                      <th>Description</th>
                      <th>Object Details</th>
                      <th>Recursive</th>
                      <th>Max Time</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missionDetails.map((mission, index) => {
                      const { title, description } = parseMissionTitleAndDescription(mission.description);
                      return (
                        <tr key={mission.id.toString()}>
                          <td>{mission.id.toString()}</td>
                          <td>{title}</td>
                          <td>{formatMissionType(mission.mode)}</td>
                          <td>{description}</td>
                          <td dangerouslySetInnerHTML={{ __html: mission.objectDetails }}></td>
                          <td>{mission.recursive ? 'Yes' : 'No'}</td>
                          <td>{formatTime(mission.maxtime)}</td>
                          <td>
                            <img src={`https://onpqf-diaaa-aaaag-qkeda-cai.raw.icp0.io${mission.image}`} alt="Mission" width="200" height="200" />
                          </td>
                          <td>
                            <button onClick={() => handleOpenModifyModal(mission)}>Modify</button> {/* Modify button */}
                            {mission.id >= 0n && (
                              <button onClick={() => handleDeleteMission(mission.id)}>Delete</button>
                            )} {/* Delete button */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>There are no missions</p>
              )}

              <br />
              <p>Add a new mission</p>
              <br />

              <form onSubmit={handleSubmit}>
                <div className="mission-form">
                  <div>
                    <label htmlFor="missionType">Mission Type: </label>
                    <select
                      id="missionType"
                      value={selectedMissionType}
                      onChange={(e) => setSelectedMissionType(e.target.value)}
                    >
                      <option>Single Button Mission</option>
                      <option>Double Button Mission</option>
                      <option>Input + Button Mission</option>
                    </select>
                  </div>
                  <br />

                  <div>
                    <input
                      type="text"
                      placeholder="Mission Title"
                      value={missionTitle}
                      onChange={(e) => setMissionTitle(e.target.value)}
                    />
                  </div>
                  <br />

                  <div>
                    <input
                      type="text"
                      placeholder="Mission Description"
                      value={missionDescription}
                      onChange={(e) => setMissionDescription(e.target.value)}
                    />
                  </div>
                  <br />

                  {selectedMissionType === 'Single Button Mission' && (
                    <>
                      <input
                        type="text"
                        placeholder="Button Text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                      />
                      <br />
                      <input
                        type="text"
                        placeholder="Button Function Name"
                        value={buttonFunctionName}
                        onChange={(e) => setButtonFunctionName(e.target.value)}
                      />
                      <br />
                    </>
                  )}

                  {selectedMissionType === 'Double Button Mission' && (
                    <>
                      <input
                        type="text"
                        placeholder="Button 1 Text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                      />
                      <br />
                      <input
                        type="text"
                        placeholder="Button 1 Function Name"
                        value={buttonFunctionName}
                        onChange={(e) => setButtonFunctionName(e.target.value)}
                      />
                      <br />
                      <input
                        type="text"
                        placeholder="Button 2 Text"
                        value={buttonText2}
                        onChange={(e) => setButtonText2(e.target.value)}
                      />
                      <br />
                      <input
                        type="text"
                        placeholder="Button 2 Function Name"
                        value={buttonFunctionName2}
                        onChange={(e) => setButtonFunctionName2(e.target.value)}
                      />
                      <br />
                    </>
                  )}

                  {selectedMissionType === 'Input + Button Mission' && (
                    <>
                      <input
                        type="text"
                        placeholder="Input Text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                      <br />
                      <input
                        type="text"
                        placeholder="Button Text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                      />
                      <br />
                      <input
                        type="text"
                        placeholder="Button Function Name"
                        value={buttonFunctionName}
                        onChange={(e) => setButtonFunctionName(e.target.value)}
                      />
                      <br />
                    </>
                  )}

                  <input
                    type="checkbox"
                    checked={isRecursive}
                    onChange={(e) => setIsRecursive(e.target.checked)}
                  />{" "}
                  Is recursive
                  <br />

                  <input
                    type="text"
                    placeholder="Seconds to earn"
                    value={secondsToEarn}
                    onChange={(e) => setSecondsToEarn(e.target.value)}
                  />
                  <br />

                  <input type="file" accept=".png,.jpg" onChange={handleImageUpload} />
                  {imageError && <p style={{ color: "red" }}>{imageError}</p>}
                  <br />

                  <button className="small-button" type="submit">
                    Submit
                  </button>
                </div>
              </form>

            </div>

            {/* Modal for editing mission */}
            {showMissionModal && (
              <Modal key={missionToEdit?.id} onClose={() => setShowMissionModal(false)}>
                <h2>Edit Mission</h2>
                <form onSubmit={handleUpdateMission}>
                  <label>Title</label>
                  <input name="title" type="text" defaultValue={editMissionFields.title} />

                  <label>Description</label>
                  <textarea name="description" defaultValue={editMissionFields.description} />

                  <label>Button Text 1</label>
                  <input name="obj1" type="text" defaultValue={editMissionFields.obj1} />

                  <label>Button Text 2</label>
                  <input name="obj2" type="text" defaultValue={editMissionFields.obj2} />

                  <label>Function Name 1</label>
                  <input name="functionName1" type="text" defaultValue={editMissionFields.functionName1} />

                  <label>Function Name 2</label>
                  <input name="functionName2" type="text" defaultValue={editMissionFields.functionName2} />

                  <label>Max Time (Seconds)</label>
                  <input name="maxtime" type="text" defaultValue={editMissionFields.maxtime} />

                  <button type="submit">Update Mission</button>
                </form>
              </Modal>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;