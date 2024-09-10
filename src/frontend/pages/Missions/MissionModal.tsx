import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MissionModal.module.scss';
import { getGradientStartColor, getGradientEndColor, rgbToRgba } from '../../../utils/colorUtils.ts';
import MissionFunctionsComponent from './MissionFunctionsComponent.tsx';
import usePTWData from '../../../hooks/usePTWData.tsx';
import useTWtoRT from '../../../hooks/useTWtoRT.tsx';
import { useGlobalID } from '../../../hooks/globalID.tsx';

interface MissionModalProps {
    closeModal: () => void;
    selectedMissionId: bigint;
    loading: boolean;
}
const globalID = useGlobalID();
const BASE_URL = "https://onpqf-diaaa-aaaag-qkeda-cai.raw.icp0.io";

const MissionModal: React.FC<MissionModalProps> = ({ closeModal, selectedMissionId, loading, }) => {

    const missions = globalID.missions;
    const mission = missions ? missions.find(m => m.id === selectedMissionId) : undefined;
    if (!mission) return null;

    const navigate = useNavigate();

    const missionId = BigInt(mission.id);

    // Check if the current mission has been completed
    const missionCompleted = globalID.userProgress?.some(([id]) => {
        return BigInt(id) === missionId;
    }) ?? false;

    let requiredMissionCompleted = true; // Assume no required mission or it's completed

    // Check if there's a required previous mission
    const requiredMissionId = mission.requiredPreviousMissionId?.[0]; // Safely get required previous mission ID if it exists

    if (requiredMissionId !== undefined) {
        const requiredMissionBigInt = BigInt(requiredMissionId); // Convert to BigInt if defined

        // Check if the required mission is completed
        requiredMissionCompleted = globalID.userProgress?.some(([id]) => {
            return BigInt(id) === requiredMissionBigInt;
        }) ?? false;
    }

    const isAvailableMission = !missionCompleted && requiredMissionCompleted;

    useEffect(() => {
        if (!isAvailableMission) {
            navigate('/Missions');
        }
    }, [loading, requiredMissionCompleted, navigate]);


    if (Array.isArray(mission.requiredPreviousMissionId) && mission.requiredPreviousMissionId.length > 0) {
        const requiredMissionId = mission.requiredPreviousMissionId[0];
        requiredMissionCompleted = globalID.userProgress?.some(([id]) => id === requiredMissionId) ?? false;
    }

    const { renderPTWContent } = usePTWData(Number(selectedMissionId));
    const { tweetId, loading: tweetLoading, error: tweetError } = useTWtoRT();

    // Close the modal when clicking outside
    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const target = e.target as HTMLElement; // Cast e.target to HTMLElement
        if (target.className === styles.ModalBackground) {
            //            navigate('/Missions');
            closeModal();
        }
    };

    if (!mission) return null;

    const gradientStartColor = getGradientStartColor(Number(mission.mode));
    const gradientEndColor = getGradientEndColor(Number(mission.mode));

    const renderButtons = () => {
        const missionCompleted = globalID.userProgress?.some(([id]) => id === BigInt(mission.id)) ?? false;

        if (missionCompleted) {
            return <div className={styles.CompletedText}>Already Completed</div>;
        }

        const missionMode = Number(mission.mode);
        const functionName1 = Array.isArray(mission.functionName1) && mission.functionName1.length > 0
            ? mission.functionName1[0]
            : undefined;
        const functionName2 = typeof mission.functionName2 === 'string' ? mission.functionName2 : undefined;

        const executeFunction = (functionName: string | undefined) => {
            if (functionName && MissionFunctionsComponent[functionName as keyof typeof MissionFunctionsComponent]) {
                MissionFunctionsComponent[functionName as keyof typeof MissionFunctionsComponent]();
            } else {
                console.error(`Function ${functionName} not found`);
            }
        };

        // Gradient Background

        const buttonGradientStyle = {
            backgroundImage: `linear-gradient(to right, ${gradientEndColor}, ${gradientStartColor})`,
        };

        let svgLines = null;
        if (missionMode === 0) {
            // One line for mode 0
            svgLines = (
                <svg className={styles.MissionLine2} viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`lineGradient${mission.id}-small`} x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" stopColor={gradientStartColor} />
                            <stop offset="100%" stopColor={gradientEndColor} />
                        </linearGradient>
                    </defs>
                    <rect x="0" y="72" width="55" height="6" fill="url(#lineGradient1-small)"></rect>
                </svg>
            );
        } else if (missionMode === 1 || missionMode === 2 || missionMode === 3) {
            // Two lines for modes 1, 2, 3
            svgLines = (
                <svg className={styles.MissionLine2} viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`lineGradient${mission.id}-small`} x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" stopColor={gradientStartColor} />
                            <stop offset="100%" stopColor={gradientEndColor} />
                        </linearGradient>
                    </defs>
                    <rect x="0" y="30" width="55" height="6" fill="url(#lineGradient1-small)"></rect>
                    <rect x="0" y="72" width="55" height="6" fill="url(#lineGradient1-small)"></rect>
                </svg>
            );
        }

        if (missionMode === 0) {
            return (
                <>
                    {svgLines}
                    <button onClick={() => executeFunction(functionName2)} style={buttonGradientStyle}>
                        {mission.obj2}
                    </button>
                </>
            );
        }

        if (missionMode === 1) {
            return (
                <>
                    {svgLines}
                    <button onClick={() => executeFunction(functionName1)} style={buttonGradientStyle}>
                        {mission.obj1}
                    </button>
                    <button onClick={() => executeFunction(functionName2)} style={buttonGradientStyle}>
                        {mission.obj2}
                    </button>
                </>
            );
        }

        if (missionMode === 2 || missionMode === 3) {
            return (
                <>
                    {svgLines}
                    <div className={styles.InputButtonWrapper}>
                        <input type="text" placeholder="Enter Code" />
                        <button onClick={() => executeFunction(functionName2)} style={buttonGradientStyle}>
                            {mission.obj2}
                        </button>
                    </div>
                </>
            );
        }

        return null;
    };


    // Embed the tweet iframe
    const renderTweetEmbed = () => {
        if (loading || !tweetId) return null;
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


    return (
        <div className={styles.ModalBackground} onClick={handleBackgroundClick}>
            <div className={styles.MissionModal}>
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
                    <path d="M 5 0 L 5 96 L 74 96 L 95 80 L 95 0" stroke={`url(#lineGradient${mission.id})`} strokeWidth="10" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" fill="none" />
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

                <div className={styles.ButtonInputs}>
                    <div className={styles.MissionActions}>{renderButtons()}</div>
                </div>

            </div>
        </div>
    );
};

export default MissionModal;
