#!/usr/bin/env python3
"""
SHIELD Report Generator CLI (safe wrapper)
"""

import argparse
import json
from pathlib import Path

from report_generator import ReportGenerator


def main():
    parser = argparse.ArgumentParser(description="SHIELD Report Generator (safe wrapper)")
    parser.add_argument("--input", required=True, help="Path to JSON file with report data")
    parser.add_argument("--output-dir", default=".", help="Output directory")
    parser.add_argument("--formats", default="html,json,md", help="Comma-separated formats: html,json,md")
    parser.add_argument("--json", action="store_true", help="Output summary as JSON")
    args = parser.parse_args()

    data_path = Path(args.input)
    if not data_path.is_file():
        raise SystemExit("Input file not found")

    data = json.loads(data_path.read_text(encoding="utf-8"))

    report = ReportGenerator(title=data.get("title", "Security Assessment Report"))
    if data.get("executive_summary"):
        report.set_executive_summary(data["executive_summary"])

    for section in data.get("sections", []):
        report.add_section(
            section.get("title", "Section"),
            section.get("content", ""),
            section.get("findings") or [],
        )

    for finding in data.get("findings", []):
        report.add_finding(finding)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    formats = {f.strip().lower() for f in args.formats.split(",") if f.strip()}

    outputs = []
    if "html" in formats:
        outputs.append(report.generate_html(str(output_dir / "security_report.html")))
    if "json" in formats:
        outputs.append(report.generate_json(str(output_dir / "security_report.json")))
    if "md" in formats or "markdown" in formats:
        outputs.append(report.generate_markdown(str(output_dir / "security_report.md")))

    result = {"outputs": outputs}

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        for out in outputs:
            print(f"Generated: {out}")


if __name__ == "__main__":
    main()
