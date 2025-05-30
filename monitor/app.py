from flask import Flask, request, jsonify
import pandas as pd
from sklearn.calibration import LabelEncoder
from sklearn.ensemble import IsolationForest
import numpy as np
from sklearn.preprocessing import MinMaxScaler
app = Flask(__name__)

# Initialize IsolationForest
isolation_forests = {}
logs = {}
max_logs = 10000
retrain_threshold = 100
label_encoders = {}
contamination = 0.1
def preprocess_df(df,event_type):
    """Preprocess the DataFrame by encoding categorical columns and normalizing numerical columns."""
    global label_encoders
    # replace na with 0s 
    df.fillna(0, inplace=True)
    
    # split the columns into categorical and numerical
    categorical_cols = df.select_dtypes(include=['object']).columns
    numerical_cols = df.select_dtypes(include=['int64', 'float64', 'int', 'float']).columns

    # Encode categorical columns, using LabelEncoder
    encoded_cols = pd.DataFrame()
    for col in categorical_cols:
        if event_type not in label_encoders:
            label_encoders[event_type] = {}
        if col not in label_encoders[event_type]:
            label_encoders[event_type][col] = LabelEncoder()
            df[col] = label_encoders[event_type][col].fit_transform(df[col])
        else:
            # Fit the label encoder with new categories if they exist
            new_labels = set(df[col]) - set(label_encoders[event_type][col].classes_)
            if new_labels:
                label_encoders[event_type][col].classes_ = np.append(label_encoders[event_type][col].classes_, list(new_labels))
            df[col] = label_encoders[event_type][col].transform(df[col])
    encoded_cols = df[categorical_cols]

    # Normalize numerical columns
    scaler = MinMaxScaler()
    scaled_nums = pd.DataFrame(
        scaler.fit_transform(df[numerical_cols]),
        columns=numerical_cols
    )

    # Combine encoded categorical and scaled numerical columns
    final_df = pd.concat([encoded_cols, scaled_nums], axis=1)
    return final_df, scaler
    


def flatten_json(obj):
    """Flatten a nested JSON object into a flat dictionary."""
    out = {}
    def flatten(x, name=''):
        # Recursive function to flatten the JSON object
        if type(x) is dict:
            for a in x:
                flatten(x[a], name + a + '_')
        elif type(x) is list:
            i = 0
            for a in x:
                flatten(a, name + str(i) + '_')
                i += 1
        else:
            out[name[:-1]] = x
    flatten(obj)

    return out


def train_event(event_type):
    global logs
    global isolation_forests
    event_type_logs = logs[event_type]
    max_features = max(log.shape[1] for log in event_type_logs)
    padded_logs = [np.pad(log, ((0, 0), (0, max_features - log.shape[1])), 'constant') for log in event_type_logs]
    
    data = np.concatenate(padded_logs, axis=0)
    if event_type not in isolation_forests:
        isolation_forests[event_type] = IsolationForest(contamination=contamination)
    isolation_forests[event_type].fit(data)

@app.route('/analyze', methods=['POST'])
def analyze_log():
    
    global logs
    global isolation_forests
    
    # Get the log from the request
    log = request.json
    if log is None:
        return jsonify({'error': 'No log provided'}), 400

    # remove timestamp and flow_id
    log.pop('timestamp', None)
    log.pop('flow_id', None)
    event_type = log.get('event_type')

    # events to be ignored 
    if event_type == "flow":
        return jsonify({'anomaly': 1})
    
    # Convert log to NumPy array for IsolationForest and encode columns
    flattened_log = flatten_json(log)
    log_df = pd.json_normalize(flattened_log)
    log_data, _ = preprocess_df(log_df, event_type)
    log_np = log_data.to_numpy()
   
    # if event type is not in logs, create a new list for it
    if event_type not in logs:
        logs[event_type] = []
        
    # Append the log to the list
    logs[event_type].append(log_np)
    
    event_logs = logs[event_type]
    
    # Fit the model if we have enough logs
    if (len(event_logs) % retrain_threshold == 0 and len(event_logs) > 0):
        train_event(event_type)
        
    # Predict if we have enough logs
    try:
        if len(event_logs) > 100:        
            max_features = max(log.shape[1] for log in event_logs)
            log_data = np.pad(log_data, ((0, 0), (0, max_features - log_data.shape[1])), 'constant')
            prediction = isolation_forests[event_type].predict(log_data)
        else:
            prediction = [1]  # Assume normal if not enough logs to train
    except ValueError as e:
        print({'error': str(e)})
        prediction = [1]
        
        # Force retrain if error occurs 
        # Error is usually due to mismatch in number of features
        train_event(event_type)
    
    # remove old logs if we exceed max_logs
    if len(event_logs) > max_logs:
        logs[event_type] = logs[event_type][-max_logs:]
    
    # Check if the prediction is -1 (anomaly) or 1 (normal)
    return jsonify({'anomaly': int(prediction[0]) == -1 })
    
@app.route('/max_logs', methods=['POST'])
def set_max_logs():
    global max_logs
    max_log_request = request.json.get('max_logs')
    
    if max_log_request is None:
        return jsonify({'error': 'No max_logs provided'}), 400
    
    if int(max_log_request) < 1:
        return jsonify({'error': 'max_logs must be greater than 0'}), 400
    
    max_logs = int(max_log_request)

    return jsonify({'max_logs': max_logs})

@app.route('/retrain_threshold', methods=['POST'])
def set_retrain_threshold():
    global retrain_threshold
    retrain_threshold_request = request.json.get('retrain_threshold')
    
    if retrain_threshold_request is None:
        return jsonify({'error': 'No retrain_threshold provided'}), 400
    
    if int(retrain_threshold_request) < 1:
        return jsonify({'error': 'retrain_threshold must be greater than 0'}), 400
    
    retrain_threshold = int(retrain_threshold_request)

    return jsonify({'retrain_threshold': retrain_threshold})


# Set the contamination rate for the IsolationForest, clears the models 
@app.route('/contamination', methods=['POST'])
def set_contamination():
    global contamination
    global isolation_forests
    contamination_request = request.json.get('contamination')
    
    if contamination_request is None:
        return jsonify({'error': 'No contamination provided'}), 400
    
  
    
    if not 0 <= float(contamination_request) <= 0.5:
        return jsonify({'error': 'contamination must be between 0 and 0.5'}), 400
    
    contamination = float(contamination_request)
    isolation_forests = {}

    return jsonify({'contamination': contamination})

# Get the current metrics
@app.route('/metrics', methods=['GET'])
def metrics():    
    metrics = {
        'logs': {},
        'max_logs': max_logs,
        'retrain_threshold': retrain_threshold,
        'contamination': contamination
    }
    for event_type in logs:
        metrics['logs'][event_type] = len(logs[event_type])
    
    return jsonify(metrics)        


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=5000, host='0.0.0.0')
