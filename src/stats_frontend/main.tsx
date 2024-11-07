import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss';
import "@nfid/identitykit/react/styles.css";
import { IdentityKitProvider } from '@nfid/identitykit/react';
import { IdentityKitAuthType, NFIDW } from '@nfid/identitykit';
import { canisterId } from '../declarations/backend/index.js';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <IdentityKitProvider signers={[NFIDW]} featuredSigner={NFIDW} signerClientOptions={{ targets: [canisterId, 'dcdzc-hiaaa-aaaag-qm74q-cai'] }} authType={IdentityKitAuthType.DELEGATION}>
      <App />
    </IdentityKitProvider>
  </React.StrictMode>,
);
