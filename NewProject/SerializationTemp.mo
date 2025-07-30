import NewTypesTemp "NewTypesTemp";
import Iter "mo:base/Iter";
import StableTrieMap "../StableTrieMap";
module Serialization {

    public func deserializePermissions(permissions : NewTypesTemp.SerializedPermissions) : NewTypesTemp.Permissions {
        {
            var addAdmin = permissions.addAdmin;
            var removeAdmin = permissions.removeAdmin;
            var editAdmin = permissions.editAdmin;
            var viewAdmins = permissions.viewAdmins;
            var editProjectInfo = permissions.editProjectInfo;
            var createMission = permissions.createMission;
            var editMissionInfo = permissions.editMissionInfo;
            var editMissionFlow = permissions.editMissionFlow;
            var updateMissionStatus = permissions.updateMissionStatus;
            var deleteMission = permissions.deleteMission;
            var viewAnyUserProgress = permissions.viewAnyUserProgress;
            var resetUserProgress = permissions.resetUserProgress;
            var adjustUserProgress = permissions.adjustUserProgress;
        };
    };

    public func serializePermissions(permissions : NewTypesTemp.Permissions) : NewTypesTemp.SerializedPermissions {
        {
            addAdmin = permissions.addAdmin;
            removeAdmin = permissions.removeAdmin;
            editAdmin = permissions.editAdmin;
            viewAdmins = permissions.viewAdmins;
            editProjectInfo = permissions.editProjectInfo;
            createMission = permissions.createMission;
            editMissionInfo = permissions.editMissionInfo;
            editMissionFlow = permissions.editMissionFlow;
            updateMissionStatus = permissions.updateMissionStatus;
            deleteMission = permissions.deleteMission;
            viewAnyUserProgress = permissions.viewAnyUserProgress;
            resetUserProgress = permissions.resetUserProgress;
            adjustUserProgress = permissions.adjustUserProgress;
        };
    };

    public func serializeUserActionStepState(actionState : NewTypesTemp.UserActionStepState) : NewTypesTemp.SerializedUserActionStepState {
        {
            attempts = actionState.attempts;
            lastAttemptTime = actionState.lastAttemptTime;
            lastMessageFromAction = actionState.lastMessageFromAction;
            status = actionState.status;
        };
    };

    public func serializeMission(mission : NewTypesTemp.Mission) : NewTypesTemp.SerializedMission {
        {
            name = mission.name;
            description = mission.description;
            actionFlowJson = mission.actionFlowJson;
            creationTime = mission.creationTime;
            minRewardAmount = mission.minRewardAmount;
            maxRewardAmount = mission.maxRewardAmount;
            rewardType = mission.rewardType;
            startTime = mission.startTime;
            endTime = mission.endTime;
            status = mission.status;
            creator = mission.creator;
            imageUrl = mission.imageUrl;
            iconUrl = mission.iconUrl;
            tags = mission.tags;
            requiredPreviousMissionId = mission.requiredPreviousMissionId;
            requiredMissionLogic = mission.requiredMissionLogic;
            isRecursive = mission.isRecursive;
            recursiveTimeCooldown = mission.recursiveTimeCooldown;
            maxCompletionsPerUser = mission.maxCompletionsPerUser;
            maxTotalCompletions = mission.maxTotalCompletions;
            currentTotalCompletions = mission.currentTotalCompletions;
            usersWhoCompletedCount = Iter.toArray(StableTrieMap.entries(mission.usersWhoCompletedCount));
            updates = mission.updates;
            priority = mission.priority;
        };
    };

    let step_state_transformer : (
        ((Nat, NewTypesTemp.UserActionStepState)) -> ((Nat, NewTypesTemp.SerializedUserActionStepState))
    ) = func(pair : (Nat, NewTypesTemp.UserActionStepState)) : ((Nat, NewTypesTemp.SerializedUserActionStepState)) {
        // Destructure the single tuple argument 'pair'
        let (stepId, stepStateValue) = pair;

        let serializedStepState : NewTypesTemp.SerializedUserActionStepState = {
            status = stepStateValue.status;
            attempts = stepStateValue.attempts;
            lastAttemptTime = stepStateValue.lastAttemptTime;
            lastMessageFromAction = stepStateValue.lastMessageFromAction;
        };
        (stepId, serializedStepState);
    };

    public func serializeUserMissionProgress(userprogress : NewTypesTemp.UserMissionProgress) : NewTypesTemp.SerializedUserMissionProgress {
        {
            overallStatus = userprogress.overallStatus;
            stepStates = Iter.toArray(
                Iter.map<(Nat, NewTypesTemp.UserActionStepState), (Nat, NewTypesTemp.SerializedUserActionStepState)>(
                    StableTrieMap.entries(userprogress.stepStates),
                    step_state_transformer,
                )
            );
            currentStepId = userprogress.currentStepId;
            flowOutputs = Iter.toArray(StableTrieMap.entries(userprogress.flowOutputs));
            completionTime = userprogress.completionTime;
            claimedRewardTime = userprogress.claimedRewardTime;
            lastActiveTime = userprogress.lastActiveTime;
        };
    };

    private func serializeProjectContactInfo(contactInfo : NewTypesTemp.ProjectContactInfo) : NewTypesTemp.SerializedProjectContactInfo {
        {
            xAccountUrl = contactInfo.xAccountUrl;
            telegramGroupUrl = contactInfo.telegramGroupUrl;
            discordInviteUrl = contactInfo.discordInviteUrl;
            openChatUrl = contactInfo.openChatUrl;
            websiteUrl = contactInfo.websiteUrl;
            emailContact = contactInfo.emailContact;
            otherLinks = contactInfo.otherLinks;
        };
    };

    public func serializeProjectDetails(details : NewTypesTemp.ProjectDetails) : NewTypesTemp.SerializedProjectDetails {
        {
            name = details.name;
            isVisible = details.isVisible;
            iconUrl = details.iconUrl;
            bannerUrl = details.bannerUrl;
            description = details.description;
            aboutInfo = details.aboutInfo;
            contactInfo = serializeProjectContactInfo(details.contactInfo);
            lastUpdated = details.lastUpdated;
            updatedBy = details.updatedBy;
        };
    };
};
