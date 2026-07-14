import json

filepath = "notebooks/Analyst_Report.ipynb"
with open(filepath, "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] == "code":
        source = "".join(cell["source"])
        
        # Fix pandas resample
        source = source.replace('resample("1H")', 'resample("1h")')
        
        # split it back safely
        if source.endswith('\n'):
            lines = [line + '\n' for line in source.split('\n')[:-1]]
        else:
            lines = [line + '\n' for line in source.split('\n')]
            if lines:
                lines[-1] = lines[-1][:-1]
            
        cell["source"] = lines

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Pandas frequency fixed!")
