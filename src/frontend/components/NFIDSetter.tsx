// src/components/NFIDSetter.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalID } from '../../hooks/globalID.tsx';

const NFIDSetter: React.FC = () => {
    const navigate = useNavigate();
    const globalID = useGlobalID();
    useEffect(() => {
        globalID.setNfid(true);
        navigate('/Missions');
    }, [globalID, navigate]);
    return null;
};

export default NFIDSetter;
