from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import os
import pandas as pd
from pymongo import MongoClient
import logging
import tempfile

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)  # Enable CORS for all routes

# Load the saved encoders, scaler, and model
label_encoder_gender = joblib.load('label_encoder_gender.pkl')
label_encoder_mode = joblib.load('label_encoder_mode.pkl')
column_transformer = joblib.load('ColumnTransformer.pkl')
sc = joblib.load('StandardScaler.pkl')
model = joblib.load('model.pkl')

# Set up MongoDB connection
client = MongoClient('localhost', 27017)
db = client['predictions_db']
predictions_collection = db['predictions']

@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_react_static_files(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']
    
    try:
        # Save the uploaded file to a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            file_path = tmp_file.name
            file.save(file_path)

        # Read the uploaded file as DataFrame
        input_data = pd.read_csv(file_path)
        logging.info(f"Input data columns: {input_data.columns.tolist()}")
        logging.info(f"Input data shape: {input_data.shape}")

        # Apply Label Encoding to 'Gender' and 'Mode'
        input_data['Gender'] = label_encoder_gender.transform(input_data['Gender'])
        input_data['Mode'] = label_encoder_mode.transform(input_data['Mode'])

        logging.info(f"Data after encoding: {input_data.head()}")

        # Transform the input data using the loaded ColumnTransformer
        transformed_data = column_transformer.transform(input_data)
        logging.info(f"Transformed data shape: {transformed_data.shape}")

        # Apply feature scaling
        transformed_data = sc.transform(transformed_data)

        # Make predictions
        predictions = model.predict(transformed_data)

        # Determine the prediction labels
        input_data['Prediction'] = ["Will Graduate" if pred == 1 else "Dropout" for pred in predictions]

        # Store results in MongoDB
        result = input_data.to_dict(orient='records')
        predictions_collection.insert_many(result)

        return jsonify(message="Predictions stored in database"), 200
    except Exception as e:
        logging.error(f"Error in prediction: {e}")
        return jsonify(error=str(e)), 500
    finally:
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.route('/results', methods=['GET'])
def get_results():
    try:
        results = list(predictions_collection.find({}, {"_id": 1, "Department": 1, "Gender": 1, "Mode": 1, "GPA": 1, "Prediction": 1}))
        # Convert ObjectId to string for JSON serialization
        for result in results:
            result['_id'] = str(result['_id'])
        logging.info(f"Results fetched: {results}")
        return jsonify(results=results), 200
    except Exception as e:
        logging.error(f"Error fetching results: {e}")
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(host='127.0.0.1', port=5000, debug=True)
