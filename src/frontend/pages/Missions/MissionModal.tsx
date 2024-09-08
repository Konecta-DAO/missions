import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MissionModal.module.scss';
import { getGradientStartColor, getGradientEndColor, rgbToRgba } from '../../../utils/colorUtils';
import MissionFunctionsComponent from './MissionFunctionsComponent';
import { SerializedMission, SerializedProgress } from '../../../declarations/backend/backend.did';
import { Principal } from '@dfinity/principal';
import usePTWData from '../../hooks/usePTWData';

interface MissionModalProps {
    missions: SerializedMission[];           // Array of SerializedMission
    closeModal: () => void;                  // Function to close the modal
    selectedMissionId: bigint;               // The selected mission's ID
    userProgress: Array<[bigint, SerializedProgress]> | null;
    loading: boolean;
    principalId: Principal | null;
    backendActor: any;
}

const BASE_URL = "https://onpqf-diaaa-aaaag-qkeda-cai.raw.icp0.io";

const MissionModal: React.FC<MissionModalProps> = ({ missions, selectedMissionId, userProgress, closeModal, loading, principalId, backendActor }) => {



    const mission = missions.find(m => m.id === selectedMissionId);
    if (!mission) return null;
    const navigate = useNavigate();
    let requiredMissionCompleted = true;

    const { renderPTWContent } = usePTWData(Number(selectedMissionId));

    if (Array.isArray(mission.requiredPreviousMissionId) && mission.requiredPreviousMissionId.length > 0) {
        const requiredMissionId = mission.requiredPreviousMissionId[0];
        requiredMissionCompleted = userProgress?.some(([id]) => id === requiredMissionId) ?? false;
    }

    useEffect(() => {
        if (!loading && !requiredMissionCompleted) {
            navigate('/Missions');
        }
    }, [loading, requiredMissionCompleted, navigate]);

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
        const missionCompleted = userProgress?.some(([id]) => id === BigInt(mission.id)) ?? false;

        if (missionCompleted) {
            return <div className={styles.CompletedText}>Already Completed</div>;
        }

        const missionMode = Number(mission.mode);
        const functionName1 = Array.isArray(mission.functionName1) && mission.functionName1.length > 0
            ? mission.functionName1[0]
            : undefined;
        const functionName2 = typeof mission.functionName2 === 'string' ? mission.functionName2 : undefined;

        const executeFunction = (functionName: string | undefined, navigate: (path: string) => void) => {
            if (functionName && MissionFunctionsComponent[functionName as keyof typeof MissionFunctionsComponent]) {
                MissionFunctionsComponent[functionName as keyof typeof MissionFunctionsComponent](principalId, backendActor, missions, navigate);
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
                    <button onClick={() => executeFunction(functionName2, navigate)} style={buttonGradientStyle}>
                        {mission.obj2}
                    </button>
                </>
            );
        }

        if (missionMode === 1) {
            return (
                <>
                    {svgLines}
                    <button onClick={() => executeFunction(functionName1, navigate)} style={buttonGradientStyle}>
                        {mission.obj1}
                    </button>
                    <button onClick={() => executeFunction(functionName2, navigate)} style={buttonGradientStyle}>
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
                        <button onClick={() => executeFunction(functionName2, navigate)} style={buttonGradientStyle}>
                            {mission.obj2}
                        </button>
                    </div>
                </>
            );
        }

        return null;
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
                </div>

                <div className={styles.ButtonInputs}>
                    <div className={styles.MissionActions}>{renderButtons()}</div>
                </div>

            </div>
        </div>
    );
};

export default MissionModal;
