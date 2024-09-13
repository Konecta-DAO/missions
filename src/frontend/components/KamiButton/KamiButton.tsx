import React, { useState } from 'react';
import './KamiButton.scss';
import KamiSVG from '../../../../public/assets/Kami Button.svg';

interface KamiButtonProps {
    onClick: () => void;
}

const KamiButton: React.FC<KamiButtonProps> = ({ onClick }) => {
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
            <img src={KamiSVG} alt="Kami Info Button" />
        </div>
    );
};

export default KamiButton;