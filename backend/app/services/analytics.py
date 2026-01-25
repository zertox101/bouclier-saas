import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any
import pandas as pd
from datetime import datetime

class SecurityAnalyticsEngine:
    def __init__(self):
        self.scaler = StandardScaler()
        self.clf = IsolationForest(contamination=0.1, random_state=42)
        self.is_fitted = False
        self.history = []

    def train_model(self, traffic_data: List[Dict[str, Any]]):
        """
        Train the anomaly detection model on historical traffic data
        Feature engineering: port, packet_size (simulated), protocol_id
        """
        if len(traffic_data) < 10:
            return # Not enough data
            
        df = pd.DataFrame(traffic_data)
        
        # dynamic feature extraction
        features = self._extract_features(df)
        
        if features.empty:
            return

        self.clf.fit(features)
        self.is_fitted = True
        print(f"[AI Engine] Isolation Forest trained on {len(df)} records.")

    def detect_anomalies(self, current_traffic: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict anomalies in the current traffic batch
        Returns: List of anomalies with score
        """
        if not self.is_fitted or not current_traffic:
            return []

        df = pd.DataFrame(current_traffic)
        features = self._extract_features(df)
        
        if features.empty:
            return []
            
        # Predict: -1 for outliers, 1 for inliers
        predictions = self.clf.predict(features)
        # Decision function: lower = more abnormal
        scores = self.clf.decision_function(features)
        
        anomalies = []
        for i, pred in enumerate(predictions):
            if pred == -1:
                item = current_traffic[i].copy()
                item["ml_anomaly_score"] = float(round(scores[i], 4))
                item["ai_label"] = "Behavioral Anomaly"
                anomalies.append(item)
                
        return anomalies

    def _extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert raw logs to numerical features for the ML model"""
        try:
            # Create a copy to avoid SettingWithCopy warnings
            data = df.copy()
            
            # Feature 1: Port number
            data['port_feat'] = data['dst_port'].fillna(0).astype(int)
            
            # Feature 2: Time of day (hour)
            # Assuming there's a timestamp, otherwise use current
            if 'timestamp' in data.columns:
                data['hour'] = pd.to_datetime(data['timestamp']).dt.hour
            else:
                data['hour'] = datetime.now().hour

            # Feature 3: Service Mapping (Basic One-Hot or Ordinal)
            # For simplicity, we just hash the service string to a number
            data['service_hash'] = data['service'].apply(lambda x: hash(x) % 1000)

            return data[['port_feat', 'hour', 'service_hash']]
        except Exception as e:
            print(f"Feature extraction error: {e}")
            return pd.DataFrame()

# Global Instance
analytics_engine = SecurityAnalyticsEngine()
