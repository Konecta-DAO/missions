import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss';
import { ActorProvider, AgentProvider } from '@ic-reactor/react';
import { idlFactory, canisterId } from '../declarations/backend/index.js';
import { IdentityKitProvider } from "@nfid/identitykit/react"
import { InternetIdentity, NFIDW } from "@nfid/identitykit"
import "@nfid/identitykit/react/styles.css";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

  <React.StrictMode>
    <AgentProvider withProcessEnv>
      <ActorProvider idlFactory={idlFactory} canisterId={canisterId}>
          <IdentityKitProvider signers={[NFIDW, InternetIdentity]} featuredSigner={NFIDW} signerClientOptions={{
            targets: ["onpqf-diaaa-aaaag-qkeda-cai"]
          }}>
            <App />
          </IdentityKitProvider>
      </ActorProvider>
    </AgentProvider>
  </React.StrictMode>,
);
