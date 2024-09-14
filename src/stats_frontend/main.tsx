import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss';
// import { ActorProvider, AgentProvider } from '@ic-reactor/react';
import { idlFactory, canisterId } from '../declarations/backend/index.js';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <AgentProvider withProcessEnv>
      <ActorProvider idlFactory={idlFactory} canisterId={canisterId}> */}
        <App />
      {/* </ActorProvider>
    </AgentProvider> */}
  </React.StrictMode>,
);
