
import sys
import json
import argparse
from cyber_resources_db import search_resources

def main():
    parser = argparse.ArgumentParser(description="Cybersecurity Resource Hub")
    parser.add_argument("--query", type=str, help="Search query for resources")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")
    
    args = parser.parse_args()
    results = search_resources(args.query or "*")
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("\n📚 [Cyber Intelligence Hub] - Tactical Resources\n")
        if not results:
            print("[-] No resources found matching your query.")
        else:
            for res in results:
                print(f"[+] {res['name']}")
                print(f"    Category: {res['category']}")
                print(f"    URL: {res['url']}\n")

if __name__ == "__main__":
    main()
