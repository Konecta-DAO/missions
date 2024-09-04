import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground';
import Home from './pages/Home/Home';
import useIsMobile from './hooks/useIsMobile';

const App: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <RadialBackground mobile={true}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </RadialBackground>
      ) : (
        <RadialBackground mobile={false}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </RadialBackground>
      )}
    </div>
  );
};

export default App;
