import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { ActorProvider, AgentProvider } from '@ic-reactor/react';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { BrowserRouter } from 'react-router-dom';
import { IdentityKitProvider } from "@nfid/identitykit/react"
import { NFIDW } from "@nfid/identitykit"
import { GlobalProvider } from '../hooks/globalID.tsx';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground.tsx';
import Home from './pages/Home/Home.tsx';
import Missions from './pages/Missions/Missions.tsx';
import useIsMobile from '../hooks/useIsMobile.tsx';
import UsergeekProvider from '../components/UsergeekProvider.tsx';

console.log('App is starting');
const isMobile = useIsMobile();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

  <React.StrictMode>
    <GlobalProvider>
      <BrowserRouter>
        <AgentProvider withProcessEnv>
          <ActorProvider idlFactory={idlFactory} canisterId={canisterId}>
            <IdentityKitProvider signers={[NFIDW]} featuredSigner={NFIDW} >
              <UsergeekProvider>
                <RadialBackground mobile={isMobile}>
                  <Routes>
                    <Route path="/" element={<Home />} />

                  </Routes>
                </RadialBackground>
              </UsergeekProvider>
            </IdentityKitProvider>
          </ActorProvider>
        </AgentProvider>
      </BrowserRouter>
    </GlobalProvider>
  </React.StrictMode>,
);
