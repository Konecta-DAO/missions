import json

def count_points_earned(data):
    count = 0

    for user_entry in data:
        # Each user_entry is a list: [ { "__principal__": ... }, [ ... missions ... ] ]
        if not isinstance(user_entry, list) or len(user_entry) != 2:
            continue  # Skip invalid entries

        missions = user_entry[1]
        if not isinstance(missions, list):
            continue  # Skip if missions is not a list

        for mission in missions:
            # Each mission is a list: [ "mission_id", { ... mission_details ... } ]
            if not isinstance(mission, list) or len(mission) != 2:
                continue  # Skip invalid mission entries

            mission_details = mission[1]
            if not isinstance(mission_details, dict):
                continue  # Skip if mission_details is not a dict

            completion_history = mission_details.get("completionHistory", [])
            if not isinstance(completion_history, list):
                continue  # Skip if completionHistory is not a list

            for completion in completion_history:
                if isinstance(completion, dict) and "pointsEarned" in completion:
                    count += 1

    return count

def main():
    # Replace 'data.json' with the path to your JSON file
    json_file = 'progress.json'

    try:
        with open(json_file, 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        print(f"File '{json_file}' not found.")
        return
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return

    total_missions = count_points_earned(data)
    print("Amount of missions completed by all users in total:", total_missions)

if __name__ == "__main__":
    main()
