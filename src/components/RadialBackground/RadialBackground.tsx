import React, { ReactNode } from 'react';
import './RadialBackground.css';
import { isMobileOnly, isTablet } from 'react-device-detect';

interface RadialBackgroundProps {
  children: ReactNode;
}



const RadialBackground: React.FC<RadialBackgroundProps> = ({ children }) => {
  return (
    <div className={`background ${isMobileOnly || isTablet ? 'background-mobile' : 'background-desktop'}`}>
      <div className={`overlay ${isMobileOnly || isTablet ? 'overlay-mobile' : 'overlay-desktop'}`} />
      {children}
    </div>
  );
};

export default RadialBackground;
