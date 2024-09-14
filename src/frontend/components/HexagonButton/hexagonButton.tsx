import React, { useState } from 'react';
import './hexagonButton.scss';

interface InfoButtonProps {
    onClick: () => void;
    src: string;
    name: string;
}

const HexagonButton: React.FC<InfoButtonProps> = ({ onClick, src, name }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
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
        <a
            className={`KonectaButtonContainer ${isPressed ? 'pressed' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <img src={src} alt={name} />
        </a>
    );
};

export default HexagonButton;