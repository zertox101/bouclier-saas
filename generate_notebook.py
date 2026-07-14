import json
import os

nb = {
 'nbformat': 4,
 'nbformat_minor': 5,
 'metadata': {
  'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'},
  'language_info': {'name': 'python', 'version': '3.12.0'}
 },
 'cells': []
}

def md(src):
    return {'cell_type': 'markdown', 'metadata': {}, 'source': [src]}

def code(src):
    return {'cell_type': 'code', 'metadata': {}, 'source': [src], 'execution_count': None, 'outputs': []}

# ── Title ──
nb['cells'].append(md("""# BOUCLIER SAAS — CICIDS-2017 Threat Intelligence Analysis

**Dataset:** Canadian Institute for Cybersecurity — Intrusion Detection System 2017  
**Objective:** Analyze real network attack patterns, train anomaly detection models, and generate actionable threat intelligence.

---"""))

# ── Cell 1: Imports ──
nb['cells'].append(code("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import warnings
warnings.filterwarnings("ignore")

# Style
plt.style.use("dark_background")
sns.set_palette("magma")

# Helper for saving plots in either backend/ or backend/notebooks/
def safe_save(filename):
    if os.path.exists("notebooks"):
        path = os.path.join("notebooks", filename)
    else:
        path = filename
    plt.savefig(path, dpi=150, bbox_inches="tight")
    print(f"Saved plot: {path}")

print("Libraries loaded.")"""))

# ── Cell 2: Load Data ──
nb['cells'].append(md("## 1. Data Loading & Exploration\n\nLoad the real CICIDS-2017 dataset (sample: ~350K records)."))

nb['cells'].append(code("""DATA_PATH = "app/ml/data/cicids2017_sample.csv"
if not os.path.exists(DATA_PATH):
    DATA_PATH = "../app/ml/data/cicids2017_sample.csv"
    
df = pd.read_csv(DATA_PATH, low_memory=False)
print(f"Dataset shape: {df.shape[0]:,} rows x {df.shape[1]} columns")
print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1e6:.1f} MB")
df.head()"""))

# ── Cell 3: Info ──
nb['cells'].append(code("""df.info(verbose=False)
print("\\nMissing values:", df.isnull().sum().sum())
print("\\nLabel distribution:")
print(df["Label"].value_counts())"""))

# ── Cell 4: Class Distribution ──
nb['cells'].append(md("## 2. Attack Distribution Analysis"))

nb['cells'].append(code("""fig, axes = plt.subplots(1, 2, figsize=(18, 6))

# Bar chart
label_counts = df["Label"].value_counts()
colors = ["#00ff88" if l == "BENIGN" else "#ff4444" for l in label_counts.index]
axes[0].barh(label_counts.index, label_counts.values, color=colors, edgecolor="white", linewidth=0.3)
axes[0].set_xlabel("Number of Flows", fontweight="bold")
axes[0].set_title("Attack Type Distribution", fontsize=14, fontweight="bold")
for i, v in enumerate(label_counts.values):
    axes[0].text(v + 500, i, f"{v:,}", va="center", fontsize=9, color="white")

# Pie chart (top 6)
top_labels = label_counts.head(6)
explode = [0.05] * len(top_labels)
axes[1].pie(top_labels, labels=top_labels.index, autopct="%1.1f%%", explode=explode,
            shadow=True, startangle=140, textprops={"fontsize": 9})
axes[1].set_title("Top 6 Traffic Categories", fontsize=14, fontweight="bold")

plt.tight_layout()
safe_save("attack_distribution.png")
plt.show()"""))

# ── Cell 5: Feature Engineering ──
nb['cells'].append(md("## 3. Feature Engineering & Preprocessing"))

nb['cells'].append(code("""# Select numeric features for ML
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

# Clean infinities and NaN
X = df[FEATURES].copy()
X = X.replace([np.inf, -np.inf], np.nan).fillna(0)

# Encode labels: BENIGN = 0, Attack = 1
y_binary = (df["Label"] != "BENIGN").astype(int)
y_multi = df["Label"].copy()

print(f"Features: {len(FEATURES)}")
print(f"Benign: {(y_binary == 0).sum():,}  |  Attacks: {(y_binary == 1).sum():,}")"""))

# ── Cell 6: Correlation Heatmap ──
nb['cells'].append(md("## 4. Feature Correlation Heatmap"))

nb['cells'].append(code("""fig, ax = plt.subplots(figsize=(16, 12))
corr = X.corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, cmap="coolwarm", center=0, ax=ax,
            square=True, linewidths=0.5, cbar_kws={"shrink": 0.7},
            xticklabels=True, yticklabels=True)
