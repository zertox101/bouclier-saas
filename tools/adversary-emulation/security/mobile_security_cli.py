#!/usr/bin/env python3
"""
SHIELD Mobile Security CLI (safe wrapper)
"""

import argparse
import json

from mobile_security import APKAnalyzer, AppSecurityTester


def main():
    parser = argparse.ArgumentParser(description="SHIELD Mobile Security (safe wrapper)")
    parser.add_argument("--apk", help="Path to APK file for static analysis")
    parser.add_argument("--domain", help="Domain for TLS and API header checks")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    results = {}

    if args.apk:
        analyzer = APKAnalyzer()
        results["apk_analysis"] = analyzer.analyze(args.apk)

    if args.domain:
        tester = AppSecurityTester()
        results["app_security"] = {
            "domain": args.domain,
            "ssl": tester.test_ssl_pinning(args.domain),
            "api": tester.test_api_security(f"https://{args.domain}"),
        }

    if not results:
        raise SystemExit("Provide --apk and/or --domain")

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        if "apk_analysis" in results:
            apk = results["apk_analysis"]
            print(f"APK: {apk.get('path')}")
            print(f"Risk score: {apk.get('risk_score')}")
            print(f"Dangerous permissions: {len(apk.get('dangerous_permissions', []))}")
        if "app_security" in results:
            app = results["app_security"]
            print(f"Domain: {app.get('domain')}")
            tests = app.get("api", {}).get("api_tests", [])
            missing = [t for t in tests if t.get("status") == "MISSING"]
            print(f"Security headers missing: {len(missing)}")


if __name__ == "__main__":
    main()
