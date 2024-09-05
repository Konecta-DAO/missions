import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground';
import { EncryptionProvider } from '../components/EncryptionProvider';
import Home from './pages/Home/Home';
import Missions from './pages/Missions/Missions';
import useIsMobile from './hooks/useIsMobile';

const App: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <EncryptionProvider>
      <div>
        {isMobile ? (
          <RadialBackground mobile={true}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Missions" element={<Missions />} />
            </Routes>
          </RadialBackground>
        ) : (
          <RadialBackground mobile={false}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Missions" element={<Missions />} />
            </Routes>
          </RadialBackground>
        )}
      </div>
    </EncryptionProvider>
  );
};

export default App;
