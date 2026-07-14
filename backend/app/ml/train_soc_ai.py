import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

CICIDS_FILE = os.path.join(DATA_DIR, "cicids2017_sample.csv")

DATASET_MAPPING = {
    "CIC-IDS 2017": "cicids2017_sample.csv",
    "CIC-YNU-IoTMal 2026": "iotmal2026_sample.csv",
    "CIC MalMem 2022": "malmem2022_sample.csv",
    "UNSW-NB15 2024": "unsw_nb15_sample.csv",
    "Modbus 2023": "modbus2023_sample.csv",
}

def get_real_data(dataset_name="CIC-IDS 2017"):
    """
    Attempts to load a specific cybersecurity dataset from the registry.
    """
    file_name = DATASET_MAPPING.get(dataset_name, "cicids2017_sample.csv")
    dataset_path = os.path.join(DATA_DIR, file_name)

    if os.path.exists(dataset_path):
        logging.info(f"Loading real dataset [{dataset_name}] from {dataset_path}...")
        df = pd.read_csv(dataset_path)
        
        # Performance optimization: Use 30% of the dataset as requested by the user
        original_count = len(df)
        df = df.sample(frac=0.3, random_state=42)
        logging.info(f"Sampled 30% of dataset ({len(df)}/{original_count} rows) for optimal performance.")
        
        # Robust label column detection
        label_col = next((c for c in ["Label", "label", "Attempted Category"] if c in df.columns), None)
        if not label_col:
            logging.error(f"No label column found in {CICIDS_FILE}. Columns: {df.columns.tolist()}")
            # Fallback to last column
            label_col = df.columns[-1]
            
        logging.info(f"Using '{label_col}' as target label.")
        
        # Drop rows with NaN labels or features
        df = df.dropna(subset=[label_col])
        
        X = df.drop(columns=[label_col])
        y = df[label_col].astype(str) # Ensure labels are strings
        
        # Handle non-numeric features
        X = X.select_dtypes(include=[np.number])
        # Drop columns with all NaNs
        X = X.dropna(axis=1, how='all')
        # Fill remaining NaNs with 0
        X = X.fillna(0)
        # Handle infinities which are common in CICIDS
        X.replace([np.inf, -np.inf], 0, inplace=True)
        
        return X, y
    else:
        logging.warning(f"Target dataset [{dataset_name}] file not found at {dataset_path}.")
        logging.info("Falling back to KDDCup99 (Real Network Intrusion Dataset) from sklearn...")
        from sklearn.datasets import fetch_kddcup99
        
        # Download a 10% subset of KDDCup99 (real network traffic from DARPA)
        kdd = fetch_kddcup99(subset='http', percent10=True, as_frame=True)
        
        # Cast to float, drop categorical columns if necessary. For KDDCup99, 'http' subset features are numeric but loaded as objects
        X = kdd.data.astype(float)
        
        y = kdd.target.apply(lambda x: "BENIGN" if x == b'normal.' else "ATTACK")
        return X, y

def train_and_test_soc_ai(dataset_name="CIC-IDS 2017"):
    logging.info(f"Starting AI Reasoning Training for [{dataset_name}]...")
    
    # 1. Get Data
    X, y = get_real_data(dataset_name)
    logging.info(f"Dataset shape: {X.shape}")
    
    # 2. Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    logging.info(f"Training set: {X_train.shape[0]} samples. Testing set: {X_test.shape[0]} samples.")
    
    # 3. Train Random Forest
    logging.info("Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    
    # 4. Train KNN
    logging.info("Training K-Nearest Neighbors Classifier...")
    knn_model = KNeighborsClassifier(n_neighbors=5, n_jobs=-1)
    knn_model.fit(X_train, y_train)
    
    # 5. Evaluate Random Forest
    rf_preds = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    logging.info(f"Random Forest Accuracy: {rf_acc * 100:.2f}%")
    logging.info(f"\nRandom Forest Report:\n{classification_report(y_test, rf_preds)}")
    
    # 6. Evaluate KNN
    knn_preds = knn_model.predict(X_test)
    knn_acc = accuracy_score(y_test, knn_preds)
    logging.info(f"KNN Accuracy: {knn_acc * 100:.2f}%")
    logging.info(f"\nKNN Report:\n{classification_report(y_test, knn_preds)}")
    
    # 7. Save Models
    rf_path = os.path.join(MODELS_DIR, "soc_rf_model.pkl")
    knn_path = os.path.join(MODELS_DIR, "soc_knn_model.pkl")
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    
    joblib.dump(rf_model, rf_path)
    joblib.dump(knn_model, knn_path)
    
    # Save Feature Importance and Metadata for the "Reasoning" Page
    import json
    feature_importance = {}
    importances = rf_model.feature_importances_
    feature_names = X.columns.tolist()
    
    # Pair names with importance
    for name, imp in zip(feature_names, importances):
        feature_importance[name] = float(imp)
        
    metadata = {
        "rf_accuracy": float(rf_acc),
        "knn_accuracy": float(knn_acc),
        "feature_names": feature_names,
        "feature_importance": feature_importance,
        "dataset_samples": int(X.shape[0]),
        "trained_at": datetime.now().isoformat(),
        "classes": [str(c) for c in rf_model.classes_]
    }
    
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=4)
    
    logging.info(f"Models and metadata saved successfully to {MODELS_DIR}")
    logging.info("SOC AI Reasoning Feature is now ready to use these models.")


if __name__ == "__main__":
    train_and_test_soc_ai()
