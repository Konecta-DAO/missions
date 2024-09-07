import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { ActorProvider, AgentProvider } from '@ic-reactor/react';
import { idlFactory, canisterId } from '../declarations/backend';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AgentProvider withProcessEnv>
        <ActorProvider idlFactory={idlFactory} canisterId={canisterId}>
          <App />
        </ActorProvider>
      </AgentProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
