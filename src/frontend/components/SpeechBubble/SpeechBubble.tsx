import React, { useState, useEffect, useRef } from 'react';
import './SpeechBubble.scss';

interface SpeechBubbleProps {
    visible: boolean;
    onHide: () => void;
    content: string; // Accept the text content as a prop
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ visible, onHide, content }) => {
    const [displayedText, setDisplayedText] = useState('');
    const typingEffectRef = useRef<NodeJS.Timeout | null>(null);

    const clearTextBeforeTyping = () => {
        return new Promise<void>((resolve) => {
            setDisplayedText(''); // Clear the text
            setTimeout(() => resolve(), 0); // Ensure React processes the state change
        });
    };

    useEffect(() => {
        if (visible) {
            clearTextBeforeTyping().then(() => {
                let index = 0;

                // Adjust the content to add a space at the second character position
                const adjustedContent = content.slice(0, 1) + ' ' + content.slice(1);

                // Typing effect logic (faster typing speed)
                typingEffectRef.current = setInterval(() => {
                    if (index < adjustedContent.length) {
                        setDisplayedText((prev) => prev + adjustedContent.charAt(index));
                        index++;
                    } else {
                        if (typingEffectRef.current) clearInterval(typingEffectRef.current);
                    }
                }, 30); // Typing speed is now 30ms

            });
        } else {
            setDisplayedText('');
        }

        return () => {
            if (typingEffectRef.current) clearInterval(typingEffectRef.current);
        };
    }, [visible, onHide, content]);

    return (
        <div className={`SpeechBubble ${visible ? 'visible' : 'hidden'}`} onClick={onHide}>
            <p className={`bubbleText ${visible ? 'showText' : ''}`}>{displayedText}</p>
        </div>
    );
};

export default SpeechBubble;
