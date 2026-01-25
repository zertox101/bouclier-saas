
import sys
import json
import argparse
from telegram_osint_db import search_bots

def main():
    parser = argparse.ArgumentParser(description="Telegram OSINT Bot Finder")
    parser.add_argument("--query", type=str, help="Search query (name, handle, or category)")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")
    
    args = parser.parse_args()
    
    results = search_bots(args.query or "*")
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("\n🛡️  [Telegram OSINT Hub] - Search Results\n")
        if not results:
            print("[-] No matching bots found.")
        for bot in results:
            print(f"[+] {bot['name']} ({bot['handle']})")
            print(f"    Category: {bot['category']}")
            print(f"    Description: {bot['description']}\n")

if __name__ == "__main__":
    main()
