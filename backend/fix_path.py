import json

filepath = "notebooks/Analyst_Report.ipynb"
with open(filepath, "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] == "code":
        source = "".join(cell["source"])
        if "app/ml/data/cicids2017_sample.csv" in source:
            new_source = source.replace(
                "df = pd.read_csv('app/ml/data/cicids2017_sample.csv').sample(frac=0.3, random_state=42)", 
                "import os\n# Fix path based on where notebook is executed\ndata_path = '../app/ml/data/cicids2017_sample.csv' if os.path.exists('../app/ml/data/cicids2017_sample.csv') else 'app/ml/data/cicids2017_sample.csv'\ndf = pd.read_csv(data_path).sample(frac=0.3, random_state=42)"
            )
            
            lines = [line + '\n' for line in new_source.split('\n')]
            if lines:
                lines[-1] = lines[-1][:-1]
                
            cell["source"] = lines
            break

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Path fixed!")
