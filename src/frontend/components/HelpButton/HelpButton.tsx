import React, { useState } from 'react';
import './HelpButton.scss';
import QuestionSVG from '../../../../public/assets/question_button.svg';

interface HelpButtonProps {
    onClick: () => void;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
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
            className={`HelpButtonContainer ${isPressed ? 'pressed' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <img src={QuestionSVG} alt="Help Button" />
        </div>
    );
};

export default HelpButton;