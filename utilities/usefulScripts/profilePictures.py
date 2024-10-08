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

def open_twitter_profiles(users, batch_size=25):
    """
    Open Twitter profiles in the default web browser in batches.
    
    Parameters:
    - users (list): List of user dictionaries.
    - batch_size (int): Number of profiles to open in each batch.
    """
    # Collect all URLs to open
    urls = []
    for user in users:
        pfp_progress = user.get('pfpProgress', '').lower()
        if pfp_progress == "loading":
            twitter_handles = user.get('twitterhandle', [])
            for handle in twitter_handles:
                if handle:  # Ensure handle is not empty
                    url = f"https://x.com/{handle}"
                    urls.append(url)
    
    total_urls = len(urls)
    
    if total_urls == 0:
        print("No users with 'pfpProgress' set to 'loading' were found.")
        return
    
    print(f"Total Twitter profiles to open: {total_urls}")
    
    # Open URLs in batches
    for i in range(0, total_urls, batch_size):
        batch = urls[i:i + batch_size]
        print(f"\nOpening batch {i // batch_size + 1}: {len(batch)} profiles...")
        for url in batch:
            print(f"Opening: {url}")
            webbrowser.open_new_tab(url)
        
        # If there are more batches to process, wait for user input
        if i + batch_size < total_urls:
            input("Press Enter to open the next batch of 25 profiles...")
    
    print(f"\nAll {total_urls} Twitter profiles have been opened.")

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
    
    # Open Twitter profiles in batches
    open_twitter_profiles(users)

if __name__ == "__main__":
    main()
