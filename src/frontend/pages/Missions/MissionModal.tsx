import React, { useEffect } from 'react';
import styles from './MissionModal.module.scss';
import { useNavigate } from 'react-router-dom';
import { getGradientStartColor, getGradientEndColor, rgbToRgba } from '../../../utils/colorUtils.ts';
import usePTWData from '../../../hooks/usePTWData.tsx';
import useTWtoRT from '../../../hooks/useTWtoRT.tsx';
import MissionFunctionsComponent from './MissionFunctionsComponent.tsx';

interface MissionModalProps {
    closeModal: () => void;
    selectedMissionId: bigint;
    globalID: any;
}

const BASE_URL = "https://onpqf-diaaa-aaaag-qkeda-cai.raw.icp0.io";

const MissionModal: React.FC<MissionModalProps> = ({ closeModal, selectedMissionId, globalID }) => {
    const missions = globalID.missions;
    const mission = missions ? missions.find((m: { id: bigint; }) => m.id === selectedMissionId) : undefined;
    const navigate = useNavigate();

    useEffect(() => {
        if (!mission) {
            navigate('/Missions');
        }
    }, [mission, navigate]);

    if (!mission) return null;

    const missionId = BigInt(mission.id);
    const missionCompleted = globalID.userProgress?.some(([idTuple]: any) => {
        const id = Array.isArray(idTuple) ? idTuple[0] : idTuple;
        return BigInt(id) === missionId;
    }) ?? false;

    let requiredMissionCompleted = true;
    const requiredMissionId = mission.requiredPreviousMissionId?.[0];

    if (requiredMissionId !== undefined) {
        requiredMissionCompleted = globalID.userProgress?.some(([idTuple]: any) => {
            const id = Array.isArray(idTuple) ? idTuple[0] : idTuple;
            return BigInt(id) === BigInt(requiredMissionId);
        }) ?? false;
    }

    const isAvailableMission = !missionCompleted && requiredMissionCompleted;

    // If mission is not available, navigate away
    useEffect(() => {
        if (!isAvailableMission) {
            navigate('/Missions');
        }
    }, [isAvailableMission, navigate]);


    const gradientStartColor = getGradientStartColor(Number(mission.mode));
    const gradientEndColor = getGradientEndColor(Number(mission.mode));

    const renderButtons = () => {
        if (missionCompleted) {
            return <div className={styles.CompletedText}>Mission Completed!</div>;
        }

        const functionName1 = mission.functionName1?.[0];
        const functionName2 = mission.functionName2;

        const buttonGradientStyle = {
            backgroundImage: `linear-gradient(to right, ${gradientEndColor}, ${gradientStartColor})`,
        };

        const executeFunction = (functionName: string | undefined) => {
            if (functionName && MissionFunctionsComponent[functionName as keyof typeof MissionFunctionsComponent]) {
                MissionFunctionsComponent[functionName as keyof typeof MissionFunctionsComponent](globalID);
            } else {
                console.error(`Function ${functionName} not found`);
            }
        };

        const missionMode = Number(mission.mode);
        if (missionMode === 0) {
            return (
                <>
                    <button onClick={() => executeFunction(functionName2)} style={buttonGradientStyle}>
                        {mission.obj2}
                    </button>
                </>
            );
        }

        if (missionMode === 1 || missionMode === 2 || missionMode === 3) {
            return (
                <>
                    {functionName1 && (
                        <button onClick={() => executeFunction(functionName1)} style={buttonGradientStyle}>
                            {mission.obj1}
                        </button>
                    )}
                    {functionName2 && (
                        <button onClick={() => executeFunction(functionName2)} style={buttonGradientStyle}>
                            {mission.obj2}
                        </button>
                    )}
                </>
            );
        }

        return null;
    };

    // Embed the tweet iframe

    const renderRecursiveMissionOverlay = () => {
        if (mission.recursive && missionCompleted && BigInt(mission.endDate) !== BigInt(0)) {
            const countdownText = `Mission resets at ${new Date(Number(mission.endDate)).toLocaleString()}`;
            return <div className={styles.RecursiveMissionOverlay}>{countdownText}</div>;
        }
        return null;
    };

    const renderTweetEmbed = () => {
        const { tweetId, loading: tweetLoading, error: tweetError } = useTWtoRT();

        if (!tweetId) return null;
        if (tweetError) return <div>Error loading tweet</div>;

        return (
            <div className={styles.TweetEmbedWrapper}>
                <blockquote className="twitter-tweet">
                    <a href={`https://twitter.com/i/web/status/${tweetId}`}></a>
                </blockquote>
                <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
            </div>
        );
    };

    // Render custom content for PTW (Particular to mission 4)
    const { renderPTWContent } = usePTWData(Number(selectedMissionId));

    // Handle background click (closes modal when clicking outside the modal content)
    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if ((e.target as HTMLElement).classList.contains(styles.ModalBackground)) {
            closeModal(); // Close modal only if clicked outside the modal content
        }
    };

    return (
        <div className={styles.ModalBackground} onClick={handleBackgroundClick}>
            <div className={styles.MissionModal}>
                {/* Close Button */}
                <button className={styles.CloseButton} onClick={closeModal}>
                    &times;
                </button>

                {/* Mission Image */}
                <div className={styles.MissionImageWrapper}>
                    <img src={`${BASE_URL}${mission.image}`} alt="Mission Image" className={styles.MissionImage} />
                    <div
                        className={styles.GradientOverlay}
                        style={{
                            background: `linear-gradient(${rgbToRgba(gradientStartColor, 30)} 0%, transparent 100%)`
                        }}
                    />
                </div>

                {/* Gradient Line */}
                <svg className={styles.MissionLine} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`lineGradient${mission.id}`} x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" stopColor={getGradientStartColor(Number(mission.mode))} />
                            <stop offset="100%" stopColor={getGradientEndColor(Number(mission.mode))} />
                        </linearGradient>
                    </defs>
                    <path d="M 5 0 L 5 96 L 74 96 L 95 80 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
                </svg>

                {/* Mission Title */}
                <div className={styles.MissionTitleWrapper}>
                    <div className={styles.MissionTitle}>
                        {mission.title}
                    </div>
                </div>

                {/* Mission Content */}
                <div className={styles.MissionContent}>
                    <p>{mission.description}</p>
                    {Number(selectedMissionId) === 4 && renderPTWContent()}
                    {Number(selectedMissionId) === 5 && renderTweetEmbed()}
                </div>

                {renderRecursiveMissionOverlay()}

                <div className={styles.ButtonInputs}>
                    <div className={styles.MissionActions}>{renderButtons()}</div>
                </div>

            </div>
        </div>
    );
};

export default MissionModal;
