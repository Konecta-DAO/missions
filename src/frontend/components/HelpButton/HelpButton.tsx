import React, { useState } from 'react';
import './HelpButton.scss';
import QuestionSVG from '../../../../public/assets/Question Mark Button.svg';

interface HelpButtonProps {
    onClick: () => void;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
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
            className={`HelpButtonContainer ${isPressed ? 'pressed' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <img src={QuestionSVG} alt="Help Button" />
        </div>
    );
};

export default HelpButton;