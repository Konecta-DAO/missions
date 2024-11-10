import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MissionPage, useGlobalID } from '../../hooks/globalID.tsx';

const DFINITYSetter: React.FC = () => {
    const navigate = useNavigate();
    const globalID = useGlobalID();
    useEffect(() => {
        globalID.setCurrentMissionPage(MissionPage.DFINITY);
        navigate('/Missions');
    }, [globalID, navigate]);
    return null;
};

export default DFINITYSetter;