ax.set_title("Feature Correlation Matrix - CICIDS 2017", fontsize=14, fontweight="bold")
plt.xticks(fontsize=7, rotation=45, ha="right")
plt.yticks(fontsize=7)
plt.tight_layout()
safe_save("correlation_heatmap.png")
plt.show()"""))

# ── Cell 7: PCA Visualization ──
nb['cells'].append(md("## 5. PCA - Anomaly Visualization (2D Projection)"))

nb['cells'].append(code("""scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

fig, ax = plt.subplots(figsize=(12, 8))
scatter = ax.scatter(X_pca[:, 0], X_pca[:, 1], c=y_binary, cmap="coolwarm",
                     alpha=0.15, s=3, edgecolors="none")
ax.set_xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% variance)")
ax.set_ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% variance)")
ax.set_title("PCA Projection - Benign vs Attack Traffic", fontsize=14, fontweight="bold")
legend = ax.legend(*scatter.legend_elements(), title="Class", labels=["Benign", "Attack"])
ax.add_artist(legend)
plt.tight_layout()
safe_save("pca_scatter.png")
plt.show()
print(f"Explained variance: PC1={pca.explained_variance_ratio_[0]*100:.1f}%, PC2={pca.explained_variance_ratio_[1]*100:.1f}%")"""))

# ── Cell 8: IsolationForest ──
nb['cells'].append(md("## 6. Anomaly Detection - IsolationForest"))

nb['cells'].append(code("""iso = IsolationForest(n_estimators=200, contamination=0.15, random_state=42, n_jobs=-1)
iso.fit(X_scaled)

y_iso_pred = iso.predict(X_scaled)  # -1 = anomaly, 1 = normal
y_iso_binary = (y_iso_pred == -1).astype(int)

print("IsolationForest Results:")
print(f"  Detected anomalies: {y_iso_binary.sum():,} / {len(y_iso_binary):,}")
print(f"  Actual attacks:     {y_binary.sum():,}")
print()
print(classification_report(y_binary, y_iso_binary, target_names=["Benign", "Attack"]))"""))

# ── Cell 9: Random Forest ──
nb['cells'].append(md("## 7. Supervised Classification - Random Forest\n\nTrain a real multi-class classifier to distinguish attack types."))

nb['cells'].append(code("""# Encode multi-class labels
le = LabelEncoder()
y_encoded = le.fit_transform(y_multi)

# Filter out classes with only 1 member to avoid split error
counts = np.bincount(y_encoded)
valid_classes = np.where(counts >= 2)[0]
mask = np.isin(y_encoded, valid_classes)
X_final = X_scaled[mask]
y_final = y_encoded[mask]

X_train, X_test, y_train, y_test = train_test_split(
    X_final, y_final, test_size=0.2, random_state=42, stratify=y_final
)

