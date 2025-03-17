import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import styles from './MissionModal.module.scss';
import { useNavigate } from 'react-router-dom';
import { getGradientStartColor, getGradientEndColor, rgbToRgba } from '../../../../../utils/colorUtils.ts';
import missionFunctions from '../MissionFunctionsComponent.ts';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { checkMissionCompletion, checkRequiredMissionCompletion } from '../../missionUtils.ts';
import PTWContent from './PTWContent.tsx';
import TweetEmbed from './TweetEmbed.tsx';
import Mission7View from './Mission7View.tsx';
import { useIdentityKit } from '@nfid/identitykit/react';

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
    const [inputValue, setInputValue] = useState('');
    const [placestate, setPlacestate] = useState(false);
    const { disconnect } = useIdentityKit();
    const [currentTimeNano, setCurrentTimeNano] = useState(() => {
        return BigInt(Date.now()) * 1_000_000n;
    });

    const mission = useMemo(() => {
        return globalID.missions?.find((m: { id: bigint }) => m.id === selectedMissionId);
    }, [globalID.missions, selectedMissionId]);

    if (!mission) return null;

    useEffect(() => {
        const updateTime = () => {
            setCurrentTimeNano(BigInt(Date.now()) * 1_000_000n);
        };

        updateTime();

        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (currentTimeNano >= mission?.endDate! && mission?.endDate! !== BigInt(0)) {
            closeModal();
        }
    }, [currentTimeNano]);

    if (!mission) return null;

    // Memoize background click handler
    const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (loading) return; // Do nothing if loading is true
        if ((e.target as HTMLElement).classList.contains(styles.ModalBackground)) {
            closeModal(); // Close modal only if clicked outside and not loading
        }
    }, [loading, closeModal]);

    const missionId = BigInt(mission.id);

    // Memoize gradient colors
    const gradientColors = useMemo(() => ({
        start: getGradientStartColor(Number(mission.mode)),
        end: getGradientEndColor(Number(mission.mode)),
    }), [mission.mode]);

    const missionCompleted = useMemo(() => checkMissionCompletion(globalID.userProgress, mission), [globalID.userProgress, missionId]);

    if (Number(selectedMissionId) === 7 && !missionCompleted) {
        return (
            <>
                <div className={styles.ModalBackground} onClick={handleBackgroundClick}>
                    <div className={styles.MissionModal}>

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
                        <div className={styles.MissionContent7}>
                            <Mission7View
                                mission={mission}
                                closeModal={closeModal}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }


    // Memoize mission completion checks


    const { requiredMissionCompleted } = useMemo(() => checkRequiredMissionCompletion(globalID, mission), [globalID, mission]);

    // Redirect if mission requirements not met
    useEffect(() => {
        if (!requiredMissionCompleted && !missionCompleted) {
            navigate('/');
        }
    }, [requiredMissionCompleted, missionCompleted, navigate]);



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
                await missionFunctions[functionName as keyof typeof missionFunctions](globalID, navigate, fetchData, setLoading, closeModal, mission.id, inputValue, setPlacestate, disconnect);
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
        width: '11vw',
        color: 'white',
        outline: 'none',
        background: 'black',
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
                    {/* Tweet Component */}
                    <PTWContent missionId={Number(missionId)} />
                    {/* Retweet Embed Component */}
                    <TweetEmbed missionId={Number(missionId)} />
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
