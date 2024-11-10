import React, { ReactNode } from 'react';
import './RadialBackground.css';
import { isMobileOnly, isTablet } from 'react-device-detect';
import { useGlobalID, MissionPage } from '../../hooks/globalID.tsx';

interface RadialBackgroundProps {
  children: ReactNode;
}

const RadialBackground: React.FC<RadialBackgroundProps> = ({ children }) => {
  const globalID = useGlobalID();

  const backgroundClass = isMobileOnly || isTablet
    ? (
      globalID.currentMissionPage === MissionPage.NFID
        ? 'background-nfid-mobile'
        : globalID.currentMissionPage === MissionPage.DFINITY
          ? 'background-dfinity-mobile'
          : 'background-mobile'
    )
    : (
      globalID.currentMissionPage === MissionPage.NFID
        ? 'background-nfid-desktop'
        : globalID.currentMissionPage === MissionPage.DFINITY
          ? 'background-dfinity-desktop'
          : 'background-desktop'
    );

  const overlayClass = (isMobileOnly || isTablet)
    ? (
      globalID.currentMissionPage === MissionPage.NFID || globalID.currentMissionPage === MissionPage.DFINITY
        ? ''
        : 'overlay-mobile'
    )
    : (
      globalID.currentMissionPage === MissionPage.NFID || globalID.currentMissionPage === MissionPage.DFINITY
        ? ''
        : 'overlay-desktop'
    );

  return (
    <div className={`background ${backgroundClass}`}>
      <div className={`overlay ${overlayClass}`} />
      {children}
    </div>
  );
};

export default RadialBackground;
