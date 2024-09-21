import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import styles from './MissionModal.module.scss';
import { useNavigate } from 'react-router-dom';
import { getGradientStartColor, getGradientEndColor, rgbToRgba } from '../../../../../utils/colorUtils.ts';
import { fetchPTWData, generatePTWContent, PTWData } from '../../../../../hooks/ptwUtils.ts';
import getTWtoRT from '../../../../../hooks/getTWtoRT.ts';
import missionFunctions from '../MissionFunctionsComponent.ts';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { checkMissionCompletion, checkRequiredMissionCompletion } from '../../missionUtils.ts';

declare global {
    interface Window {
        twttr: any;
    }
}


interface MissionModalProps {
    closeModal: () => void;
    selectedMissionId: bigint;
}

const BASE_URL = process.env.DEV_IMG_CANISTER_ID;

const MissionModal: React.FC<MissionModalProps> = ({ closeModal, selectedMissionId }) => {
    const globalID = useGlobalID();
    const navigate = useNavigate();
    const fetchData = useFetchData();
    const [loading, setLoading] = useState(false);
    const [ptwContent, setPtwContent] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [tweetId, setTweetId] = useState<string | null>(null);

    // Memoize mission selection
    const mission = useMemo(() => {
        return globalID.missions?.find((m: { id: bigint }) => m.id === selectedMissionId);
    }, [globalID.missions, selectedMissionId]);

    // Redirect if mission not found
    useEffect(() => {
        if (!mission) {
            navigate('/Missions');
        }
    }, [mission, navigate]);

    if (!mission) return null;

    useEffect(() => {
        const missionId = Number(selectedMissionId);

        // Only fetch if missionId is 4
        if (missionId !== 4) {
            return;
        }

        const fetchAndSetPTWContent = async () => {
            const data: PTWData | null = await fetchPTWData(missionId);
            const content = generatePTWContent(data);
            setPtwContent(content);
        };

        fetchAndSetPTWContent();
    }, []);

    useEffect(() => {
        const fetchTweetId = async () => {
            try {
                const id = await getTWtoRT();
                setTweetId(id);
            } catch (error) {
                console.error('Failed to fetch tweet ID', error);
            }
        };

        if (Number(selectedMissionId) === 5) {
            fetchTweetId();
        }
    }, [selectedMissionId]);

    const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
    const [isTweetVisible, setIsTweetVisible] = useState(false);
    const tweetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only proceed if selectedMissionId is 5, tweetId is present, and the tweet is visible
        if (Number(selectedMissionId) !== 5 || !tweetId || !isTweetVisible) {
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
    }, [tweetId, selectedMissionId, isTweetVisible]);

    useEffect(() => {
        if (!isTweetVisible && tweetRef.current) {
            setIsWidgetLoaded(false);
            tweetRef.current.innerHTML = '';
        }
    }, [isTweetVisible]);

    const missionId = BigInt(mission.id);

    // Memoize mission completion checks
    const missionCompleted = useMemo(() => checkMissionCompletion(globalID.userProgress, mission), [globalID.userProgress, missionId]);

    const { requiredMissionCompleted } = useMemo(() => checkRequiredMissionCompletion(globalID, mission), [globalID, mission]);

    // Redirect if mission requirements not met
    useEffect(() => {
        if (!requiredMissionCompleted && !missionCompleted) {
            navigate('/Missions');
        }
    }, [requiredMissionCompleted, missionCompleted, navigate]);

    // Memoize gradient colors
    const gradientColors = useMemo(() => ({
        start: getGradientStartColor(Number(mission.mode)),
        end: getGradientEndColor(Number(mission.mode)),
    }), [mission.mode]);

    // Handle beforeunload event
    const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
        if (loading) {
            e.preventDefault();
            e.returnValue = '';
        }
    }, [loading]);

    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleBeforeUnload]);

    // Execute mission functions
    const executeFunction = useCallback(async (functionName?: string) => {
        if (functionName && missionFunctions[functionName as keyof typeof missionFunctions]) {
            setLoading(true);
            try {
                await missionFunctions[functionName as keyof typeof missionFunctions](globalID, navigate, fetchData, setLoading, closeModal, mission.id, inputValue);
            } catch (error) {
                console.error(`Error executing function: ${functionName}`, error);
            }
        } else {
            console.error(`Function ${functionName} not found`);
        }
    }, [globalID, navigate, fetchData, closeModal]);

    // Memoize button styles
    const buttonGradientStyle = useMemo(() => ({
        backgroundImage: `linear-gradient(to right, ${gradientColors.end}, ${gradientColors.start})`,
    }), [gradientColors]);

    const missionInputStyle = useMemo(() => ({
        border: 'none',
        borderRadius: 'inherit',
        padding: '10px 20px',
        width: '9vw',
        color: 'white',
        outline: 'none',
    }), [gradientColors]);

    // Memoize button rendering
    const renderButtons = useMemo(() => {
        if (missionCompleted) {
            return <div className={styles.CompletedText}>Mission Completed!</div>;
        }

        const functionName1 = mission.functionName1?.[0];
        const functionName2 = mission.functionName2;

        const missionMode = Number(mission.mode);
        if (missionMode === 0) {
            return (
                <button
                    onClick={() => executeFunction(functionName2)}
                    style={buttonGradientStyle}
                    disabled={loading}
                    className={`${styles.customButton} ${loading ? styles.loadingButton : ''}`}
                >
                    <div className={styles.buttonContent}>
                        {loading && <div className={styles.spinner} />}
                        <span className={loading ? styles.loadingText : ''}>
                            {loading ? 'Loading...' : mission.obj2}
                        </span>
                    </div>
                </button>
            );
        }

        if (missionMode === 1) {
            return (
                <>
                    {functionName1 && (
                        <button
                            onClick={() => executeFunction(functionName1)}
                            style={buttonGradientStyle}
                            disabled={loading}
                            className={`${styles.customButton} ${loading ? styles.loadingButton : ''}`}
                        >
                            <div className={styles.buttonContent}>
                                {loading && <div className={styles.spinner} />}
                                <span className={loading ? styles.loadingText : ''}>
                                    {loading ? 'Loading...' : mission.obj1}
                                </span>
                            </div>
                        </button>
                    )}
                    {functionName2 && (
                        <button
                            onClick={() => executeFunction(functionName2)}
                            style={buttonGradientStyle}
                            disabled={loading}
                            className={`${styles.customButton} ${loading ? styles.loadingButton : ''}`}
                        >
                            <div className={styles.buttonContent}>
                                {loading && <div className={styles.spinner} />}
                                <span className={loading ? styles.loadingText : ''}>
                                    {loading ? 'Loading...' : mission.obj2}
                                </span>
                            </div>
                        </button>
                    )}
                </>
            );
        }

        if (missionMode === 2) {
            return (
                <>
                    <div style={{
                        padding: '3px',
                        borderRadius: '25px',
                        background: `linear-gradient(to right, ${gradientColors.end}, ${gradientColors.start})`,
                    }}>
                        <input type="text" placeholder={mission.inputPlaceholder[0] || ''} disabled={loading} style={missionInputStyle} className={styles.InputContent} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                    </div>
                    {functionName2 && (
                        <button
                            onClick={() => executeFunction(functionName2)}
                            style={buttonGradientStyle}
                            disabled={loading}
                            className={`${styles.customButton} ${loading ? styles.loadingButton : ''}`}
                        >
                            <div className={styles.buttonContent}>
                                {loading && <div className={styles.spinner} />}
                                <span className={loading ? styles.loadingText : ''}>
                                    {loading ? 'Loading...' : mission.obj2}
                                </span>
                            </div>
                        </button>
                    )}
                </>
            );
        }

        return null;
    }, [missionCompleted, mission, executeFunction, buttonGradientStyle, loading]);

    // Memoize background click handler
    const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (loading) return; // Do nothing if loading is true
        if ((e.target as HTMLElement).classList.contains(styles.ModalBackground)) {
            closeModal(); // Close modal only if clicked outside and not loading
        }
    }, [loading, closeModal]);

    return (
        <div className={styles.ModalBackground} onClick={handleBackgroundClick}>
            <div className={styles.MissionModal}>

                {/* Mission Image */}
                <div className={styles.MissionImageWrapper}>
                    <img
                        src={`https://${BASE_URL}.raw.icp0.io${mission.image}`}
                        alt="Mission Image"
                        className={styles.MissionImage}
                    />
                    <div
                        className={styles.GradientOverlay}
                        style={{
                            background: `linear-gradient(${rgbToRgba(gradientColors.start, 30)} 0%, transparent 100%)`
                        }}
                    />
                </div>

                {/* Gradient Line */}
                <svg className={styles.MissionLine} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`lineGradient${mission.id}`} x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" stopColor={gradientColors.start} />
                            <stop offset="100%" stopColor={gradientColors.end} />
                        </linearGradient>
                    </defs>
                    <path d="M 5 0 L 5 96 L 74 96 L 95 80 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
                </svg>

                <div>
                    {/* Mission Title */}
                    <div className={styles.MissionTitleWrapper}>
                        <div className={styles.MissionTitle}>
                            {mission.title}
                        </div>
                    </div>
                    <div className={styles.MissionBadge}>
                        {/* Gradient Circle */}
                        <svg className={styles.MissionCircle} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`circleGradient${mission.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={gradientColors.start} />
                                    <stop offset="100%" stopColor={gradientColors.end} />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="50" fill={`url(#circleGradient${mission.id})`} />
                        </svg>
                        {/* Mission Icon */}
                        <img
                            src={`https://${BASE_URL}.raw.icp0.io${mission.iconUrl}`}
                            alt="Mission Icon"
                            className={styles.MissionIcon}
                        />
                    </div>
                </div>
                {/* Mission Content */}
                <div className={styles.MissionContent}>
                    <p>{mission.description}</p>
                    {Number(selectedMissionId) === 4 && ptwContent && <p>{ptwContent}</p>}
                    {Number(selectedMissionId) === 5 && tweetId && (
                        <div className={styles.tweetEmbedContainer}>
                            <button
                                onClick={() => setIsTweetVisible(!isTweetVisible)}
                                aria-expanded={isTweetVisible}
                                aria-controls="tweetEmbed"
                                className={styles.toggleButton}
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
                    )}
                </div>

                <div className={styles.ButtonInputs}>
                    <div className={styles.MissionActions}>
                        {renderButtons}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default React.memo(MissionModal);
