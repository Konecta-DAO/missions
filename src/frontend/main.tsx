import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
// import { ActorProvider, AgentProvider } from '@ic-reactor/react';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { BrowserRouter } from 'react-router-dom';
import { IdentityKitProvider } from "@nfid/identitykit/react"
import { NFIDW } from "@nfid/identitykit"
import { GlobalProvider } from '../hooks/globalID.tsx';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground.tsx';
import Home from './pages/Home/Home.tsx';
import Missions from './pages/Missions/Missions.tsx';
import UsergeekProvider from '../components/UsergeekProvider.tsx';
import { IdentityKitAuthType } from "@nfid/identitykit"

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

  <React.StrictMode>
    <GlobalProvider>
      <BrowserRouter>
        {/* <AgentProvider withProcessEnv>
          <ActorProvider idlFactory={idlFactory} canisterId={canisterId}> */}
            <IdentityKitProvider signers={[NFIDW]} featuredSigner={NFIDW} signerClientOptions={{ targets: ["onpqf-diaaa-aaaag-qkeda-cai", canisterId] }} authType={IdentityKitAuthType.DELEGATION}>
              <UsergeekProvider>
                <RadialBackground mobile={false}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/Missions" element={<Missions />} />
                    <Route path="/Missions/:missionId" element={<Missions />} />
                  </Routes>
                </RadialBackground>
              </UsergeekProvider>
            </IdentityKitProvider>
          {/* </ActorProvider>
        </AgentProvider> */}
      </BrowserRouter>
    </GlobalProvider>
  </React.StrictMode>,
);
