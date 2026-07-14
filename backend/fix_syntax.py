import json

filepath = "notebooks/Analyst_Report.ipynb"
with open(filepath, "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] == "code":
        source = "".join(cell["source"])
        if 'summary_md = "\n".join(summary_lines)' in source:
            source = source.replace('summary_md = "\n".join(summary_lines)', 'summary_md = "\\n".join(summary_lines)')
            cell["source"] = [line + "\n" for line in source.split("\n")]
            cell["source"][-1] = cell["source"][-1].replace("\n", "")

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Syntax error fixed!")
