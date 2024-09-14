import React, { useState, useEffect, useRef } from 'react';
import './SpeechBubble.scss';

interface SpeechBubbleProps {
    visible: boolean;
    onHide: () => void;
    content: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ visible, onHide, content }) => {
    const [displayedText, setDisplayedText] = useState('');
    const typingEffectRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear any existing typing intervals
        if (typingEffectRef.current) {
            clearInterval(typingEffectRef.current);
            typingEffectRef.current = null;
        }

        if (visible) {
            setDisplayedText(''); // Clear the displayed text

            let index = 0;

            // Typing effect logic without relying on previous state
            typingEffectRef.current = setInterval(() => {
                if (index < content.length) {
                    setDisplayedText(content.slice(0, index + 1)); // Set displayedText directly
                    index++;
                } else {
                    // Clear the interval when done
                    if (typingEffectRef.current) {
                        clearInterval(typingEffectRef.current);
                        typingEffectRef.current = null;
                    }
                }
            }, 30);
        } else {
            setDisplayedText(''); // Clear the text when not visible
        }

        return () => {
            // Cleanup the interval on unmount or when dependencies change
            if (typingEffectRef.current) {
                clearInterval(typingEffectRef.current);
                typingEffectRef.current = null;
            }
        };
    }, [visible, content]); // Removed onHide from dependencies

    return (
        <div className={`SpeechBubble ${visible ? 'visible' : 'hidden'}`} onClick={onHide}>
            <p className={`bubbleText ${visible ? 'showText' : ''}`}>{displayedText}</p>
        </div>
    );
};

export default SpeechBubble;
