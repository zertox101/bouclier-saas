
CYBER_RESOURCES = [
    {"name": "Awesome Red Team Ops", "url": "https://github.com/CyberSecurityUP/Awesome-Red-Team-Operations", "category": "Red Team"},
    {"name": "Awesome Red Teaming", "url": "https://github.com/yeyintminthuhtut/Awesome-Red-Teaming", "category": "Red Team"},
    {"name": "Awesome Red Team ToolKit", "url": "https://0x1.gitlab.io/pentesting/Red-Teaming-Toolkit/", "category": "Red Team"},
    {"name": "Awesome Blue Team Ops", "url": "https://github.com/fabacab/awesome-cybersecurity-blueteam", "category": "Blue Team"},
    {"name": "Awesome OSINT", "url": "https://github.com/jivoi/awesome-osint", "category": "OSINT"},
    {"name": "Awesome DevSecOps", "url": "https://github.com/devsecops/awesome-devsecop", "category": "DevSecOps"},
    {"name": "Awesome Pentest", "url": "https://github.com/enaqx/awesome-pentest", "category": "Pentest"},
    {"name": "Awesome Cloud Pentest", "url": "https://github.com/CyberSecurityUP/Awesome-Cloud-PenTest", "category": "Cloud"},
    {"name": "Awesome Shodan", "url": "https://github.com/jakejarvis/awesome-shodan-queries", "category": "OSINT"},
    {"name": "Awesome AWS Security", "url": "https://github.com/jassics/awesome-aws-security", "category": "Cloud"},
    {"name": "Awesome Malware Analysis & RE", "url": "https://github.com/CyberSecurityUP/Awesome-Malware-Analysis-Reverse-Engineering", "category": "Malware"},
    {"name": "Awesome Malware Analysis", "url": "https://github.com/rshipp/awesome-malware-analysis", "category": "Malware"},
    {"name": "Awesome Computer Forensics", "url": "https://github.com/cugu/awesome-forensics", "category": "Forensics"},
    {"name": "Awesome Cloud Security", "url": "https://github.com/4ndersonLin/awesome-cloud-security", "category": "Cloud"},
    {"name": "Awesome Reverse Engineering", "url": "https://github.com/tylerha97/awesome-reversing", "category": "Reverse Engineering"},
    {"name": "Awesome Threat Intelligence", "url": "https://github.com/hslatman/awesome-threat-intelligence", "category": "Threat Intelligence"},
    {"name": "Awesome SOC", "url": "https://github.com/cyb3rxp/awesome-soc", "category": "SOC"},
    {"name": "Awesome Social Engineering", "url": "https://github.com/v2-dev/awesome-social-engineering", "category": "Social Engineering"},
    {"name": "Awesome Web Security", "url": "https://github.com/qazbnm456/awesome-web-security", "category": "Web"},
    {"name": "Awesome API Security", "url": "https://github.com/arainho/awesome-api-security", "category": "API"},
    {"name": "Awesome WEB3 Security", "url": "https://github.com/Anugrahsr/Awesome-web3-Security", "category": "Web3"},
    {"name": "Awesome Incident Response", "url": "https://github.com/Correia-jpv/fucking-awesome-incident-response", "category": "Incident Response"},
    {"name": "Awesome Search Engines", "url": "https://github.com/edoardottt/awesome-hacker-search-engines", "category": "OSINT"},
    {"name": "Awesome Smart Contract Security", "url": "https://github.com/saeidshirazi/Awesome-Smart-Contract-Security", "category": "Web3"},
    {"name": "Awesome Terraform", "url": "https://github.com/shuaibiyy/awesome-terraform", "category": "DevSecOps"},
    {"name": "Awesome Burpsuite Extensions", "url": "https://github.com/snoopysecurity/awesome-burp-extensions", "category": "Web"},
    {"name": "Awesome IOT", "url": "https://github.com/phodal/awesome-iot", "category": "IOT"},
    {"name": "Awesome IOS Security", "url": "https://github.com/Cy-clon3/awesome-ios-security", "category": "Mobile"},
    {"name": "Awesome Embedded & IOT Security", "url": "https://github.com/fkie-cad/awesome-embedded-and-iot-security", "category": "IOT"},
    {"name": "Awesome OSINT Bots", "url": "https://github.com/ItIsMeCall911/Awesome-Telegram-OSINT", "category": "OSINT"},
    {"name": "Awesome IOT Hacks", "url": "https://github.com/nebgnahz/awesome-iot-hacks", "category": "IOT"},
    {"name": "Awesome Piracy", "url": "https://github.com/Igglybuff/awesome-piracy", "category": "Misc"},
    {"name": "Awesome Web Hacking", "url": "https://github.com/infoslack/awesome-web-hacking", "category": "Web"},
    {"name": "Awesome Memory Forensics", "url": "https://github.com/digitalisx/awesome-memory-forensics", "category": "Forensics"},
    {"name": "Awesome OSCP", "url": "https://github.com/0x4D31/awesome-oscp", "category": "Certification"},
    {"name": "Awesome RAT", "url": "https://github.com/alphaSeclab/awesome-rat", "category": "Malware"}
]

def search_resources(query: str):
    if not query or query == "*":
        return CYBER_RESOURCES
    
    query = query.lower()
    return [r for r in CYBER_RESOURCES if query in r["name"].lower() or query in r["category"].lower()]
