import React, { ReactNode } from 'react';
import './RadialBackground.css';
import useIsMobile from '../../hooks/useIsMobile.tsx';

interface RadialBackgroundProps {
  children: ReactNode;
}



const RadialBackground: React.FC<RadialBackgroundProps> = ({ children }) => {
  const mobile = useIsMobile();
  return (
    <div className={`background ${mobile ? 'background-mobile' : 'background-desktop'}`}>
      <div className={`overlay ${mobile ? 'overlay-mobile' : 'overlay-desktop'}`} />
      {children}
    </div>
  );
};

export default RadialBackground;
