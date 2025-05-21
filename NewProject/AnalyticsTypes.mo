import NewTypes "NewTypes";
module AnalyticsTypes {
    // For get_analytics_overview
    public type ProjectGlobalAnalytics = {
        project_name : Text;
        total_missions : Nat;
        active_missions : Nat; // Status == #Active
        expired_missions : Nat; // Status == #Expired
        completed_overall_missions : Nat; // Status == #Completed (max total redemptions)
        draft_missions : Nat; // Status == #Draft
        paused_missions : Nat; // Status == #Paused
        unique_users_interacted : Nat; // Unique UUIDs in userProgress
        project_lifetime_completions : Nat; // Sum of mission.currentTotalCompletions
        project_lifetime_starts_approx : Nat; // Sum of all UserMissionProgress entries
    };

    // For get_all_missions_analytics
    public type MissionAnalyticsSummary = {
        mission_id : Nat;
        name : Text;
        status : NewTypes.MissionStatus;
        total_completions : Nat; // mission.currentTotalCompletions
        unique_completers : Nat; // mission.usersWhoCompletedCount.size()
        estimated_starts : Nat; // Count of UserMissionProgress entries for this mission
        creation_time : Int;
        mission_start_time : Int;
        mission_end_time : ?Int;
        tags : ?[Text];
        // action_flow_step_count: Nat; // Requires JSON parsing, potentially slow. Add if needed.
    };

    // For get_all_user_progress_for_analytics
    // This will be a nested structure.
    public type UserMissionProgressAnalyticsRecord = {
        mission_id : Nat;
        last_active_time : Int;
        completion_time : ?Int;
        overall_status : NewTypes.UserOverallMissionStatus;
        // Optional: Add a summary of step states if needed, but it makes the payload larger.
        // step_states_summary: [(Nat, NewTypes.UserActionStepStatus)];
        completions_by_this_user_for_this_mission : Nat; // From mission.usersWhoCompletedCount
        // progress_start_time: Int; // Hard to get accurately without more data/iteration
    };

    public type UserAnalyticsRecord = {
        user_uuid : Text;
        first_seen_time_approx : Int; // Earliest last_active_time for this user
        last_seen_time : Int; // Latest last_active_time for this user
        missions_attempted_count : Nat;
        missions_completed_count : Nat;
        progress_entries : [UserMissionProgressAnalyticsRecord];
    };
    
    public type AggregatedFunnelStep = {
        step_id : Nat;
        step_name : ?Text; // From actionFlowJson, if available
        users_reached_step : Nat; // Users who started the mission (for step 1) or completed the previous step
        users_completed_step : Nat; // Users who successfully completed this specific step
    };
};
