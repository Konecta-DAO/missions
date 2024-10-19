import React, { useState, useEffect, useRef } from 'react';
import './JackpotRoller.css'; // Import the CSS for styling

interface JackpotRollerProps {
    targetNumber: number; // Number between 1 and 9
    svgList: string[]; // Array of 9 SVGs
    size?: number; // Size in pixels (optional, default: 200)
    rollingDuration?: number; // Duration of the rolling in milliseconds (optional, default: 3000)
    rollingInterval?: number; // Interval between rolls in milliseconds (optional, default: 100)
}

const JackpotRoller: React.FC<JackpotRollerProps> = ({
    targetNumber,
    svgList,
    size = 300,
    rollingDuration = 3000,
    rollingInterval = 100,
}) => {
    // Validate props
    if (targetNumber < 1 || targetNumber > 9) {
        throw new Error('targetNumber must be between 1 and 9.');
    }

    if (svgList.length !== 9) {
        throw new Error('svgList must contain exactly 9 SVGs.');
    }

    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Start rolling
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % 9);
        }, rollingInterval);

        // Stop rolling after rollingDuration
        timeoutRef.current = setTimeout(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setCurrentIndex(targetNumber - 1);
        }, rollingDuration);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [targetNumber, rollingDuration, rollingInterval]);

    return (
        <div
            className="jackpot-roller-container"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid #000', // Optional: add a border
                borderRadius: '10px', // Optional: rounded corners
            }}
        >
            <div
                className="jackpot-roller-inner"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    transform: `translateY(-${currentIndex * size}px)`,
                    transition: `transform ${rollingInterval}ms linear`,
                }}
            >
                {svgList.map((svg, index) => (
                    <div key={index} style={{ width: `${size}px`, height: `${size}px` }}>
                        <img src={svg} alt={`SVG ${index + 1}`} style={{ width: '100%', height: '100%' }} />
                    </div>
                ))}
                {/* Duplicate the SVGs to allow seamless looping */}
                {svgList.map((svg, index) => (
                    <div key={`duplicate-${index}`} style={{ width: `${size}px`, height: `${size}px` }}>
                        <img src={svg} alt={`SVG duplicate ${index + 1}`} style={{ width: '100%', height: '100%' }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JackpotRoller;
