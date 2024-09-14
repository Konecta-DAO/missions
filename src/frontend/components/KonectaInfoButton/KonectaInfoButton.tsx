import React, { useState } from 'react';
import './KonectaInfoButton.scss';
import KonectaSVG from '../../../../public/assets/konecta_button.svg';

interface KonectaInfoButtonProps {
    onClick: () => void;
}

const KonectaInfoButton: React.FC<KonectaInfoButtonProps> = ({ onClick }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.button !== 0) return;
        setIsPressed(true);
        onClick();
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    const handleMouseLeave = () => {
        setIsPressed(false);
    };

    return (
        <div
            className={`KonectaButtonContainer ${isPressed ? 'pressed' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <img src={KonectaSVG} alt="Konecta Info Button" />
        </div>
    );
};

export default KonectaInfoButton;