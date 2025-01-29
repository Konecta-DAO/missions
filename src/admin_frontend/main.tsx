import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss';
import { canisterId } from '../declarations/backend/index.js';
import { IdentityKitProvider } from "@nfid/identitykit/react"
import { IdentityKitAuthType, NFIDW } from "@nfid/identitykit"
import "@nfid/identitykit/react/styles.css";
import { GlobalProvider } from '../hooks/globalID.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import RadialBackground from '../components/RadialBackground/RadialBackground.tsx';

const origin = process.env.CANISTER_ID_ADMIN_FRONTEND;

const fullOrigin = "https://" + origin + ".icp0.io/";

console.log(fullOrigin);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

  <GlobalProvider>
    <BrowserRouter>
      <IdentityKitProvider signers={[NFIDW]} featuredSigner={NFIDW} signerClientOptions={{ derivationOrigin: "https://apcy6-tiaaa-aaaag-qkfda-cai.icp0.io/", targets: [canisterId, "dcdzc-hiaaa-aaaag-qm74q-cai"] }} authType={IdentityKitAuthType.DELEGATION}>
        <RadialBackground>
          <Routes>
            <Route path="/" element={<App />} />
          </Routes>
        </RadialBackground>
      </IdentityKitProvider>
    </BrowserRouter>
  </GlobalProvider>

);
