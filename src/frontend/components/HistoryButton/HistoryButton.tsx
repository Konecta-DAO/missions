import React, { useState } from 'react';
import './HistoryButton.scss';
import KonectaSVG from '../../../../public/assets/History Button.svg';

interface HistoryButtonProps {
    onClick: () => void;
}

const HistoryButton: React.FC<HistoryButtonProps> = ({ onClick }) => {
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
            <img src={KonectaSVG} alt="History Button" />
        </div>
    );
};

export default HistoryButton;