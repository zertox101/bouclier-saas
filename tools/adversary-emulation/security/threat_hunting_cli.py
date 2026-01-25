#!/usr/bin/env python3
"""
SHIELD Threat Hunting CLI (safe wrapper)
"""

import argparse
import json
import hashlib
import re
from pathlib import Path

from threat_hunting import IOCDatabase

IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
DOMAIN_RE = re.compile(r"\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b")
MD5_RE = re.compile(r"\b[a-fA-F0-9]{32}\b")
SHA256_RE = re.compile(r"\b[a-fA-F0-9]{64}\b")


def extract_indicators(text):
    indicators = set()
    indicators.update(IP_RE.findall(text))
    indicators.update(DOMAIN_RE.findall(text))
    indicators.update(MD5_RE.findall(text))
    indicators.update(SHA256_RE.findall(text))
    return sorted(indicators)


def main():
    parser = argparse.ArgumentParser(description="SHIELD Threat Hunting (safe wrapper)")
    parser.add_argument("--indicator", help="Single indicator to check (ip, domain, hash)")
    parser.add_argument("--file", help="Path to a text file to scan for indicators")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    if not args.indicator and not args.file:
        raise SystemExit("Provide --indicator or --file")

    ioc_db = IOCDatabase()
    findings = []

    if args.indicator:
        hits = ioc_db.search(args.indicator)
        findings.extend([ioc.__dict__ for ioc in hits])

    if args.file:
        path = Path(args.file)
        if not path.is_file():
            raise SystemExit("File not found")
        text = path.read_text(encoding="utf-8", errors="ignore")
        indicators = extract_indicators(text)
        for indicator in indicators:
            hits = ioc_db.search(indicator)
            for hit in hits:
                findings.append(hit.__dict__)

        file_hashes = {
            "md5": hashlib.md5(path.read_bytes()).hexdigest(),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }
        for h in file_hashes.values():
            hits = ioc_db.search(h)
            findings.extend([ioc.__dict__ for ioc in hits])

    result = {
        "indicator": args.indicator,
        "file": args.file,
        "matches": findings,
        "match_count": len(findings),
    }

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Matches: {result['match_count']}")
        for match in findings[:10]:
            print(f"- {match.get('type')}: {match.get('threat_type')} ({match.get('confidence')})")


if __name__ == "__main__":
    main()
