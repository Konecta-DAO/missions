import React, { ReactNode } from 'react';
import './RadialBackground.css';

interface RadialBackgroundProps {
  children: ReactNode;
  mobile: boolean;
}

const RadialBackground: React.FC<RadialBackgroundProps> = ({ children, mobile }) => {
  return (
    <div className={`background ${mobile ? 'background-mobile' : 'background-desktop'}`}>
      <div className={`overlay ${mobile ? 'overlay-mobile' : 'overlay-desktop'}`} />
      {children}
    </div>
  );
};

export default RadialBackground;
