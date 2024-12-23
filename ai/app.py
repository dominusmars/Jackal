from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
import numpy as np
import pandas as pd

app = Flask(__name__)

# Initialize IsolationForest
isolation_forest = IsolationForest(contamination=0.1)
logs = []
current_df = pd.DataFrame()
max_logs = 10000
force_train = False

@app.route('/add_log', methods=['POST'])
def add_log():
    global logs
    global force_train
    global current_df
    log = request.json
    
    if log is None:
        return jsonify({'error': 'No log provided'}), 400

    # Append the log to the list
    logs.append(log)

    # Convert log to DataFrame for IsolationForest
    log_df = pd.json_normalize([log])
    
    # Normalize the log DataFrame
    # Frequency encoding for categorical columns based on current_df
    categorical_cols = current_df.select_dtypes(include=['object']).columns

    for col in categorical_cols:
        if col in log_df.columns:
            freq_encoding = current_df[col].value_counts().to_dict()
            log_df[col] = log_df[col].map(freq_encoding).fillna(0)
        else:
            log_df[col] = 0

    # Add missing columns from current_df to log_df
    missing_cols = {col: 0 for col in current_df.columns if col not in log_df.columns}
    log_df = pd.concat([log_df, pd.DataFrame(missing_cols, index=log_df.index)], axis=1)
    
    # Ensure the columns are in the same order as current_df
    log_df = log_df.sort_index(axis=1)
    log_df = log_df[current_df.columns]


    # Fit the model if we have enough logs
    if (len(logs) % 100 == 0 and len(logs) > 0) or force_train:
        df = pd.json_normalize(logs)
        df_clean = df.map(lambda x: x if isinstance(x, (int, float, str)) else None)
        categorical_cols = df_clean.select_dtypes(include=['object']).columns

        # Frequency encoding for categorical columns based on logs
        for col in categorical_cols:
            if col in df_clean.columns:
                freq_encoding = df_clean[col].value_counts().to_dict()
                df_clean[col] = df_clean[col].map(freq_encoding).fillna(0)

        
        # sort index
        df_clean = df_clean.sort_index(axis=1)
        
        current_df = df_clean
        isolation_forest.fit(current_df)
        force_train = False

    prediction = [1]
    try:
        if len(logs) > 100:
            prediction = isolation_forest.predict(log_df)
        else:
            prediction = [1]  # Assume normal if not enough logs to train
    except ValueError as e:
        print({'error': str(e)})
        prediction = [1]
        force_train = True

    # Maintain the log DataFrame size
    if len(logs) > max_logs:
        logs.pop()
    
    return jsonify({'anomaly': prediction[0]})

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
