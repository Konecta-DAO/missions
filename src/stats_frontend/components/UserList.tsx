import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SerializedGlobalUser } from '../../declarations/index/index.did.js';

interface UserListProps {
  users: SerializedGlobalUser[];
  onUserSelect: (user: SerializedGlobalUser) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onUserSelect }) => {
  const [searchHandle, setSearchHandle] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const handleSearchHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchHandle(event.target.value);
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const filteredUsers = users.filter(user => {
    const matchesHandle = user.twitterhandle[0]?.toLowerCase().includes(searchHandle.toLowerCase());
    const matchesDate = (!startDate || new Date(Number(user.creationTime) / 1_000_000) >= startDate) && (!endDate || new Date(Number(user.creationTime) / 1_000_000) <= endDate);
    return matchesHandle && matchesDate;
  });

  return (
    <div>
      <div className="search-container">
        <div className="search-left">
          <input type="text" placeholder="Search by Twitter Handle" value={searchHandle} onChange={handleSearchHandle} />
        </div>
        <div className="search-right">
          <button onClick={() => setShowCalendar(!showCalendar)}>Select Date Range</button>
          {showCalendar}
          <button onClick={() => { setStartDate(null); setEndDate(null); }}>Reset</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Seconds</th>
            <th>Twitter ID</th>
            <th>Twitter Handle</th>
            <th>Creation Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {/*filteredUsers?.map(user => (
            <tr key={user.id.toString()}>
              <td>{user.twitterid.toString()}</td>
              <td>{user.twitterhandle}</td>
              <td>{new Date(Number(user.creationTime) / 1_000_000).toLocaleString()}</td>
              <td><button onClick={() => onUserSelect(user)}>In Detail</button></td>
            </tr>
          ))*/}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
