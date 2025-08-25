import React from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { Toaster } from 'react-hot-toast';
import './index.scss';
import { canisterId as backId } from '../declarations/backend/index.js';
import { BrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { IdentityKitProvider, useIdentityKit } from "@nfid/identitykit/react";
import { NFIDW, InternetIdentity } from "@nfid/identitykit";
import { GlobalProvider } from '../hooks/globalID.tsx';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground.tsx';
import Home from './pages/Home/Home.tsx';
import UsergeekProvider from '../components/UsergeekProvider.tsx';
import { IdentityKitAuthType } from "@nfid/identitykit";
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/index/index.js';
import ProjectExplorerPage from './pages/Missions/ProjectExplorer/ProjectExplorerPage.tsx';
import { Principal } from '@dfinity/principal';
import ProjectViewPage from './ProjectViewPage/ProjectViewPage.tsx';
import MainLayout from './pages/Missions/Components/MainLayout/MainLayout.tsx';
import ProtectedRouteLayout from './pages/Missions/Components/ProtectedRouteLayout/ProtectedRouteLayout.tsx';
import UserDashboardPage from './pages/Missions/Components/UserDashboardPage/UserDashboardPage.tsx';

type Env = "TEST" | "PROD";
let environment: Env = "TEST";

// @ts-ignore
export const IndexCanisterId = environment === "PROD" ? 'tui2b-giaaa-aaaag-qnbpq-cai' : 'q3itu-vqaaa-aaaag-qngyq-cai';
// @ts-ignore
export const derivationOrigin = environment === "PROD" ? "https://pre.konecta.one" : "https://y7mum-taaaa-aaaag-qklxq-cai.icp0.io";

const NavigateToKonnectOrFallback: React.FC = () => {
  const { identity, user } = useIdentityKit();
  const location = useLocation();

  const isAuthenticated = !!(user?.principal && user.principal.toText() !== "2vxsx-fae" && identity);

  if (!isAuthenticated && location.pathname !== "/konnect") {
    return <Navigate to="/konnect" state={{ from: location }} replace />;
  }

  return <ProjectExplorerPage />;
};


const fetchTargets = async (): Promise<string[]> => {
  const agent = HttpAgent.createSync();

  const actor = Actor.createActor(idlFactory, {
    agent: agent!,
    canisterId: IndexCanisterId,
  });

  const projectPrincipals = await actor.getProjects() as Principal[];
  // console.log(projectPrincipals);
  const targets: string[] = projectPrincipals.map(principal => principal.toText());
  // console.log(targets);
  return [backId, IndexCanisterId, ...targets];
};

(async () => {
  const fetchedTargets = await fetchTargets();

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <GlobalProvider>
        <BrowserRouter>
          <IdentityKitProvider
            signers={[NFIDW, InternetIdentity]}
            featuredSigner={NFIDW}
            signerClientOptions={{
              derivationOrigin: derivationOrigin,
              targets: fetchedTargets,
              idleOptions: { idleTimeout: 604800000 },
            }}
            authType={IdentityKitAuthType.DELEGATION}
          >
            <UsergeekProvider>
              <RadialBackground>
                <Routes>
                  {/* Route for Home (Konnect) - NO TopBar */}
                  <Route path="/konnect" element={<Home />} />

                  {/* Routes WITH TopBar, nested under MainLayout */}
                  <Route element={<ProtectedRouteLayout />}>
                    <Route path="/" element={<ProjectExplorerPage />} />
                    <Route path="/projects" element={<ProjectExplorerPage />} />
                    <Route path="/project/:projectCanisterId/:projectSlug?" element={<ProjectViewPage />} />
                    <Route path="/project/:projectCanisterId/:projectSlug?/mission/:missionId/:missionSlug?" element={<ProjectViewPage />} />
                    <Route path="/dashboard" element={<UserDashboardPage />} />
                  </Route>

                  {/* Fallback for any other unmatched route */}
                  <Route path="*" element={<NavigateToKonnectOrFallback />} />
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