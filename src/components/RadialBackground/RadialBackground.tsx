import React, { ReactNode } from 'react';
import './RadialBackground.css';
import { isMobileOnly, isTablet } from 'react-device-detect';
import { useGlobalID } from '../../hooks/globalID.tsx';

interface RadialBackgroundProps {
  children: ReactNode;
}

const RadialBackground: React.FC<RadialBackgroundProps> = ({ children }) => {
  const GlobalID = useGlobalID();
  const isNfid = GlobalID.nfid === true;

  const backgroundClass = isMobileOnly || isTablet
    ? (isNfid ? 'background-nfid-mobile' : 'background-mobile')
    : (isNfid ? 'background-nfid-desktop' : 'background-desktop');

  const overlayClass = (isMobileOnly || isTablet)
    ? (isNfid ? '' : 'overlay-mobile')
    : (isNfid ? '' : 'overlay-desktop');

  return (
    <div className={`background ${backgroundClass}`}>
      <div className={`overlay ${overlayClass}`} />
      {children}
    </div>
  );
};

export default RadialBackground;
