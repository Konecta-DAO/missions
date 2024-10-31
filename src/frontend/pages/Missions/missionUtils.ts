import { SerializedMission, SerializedProgress } from "../../../declarations/backend/backend.did.js";
import { SerializedMission as SerializedMissionNFID, SerializedProgress as SerializedProgressNFID } from '../../../declarations/nfid/nfid.did.js';

// Utility function to check mission completion
export const checkMissionCompletion = (userProgress: any, mission: SerializedMission): boolean => {
    if (!mission) {
        console.error("mission is undefined");
        return false;
    }

    if (!Array.isArray(userProgress)) {
        console.error("userProgress is not an array");
        return false;
    }
    const a = userProgress[0]?.some(([progressId, progress]: [bigint, SerializedProgress]) => {



        if (!mission.recursive) {
            if (progressId === mission.id) {
                return true;
            } else {
                return false;
            }
        } else {
            // Recursive Missions
            if (progressId === mission.id) {
                // Exists
                if (
                    Array.isArray(progress.completionHistory) &&
                    progress.completionHistory.length > 0
                ) {
                    // Check if any record has a timestamp greater than mission.startDate
                    const hasRecentCompletion = progress.completionHistory.some(
                        (record) => record.timestamp > mission.startDate
                    );

                    // If yes then mission is completed
                    if (hasRecentCompletion) {
                        return true;
                    } else {
                        // If not then mission is not completed
                        return false;
                    }
                } else {
                    // No completion history = mission available first time
                    return false;
                }
            }
            return false;
        }

    });
    return a;
};

export const checkMissionCompletionNfid = (userProgress: any, mission: SerializedMissionNFID): boolean => {
    if (!mission) {
        console.error("mission is undefined");
        return false;
    }

    if (!Array.isArray(userProgress)) {
        console.error("userProgress is not an array");
        return false;
    }
    const a = userProgress[0]?.some(([progressId, progress]: [bigint, SerializedProgressNFID]) => {



        if (!mission.recursive) {
            if (progressId === mission.id) {
                return true;
            } else {
                return false;
            }
        } else {
            // Recursive Missions
            if (progressId === mission.id) {
                // Exists
                if (
                    Array.isArray(progress.completionHistory) &&
                    progress.completionHistory.length > 0
                ) {
                    // Check if any record has a timestamp greater than mission.startDate
                    const hasRecentCompletion = progress.completionHistory.some(
                        (record) => record.timestamp > mission.startDate
                    );

                    // If yes then mission is completed
                    if (hasRecentCompletion) {
                        return true;
                    } else {
                        // If not then mission is not completed
                        return false;
                    }
                } else {
                    // No completion history = mission available first time
                    return false;
                }
            }
            return false;
        }

    });
    return a;
};

// Utility function to check required mission completion
export const checkRequiredMissionCompletion = (globalID: any, mission: any) => {
    let requiredMissionCompleted = true; // Assume no required mission or it's completed
    let requiredMissionTitle = '';

    const requiredMissionId = mission.requiredPreviousMissionId[0];
    // Check if the required mission is not the same as the current mission
    if (requiredMissionId !== undefined && BigInt(requiredMissionId) !== BigInt(mission.id)) {
        const requiredMissionBigInt = BigInt(requiredMissionId);
        const requiredMission = globalID.missions.find((m: any) => BigInt(m.id) === requiredMissionBigInt);
        requiredMissionTitle = requiredMission?.title ?? '';
        const b = globalID?.userProgress[0]?.some(([progressId, progress]: [bigint, SerializedProgress]) => {
            if (progressId === requiredMission.id) {
                return true;
            } else {
                return false;
            }
        });
        requiredMissionCompleted = b;

    }

    return { requiredMissionCompleted, requiredMissionTitle };
};

export const checkRequiredMissionCompletionNFID = (globalID: any, mission: any) => {
    let requiredMissionCompleted = true; // Assume no required mission or it's completed
    let requiredMissionTitle = '';

    const requiredMissionId = mission.requiredPreviousMissionId[0];
    // Check if the required mission is not the same as the current mission
    if (requiredMissionId !== undefined && BigInt(requiredMissionId) !== BigInt(mission.id)) {
        const requiredMissionBigInt = BigInt(requiredMissionId);
        const requiredMission = globalID.missions.find((m: any) => BigInt(m.id) === requiredMissionBigInt);
        requiredMissionTitle = requiredMission?.title ?? '';
        const b = globalID?.userProgress[0]?.some(([progressId, progress]: [bigint, SerializedProgressNFID]) => {
            if (progressId === requiredMission.id) {
                return true;
            } else {
                return false;
            }
        });
        requiredMissionCompleted = b;

    }

    return { requiredMissionCompleted, requiredMissionTitle };
};

// Utility function for recursive mission
export const checkRecursiveMission = (mission: any, missionCompleted: boolean) => {
    let isRecursiveMissionDarkened = false;

    if (mission.recursive && missionCompleted && BigInt(mission.endDate) !== BigInt(0)) {
        isRecursiveMissionDarkened = true;
    }

    return { isRecursiveMissionDarkened };
};
