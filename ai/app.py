from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import IsolationForest
import numpy as np
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler

app = Flask(__name__)

# Initialize IsolationForest
isolation_forest = IsolationForest(contamination=0.1)
logs = []
max_logs = 10000
force_train = False
max_features = 0
def preprocess_df(df):
    
    # replace na with 0s 
    df.fillna(0, inplace=True)
    
    categorical_cols = df.select_dtypes(include=['object']).columns
    numerical_cols = df.select_dtypes(include=['int64', 'float64', 'int', 'float']).columns

    # One-hot encode categorical columns
    encoder = OneHotEncoder(sparse_output=False)
    # Convert lists to strings
    df[categorical_cols] = df[categorical_cols].map(lambda x: str(x) if isinstance(x, list) else x)
    
    encoded_cats = pd.DataFrame(
        encoder.fit_transform(df[categorical_cols]),
        columns=encoder.get_feature_names_out(categorical_cols)
    )

    # Normalize numerical columns
    scaler = MinMaxScaler()
    scaled_nums = pd.DataFrame(
        scaler.fit_transform(df[numerical_cols]),
        columns=numerical_cols
    )

    # Combine encoded categorical and scaled numerical columns
    final_df = pd.concat([encoded_cats, scaled_nums], axis=1)

    return final_df, encoder, scaler
    


@app.route('/add_log', methods=['POST'])
def add_log():
    global logs
    global force_train
    global max_features
    
    # Get the log from the request
    log = request.json
    if log is None:
        return jsonify({'error': 'No log provided'}), 400

    # Convert log to NumPy array for IsolationForest and encode columns
    log_df = pd.json_normalize(log)
    log_data, _, _ = preprocess_df(log_df)
    log_np = log_data.to_numpy()
   
    # Append the log to the list
    logs.append(log_np)
        
    # Fit the model if we have enough logs
    if (len(logs) % 100 == 0 and len(logs) > 0) or force_train:
        # Create a NumPy array from logs
        # Ensure all logs have the same number of features
        max_features = max(log.shape[1] for log in logs)
        padded_logs = [np.pad(log, ((0, 0), (0, max_features - log.shape[1])), 'constant') for log in logs]
        
        data = np.concatenate(padded_logs, axis=0)
        
        isolation_forest.fit(data)
        force_train = False
    try:
        if len(logs) > 100:
            log_data = np.pad(log_data, ((0, 0), (0, max_features - log_data.shape[1])), 'constant')
            prediction = isolation_forest.predict(log_data)
        else:
            prediction = [1]  # Assume normal if not enough logs to train
    except ValueError as e:
        print({'error': str(e)})
        prediction = [1]
        force_train = True
    
    if len(logs) > max_logs:
        logs.pop(0)
    
    return jsonify({'anomaly': int(prediction[0]), })
    

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
