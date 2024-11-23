import React, { ReactNode } from 'react';
import './RadialBackground.css';
import { isMobileOnly, isTablet } from 'react-device-detect';
import { useGlobalID } from '../../hooks/globalID.tsx';

interface RadialBackgroundProps {
  children: ReactNode;
}

const RadialBackground: React.FC<RadialBackgroundProps> = ({ children }) => {
  const globalID = useGlobalID();

  const backgroundClass = isMobileOnly || isTablet
    ? ('background-mobile')
    : ('background-desktop');

  const overlayClass = (isMobileOnly || isTablet)
    ? ('overlay-mobile')
    : ('overlay-desktop');

  return (
    <div className={`background ${backgroundClass}`}>
      <div className={`overlay ${overlayClass}`} />
      {children}
    </div>
  );
};

export default RadialBackground;
