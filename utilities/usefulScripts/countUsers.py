import json

def count_principals(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Option 1: Count total principals
    total_principals = len(data)
    print(f"Total number of principals: {total_principals}")
    
    # Option 2: Count unique principals
    unique_principals = len({user['id']['__principal__'] for user in data if '__principal__' in user.get('id', {})})
    print(f"Number of unique principals: {unique_principals}")

if __name__ == "__main__":
    users_json_path = 'users.json'  # Replace with your actual file path if different
    count_principals(users_json_path)
