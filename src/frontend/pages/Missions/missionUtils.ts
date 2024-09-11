// Utility function to check mission completion
export const checkMissionCompletion = (userProgress: any, missionId: bigint) => {
    return Array.isArray(userProgress)
        ? userProgress.some((nestedEntry: any) => {
            if (Array.isArray(nestedEntry) && Array.isArray(nestedEntry[0])) {
                const [progressId, progress] = nestedEntry[0];
                return BigInt(progressId) === missionId && progress.completionHistory.length > 0;
            }
            return false;
        })
        : false;
};

// Utility function to check required mission completion
export const checkRequiredMissionCompletion = (globalID: any, mission: any) => {
    let requiredMissionCompleted = true; // Assume no required mission or it's completed
    let requiredMissionTitle = '';

    const requiredMissionId = mission.requiredPreviousMissionId?.[0];
    if (requiredMissionId !== undefined) {
        const requiredMissionBigInt = BigInt(requiredMissionId);
        const requiredMission = globalID.missions.find((m: any) => BigInt(m.id) === requiredMissionBigInt);
        requiredMissionTitle = requiredMission?.title ?? '';

        requiredMissionCompleted = globalID.userProgress?.some((nestedEntry: any) => {
            if (Array.isArray(nestedEntry) && Array.isArray(nestedEntry[0])) {
                const [progressId, progress] = nestedEntry[0];
                return BigInt(progressId) === requiredMissionBigInt && progress.completionHistory.length > 0;
            }
            return false;
        }) ?? false;
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
