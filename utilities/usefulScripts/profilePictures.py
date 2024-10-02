import json
import webbrowser
import os
import sys

def load_json(file_path):
    """
    Load JSON data from a file.
    """
    if not os.path.exists(file_path):
        print(f"Error: The file '{file_path}' does not exist.")
        sys.exit(1)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return data
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)

def open_twitter_profiles(users):
    """
    Open Twitter profiles in the default web browser for users with pfpProgress == "loading".
    """
    count = 0
    for user in users:
        pfp_progress = user.get('pfpProgress', '').lower()
        if pfp_progress == "loading":
            twitter_handles = user.get('twitterhandle', [])
            for handle in twitter_handles:
                url = f"https://x.com/{handle}"
                print(f"Opening: {url}")
                webbrowser.open_new_tab(url)
                count += 1
    
    if count == 0:
        print("No users with 'pfpProgress' set to 'loading' were found.")
    else:
        print(f"Opened {count} Twitter profile(s) in your browser.")

def main():
    """
    Main function to execute the script.
    """
    # Define the JSON file path
    json_file = 'users.json'  # Change this if your JSON file has a different name or path

    # Load JSON data
    users = load_json(json_file)

    # Check if the JSON data is a list
    if not isinstance(users, list):
        print("Error: JSON data is not a list of users.")
        sys.exit(1)
    
    # Open Twitter profiles
    open_twitter_profiles(users)

if __name__ == "__main__":
    main()
