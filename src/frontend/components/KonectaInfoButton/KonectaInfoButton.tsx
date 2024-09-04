import React, { useState } from 'react';
import './KonectaInfoButton.scss';
import KonectaSVG from '../../../../public/assets/Konecta Button.svg';

interface KonectaInfoButtonProps {
    onClick: () => void;
}

const KonectaInfoButton: React.FC<KonectaInfoButtonProps> = ({ onClick }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = () => {
        setIsPressed(true);
        onClick();
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    return (
        <div
            className={`KonectaButtonContainer ${isPressed ? 'pressed' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <img src={KonectaSVG} alt="Konecta Info Button" />
        </div>
    );
};

export default KonectaInfoButton;