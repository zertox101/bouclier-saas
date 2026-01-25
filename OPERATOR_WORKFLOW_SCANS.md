# Web Security Scanner: Operator Workflow

## 1. Tactical Initialization
Access the **Web Scanner** module from the command sidebar. This subsystem is designed for zero-trust environments where only authorized, private-range assets are evaluated.

## 2. Deploying a New Operation
1.  Click **"New Operation"** in the top-right console.
2.  **Target URI**: Enter the full URL of the internal asset (e.g., `http://192.168.1.10:8080`). 
    - *Note*: The system will automatically resolve hostnames and block execution if the target identifies as a public-range asset.
3.  **Engine Selection**:
    - **Nuclei v3**: Best for template-based vulnerability matching (CVEs, misconfigurations).
    - **OWASP ZAP**: Best for dynamic discovery and recursive spidering of web trees.
4.  Click **"Initialize Engine"**.

## 3. Monitoring & Analysis
- **Job Registry**: Monitor real-time status chips (`pending` -> `running` -> `completed`).
- **Deep Inspection**: Click any operation to open the **Spectral Terminal**.
    - **Findings Tab**: Review normalized vulnerabilities, CWE mappings, and remediation protocols.
    - **Activity Logs**: Observe the raw execution flux (proxied from ZAP/Nuclei).

## 4. Remediation & Governance
- Export normalized JSON reports for internal ticketing.
- Use the **Governance** module to track vulnerability resolution over time.

---
*Senior Staff Engineer Note: All executions are strictly audited. Unauthorized scanning of public assets is prohibited by kernel-level security controls.*
