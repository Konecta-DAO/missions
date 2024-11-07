import React from 'react';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';

import KonectaLogo from '../../../../../../public/assets/Konecta Logo.svg';
import NFIDAirdrop from '../../../../../../public/assets/NFID_Airdrop.svg';

import './ToggleMissionsComponent.css';

const ToggleMissionsComponent: React.FC = () => {

    const globalID = useGlobalID();
    const isNfid = globalID.nfid;

    const handleToggle = () => {
        globalID.setNfid(!isNfid);
    };

    return (
        <div
            onClick={handleToggle}
            className="toggle-missions-component"
            aria-pressed={isNfid}
            role="button"
            title="Toggle Mission"
        >
            <img
                src={isNfid ? KonectaLogo : NFIDAirdrop}
                alt={isNfid ? 'Konecta Logo' : 'NFIDAirdrop'}
                className="toggle-image"
                width={175} // Adjust size as needed
                height={34} // Adjust size as needed
            />
        </div>
    );
};

export default ToggleMissionsComponent;
