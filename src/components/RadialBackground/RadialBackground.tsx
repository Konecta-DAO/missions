import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface RadialBackgroundProps {
  children: ReactNode;
  mobile: boolean; // Add mobile prop
}

const Background = styled.div<{ mobile: boolean }>`
  position: absolute; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ mobile }) =>
    mobile
      ? `radial-gradient(circle at center -15%, 
            #AF63C7 0%, 
            #9556B5 11%, 
            #6E429A 31%, 
            #553589 47%, 
            #4D3183 57%, 
            #412C6E 63%, 
            #2A2347 76%, 
            #222038 83%, 
            #0F0026 100%)`
      : `radial-gradient(circle at center -67%, 
            #AF63C7 0%, 
            #9556B5 11%, 
            #6E429A 31%, 
            #553589 47%, 
            #4D3183 57%, 
            #412C6E 63%, 
            #2A2347 76%, 
            #222038 83%, 
            #0F0026 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Overlay = styled.div<{ mobile: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  min-width: 100%;
  min-height: 100%;
  background-image: ${({ mobile }) =>
    mobile ? 'url(./assets/BG2ndLinesMobile.svg)' : 'url(./assets/BG2ndLines.svg)'};
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  opacity: ${({ mobile }) => (mobile ? 0.8 : 0.67)};
  pointer-events: none;
  mix-blend-mode: overlay;
`;

const RadialBackground: React.FC<RadialBackgroundProps> = ({ children, mobile }) => {
  return (
    <Background mobile={mobile}>
      <Overlay mobile={mobile} />
      {children}
    </Background>
  );
};

export default RadialBackground;
