import json
from datetime import timedelta

def main():
    # Read the progress data from 'progress.json'
    with open('progress.json', 'r') as f:
        progress_data = json.load(f)
    
    # Read the user data from 'users.json'
    with open('users.json', 'r') as f:
        users_data = json.load(f)
    
    # Create a mapping from principal to Twitter handle
    principal_to_handle = {}
    for user in users_data:
        principal_dict = user.get('id', {})
        principal = principal_dict.get('__principal__')
        twitter_handle_list = user.get('twitterhandle', [])
        twitter_handle = twitter_handle_list[0] if twitter_handle_list else 'Unknown'
        if principal:
            principal_to_handle[principal] = twitter_handle
    
    # Initialize a dictionary to store total points per principal
    points_per_principal = {}

    # Iterate over the progress data
    for entry in progress_data:
        if not entry:
            continue
        principal_dict = entry[0]
        principal = principal_dict.get('__principal__')
        if not principal:
            continue
        total_points = 0
        entries_list = entry[1]  # This is a list of entries like [ ["0", {...}], ["6", {...}], ... ]
        for sub_entry in entries_list:
            if not sub_entry or len(sub_entry) < 2:
                continue
            number_string, sub_entry_dict = sub_entry
            completion_history = sub_entry_dict.get('completionHistory', [])
            for completion in completion_history:
                points_earned_str = completion.get('pointsEarned', '0')
                try:
                    points_earned = int(points_earned_str)
                except ValueError:
                    points_earned = 0
                total_points += points_earned
        # Accumulate total points for the principal
        if principal in points_per_principal:
            points_per_principal[principal] += total_points
        else:
            points_per_principal[principal] = total_points

    # Now, convert the total points (seconds) into HH:MM:SS format
    # Sort the principals by total_points in descending order
    sorted_principals = sorted(points_per_principal.items(), key=lambda x: x[1], reverse=True)

    # Get the top 15 principals
    top_15 = sorted_principals[:15]

    # Print the top 15 handles with their total time in HH:MM:SS format
    print("Top 15 Handles with Most Time Earned:")
    for principal, total_seconds in top_15:
        time_str = str(timedelta(seconds=total_seconds))
        twitter_handle = principal_to_handle.get(principal, 'Unknown')
        print(f"Handle: {twitter_handle}, Time Earned: {time_str}")

if __name__ == "__main__":
    main()
