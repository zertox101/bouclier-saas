# Bouclier SaaS Frontend - Production Documentation

## 🚀 Overview
The Bouclier (CyberDetect) frontend is a premium, high-performance Security Operations Center (SOC) dashboard built with **Next.js 14**, **TailwindCSS**, and **SSE (Server-Sent Events)** for real-time telemetry. 

The design follows a "Senior Google UI/UX" standard: **Deep Black / Neon Violet**, glassmorphism, and holographic effects.

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: TailwindCSS + CSS Noise Texture + Glassmorphism
- **Real-time**: Custom SSE hook with exponential backoff & keep-alive
- **Animations**: Framer Motion (Optimized)
- **Icons**: Lucide React
- **Charts**: Recharts (Dashboard telemetry)

## 📁 Architecture
```text
src/
├── app/               # Next.js App Router (Public & Protected routes)
│   ├── (marketing)/   # Landing, Pricing, Security, Docs
│   └── app/           # Protected Dashboard, Alerts, Tools, etc.
├── components/        # Design System (ui, marketing, dashboard)
├── lib/               
│   ├── api.ts         # Typed fetch wrapper with httpOnly cookie support
│   ├── sse.ts         # Robust EventSource hook (de-dupe, backoff)
│   └── utils.ts       # Utility functions (cn, date formatting)
└── middleware.ts      # Auth protection (redirection logic)
```

## ⚡ How to Run
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment variables**:
   Create a `.env.local` based on `.env.example`:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8005
   ```
3. **Start development server**:
   ```bash
   npm run dev
   ```
4. **Access platform**:
   - Landing: `http://localhost:3001`
   - Login: `http://localhost:3001/login`
   - Dashboard: `http://localhost:3001/app` (Automatic redirect after login)

## 📡 Branching SSE Endpoints
The `useEventSource` hook connects to the backend telemetry stream. 
Endpoint required: `GET /api/v1/telemetry/stream`
- Must support `text/event-stream`
- Must allow `Credentials: include`
- Payload Sample:
  ```json
  {
    "id": "uuid",
    "type": "alert",
    "severity": "critical",
    "timestamp": "ISO-8601",
    "data": { "message": "SQL Injection attempt...", "src_ip": "1.2.3.4" }
  }
  ```

## 📋 Features Checklist
- [x] Full Landing with Hero Slider
- [x] Responsive Sidebar & Navigation
- [x] Real-time Dashboard (KPIs + Stream)
- [x] Triage Alert Table with Detail Drawer
- [x] Tool Grid with Category Grouping
- [x] AI Copilot Support Chat
- [x] Academy Progress Tracking
- [x] Auth Middleware & Route Protection
- [x] B2B Premium Design System
