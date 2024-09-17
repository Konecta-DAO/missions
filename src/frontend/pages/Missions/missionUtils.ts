import { SerializedProgress } from "../../../declarations/backend_test/backend_test.did.js";

// Utility function to check mission completion
export const checkMissionCompletion = (userProgress: any, missionId: bigint): boolean => {
    if (!Array.isArray(userProgress)) {
        console.error("userProgress is not an array");
        return false;
    }
    const a = userProgress[0]?.some(([progressId, progress]: [bigint, SerializedProgress]) => {
        if (progressId === missionId) {
            return true;
        } else {
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

        // requiredMissionCompleted = globalID.userProgress?.some((nestedEntry: any) => {
        //     if (Array.isArray(nestedEntry) && Array.isArray(nestedEntry[0])) {
        //         const [progressId, progress] = nestedEntry[0];
        //         return BigInt(progressId) === requiredMissionBigInt && progress.completionHistory.length > 0;
        //     }
        //     return false;
        // }) ?? false;
    }

    return { requiredMissionCompleted, requiredMissionTitle };
};


// Utility function for recursive mission
export const checkRecursiveMission = (mission: any, missionCompleted: boolean) => {
    let isRecursiveMissionDarkened = false;
    let countdownText = '';

    if (mission.recursive && missionCompleted && BigInt(mission.endDate) !== BigInt(0)) {
        isRecursiveMissionDarkened = true;
        countdownText = `This Mission will reset at ${new Date(Number(mission.endDate)).toLocaleString()}`;
    }

    return { isRecursiveMissionDarkened, countdownText };
};
