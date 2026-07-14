import os
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(MODEL_DIR, "data", "cicids2017_sample.csv")
MODEL_CACHE = "/tmp/anomaly_models"
os.makedirs(MODEL_CACHE, exist_ok=True)
MODEL_FILE = os.path.join(MODEL_CACHE, "anomaly_model.pkl")
SCALER_FILE = os.path.join(MODEL_CACHE, "scaler.pkl")
PCA_FILE = os.path.join(MODEL_CACHE, "pca.pkl")
RF_FILE = os.path.join(MODEL_CACHE, "rf_classifier.pkl")
LE_FILE = os.path.join(MODEL_CACHE, "label_encoder.pkl")

# Full feature set from CICIDS-2017 Analyst Notebook
FEATURES = [
    "Flow Duration", "Total Fwd Packet", "Total Bwd packets",
    "Total Length of Fwd Packet", "Total Length of Bwd Packet",
    "Fwd Packet Length Max", "Fwd Packet Length Min", "Fwd Packet Length Mean",
    "Bwd Packet Length Max", "Bwd Packet Length Min", "Bwd Packet Length Mean",
    "Flow Bytes/s", "Flow Packets/s",
    "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max",
    "Fwd IAT Total", "Bwd IAT Total",
    "Fwd Header Length", "Bwd Header Length",
    "Packet Length Mean", "Packet Length Std",
    "FIN Flag Count", "SYN Flag Count", "RST Flag Count", "PSH Flag Count", "ACK Flag Count",
    "Average Packet Size", "Dst Port"
]

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.pca = None
        self.classifier = None
        self.le = None
        self.is_fitted = False
        self.total_trained = 0
        self.load_or_train()

    def load_or_train(self):
        # Priority 1: Load professional models from notebook
        if all(os.path.exists(f) for f in [MODEL_FILE, SCALER_FILE, PCA_FILE, RF_FILE, LE_FILE]):
            try:
                self.model = joblib.load(MODEL_FILE)
                self.scaler = joblib.load(SCALER_FILE)
                self.pca = joblib.load(PCA_FILE)
                self.classifier = joblib.load(RF_FILE)
                self.le = joblib.load(LE_FILE)
                self.is_fitted = True
                print("[+] Loaded Professional ML Models (IsolationForest + RandomForest).")
                return
            except Exception as e:
                print(f"[-] Failed to load professional models: {e}. Retrying local training...")
        
        # Priority 2: Fallback to basic training
        self.train_model()

    def train_model(self):
        print("[*] Training new AI models on CICIDS-2017 data...")
        if not os.path.exists(DATA_FILE):
            print(f"[-] Data file not found: {DATA_FILE}")
            return
            
        try:
            # Load dataset and use 30% for training as requested
            df = pd.read_csv(DATA_FILE, usecols=FEATURES + ["Label"])
            df = df.sample(frac=0.3, random_state=42)
            print(f"[*] Sampled 30% of dataset ({len(df)} rows) for training.")
            df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
            X = df[FEATURES].values
            
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # Anomaly Detection (Unsupervised)
            self.model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
            self.model.fit(X_scaled)
            
            # PCA for 2D visualization
            self.pca = PCA(n_components=2)
            self.pca.fit(X_scaled)
            
            # Basic Classifier (Supervised)
            self.le = LabelEncoder()
            y = self.le.fit_transform(df["Label"])
            self.classifier = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)
            self.classifier.fit(X_scaled, y)
            
            self.is_fitted = True
            self.total_trained = len(df)
            
            # Save fallback models
            joblib.dump(self.model, MODEL_FILE)
            joblib.dump(self.scaler, SCALER_FILE)
            joblib.dump(self.pca, PCA_FILE)
            joblib.dump(self.classifier, RF_FILE)
            joblib.dump(self.le, LE_FILE)
            print("[+] Base AI Models trained and saved.")
        except Exception as e:
            print(f"[-] AI Training Error: {e}")

    def predict(self, features_dict):
        """
        Inference engine. Returns:
        - is_anomaly: bool
        - confidence: float (0.0 to 1.0)
        - coords: [x, y] for PCA
        - attack_type: str (Label)
        """
        if not self.is_fitted:
            return False, 0.0, [0.0, 0.0], "BENIGN"
            
        try:
            # 1. Feature Extraction (Handle float/int variations)
            X_raw = []
            for f in FEATURES:
                val = features_dict.get(f, 0)
                try:
                    X_raw.append(float(val))
                except:
                    X_raw.append(0.0)
            
            X_arr = np.array([X_raw])
            X_scaled = self.scaler.transform(X_arr)
            
            # 2. Anomaly Status
            pred = self.model.predict(X_scaled)[0]
            is_anomaly = (pred == -1)
            
            # 3. Decision Score
            score = self.model.decision_function(X_scaled)[0]
            confidence = min(1.0, max(0.0, 0.5 - score))
            
            # 4. Attack Type Classification
            if self.classifier:
                prob = self.classifier.predict_proba(X_scaled)[0]
                class_idx = np.argmax(prob)
                attack_type = self.le.classes_[class_idx]
                # If classifier is confident in an attack, override is_anomaly
                if attack_type != "BENIGN" and prob[class_idx] > 0.6:
                    is_anomaly = True
            else:
                attack_type = "BENIGN"
            
            # 5. Visualization Coords
            coords = self.pca.transform(X_scaled)[0].tolist()
            
            return is_anomaly, confidence, coords, attack_type
        except Exception as e:
            print(f"[-] Inference Error: {e}")
            return False, 0.0, [0.0, 0.0], "UNKNOWN"

# Global instance
detector = AnomalyDetector()

