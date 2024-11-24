import { SerializedMission, SerializedProgress } from "../../../declarations/backend/backend.did.js";
import { SerializedMission as SerializedMissionDefault, SerializedProgress as SerializedProgressDefault } from '../../../declarations/nfid/nfid.did.js';

// Utility function to check mission completion
export const checkMissionCompletion = (userProgress: any, mission: SerializedMission): boolean => {
    if (!mission) {
        return false;
    }

    if (!Array.isArray(userProgress)) {
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

export const checkMissionCompletionDefault = (userProgressMap: { [key: string]: Array<[bigint, SerializedProgressDefault]> | null }, projectId: string, mission: SerializedMissionDefault): boolean => {

    const progressListNested = userProgressMap[projectId];

    if (!progressListNested || progressListNested.length === 0) {
        return false;
    }

    // Explicitly specify the type of progressList after flattening
    const progressListFlattened = (progressListNested as any).flat();

    return progressListFlattened?.some((entry: any) => {
        // Ensure 'entry' is an array with exactly two elements
        if (Array.isArray(entry) && entry.length === 2) {
            const [progressId, progress] = entry;

            // Convert 'progressId' to string for comparison
            if (progressId.toString() !== mission.id.toString()) {
                return false;
            }

            // If the mission is not recursive, its existence signifies completion
            if (!mission.recursive) {
                return true;
            }

            // For recursive missions, check the 'completionHistory'
            if (
                Array.isArray(progress.completionHistory) &&
                progress.completionHistory.length > 0
            ) {
                // Determine if any completion record is after the mission's 'startDate'
                return progress.completionHistory.some((record: any) => BigInt(record.timestamp) > mission.startDate);
            }
        }

        // If there's no completion history, the mission isn't completed
        return false;
    });
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

export const checkRequiredMissionCompletionDefault = (globalID: any, canisterId: string, mission: any) => {
    let requiredMissionCompleted = true; // Assume no required mission or it's completed
    let requiredMissionTitle = '';

    const requiredMissionId = mission.requiredPreviousMissionId[0];
    // Check if the required mission is not the same as the current mission
    if (requiredMissionId !== undefined && BigInt(requiredMissionId) !== BigInt(mission.id)) {
        const requiredMissionBigInt = BigInt(requiredMissionId);


        const requiredMission = globalID.missionsMap[canisterId]?.find((m: any) => BigInt(m.id) === requiredMissionBigInt);
        requiredMissionTitle = requiredMission?.title ?? '';

        const progressListNested = globalID?.userProgressMap[canisterId];

        requiredMissionCompleted = progressListNested.some((progressList: any[]) =>
            progressList.some((entry: any[]) => {
                if (Array.isArray(entry) && entry.length === 2) {
                    const [progressId, progress] = entry;

                    if (progressId.toString() === requiredMissionId.toString()) {
                        // For non-recursive missions, existence signifies completion
                        if (!requiredMission.recursive) {
                            return true;
                        }

                        // For recursive missions, check the completion history
                        if (
                            Array.isArray(progress.completionHistory) &&
                            progress.completionHistory.length > 0
                        ) {
                            // Determine if any completion record is after the mission's startDate
                            return progress.completionHistory.some((record: any) =>
                                BigInt(record.timestamp) > BigInt(requiredMission.startDate)
                            );
                        }
                    }
                }

                return false;
            })
        );
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
