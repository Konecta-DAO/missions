import React from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { Toaster } from 'react-hot-toast';
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

type Env = "TEST" | "PROD";
let environment: Env = "TEST";

// @ts-ignore
export const IndexCanisterId = environment === "PROD" ? 'tui2b-giaaa-aaaag-qnbpq-cai' : 'q3itu-vqaaa-aaaag-qngyq-cai';
// @ts-ignore
export const derivationOrigin = environment === "PROD" ? "https://pre.konecta.one" : "https://y7mum-taaaa-aaaag-qklxq-cai.icp0.io";

const fetchTargets = async (): Promise<string[]> => {

  const agent = HttpAgent.createSync();

  const actor = Actor.createActor(idlFactory, {
    agent: agent!,
    canisterId: IndexCanisterId,
  });

  const projectPrincipals = await actor.getProjects() as { toText: () => string }[];
  // Map the principals to their text representations
  const targets: string[] = projectPrincipals.map(principal => principal.toText());
  return [backId, IndexCanisterId, ...targets];
};

(async () => {

  // Fetch the targets from the endpoint
  const fetchedTargets = await fetchTargets();

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

    <React.StrictMode>
      <GlobalProvider>
        <BrowserRouter>
          <IdentityKitProvider signers={[NFIDW]} featuredSigner={NFIDW} signerClientOptions={{ derivationOrigin: derivationOrigin, targets: fetchedTargets, idleOptions: { idleTimeout: 604800000 }, }} authType={IdentityKitAuthType.DELEGATION}>
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

      {createPortal(
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 7500,
            style: {
              zIndex: 99999,
              padding: '16px 24px',
              fontSize: '16px',
              minWidth: '280px',
              maxWidth: '90vw',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
          }}
        />,
        document.body,
      )}
    </React.StrictMode>,
  );

})();
