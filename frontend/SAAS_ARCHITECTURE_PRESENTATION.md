# 🛡️ CyberDetect SaaS - Full Architecture Presentation

## 🌟 Executive Summary
**CyberDetect** is a next-generation **Security Operations Center (SOC) as a Service**. It combines enterprise-grade threat detection tools with a modern, high-performance web interface, making advanced cybersecurity accessible to teams of all sizes.

The platform is built on a **Hybrid Architecture** that merges the speed of a modern React frontend with the raw power of a Python security backend.

---

## 🏗️ System Architecture (The "Schema")

### 1. 🖥️ Frontend Layer (Next.js 14)
* The "Face" of the application. High-performance, SEO-optimized, and interactive.*

*   **Framework**: **Next.js 14** (App Router)
*   **Language**: TypeScript
*   **Styling**: TailwindCSS + Framer Motion (Premium Dark UI)
*   **Key Responsibilities**:
    *   **Landing & Marketing**: SEO-ready pages to convert visitors.
    *   **SaaS Logic**: Pricing, Subscriptions, and User Management.
    *   **Dashboard UI**: Real-time visualization of threats (Maps, Charts).
    *   **Authentication**: Handling Login/Signup via NextAuth.js.

### 2. ⚙️ Backend Layer (Python FastAPI)
* The "Brain" of the operation. Handles heavy processing and security tools.*

*   **Framework**: **FastAPI** (Python)
*   **Capabilities**:
    *   **Orchestration**: Managing Docker containers for security tools.
    *   **Tool Execution**: Running Nmap, OWASP ZAP, Nuclei.
    *   **Data Processing**: Parsing raw logs into JSON/GeoJSON.
    *   **AI Analysis**: "Sentinel" agent analyzing threats using LLMs.

### 3. 💾 Data Persistence Layer
* The "Memory" of the system.*

*   **Primary DB**: **PostgreSQL**
    *   Stores Users, Organizations, Billing Info (SaaS Data).
    *   Stores Audit Logs, Scan Results, and Threat History (Security Data).
*   **Cache/Queue**: **Redis**
    *   Handles real-time job queues (e.g., "Start Scan").
    *   Manages live WebSocket/SSE streams for the Threat Map.

### 4. 🌐 Infrastructure & Integrations
*   **Docker**: All services are containerized for consistent deployment.
*   **Stripe**: Handles all payments and subscriptions.
*   **OpenAI/LLM**: Powers the AI security analyst.

---

## 🔄 Data Flow Diagram

1.  **User Action**: User clicks "Start Scan" on the Dashboard.
2.  **Frontend**: Next.js sends an API request to the Backend.
3.  **Backend**: FastAPI receives the request, validates license, and spawns a Docker job (e.g., ZAP).
4.  **Execution**: The security tool runs against the target.
5.  **Processing**: Results are parsed, analyzed by AI, and saved to PostgreSQL.
6.  **Notification**: Real-time updates are pushed via Redis -> SSE -> Frontend.
7.  **Visual**: The user sees the "Alert" pop up instantly on the Threat Map.

---

## 📦 Core Modules

### A. 🌍 Threat Intelligence Map
- **Tech**: `react-globe.gl` (3D) & `deck.gl` (2D).
- **Function**: Visualizes live attacks and traffic flows on a global scale.

### B. 🛠️ Tactical Toolkit
- **Tech**: Dockerized Security Tools.
- **Function**: On-demand penetration testing tools (Nmap, DNS Recon) available in the browser.

### C. 👮 Sentinel AI Agent
- **Tech**: Python RAG (Retrieval-Augmented Generation).
- **Function**: An AI assistant that chats with users to explain alerts and suggest remediation.

---

## 💎 Business Model (SaaS)

*   **Starter**: $99/mo - Basic Scans, Single User.
*   **Team**: $299/mo - Collaborative Dashboard, 5 Users, AI Reports.
*   **Enterprise**: Custom - Dedicated Instances, SSO, SLA.

---

## 🚀 Technical Stack Summary

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Next.js 14, TypeScript, TailwindCSS, Lucia/NextAuth |
| **UI Library** | Radix UI, Lucide Icons, Recharts, Framer Motion |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL, Redis |
| **DevOps** | Docker, Docker Compose |
| **External** | Stripe API, OpenAI API |
