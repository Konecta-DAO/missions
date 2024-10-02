import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './MissionModal.module.scss';
import getTWtoRT from '../../../../../hooks/getTWtoRT.ts';

interface TweetEmbedProps {
    missionId: number;
}

declare global {
    interface Window {
        twttr: any;
    }
}

const TweetEmbed: React.FC<TweetEmbedProps> = ({ missionId }) => {
    const [tweetId, setTweetId] = useState<string | null>(null);
    const [isWidgetLoaded, setIsWidgetLoaded] = useState<boolean>(false);
    const [isTweetVisible, setIsTweetVisible] = useState<boolean>(false);
    const tweetRef = useRef<HTMLDivElement>(null);

    // Fetch Tweet ID when missionId is 5
    useEffect(() => {
        if (missionId !== 5) return;

        const fetchTweetId = async () => {
            try {
                const id = await getTWtoRT();
                setTweetId(id);
            } catch (error) {
                console.error('Failed to fetch tweet ID', error);
            }
        };

        fetchTweetId();
    }, [missionId]);

    // Load Twitter widget when tweetId is available and tweet is visible
    useEffect(() => {
        if (missionId !== 5 || !tweetId || !isTweetVisible) {
            return;
        }

        const loadTwitterWidget = () => {
            if (window.twttr && window.twttr.widgets && tweetRef.current) {
                window.twttr.widgets
                    .createTweet(tweetId, tweetRef.current, {
                        theme: 'dark',
                        cards: 'hidden',
                        width: '550px',
                        conversation: 'none',
                        dnt: true,
                    })
                    .then(() => {
                        setIsWidgetLoaded(true);
                    })
                    .catch((err: unknown) => {
                        console.error('Error adding Tweet:', err);
                    });
            }
        };

        // Check if the Twitter script is already present
        if (window.twttr && window.twttr.widgets) {
            loadTwitterWidget();
        } else {
            const existingScript = document.querySelector(
                'script[src="https://platform.twitter.com/widgets.js"]'
            );
            if (!existingScript) {
                const script = document.createElement('script');
                script.src = 'https://platform.twitter.com/widgets.js';
                script.async = true;
                script.onload = loadTwitterWidget;
                script.onerror = () => {
                    console.error('Failed to load Twitter widgets script.');
                };
                document.body.appendChild(script);
            } else {
                existingScript.addEventListener('load', loadTwitterWidget);
                existingScript.addEventListener('error', () => {
                    console.error('Failed to load Twitter widgets script.');
                });
            }
        }

        // Cleanup event listeners on unmount
        return () => {
            const existingScript = document.querySelector(
                'script[src="https://platform.twitter.com/widgets.js"]'
            );
            if (existingScript) {
                existingScript.removeEventListener('load', loadTwitterWidget);
                existingScript.removeEventListener('error', () => { });
            }
        };
    }, [tweetId, missionId, isTweetVisible]);

    // Clear tweet content when it's hidden
    useEffect(() => {
        if (!isTweetVisible && tweetRef.current) {
            setIsWidgetLoaded(false);
            tweetRef.current.innerHTML = '';
        }
    }, [isTweetVisible]);

    const toggleTweetVisibility = useCallback(() => {
        setIsTweetVisible((prev) => !prev);
    }, []);

    if (missionId !== 5 || !tweetId) return null;

    return (
        <div className={styles.tweetEmbedContainer}>
            <button
                onClick={toggleTweetVisibility}
                aria-expanded={isTweetVisible}
                aria-controls="tweetEmbed"
                className={styles.toggleButton}
                disabled={false}
            >
                {isTweetVisible ? 'Hide Tweet' : 'Show Tweet'}
            </button>

            {isTweetVisible && (
                <div className={styles.scrollableContainer}>
                    {!isWidgetLoaded && <div>Loading tweet...</div>}
                    <div
                        id="tweetEmbed"
                        ref={tweetRef}
                        className={styles.tweetEmbed}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default React.memo(TweetEmbed);
