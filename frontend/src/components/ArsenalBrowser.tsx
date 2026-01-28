"use client";

import { useState } from "react";
import { Search, ExternalLink, Shield, Terminal, Zap, Lock, Globe, Database, Server, Cpu, Wifi, Eye, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

// Categories mapping to icons
const CATEGORY_ICONS: Record<string, any> = {
    "Android Utilities": Cpu,
    "Anonymity Tools": Eye,
    "Anti-virus Evasion Tools": Shield,
    "Cloud Platform Attack Tools": Database,
    "Exfiltration Tools": ExternalLink,
    "Exploit Development Tools": Terminal,
    "Network Tools": Wifi,
    "OSINT": Globe,
    "Reverse Engineering": Cpu,
    "Web Exploitation": Globe,
    "Windows Utilities": Server,
    "Vulnerability Databases": Database,
};

type Tool = {
    name: string;
    description: string;
    url: string;
    category: string;
    installed: boolean;
    toolId?: string;
    command?: string;
};

const TOOLS_DATA: Tool[] = [
    // Network Reconnaissance
    { name: "Nmap", description: "Network exploration and security auditing.", url: "https://nmap.org/", category: "Network Tools", installed: true, toolId: "network_recon", command: "nmap" },
    { name: "Masscan", description: "Fastest Internet port scanner.", url: "https://github.com/robertdavidgraham/masscan", category: "Network Tools", installed: true, toolId: "mass_scan", command: "masscan" },
    { name: "ARP-Scan", description: "Local network discovery via ARP.", url: "https://github.com/royhills/arp-scan", category: "Network Tools", installed: true, toolId: "network_scanner", command: "arp-scan" },
    { name: "Wireshark", description: "Network protocol analyzer.", url: "https://www.wireshark.org/", category: "Network Tools", installed: true, command: "tshark" },
    { name: "tcpdump", description: "Packet capture and analysis.", url: "https://www.tcpdump.org/", category: "Network Tools", installed: true, toolId: "packet_sniffer", command: "tcpdump" },

    // Web Exploitation
    { name: "SQLmap", description: "Automatic SQL injection and database takeover.", url: "http://sqlmap.org/", category: "Web Exploitation", installed: true, toolId: "sqlmap_scan", command: "sqlmap" },
    { name: "Nikto", description: "Web server scanner.", url: "https://cirt.net/Nikto2", category: "Web Exploitation", installed: true, toolId: "web_scanner", command: "nikto" },
    { name: "Gobuster", description: "Directory/file & DNS busting tool.", url: "https://github.com/OJ/gobuster", category: "Web Exploitation", installed: true, toolId: "dir_bruteforce", command: "gobuster" },
    { name: "ffuf", description: "Fast web fuzzer.", url: "https://github.com/ffuf/ffuf", category: "Web Exploitation", installed: true, toolId: "web_fuzz", command: "ffuf" },
    { name: "WhatWeb", description: "Web technology fingerprinting.", url: "https://github.com/urbanadventurer/WhatWeb", category: "Web Exploitation", installed: true, toolId: "http_fingerprint", command: "whatweb" },
    { name: "Wapiti", description: "Web application vulnerability scanner.", url: "https://wapiti-scanner.github.io/", category: "Web Exploitation", installed: true, command: "wapiti" },
    { name: "Nuclei", description: "Fast vulnerability scanner based on templates.", url: "https://github.com/projectdiscovery/nuclei", category: "Web Exploitation", installed: true, toolId: "nuclei_scan", command: "nuclei" },

    // Password Attacks
    { name: "Hydra", description: "Network logon cracker supporting many protocols.", url: "https://github.com/vanhauser-thc/thc-hydra", category: "Password Attacks", installed: true, toolId: "password_auditor", command: "hydra" },
    { name: "John the Ripper", description: "Fast password cracker.", url: "https://www.openwall.com/john/", category: "Password Attacks", installed: true, command: "john" },
    { name: "Hashcat", description: "Advanced password recovery.", url: "https://hashcat.net/hashcat/", category: "Password Attacks", installed: true, command: "hashcat" },
    { name: "Crunch", description: "Wordlist generator.", url: "https://sourceforge.net/projects/crunch-wordlist/", category: "Password Attacks", installed: true, command: "crunch" },

    // OSINT
    { name: "theHarvester", description: "E-mail, subdomain and people names harvester.", url: "https://github.com/laramies/theHarvester", category: "OSINT", installed: true, toolId: "theharvester_scan", command: "theHarvester" },
    { name: "Amass", description: "In-depth DNS enumeration and network mapping.", url: "https://github.com/OWASP/Amass", category: "OSINT", installed: true, toolId: "amass_enum", command: "amass" },
    { name: "Recon-ng", description: "Full-featured reconnaissance framework.", url: "https://github.com/lanmaster53/recon-ng", category: "OSINT", installed: true, command: "recon-ng" },
    { name: "Subfinder", description: "Subdomain discovery tool.", url: "https://github.com/projectdiscovery/subfinder", category: "OSINT", installed: true, command: "subfinder" },
    { name: "Shodan", description: "Search engine for Internet-connected devices.", url: "https://www.shodan.io/", category: "OSINT", installed: false },
    { name: "Maltego", description: "Interactive data mining tool.", url: "https://www.maltego.com/", category: "OSINT", installed: false },

    // Exploitation Frameworks
    { name: "Metasploit", description: "The world's most used penetration testing framework.", url: "https://www.metasploit.com/", category: "Exploit Frameworks", installed: true, command: "msfconsole" },
    { name: "ExploitDB", description: "Archive of public exploits and vulnerable software.", url: "https://www.exploit-db.com/", category: "Exploit Frameworks", installed: true, command: "searchsploit" },

    // Post-Exploitation
    { name: "CrackMapExec", description: "Swiss army knife for pentesting networks.", url: "https://github.com/byt3bl33d3r/CrackMapExec", category: "Post-Exploitation", installed: true, toolId: "cme_smb", command: "crackmapexec" },
    { name: "Mimikatz", description: "Extract credentials from Windows memory.", url: "https://github.com/gentilkiwi/mimikatz", category: "Post-Exploitation", installed: false },
    { name: "BloodHound", description: "Active Directory attack path analysis.", url: "https://github.com/BloodHoundAD/BloodHound", category: "Post-Exploitation", installed: true, command: "bloodhound-python" },
    { name: "Empire", description: "PowerShell post-exploitation framework.", url: "https://github.com/EmpireProject/Empire", category: "Post-Exploitation", installed: true, command: "empire" },

    // Wireless
    { name: "Aircrack-ng", description: "WiFi security auditing tools suite.", url: "https://www.aircrack-ng.org/", category: "Wireless", installed: true, command: "aircrack-ng" },
    { name: "Wifite", description: "Automated wireless attack tool.", url: "https://github.com/derv82/wifite2", category: "Wireless", installed: true, command: "wifite" },

    // Forensics
    { name: "Binwalk", description: "Firmware analysis tool.", url: "https://github.com/ReFirmLabs/binwalk", category: "Forensics", installed: true, command: "binwalk" },
    { name: "Foremost", description: "File carving and data recovery.", url: "http://foremost.sourceforge.net/", category: "Forensics", installed: true, command: "foremost" },
    { name: "YARA", description: "Pattern matching for malware research.", url: "https://virustotal.github.io/yara/", category: "Forensics", installed: true, command: "yara" },

    // Reverse Engineering
    { name: "Ghidra", description: "NSA's software reverse engineering suite.", url: "https://ghidra-sre.org/", category: "Reverse Engineering", installed: false },
    { name: "IDA Pro", description: "The premier disassembler and debugger.", url: "https://hex-rays.com/ida-pro/", category: "Reverse Engineering", installed: false },
    { name: "Radare2", description: "Open-source reverse engineering framework.", url: "https://rada.re/", category: "Reverse Engineering", installed: true, command: "r2" },

    // Cloud Security
    { name: "CloudSplaining", description: "AWS IAM security assessment.", url: "https://cloudsplaining.readthedocs.io/", category: "Cloud Security", installed: true, command: "cloudsplaining" },
    { name: "ScoutSuite", description: "Multi-cloud security auditing tool.", url: "https://github.com/nccgroup/ScoutSuite", category: "Cloud Security", installed: true, command: "scout" },
    { name: "Prowler", description: "AWS security best practices assessment.", url: "https://github.com/prowler-cloud/prowler", category: "Cloud Security", installed: true, command: "prowler" },

    // Mobile Security
    { name: "MobSF", description: "Mobile Security Framework for Android/iOS.", url: "https://github.com/MobSF/Mobile-Security-Framework-MobSF", category: "Mobile Security", installed: true, command: "mobsf" },
    { name: "Frida", description: "Dynamic instrumentation toolkit.", url: "https://frida.re/", category: "Mobile Security", installed: true, command: "frida" },

    // Utilities
    { name: "OpenSSL", description: "Cryptography and SSL/TLS toolkit.", url: "https://www.openssl.org/", category: "Utilities", installed: true, toolId: "tls_check", command: "openssl" },
    { name: "cURL", description: "Command line HTTP client.", url: "https://curl.se/", category: "Utilities", installed: true, toolId: "http_probe", command: "curl" },
    { name: "Netcat", description: "TCP/IP swiss army knife.", url: "http://netcat.sourceforge.net/", category: "Utilities", installed: true, toolId: "port_check", command: "nc" },
    { name: "SSLScan", description: "SSL/TLS scanner.", url: "https://github.com/rbsec/sslscan", category: "Utilities", installed: true, command: "sslscan" },
];

export default function ArsenalBrowser() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredTools = TOOLS_DATA.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(TOOLS_DATA.map(t => t.category)));

    return (
        <div className="h-full w-full bg-[#0a0e1a] text-white p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            Offensive Security Arsenal
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Curated elite penetration testing tools & resources.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tools (e.g., 'injection', 'audit')..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-400">LIVE DB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === null
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTools.map((tool, idx) => {
                        const Icon = CATEGORY_ICONS[tool.category] || Terminal;
                        return (
                            <motion.a
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative bg-[#0f1419] border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300"
                            >
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    {tool.installed ? (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                                            <span className="text-[10px] font-bold text-emerald-400">INSTALLED</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700">
                                            <XCircle className="h-3 w-3 text-slate-500" />
                                            <span className="text-[10px] font-bold text-slate-500">NOT INSTALLED</span>
                                        </div>
                                    )}
                                    <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                </div>

                                <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                                    <Icon className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                    {tool.name}
                                </h3>
                                <div className="text-xs font-semibold text-slate-500 mb-3 px-2 py-1 rounded bg-slate-900 inline-block">
                                    {tool.category}
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {tool.description}
                                </p>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
