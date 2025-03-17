import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { canisterId as backId } from '../declarations/backend/index.js';
import { BrowserRouter } from 'react-router-dom';
import { IdentityKitProvider } from "@nfid/identitykit/react"
import { NFIDW, InternetIdentity } from "@nfid/identitykit"
import { GlobalProvider } from '../hooks/globalID.tsx';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground.tsx';
import Home from './pages/Home/Home.tsx';
import Missions from './pages/Missions/Missions.tsx';
import UsergeekProvider from '../components/UsergeekProvider.tsx';
import { IdentityKitAuthType } from "@nfid/identitykit"
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/index/index.js';
import { SerializedProjectMissions } from '../declarations/index/index.did.js';

const frontId = process.env.CANISTER_ID_FRONTEND

const fetchTargets = async (): Promise<string[]> => {

  const agent = HttpAgent.createSync();

  const actor = Actor.createActor(idlFactory, {
    agent: agent!,
    canisterId: 'tui2b-giaaa-aaaag-qnbpq-cai',
  });

  const projects = await actor.getAllProjectMissions() as SerializedProjectMissions[];
  const targets: string[] = projects.map(project => project.canisterId.toText());
  return [backId, 'tui2b-giaaa-aaaag-qnbpq-cai', ...targets];
};

(async () => {

  // Fetch the targets from the endpoint
  const fetchedTargets = await fetchTargets();

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

    <React.StrictMode>
      <GlobalProvider>
        <BrowserRouter>
          <IdentityKitProvider signers={[NFIDW]} featuredSigner={NFIDW} signerClientOptions={{ derivationOrigin: "https://y7mum-taaaa-aaaag-qklxq-cai.icp0.io/", targets: fetchedTargets, idleOptions: { idleTimeout: 604800000 }, }} authType={IdentityKitAuthType.DELEGATION}>
            <UsergeekProvider>
              <RadialBackground>
                <Routes>
                  <Route path="/" element={<Missions />} />
                  <Route path="/:projectSlug/:missionSlug" element={<Missions />} />
                  <Route path="/:projectSlug" element={<Missions />} />
                  <Route path="/konnect" element={<Home />} />
                </Routes>
              </RadialBackground>
            </UsergeekProvider>
          </IdentityKitProvider>
        </BrowserRouter>
      </GlobalProvider>
    </React.StrictMode>,
  );

})();
