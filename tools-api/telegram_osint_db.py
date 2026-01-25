
TELEGRAM_BOTS = [
    {
        "name": "User Info Bot",
        "handle": "@userinfobot",
        "category": "ID Lookup",
        "description": "Get the unique Telegram ID for any user or forward."
    },
    {
        "name": "SangMata Info",
        "handle": "@SangMataInfo_bot",
        "category": "Name History",
        "description": "Check the history of name changes for a Telegram account."
    },
    {
        "name": "Creation Date Bot",
        "handle": "@Creation_Date_Bot",
        "category": "Account Age",
        "description": "Estimates the creation date of a Telegram account."
    },
    {
        "name": "Link Checker Bot",
        "handle": "@Link_Checker_Bot",
        "category": "Security",
        "description": "Verify if a link is safe or malicious before clicking."
    },
    {
        "name": "Quick OSINT Bot",
        "handle": "@QuickOSINTBot",
        "category": "Data Breach",
        "description": "Search for leaks associated with phone numbers or emails."
    },
    {
        "name": "Telesint",
        "handle": "@telesint_bot",
        "category": "Group Lookup",
        "description": "Identify groups a specific user is a member of."
    },
    {
        "name": "TGScan Robot",
        "handle": "@tgscanrobot",
        "category": "Group Lookup",
        "description": "Find public groups where a user has been active."
    }
]

def search_bots(query: str):
    if not query or query == "*":
        return TELEGRAM_BOTS
    
    query = query.lower()
    results = []
    for bot in TELEGRAM_BOTS:
        if query in bot["name"].lower() or query in bot["handle"].lower() or query in bot["description"].lower() or query in bot["category"].lower():
            results.append(bot)
    return results
