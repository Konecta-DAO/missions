import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss';
import { ActorProvider, AgentProvider } from '@ic-reactor/react';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { IdentityKitProvider } from "@nfid/identitykit/react"
import { InternetIdentity, NFIDW } from "@nfid/identitykit"
// import "@nfid/identitykit/react/styles.css";
import { GlobalProvider } from '../hooks/globalID.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground.tsx';
import useIsMobile from '../hooks/useIsMobile.tsx';

// const isMobile = useIsMobile();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

  <React.StrictMode>
    <GlobalProvider>
      <BrowserRouter>
        <AgentProvider withProcessEnv>
          <ActorProvider idlFactory={idlFactory} canisterId={canisterId}>
            <IdentityKitProvider signers={[NFIDW, InternetIdentity]} featuredSigner={NFIDW} signerClientOptions={{ targets: ["onpqf-diaaa-aaaag-qkeda-cai"] }}>
              <Routes>
                <Route path="/" element={<App />} />
                {/* <Route path="/Missions" element={<Missions />} />
                    <Route path="/Missions/:missionId" element={<Missions />} /> */}
              </Routes>
            </IdentityKitProvider>
          </ActorProvider>
        </AgentProvider>
      </BrowserRouter>
    </GlobalProvider>
  </React.StrictMode>,
);
