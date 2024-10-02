import React, { useEffect, useRef, useState } from 'react';
import './OpenChatSuccessOverlay.css';
import imageSrc from '../../../../public/assets/OC-Kami-Celebrate-Full.png';



interface OpenChatSuccessOverlayProps {
    message: string;
    onClose: () => void;
}

interface Particle {
    x: number;
    y: number;
    r: number;
    d: number;
    color: string;
    tilt: number;
    tiltAngleIncremental: number;
    tiltAngle: number;
    draw: () => void;
    update: () => void;
}

function randomFromTo(from: number, to: number): number {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

function createConfettiParticle(
    context: CanvasRenderingContext2D,
    W: number,
    H: number,
    possibleColors: string[],
    i: number,
    maxConfettis: number
): Particle {
    const particle: Particle = {
        x: Math.random() * W,
        y: Math.random() * H - H,
        r: randomFromTo(11, 33),
        d: Math.random() * maxConfettis + 11,
        color: possibleColors[Math.floor(Math.random() * possibleColors.length)],
        tilt: Math.floor(Math.random() * 33) - 11,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
        draw() {
            context.beginPath();
            context.lineWidth = this.r / 2;
            context.strokeStyle = this.color;
            context.moveTo(this.x + this.tilt + this.r / 3, this.y);
            context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
            context.stroke();
        },
        update() {
            this.tiltAngle += this.tiltAngleIncremental;
            this.y += (Math.cos(this.d) + 3 + this.r / 2) / 2;
            this.tilt = Math.sin(this.tiltAngle - i / 3) * 15;

            if (this.y > H) {
                this.x = Math.random() * W;
                this.y = -30;
                this.tilt = Math.floor(Math.random() * 10) - 20;
            }
        },
    };

    return particle;
}

const OpenChatSuccessOverlay: React.FC<OpenChatSuccessOverlayProps> = ({ message, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        // Function to set the --vh custom property
        const setVhProperty = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        // Initial setting of --vh
        setVhProperty();

        let resizeTimeout: number;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(setVhProperty, 100);
        };

        // Update --vh on resize
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        let W = window.innerWidth;
        let H = window.innerHeight;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        const maxConfettis = 150;
        const particles: Particle[] = [];

        const possibleColors = [
            'DodgerBlue',
            'OliveDrab',
            'Gold',
            'Pink',
            'SlateBlue',
            'LightBlue',
            'Gold',
            'Violet',
            'PaleGreen',
            'SteelBlue',
            'SandyBrown',
            'Chocolate',
            'Crimson',
        ];

        // Initialize particles
        for (let i = 0; i < maxConfettis; i++) {
            particles.push(createConfettiParticle(context, W, H, possibleColors, i, maxConfettis));
        }

        let animationFrameId: number;

        const Draw = () => {
            context.clearRect(0, 0, W, H);

            // Draw and update each particle
            particles.forEach((particle) => {
                particle.draw();
                particle.update();
            });

            animationFrameId = requestAnimationFrame(Draw);
        };

        canvas.width = W;
        canvas.height = H;
        Draw();

        const handleResize = () => {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="full-screen-overlay" onClick={onClose}>
            <div className="overlayO"></div>
            <canvas ref={canvasRef} id="canvas"></canvas>
            <div className={`image-container ${imageLoaded ? 'animate-move-up' : ''}`}>
                <div className="image-wrapper">
                    <img
                        src={imageSrc}
                        className="moving-image"
                        alt="Overlay"
                        onLoad={() => setImageLoaded(true)}
                    />
                    <div className={`overlay-text ${imageLoaded ? 'animate-text' : ''}`}>{message}</div>
                </div>
            </div>
        </div>
    );
};

export default OpenChatSuccessOverlay;
