import { SerializedMissionV2, SerializedProgress } from "../../../declarations/backend/backend.did.js";
import { SerializedMissionV2 as SerializedMissionDefault, SerializedProgress as SerializedProgressDefault } from '../../../declarations/oisy_backend/oisy_backend.did.js';

// Utility function to check mission completion
export const checkMissionCompletion = (userProgress: any, mission: SerializedMissionV2): boolean => {
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
                    const hasRecentCompletion = progress.completionHistory?.some(
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
                return progress.completionHistory?.some((record: any) => BigInt(record.timestamp) > mission.startDate);
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
    // --- BEGINNING OF SPECIFIC CHECK FOR ICTOOLKIT MISSION 11 ---
    // Ensure globalID.projects is available and contains project details like name and id
    const icToolkitProject = globalID.projects?.find((proj: any) => proj.name.toLowerCase() === 'ictoolkit');
    const isICToolkitProject = icToolkitProject && icToolkitProject.id === canisterId;

    // Check if the current mission is ICToolkit Mission 11
    if (isICToolkitProject && mission.id != null && BigInt(mission.id) === 11n) {
        let allPrerequisitesCompleted = true;
        let firstUncompletedTitle = '';
        let firstUncompletedId = '';

        // Loop through prerequisite missions 0 to 10
        for (let i = 0; i <= 10; i++) {
            const prerequisiteMissionId = BigInt(i);
            const prerequisiteMission = globalID.missionsMap?.[canisterId]?.find((m: any) => m.id != null && BigInt(m.id) === prerequisiteMissionId);

            if (!prerequisiteMission) {
                // This means a definition for one of missions 0-10 is missing.
                // This is likely an error in mission configuration.
                allPrerequisitesCompleted = false;
                firstUncompletedTitle = `Mission ID ${i} (definition missing)`;
                firstUncompletedId = i.toString();
                break;
            }

            const progressListNested = globalID?.userProgressMap?.[canisterId];
            let currentPrerequisiteCompleted = false;

            if (progressListNested && progressListNested.length > 0) {
                currentPrerequisiteCompleted = progressListNested.some((progressList: any[]) =>
                    progressList?.some((entry: any[]) => {
                        if (Array.isArray(entry) && entry.length === 2) {
                            const [progressEntryId, progressData] = entry; // progressId in entry, progress is its details

                            // Ensure progressEntryId is not null before converting to string
                            if (progressEntryId != null && progressEntryId.toString() === prerequisiteMissionId.toString()) {
                                // For non-recursive missions, existence signifies completion
                                if (!prerequisiteMission.recursive) {
                                    return true;
                                }
                                // For recursive missions, check the completion history
                                if (
                                    progressData && // Ensure progressData exists
                                    Array.isArray(progressData.completionHistory) &&
                                    progressData.completionHistory.length > 0
                                ) {
                                    // Ensure timestamps are valid before converting to BigInt
                                    return progressData.completionHistory.some((record: any) =>
                                        record && record.timestamp != null && prerequisiteMission.startDate != null &&
                                        BigInt(record.timestamp) > BigInt(prerequisiteMission.startDate)
                                    );
                                }
                            }
                        }
                        return false;
                    })
                );
            }

            if (!currentPrerequisiteCompleted) {
                allPrerequisitesCompleted = false;
                firstUncompletedTitle = prerequisiteMission.title || `Mission ID ${i}`;
                firstUncompletedId = prerequisiteMissionId.toString();
                break; // Found an uncompleted prerequisite
            }
        }

        if (!allPrerequisitesCompleted) {
            return {
                requiredMissionCompleted: false,
                // You can customize this title
                requiredMissionTitle: `Please complete "${firstUncompletedTitle}" (and any other preceding ICToolkit missions from 0-10) first.`
            };
        } else {
            // All prerequisites 0-10 are completed for ICToolkit mission 11.
            // It implies mission 11 is now unlocked based on these specific multi-mission prerequisites.
            // If mission 11 *also* has its own 'requiredPreviousMissionId' (e.g., pointing to mission 10),
            // the original logic below would handle that if we don't return true here.
            // For now, assuming 0-10 are THE prerequisites.
            return { requiredMissionCompleted: true, requiredMissionTitle: '' };
        }
    }
    // --- END OF SPECIFIC CHECK ---

    // Original logic for other missions
    let requiredMissionCompleted = true;
    let requiredMissionTitle = '';

    // Use optional chaining for safety, in case requiredPreviousMissionId is missing or not an array
    const requiredMissionIdOpt = mission.requiredPreviousMissionId?.[0];

    if (requiredMissionIdOpt !== undefined && mission.id != null && BigInt(requiredMissionIdOpt) !== BigInt(mission.id)) {
        const requiredMissionId = BigInt(requiredMissionIdOpt); // Now we know it's defined

        const requiredMission = globalID.missionsMap?.[canisterId]?.find((m: any) => m.id != null && BigInt(m.id) === requiredMissionId);

        if (!requiredMission) {
            // If the definition for the required mission itself is missing
            return { requiredMissionCompleted: false, requiredMissionTitle: `Configuration error: Required mission (ID: ${requiredMissionId.toString()}) not found.` };
        }
        requiredMissionTitle = requiredMission.title || `Mission ID ${requiredMissionId.toString()}`;

        const progressListNested = globalID?.userProgressMap?.[canisterId];

        if (!progressListNested || progressListNested.length === 0) {
            requiredMissionCompleted = false; // No progress for this canister means required mission not done
        } else {
            requiredMissionCompleted = progressListNested.some((progressList: any[]) =>
                progressList?.some((entry: any[]) => {
                    if (Array.isArray(entry) && entry.length === 2) {
                        const [progressEntryId, progressData] = entry;
                        if (progressEntryId != null && progressEntryId.toString() === requiredMissionId.toString()) {
                            if (!requiredMission.recursive) {
                                return true;
                            }
                            if (
                                progressData &&
                                Array.isArray(progressData.completionHistory) &&
                                progressData.completionHistory.length > 0
                            ) {
                                return progressData.completionHistory.some((record: any) =>
                                    record && record.timestamp != null && requiredMission.startDate != null &&
                                    BigInt(record.timestamp) > BigInt(requiredMission.startDate)
                                );
                            }
                        }
                    }
                    return false;
                })
            );
        }
    } else if (requiredMissionIdOpt === undefined) {
        // No specific requiredPreviousMissionId is defined for this mission, so it's considered available.
        requiredMissionCompleted = true;
        requiredMissionTitle = '';
    }
    // If requiredMissionId is the same as mission.id (self-referential), it also falls through,
    // keeping requiredMissionCompleted = true (effectively unlocked).

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
