import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { canisterId as backId } from '../declarations/backend/index.js';
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

const frontId = process.env.CANISTER_ID_FRONTEND

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

  <React.StrictMode>
    <GlobalProvider>
      <BrowserRouter>
        <IdentityKitProvider signers={[NFIDW]} featuredSigner={NFIDW} signerClientOptions={{ derivationOrigin: "https://" + frontId + ".icp0.io", targets: [backId], idleOptions: { idleTimeout: 86400000 }, }} authType={IdentityKitAuthType.DELEGATION}>
          <UsergeekProvider>
            <RadialBackground>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Missions" element={<Missions />} />
                <Route path="/Missions/:missionId" element={<Missions />} />
              </Routes>
            </RadialBackground>
          </UsergeekProvider>
        </IdentityKitProvider>
      </BrowserRouter>
    </GlobalProvider>
  </React.StrictMode>,
);
