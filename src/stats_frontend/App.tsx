
import { Actor, HttpAgent } from '@dfinity/agent';
import React, { useEffect, useState } from 'react';
import { canisterId, idlFactory } from '../declarations/backend/index.js';
import { ConnectWallet, useIdentityKit } from '@nfid/identitykit/react';
import { Principal } from '@dfinity/principal';
import { canisterId as canistedIdNFID, idlFactory as idlFactoryNFID } from '../declarations/nfid/index.js';
import { SerializedProgress, SerializedUser } from '../declarations/nfid/nfid.did.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MadeByKami from '../../public/assets/MadeWithLoveCoffee.png';

type GetAllUsersProgressResponse = {
  total: bigint;
  data: Array<[Principal, Array<[bigint, SerializedProgress]>]>;
};

const App: React.FC = () => {

  const { identity, user, disconnect } = useIdentityKit();
  const [actor, setActor] = useState<any>(null);
  const [actorNfid, setActorNfid] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [userCreationData, setUserCreationData] = useState<Array<{ date: string; count: number }>>([]);
  const [userProgressData, setUserProgressData] = useState<Array<[Principal, Array<[bigint, SerializedProgress]>]>>([]);
  const [missionCompletionData, setMissionCompletionData] = useState<Array<{ missionId: string; missionName: string; count: number }>>([]);
  const [missionCompletionOverTimeData, setMissionCompletionOverTimeData] = useState<Array<{ date: string;[missionName: string]: number | string }>>([]);
  const [leaderBoardData, setLeaderBoardData] = useState<Array<{ principal: string; totalPoints: bigint }>>([]);



  const missionNames: { [key: string]: string } = {
    '0': 'Join the Airdrop',
    '1': 'Create a NFID Vault',
    '2': 'Top Up your NFID Vault',
    '3': 'Stake ICP with WaterNeuron',
    '10': 'Received a Bonus',
  };

  const getColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];
    return colors[index % colors.length];
  };

  const setData = async (agent: HttpAgent) => {

    if (agent) {
      const actor = Actor.createActor(idlFactory, {
        agent: agent,
        canisterId,
      });
      setActor(actor);
      const actorNfid = Actor.createActor(idlFactoryNFID, {
        agent: agent,
        canisterId: canistedIdNFID,
      });
      setActorNfid(actorNfid);
      const b = await actor.trisAdmin(user?.principal!);
      if (b) {
        const fetchedUsers: SerializedUser[] = await actorNfid.getUsers() as SerializedUser[];
        const progress = await actorNfid.getAllUsersProgress(0n, 5000n) as GetAllUsersProgressResponse;
        const data: Array<[Principal, Array<[bigint, SerializedProgress]>]> = progress.data;
        setUserProgressData(data);
        setUsers(fetchedUsers);
        setLoaded(true);

      }
    }
  };

  const processUserCreationData = () => {
    const dateCountMap: { [date: string]: number } = {};

    users.forEach(user => {
      // Convert nanoseconds to milliseconds for JavaScript Date
      const creationDate = new Date(Number(user.creationTime) / 1e6);
      // Format date as YYYY-MM-DD
      const dateStr = creationDate.toISOString().split('T')[0];
      if (dateCountMap[dateStr]) {
        dateCountMap[dateStr] += 1;
      } else {
        dateCountMap[dateStr] = 1;
      }
    });

    // Convert the map to an array and sort by date
    const chartData = Object.keys(dateCountMap)
      .sort()
      .map(date => ({
        date,
        count: dateCountMap[date],
      }));

    setUserCreationData(chartData);
  };

  const processMissionCompletionData = () => {
    const missionCounts: { [missionId: string]: number } = {};
    const missionIds = ['0', '1', '2', '3', '10'];
    missionIds.forEach(id => missionCounts[id] = 0);

    userProgressData.forEach(([principal, progressArray]) => {
      const missionsCompleted = progressArray.map(([missionId, serializedProgress]) => missionId.toString());
      missionIds.forEach(missionId => {
        if (missionsCompleted.includes(missionId)) {
          missionCounts[missionId] += 1;
        }
      });
    });

    const chartData = missionIds.map(id => ({
      missionId: id,
      missionName: missionNames[id],
      count: missionCounts[id],
    }));

    setMissionCompletionData(chartData);
  };

  const processMissionCompletionOverTimeData = () => {
    const dateMissionCountMap: { [date: string]: { [missionName: string]: number } } = {};

    userProgressData.forEach(([principal, progressArray]) => {
      progressArray.forEach(([missionId, serializedProgress]) => {
        const missionIdStr = missionId.toString();
        const missionName = missionNames[missionIdStr];

        serializedProgress.completionHistory.forEach((record) => {
          const completionDate = new Date(Number(record.timestamp) / 1e6);
          const dateStr = completionDate.toISOString().split('T')[0];

          if (!dateMissionCountMap[dateStr]) {
            dateMissionCountMap[dateStr] = {};
          }

          if (dateMissionCountMap[dateStr][missionName]) {
            dateMissionCountMap[dateStr][missionName] += 1;
          } else {
            dateMissionCountMap[dateStr][missionName] = 1;
          }
        });
      });
    });

    // Prepare data for the chart
    const chartData: Array<{ date: string;[missionName: string]: number | string }> = [];

    Object.keys(dateMissionCountMap)
      .sort()
      .forEach((date) => {
        const dataEntry: { date: string;[missionName: string]: number | string } = { date };
        Object.keys(dateMissionCountMap[date]).forEach((missionName) => {
          dataEntry[missionName] = dateMissionCountMap[date][missionName];
        });
        chartData.push(dataEntry);
      });

    setMissionCompletionOverTimeData(chartData);
  };

  const processLeaderBoardData = () => {
    const leaderBoard: Array<{ principal: string; totalPoints: bigint }> = [];

    userProgressData.forEach(([principal, progressArray]) => {
      let totalPoints = 0n;

      progressArray.forEach(([missionId, serializedProgress]) => {
        serializedProgress.completionHistory.forEach((record) => {
          totalPoints += record.pointsEarned;
        });
      });

      leaderBoard.push({ principal: principal.toText(), totalPoints });
    });

    // Sort the leaderboard by total points in descending order
    leaderBoard.sort((a, b) => Number(b.totalPoints - a.totalPoints));

    setLeaderBoardData(leaderBoard);
  };


  useEffect(() => {

    const fetchData = async () => {
      if (user?.principal && user?.principal !== Principal.fromText("2vxsx-fae") && identity !== undefined) {
        if (identity.getPrincipal().toText() !== "2vxsx-fae") {
          const agent = HttpAgent.createSync({ identity });
          if (process.env.NODE_ENV !== "production") {
            agent.fetchRootKey();
          }
          setData(agent);
        } else {
          disconnect();
        }
      }
    };
    fetchData();
  }, [user?.principal]);

  useEffect(() => {
    if (loaded && users.length > 0) {
      processUserCreationData();
    }
  }, [loaded, users]);

  useEffect(() => {
    if (userProgressData.length > 0) {
      processMissionCompletionData();
      processMissionCompletionOverTimeData();
      processLeaderBoardData();
    }
  }, [userProgressData]);


  return (
    <div style={{ width: '100%', height: '800px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>NFID Airdrop Stats</h1>
      <div>
        <ConnectWallet />
      </div>
      {loaded && (
        <div style={{ marginTop: '40px', width: '75vw' }}>
          <h2 style={{ marginBottom: '10px' }}>Users Registered Over Time. Total: {users.length}</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={userCreationData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Users" fill="#2dd4bf" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loaded && missionCompletionData.length > 0 && (
        <div style={{ marginTop: '40px', width: '75vw' }}>
          <h2 style={{ marginBottom: '10px' }}>Missions Completed</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={missionCompletionData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="missionName" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Times Completed" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loaded && missionCompletionOverTimeData.length > 0 && (
        <div style={{ marginTop: '40px', width: '75vw' }}>
          <h2 style={{ marginBottom: '10px' }}>Missions Completed Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={missionCompletionOverTimeData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {Object.values(missionNames).map((missionName, index) => (
                <Bar key={missionName} dataKey={missionName} stackId="missions" fill={getColor(index)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loaded && missionCompletionData.length > 0 && (
        <div style={{ marginTop: '40px', width: '75vw', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '10px' }}>Missions Completed</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            {missionCompletionData.map(({ missionId, missionName, count }) => (
              <li key={missionId} style={{ marginBottom: '10px', fontSize: '16px' }}>
                <strong>Mission {missionId}:</strong> {missionName} completed <span style={{ color: '#2dd4bf' }}>{count}</span> times in total
              </li>
            ))}
          </ul>
        </div>
      )}


      {loaded && leaderBoardData.length > 0 && (
        <div style={{ marginTop: '40px', width: '75vw' }}>
          <h2 style={{ marginBottom: '10px' }}>Leaderboard</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Rank</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Principal</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderBoardData.slice(0, 20).map((entry, index) => (
                <tr key={entry.principal}>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{index + 1}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{entry.principal}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{entry.totalPoints.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <br />

      {loaded && (
        <img src={MadeByKami} alt="Cool Kami Picture" style={{ width: '50%' }} />
      )}

      <br />
      <br />
      <br />
      <br />
    </div >
  );
};

export default App;

