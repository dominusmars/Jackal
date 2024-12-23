from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
import numpy as np
import pandas as pd

app = Flask(__name__)

# Initialize IsolationForest
isolation_forest = IsolationForest(contamination=0.1)
logs = pd.DataFrame()
max_logs = 10000
force_train = False
@app.route('/add_log', methods=['POST'])
def add_log():
    global logs
    global force_train
    log = request.json
    
    if log is None:
        return jsonify({'error': 'No log provided'}), 400
    
    # Convert log to DataFrame for IsolationForest
    log_df = pd.json_normalize([log])
    
    # Normalize based on the logs which are in the logs
    if not logs.empty:
        df_clean = log_df.applymap(lambda x: x if isinstance(x, (int, float, str)) else None)
        
        # Select columns with object type
        categorical_cols = df_clean.select_dtypes(include=['object']).columns

        # Frequency encoding for categorical columns based on logs
        for col in categorical_cols:
            if col in logs.columns:
                freq_encoding = logs[col].value_counts().to_dict()
                df_clean[col] = df_clean[col].map(freq_encoding).fillna(0)
            else:
                df_clean[col] = 0

        # Drop any remaining non-scalar columns
        df_clean = df_clean.dropna(axis=1, how='all')
    else:
        df_clean = log_df.applymap(lambda x: x if isinstance(x, (int, float, str)) else None)
    # Fit the model if we have enough logs
    if (len(logs) % 100 == 0 and len(logs) > 0) or force_train:
        isolation_forest.fit(logs)
        force_train = False
    
    # Find missing columns and set them to None
    missing_cols = set(logs.columns) - set(df_clean.columns)
    missing_df = pd.DataFrame(columns=list(missing_cols))
    df_clean = pd.concat([df_clean, missing_df], axis=1)
    
    # print(df_clean)
    df_clean = df_clean.sort_index(axis=1)
    prediction= [1]
    try:
        if len(logs) > 100:
            prediction = isolation_forest.predict(df_clean)
        else:
            prediction = [1]  # Assume normal if not enough logs to train
    except ValueError as e:
        print(e)
        prediction = [1]
        force_train = True
        
        
    # Predict if the log is an anomaly
   
    
    # Add log to the DataFrame
    logs = pd.concat([logs, df_clean], ignore_index=True)
    
    # Maintain the log DataFrame size
    if len(logs) > max_logs:
        logs = logs.iloc[1:]
    
    return jsonify({'anomaly': prediction})

if __name__ == '__main__':
    app.run(debug=True, threaded=True)