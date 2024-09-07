import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground';
import { EncryptionProvider } from '../components/EncryptionProvider';
import Home from './pages/Home/Home';
import Missions from './pages/Missions/Missions';
import MissionModal from './pages/Missions/MissionModal'; // Import the modal component
import useIsMobile from './hooks/useIsMobile';
import UsergeekProvider from '../components/UsergeekProvider';

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const closeModal = () => {
    navigate('/Missions'); // Make sure the modal actually closes
  };

  return (
    <EncryptionProvider>
      <UsergeekProvider>
        <RadialBackground mobile={isMobile}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Missions" element={<Missions />} />
            <Route path="/Missions/:missionId" element={<Missions />} />
          </Routes>
        </RadialBackground>
      </UsergeekProvider>
    </EncryptionProvider>
  );
};

export default App;
