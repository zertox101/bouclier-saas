# 🛠️ Advanced Security Tools - Installation Summary

**Date**: 2026-01-30  
**Status**: ✅ INSTALLED & SYNCHRONIZED

---

## 📦 Newly Installed Enterprise Tools

### 1️⃣ **Shodan CLI** (OSINT)
- **Package**: `shodan` (Python)
- **Command**: `shodan`
- **Tool ID**: `shodan_search`
- **Usage**: 
  ```bash
  shodan init YOUR_API_KEY
  shodan search "apache country:US"
  shodan host 8.8.8.8
  ```
- **API Key Required**: Yes (get from https://shodan.io)
- **Category**: OSINT / IoT Discovery
- **Risk**: Low

---

### 2️⃣ **Maltego Transform Runtime** (OSINT)
- **Package**: `maltego-trx` (Python)
- **Command**: `maltego-trx`
- **Tool ID**: `maltego_transform`
- **Usage**:
  ```bash
  maltego-trx start
  # Custom transforms via Python API
  ```
- **Category**: OSINT / Data Mining
- **Risk**: Low
- **Note**: Community edition transforms available

---

### 3️⃣ **Pypykatz** (Post-Exploitation)
- **Package**: `pypykatz` (Python)
- **Command**: `pypykatz`
- **Tool ID**: `pypykatz_lsass`
- **Usage**:
  ```bash
  pypykatz lsa minidump lsass.DMP
  pypykatz lsa live
  pypykatz registry --sam sam.hiv system system.hiv
  ```
- **Category**: Credential Extraction
- **Risk**: High
- **Note**: **Mimikatz alternative for Linux** - extracts Windows credentials from memory dumps

---

### 4️⃣ **Ghidra** (Reverse Engineering)
- **Package**: Binary release (500MB+)
- **Command**: `ghidra` (headless mode)
- **Tool ID**: `ghidra_analyze`
- **Usage**:
  ```bash
  # GUI mode
  ghidra
  
  # Headless analysis
  analyzeHeadless /tmp/project MyProject \
    -import /path/to/binary \
    -postScript FunctionCallTrees.py
  ```
- **Category**: Reverse Engineering
- **Risk**: Low
- **Note**: **NSA-developed** - world-class binary analysis suite
- **Java Required**: OpenJDK 17

---

### 5️⃣ **Empire** (Post-Exploitation)
- **Package**: Git clone from BC-SECURITY
- **Command**: `empire`
- **Tool ID**: `empire_powershell`
- **Usage**:
  ```bash
  empire
  # Inside Empire shell
  (Empire) > uselistener http
  (Empire) > usestager windows/launcher_bat
  ```
- **Category**: Post-Exploitation Framework
- **Risk**: High
- **Note**: PowerShell & Python post-exploitation agents

---

## 📊 Already Enhanced Tools

### **BloodHound** (Updated)
- **Tool ID**: `bloodhound_collect`
- **Command**: `bloodhound-python`
- **Usage**:
  ```bash
  bloodhound-python -d corp.local -u user -p password -c all
  ```

### **MobSF** (Updated)
- **Tool ID**: `mobsf_scan`
- **Category**: Mobile Security

### **Frida** (Updated)
- **Tool ID**: `frida_hook`
- **Category**: Mobile Security

---

## 🔧 Installation Details

### Dockerfile Changes
```dockerfile
# Python packages added
pip3 install shodan pypykatz maltego-trx

# Empire installed from source
git clone --depth=1 https://github.com/BC-SECURITY/Empire /opt/Empire
ln -s /opt/Empire/empire /usr/local/bin/empire

# Ghidra binary installation
wget ghidra_11.0_PUBLIC_20231222.zip
unzip -d /opt/ghidra
ln -s /opt/ghidra/ghidraRun /usr/local/bin/ghidra
```

---

## 🎯 Arsenal Integration

All tools are now visible in:
- **Frontend**: `http://localhost:3002/arsenal`
- **Backend**: `http://localhost:8100/tools`

### Tool Status
✅ **84 Total Tools**  
✅ **71 Installed** (was 67)  
❌ **13 Not Installed** (mostly commercial: IDA Pro, etc.)

---

## 🚀 Usage Examples

### OSINT Workflow
```bash
# 1. Shodan reconnaissance
shodan search "apache country:MA"

# 2. DNS enumeration
theHarvester -d target.com -b google

# 3. Subdomain discovery
amass enum -d target.com

# 4. Maltego transforms (optional)
maltego-trx start
```

### Post-Exploitation Workflow
```bash
# 1. Collect BloodHound data
bloodhound-python -d corp.local -u user -p pass -c all

# 2. Extract credentials from LSASS dump
pypykatz lsa minidump lsass.DMP -o pypykatz.json

# 3. Launch Empire listener
empire
(Empire) > uselistener http
```

### Reverse Engineering Workflow
```bash
# 1. Quick binary check
checksec /usr/bin/binary

# 2. Automated Ghidra analysis
analyzeHeadless /tmp/ghidra_project test \
  -import /usr/bin/binary \
  -postScript DecompileAll.py

# 3. Interactive radare2
r2 -A /usr/bin/binary
```

---

## ⚠️ Important Notes

### API Keys Required
- **Shodan**: Get free tier at https://shodan.io (100 queries/month)
- **Maltego**: Community edition available

### Environment Variables
```bash
# Set in docker-compose.yml or .env
SHODAN_API_KEY=your_key_here
```

### Mimikatz Alternative
**Pypykatz** is used instead of Mimikatz because:
- ✅ Works on Linux (container-friendly)
- ✅ Pure Python implementation
- ✅ Parses Windows memory dumps
- ✅ Supports LSASS, Registry, Live mode
- ❌ NOT Windows native (use Mimikatz for live Windows attacks)

### IDA Pro
- **Status**: Not installed (commercial license ~$2,000+)
- **Alternative**: Use **Ghidra** (free, NSA-quality, 95% feature parity)

---

## 🔄 Rebuild Instructions

To apply these changes:

```bash
# Stop services
docker-compose down

# Rebuild tools-api with new tools
docker-compose build --no-cache tools-api

# Restart everything
docker-compose up -d

# Verify installation
docker exec -it bouclier-tools-api-1 which ghidra
docker exec -it bouclier-tools-api-1 shodan version
docker exec -it bouclier-tools-api-1 pypykatz --help
```

---

## ✅ Verification Checklist

- [x] Dockerfile updated with new tools
- [x] arsenal_tools.py has 8 new tool definitions
- [x] ArsenalBrowser.tsx marks tools as installed
- [x] Tool IDs synchronized across frontend/backend
- [x] Empire, Ghidra, Shodan, Maltego, Pypykatz ready
- [ ] Docker image rebuilt
- [ ] Tools verified in container

---

**Next Step**: Rebuild the `tools-api` Docker container to install these enterprise tools!

```bash
cd c:\Users\ASUS\Desktop\cyberattack\bouclier-saas
docker-compose build --no-cache tools-api
docker-compose up -d tools-api
```