rf = RandomForestClassifier(n_estimators=100, max_depth=20, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

y_pred = rf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Random Forest Accuracy: {acc*100:.2f}%")
print()
# Get filtered target names
filtered_classes = [le.classes_[i] for i in valid_classes]
print(classification_report(y_test, y_pred, target_names=filtered_classes))"""))

# ── Cell 10: Confusion Matrix ──
nb['cells'].append(md("## 8. Confusion Matrix"))

nb['cells'].append(code("""cm = confusion_matrix(y_test, y_pred)
fig, ax = plt.subplots(figsize=(12, 10))
sns.heatmap(cm, annot=True, fmt="d", cmap="Reds",
            xticklabels=filtered_classes, yticklabels=filtered_classes, ax=ax)
ax.set_xlabel("Predicted", fontweight="bold")
ax.set_ylabel("Actual", fontweight="bold")
ax.set_title(f"Multi-Class Confusion Matrix (Accuracy: {acc*100:.1f}%)", fontsize=14, fontweight="bold")
plt.xticks(rotation=45, ha="right", fontsize=8)
plt.yticks(fontsize=8)
plt.tight_layout()
safe_save("confusion_matrix.png")
plt.show()"""))

# ── Cell 11: Feature Importance ──
nb['cells'].append(md("## 9. Feature Importance - What Reveals an Attack?"))

nb['cells'].append(code("""importances = rf.feature_importances_
idx = np.argsort(importances)[::-1]

fig, ax = plt.subplots(figsize=(14, 6))
ax.bar(range(len(FEATURES)), importances[idx], color="#ff6b6b", edgecolor="white", linewidth=0.3)
ax.set_xticks(range(len(FEATURES)))
ax.set_xticklabels([FEATURES[i] for i in idx], rotation=45, ha="right", fontsize=8)
ax.set_ylabel("Importance Score")
ax.set_title("Random Forest Feature Importance - Top Attack Indicators", fontsize=14, fontweight="bold")
plt.tight_layout()
safe_save("feature_importance.png")
plt.show()

print("Top 5 features:")
for i in idx[:5]:
    print(f"  {FEATURES[i]}: {importances[i]:.4f}")"""))

# ── Cell 12: Port Analysis ──
nb['cells'].append(md("## 10. Targeted Port Analysis"))

nb['cells'].append(code("""attack_df = df[df["Label"] != "BENIGN"].copy()
port_counts = attack_df["Dst Port"].value_counts().head(15)

fig, ax = plt.subplots(figsize=(12, 5))
port_counts.plot(kind="bar", ax=ax, color="#ff4757", edgecolor="white", linewidth=0.3)
ax.set_xlabel("Destination Port")
ax.set_ylabel("Attack Count")
ax.set_title("Most Targeted Ports in CICIDS-2017 Attacks", fontsize=14, fontweight="bold")
plt.xticks(rotation=0, fontsize=9)
plt.tight_layout()
safe_save("targeted_ports.png")
plt.show()"""))

# ── Cell 13: Export Model ──
nb['cells'].append(md("## 11. Export Production Model\n\nSave the trained model for the BOUCLIER backend API."))

nb['cells'].append(code("""import joblib
import os

MODEL_DIR = "app/ml"
if not os.path.exists(MODEL_DIR):
    MODEL_DIR = "../app/ml"

joblib.dump(iso, os.path.join(MODEL_DIR, "anomaly_model.pkl"))
joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
joblib.dump(pca, os.path.join(MODEL_DIR, "pca.pkl"))
joblib.dump(rf, os.path.join(MODEL_DIR, "rf_classifier.pkl"))
joblib.dump(le, os.path.join(MODEL_DIR, "label_encoder.pkl"))

print("Models exported:")
for f in ["anomaly_model.pkl", "scaler.pkl", "pca.pkl", "rf_classifier.pkl", "label_encoder.pkl"]:
    path = os.path.join(MODEL_DIR, f)
    if os.path.exists(path):
        size = os.path.getsize(path) / 1024
        print(f"  {f}: {size:.0f} KB")"""))

# ── Cell 14: Summary ──
nb['cells'].append(md("""## 12. Executive Summary

| Metric | Value |
|--------|-------|
| Dataset | CICIDS-2017 (Canadian Institute for Cybersecurity) |
| Records | ~350,000 network flows |
| Features | 29 selected from 87 |
| IsolationForest | Unsupervised anomaly detection |
| RandomForest | Supervised multi-class classification |
| Exported Models | `anomaly_model.pkl`, `rf_classifier.pkl`, `scaler.pkl`, `pca.pkl` |

---

**BOUCLIER SAAS** uses these models in production for real-time threat detection."""))

out_path = os.path.join("backend", "notebooks", "Analyst_Report.ipynb")
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

print(f"Notebook created: {out_path}")
