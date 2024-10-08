import json

def main():
    # Read the progress data from 'progress.json'
    with open('progress.json', 'r') as f:
        progress_data = json.load(f)

    principals_status = {}  # Dictionary to store the status of each principal

    for entry in progress_data:
        if not entry:
            continue
        principal_dict = entry[0]
        principal = principal_dict.get('__principal__')
        if not principal:
            continue

        entries_list = entry[1]  # List of entries like [ ["0", {...}], ["7", {...}], ... ]
        has_entry_7 = False
        timestamp_7 = None
        other_timestamps = []

        for sub_entry in entries_list:
            if not sub_entry or len(sub_entry) < 2:
                continue
            number_string, sub_entry_dict = sub_entry

            completion_history = sub_entry_dict.get('completionHistory', [])
            for completion in completion_history:
                timestamp_str = completion.get('timestamp')
                if not timestamp_str:
                    continue
                try:
                    timestamp = int(timestamp_str)
                except ValueError:
                    continue

                if number_string == "7":
                    has_entry_7 = True
                    if timestamp_7 is None or timestamp > timestamp_7:
                        timestamp_7 = timestamp
                else:
                    other_timestamps.append(timestamp)

        # If the principal has an entry "7", check their other timestamps
        if has_entry_7:
            # Check if any other timestamp is greater than timestamp_7
            continued_missions = any(ts > timestamp_7 for ts in other_timestamps)
            principal_short = f"{principal[:4]}...{principal[-3:]}"
            if continued_missions:
                status = "kept doing missions"
            else:
                status = "didn't do more missions"
            principals_status[principal_short] = status

    # Count principals based on their status
    still_doing_missions = sum(1 for status in principals_status.values() if status == "kept doing missions")
    stopped_doing_missions = sum(1 for status in principals_status.values() if status == "didn't do more missions")

    # Print the results
    for principal_short, status in principals_status.items():
        print(f"Principal: \"{principal_short}\", {status}")

    print(f"\nPrincipals still doing missions: {still_doing_missions}")
    print(f"Principals that stopped doing missions: {stopped_doing_missions}")

if __name__ == "__main__":
    main()
