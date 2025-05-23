/* import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import styles from './MissionModal.module.scss';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { getGradientStartColor, getGradientEndColor, rgbToRgba } from '../../../../../utils/colorUtils.ts';
import missionFunctions from '../MissionFunctionsComponent.ts';
import useFetchData from '../../../../../hooks/fetchData.tsx';
import { useGlobalID } from '../../../../../hooks/globalID.tsx';
import { checkMissionCompletionDefault, checkRequiredMissionCompletionDefault } from '../../missionUtils.ts';
import { SerializedMissionV2 as SerializedMissionDefault } from '../../../../../declarations/oisy_backend/oisy_backend.did.js';
import { useIdentityKit } from '@nfid/identitykit/react';

declare global {
    interface Window {
        twttr: any;
    }
}


interface MissionModalProps {
    closeModal: () => void;
    selectedMissionId: bigint;
    canisterId: string;
}

const BASE_URL = process.env.DEV_IMG_CANISTER_ID;

const ICToolkitMissionZeroOptions = [
    { name: 'ALICE', id: 'oa5dz-haaaa-aaaaq-aaegq-cai' },
    { name: 'BOOM DAO', id: 'xomae-vyaaa-aaaaq-aabhq-cai' },
    { name: 'Catalyze', id: 'umz53-fiaaa-aaaaq-aabmq-cai' },
    { name: 'Cecil The Lion DAO', id: 'jt5an-tqaaa-aaaaq-aaevq-cai' },
    { name: 'DecideAI DAO', id: 'xvj4b-paaaa-aaaaq-aabfa-cai' },
    { name: 'DOLR AI', id: '6wcax-haaaa-aaaaq-aaava-cai' },
    { name: 'Dragginz', id: 'zqfso-syaaa-aaaaq-aaafq-cai' },
    { name: 'ELNA AI', id: 'gdnpl-daaaa-aaaaq-aacna-cai' },
    { name: 'Estate DAO', id: 'bmjwo-aqaaa-aaaaq-aac4a-cai' },
    { name: 'FomoWell', id: 'o3y74-5yaaa-aaaaq-aaeea-cai' },
    { name: 'FuelEV', id: 'nmkto-maaaa-aaaaq-aaemq-cai' },
    { name: 'Gold DAO', id: 'tr3th-kiaaa-aaaaq-aab6q-cai' },
    { name: 'IC Explorer', id: 'icx6s-lyaaa-aaaaq-aaeqa-cai' },
    { name: 'ICFC', id: 'detjl-sqaaa-aaaaq-aacqa-cai' },
    { name: 'ICLighthouse DAO', id: 'hodlf-miaaa-aaaaq-aackq-cai' },
    { name: 'ICPanda', id: 'dwv6s-6aaaa-aaaaq-aacta-cai' },
    { name: 'ICPEx', id: 'lseuu-xyaaa-aaaaq-aaeya-cai' },
    { name: 'ICPSwap', id: 'cvzxu-kyaaa-aaaaq-aacvq-cai' },
    { name: 'ICVC', id: 'ntzq5-dyaaa-aaaaq-aadtq-cai' },
    { name: 'Kinic', id: '74ncn-fqaaa-aaaaq-aaasa-cai' },
    { name: 'KongSwap', id: 'oypg6-faaaa-aaaaq-aadza-cai' },
    { name: 'Mimic', id: '4l7o7-uiaaa-aaaaq-aaa2q-cai' },
    { name: 'Motoko', id: 'k34pm-nqaaa-aaaaq-aadca-cai' },
    { name: 'Neutrinite', id: 'eqsml-lyaaa-aaaaq-aacdq-cai' },
    { name: 'NFID Wallet', id: 'mpg2i-yyaaa-aaaaq-aaeka-cai' },
    { name: 'Nuance', id: 'rqch6-oaaaa-aaaaq-aabta-cai' },
    { name: 'OpenChat', id: '2jvtu-yqaaa-aaaaq-aaama-cai' },
    { name: 'ORIGYN', id: 'lnxxh-yaaaa-aaaaq-aadha-cai' },
    { name: 'Personal DAO', id: 'iqrjl-hiaaa-aaaaq-aaeta-cai' },
    { name: 'PokedBots', id: 'ni4my-zaaaa-aaaaq-aadra-cai' },
    { name: 'Sneed', id: 'fi3zi-fyaaa-aaaaq-aachq-cai' },
    { name: 'SONIC', id: 'qgj7v-3qaaa-aaaaq-aabwa-cai' },
    { name: 'Swampies', id: 'lyqgk-ziaaa-aaaaq-aadeq-cai' },
    { name: 'TACO DAO', id: 'lhdfz-wqaaa-aaaaq-aae3q-cai' },
    { name: 'TRAX', id: 'elxqo-raaaa-aaaaq-aacba-cai' },
    { name: 'WaterNeuron', id: 'jfnic-kaaaa-aaaaq-aadla-cai' },
    { name: 'Yuku AI', id: 'auadn-oqaaa-aaaaq-aacya-cai' },
    { name: '---- (formerly known as CYCLES-TRANSFER-STATION)', id: 'igbbe-6yaaa-aaaaq-aadnq-cai' },
    { name: '---- ex Seers ----', id: 'rceqh-cqaaa-aaaaq-aabqa-cai' }
];

const MissionModal: React.FC<MissionModalProps> = ({ closeModal, selectedMissionId, canisterId }) => {
    const globalID = useGlobalID();
    const navigate = useNavigate();
    const fetchData = useFetchData();
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { disconnect } = useIdentityKit();
    const [placestate, setPlacestate] = useState(false);
    const [currentTimeNano, setCurrentTimeNano] = useState(() => {
        return BigInt(Date.now()) * 1_000_000n;
    });

    const [selectedICToolkitCanister, setSelectedICToolkitCanister] = useState(ICToolkitMissionZeroOptions[0]?.id || '');

    const mission = useMemo(() => {
        // Ensure canisterId is provided
        if (!canisterId) {
            console.error('No canisterId provided to MissionModal.');
            return null;
        }

        // Fetch missions for the specific project using canisterId
        const missionsForProject = globalID.missionsMap[canisterId] || [];
        const foundMission = missionsForProject.find(
            (m: SerializedMissionDefault) => m.id === selectedMissionId
        );

        if (!foundMission) {
            console.error(`Mission with ID ${selectedMissionId} not found for canister ${canisterId}.`);
        }

        return foundMission || null;
    }, [globalID.missionsMap, canisterId, selectedMissionId]);

    if (!mission) return null;

    const projectForGradient = useMemo(() => {
        return globalID.projects.find(p => p.id === canisterId);
    }, [globalID.projects, canisterId]);

    const isICToolkitProject = useMemo(() => {
        return projectForGradient ? projectForGradient.name.toLowerCase() === 'ictoolkit' : false;
    }, [projectForGradient]);

    useEffect(() => {
        if (mission) {
            if (isICToolkitProject && (mission.id === 0n || mission.id === 5n)) {
                const initialId = ICToolkitMissionZeroOptions[0]?.id || '';
                setSelectedICToolkitCanister(initialId);
                setInputValue(initialId);
            } else if (Number(mission.mode) !== 2) {
                setInputValue('');
            }
        }
    }, [mission, isICToolkitProject]);

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

    // Memoize background click handler
    const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (loading) return; // Do nothing if loading is true
        if ((e.target as HTMLElement).classList.contains(styles.ModalBackground)) {
            closeModal(); // Close modal only if clicked outside and not loading
        }
    }, [loading, closeModal]);

    // Memoize gradient colors
    const gradientColors = useMemo(() => {
        if (!mission) {
            return { start: '#CCCCCC', end: '#AAAAAA' };
        }
        if (isICToolkitProject) {
            return {
                start: '#651fff',
                end: '#b388ff',
            };
        }
        return {
            start: getGradientStartColor(Number(mission.mode)),
            end: getGradientEndColor(Number(mission.mode)),
        };
    }, [mission, isICToolkitProject]);

    const missionCompleted = useMemo(() => checkMissionCompletionDefault(globalID.userProgressMap, canisterId, mission), [globalID.userProgressMap, mission]);

    // Memoize mission completion checks

    const { requiredMissionCompleted } = useMemo(() => checkRequiredMissionCompletionDefault(globalID, canisterId, mission), [globalID, mission]);

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
                await missionFunctions[functionName as keyof typeof missionFunctions](globalID, fetchData, setLoading, closeModal, mission.id, inputValue, setPlacestate, disconnect);
            } catch (error) {
                console.error(`Error executing function: ${functionName}`, error);
            }
        } else {
            console.error(`Function ${functionName} not found`);
        }
    }, [globalID, fetchData, closeModal, mission, inputValue, disconnect]);

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

        if (isICToolkitProject && (mission.id === 0n || mission.id === 5n)) {
            const functionNameToExecute = mission.functionName2; // Or mission.functionName1?.[0] based on specific need
            const buttonText = mission.obj2 || 'Execute'; // Fallback button text

            return (
                <>
                    <div style={{
                        padding: '3px',
                        borderRadius: '25px',
                        background: `linear-gradient(to right, ${gradientColors.end}, ${gradientColors.start})`,
                        marginRight: '10px',
                        display: 'inline-block',
                    }}>
                        <select
                            value={selectedICToolkitCanister}
                            onChange={(e) => {
                                setSelectedICToolkitCanister(e.target.value);
                                setInputValue(e.target.value);
                            }}
                            style={{ ...missionInputStyle, width: '300px', minWidth: '200px' }}
                            disabled={loading}
                            className={styles.InputContent}
                        >
                            {ICToolkitMissionZeroOptions.map(option => (
                                <option key={option.id} value={option.id} style={{ backgroundColor: 'black', color: 'white' }}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {functionNameToExecute && (
                        <button
                            onClick={() => executeFunction(functionNameToExecute)}
                            style={buttonGradientStyle}
                            disabled={loading}
                            className={`${styles.customButton} ${loading ? styles.loadingButton : ''}`}
                        >
                            <div className={styles.buttonContent}>
                                {loading && <div className={styles.spinner} />}
                                <span className={loading ? styles.loadingText : ''}>
                                    {loading ? 'Loading...' : buttonText}
                                </span>
                            </div>
                        </button>
                    )}
                </>
            );
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
    }, [
        mission,
        missionCompleted,
        isICToolkitProject,
        selectedICToolkitCanister,
        inputValue, 
        executeFunction,
        buttonGradientStyle,
        missionInputStyle, 
        gradientColors,
        loading,
        setInputValue,
        setSelectedICToolkitCanister
    ]);



    return (
        <div className={styles.ModalBackground} onClick={handleBackgroundClick}>
            <div className={styles.MissionModal}>

                
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
                    
                    <div className={styles.MissionTitleWrapper}>
                        <div className={styles.MissionTitle}>
                            {mission.title}
                        </div>
                    </div>
                    <div className={styles.MissionBadge}>
                        
                        <svg className={styles.MissionCircle} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`circleGradient${mission.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={gradientColors.start} />
                                    <stop offset="100%" stopColor={gradientColors.end} />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="50" fill={`url(#circleGradient${mission.id})`} />
                        </svg>
                        
                        <img
                            src={`https://${BASE_URL}.raw.icp0.io${mission.iconUrl}`}
                            alt="Mission Icon"
                            className={styles.MissionIcon}
                        />
                    </div>
                </div>
                
                <div className={styles.MissionContent}>
                    <ReactMarkdown
                        children={mission.description}
                        components={{
                            a: ({ node, ...props }) => (
                                <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: gradientColors.end }}>
                                    {props.children}
                                </a>
                            ),
                        }}
                    />
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
 */