import React from 'react';
import { MissionPage, useGlobalID } from '../../../../../hooks/globalID.tsx';

import KonectaLogo from '../../../../../../public/assets/Konecta Logo.svg';
import NFIDAirdrop from '../../../../../../public/assets/NFID_Airdrop.svg';
import DFINITYLogo from '../../../../../../public/assets/ICP2LinesLogo.svg';

import './ToggleMissionsComponent.css';

const ToggleMissionsComponent: React.FC = () => {

    const globalID = useGlobalID();


    const handleToggle = () => {
        globalID.setCurrentMissionPage(globalID.previousMissionPage);
    };

    return (
        <div
            onClick={handleToggle}
            className="toggle-missions-component"
            role="button"
            title="Toggle Mission"
        >
            <img
                src={globalID.currentMissionPage === MissionPage.MAIN
                    ? KonectaLogo
                    : globalID.currentMissionPage === MissionPage.NFID
                        ? NFIDAirdrop
                        : DFINITYLogo}
                alt={'Logo'}
                className="toggle-image"
                width={175}
                height={34}
            />
        </div>
    );
};

export default ToggleMissionsComponent;
