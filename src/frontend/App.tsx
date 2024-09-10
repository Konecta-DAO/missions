import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground.tsx';
import Home from './pages/Home/Home.tsx';
import Missions from './pages/Missions/Missions.tsx';
import useIsMobile from '../hooks/useIsMobile.tsx';
import UsergeekProvider from '../components/UsergeekProvider.tsx';

const App: React.FC = () => {
  const isMobile = useIsMobile();

  return (

      <UsergeekProvider>
        <RadialBackground mobile={isMobile}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Missions" element={<Missions />} />
            <Route path="/Missions/:missionId" element={<Missions />} />
          </Routes>
        </RadialBackground>
      </UsergeekProvider>

  );
};

export default App;
