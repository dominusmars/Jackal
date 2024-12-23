import json
import requests

url = 'http://localhost:5000'
file_path = '../server/demoData/eve.json'

with open(file_path, 'r') as file:
    for line in file:
        print("sending log entry")
        log_entry = json.loads(line)
        response = requests.post(url + "/add_log", json=log_entry)
        print(f'Status Code: {response.status_code}, Response: {response.text}')