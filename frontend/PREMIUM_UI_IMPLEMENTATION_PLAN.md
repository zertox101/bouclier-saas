# CyberDetect Premium Dark SaaS UI - Implementation Plan

## Project Overview
Building a premium dark SaaS UI for CyberDetect (SOC + Purple Team + Security Tools) using Next.js 14 App Router, TypeScript, TailwindCSS, shadcn/ui, and lucide-react.

**Design Inspiration**: Modern pricing pages (Traefik-style) with dark backgrounds, gradient glows, clean cards, and generous spacing.

---

## Folder & File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with fonts & theme
│   │   ├── page.tsx                      # Landing page (main entry)
│   │   ├── pricing/
│   │   │   └── page.tsx                  # Pricing page
│   │   ├── docs/
│   │   │   ├── page.tsx                  # Docs home
│   │   │   ├── layout.tsx                # Docs sidebar layout
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Dynamic doc pages
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Real-time dashboard
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page
│   │   └── globals.css                   # Tailwind + custom CSS
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                # Top navigation
│   │   │   ├── Footer.tsx                # Footer with links
│   │   │   └── DocsNav.tsx               # Docs sidebar
│   │   │
│   │   ├── landing/
│   │   │   ├── HeroSection.tsx           # Hero with gradient glow
│   │   │   ├── TrustedByLogos.tsx        # Logo placeholders
│   │   │   ├── FeatureSection.tsx        # Feature cards
│   │   │   ├── MetricsStrip.tsx          # KPI metrics
│   │   │   ├── CustomerStory.tsx         # Testimonial card
│   │   │   └── WelcomeModal.tsx          # First-visit modal
│   │   │
│   │   ├── pricing/
│   │   │   ├── PricingToggle.tsx         # Monthly/Yearly toggle
│   │   │   ├── PricingCard.tsx           # Plan card
│   │   │   ├── FeatureComparison.tsx     # Comparison table
│   │   │   └── PricingFAQ.tsx            # FAQ accordion
│   │   │
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx               # Dashboard KPI widget
│   │   │   ├── LiveEventStream.tsx       # SSE event feed
│   │   │   ├── AlertsTable.tsx           # Alerts table
│   │   │   ├── JobsPanel.tsx             # Jobs panel
│   │   │   └── SensorHealthList.tsx      # Sensor status
│   │   │
│   │   └── docs/
│   │       ├── SearchBar.tsx             # Docs search
│   │       ├── CategoryCard.tsx          # Category cards
│   │       └── CodeBlock.tsx             # Syntax-highlighted code
│   │
│   ├── hooks/
│   │   ├── useSSE.ts                     # Server-Sent Events hook
│   │   └── useLocalStorage.ts            # localStorage hook
│   │
│   ├── lib/
│   │   └── utils.ts                      # Utility functions (cn, etc.)
│   │
│   └── types/
│       ├── dashboard.ts                  # Dashboard types
│       └── pricing.ts                    # Pricing types
│
├── public/
│   ├── fonts/                            # Inter & JetBrains Mono
│   └── images/
│       ├── hero-bg.webp                  # Hero background
│       └── logos/                        # Placeholder logos
│
├── tailwind.config.ts                    # Theme tokens
└── package.json
```

---

## Design System Tokens

### Color Palette
```typescript
colors: {
  // Backgrounds
  bg: {
    primary: 'hsl(222, 47%, 11%)',      // Deep navy #0F1419
    secondary: 'hsl(222, 39%, 15%)',    // Slightly lighter
    tertiary: 'hsl(222, 35%, 19%)',     // Card backgrounds
  },
  
  // Surfaces
  surface: {
    DEFAULT: 'hsl(222, 30%, 22%)',      // Elevated surfaces
    hover: 'hsl(222, 30%, 26%)',        // Hover state
  },
  
  // Cards
  card: {
    DEFAULT: 'hsl(222, 28%, 20%)',      // Card background
    border: 'hsl(222, 20%, 30%)',       // Subtle borders
  },
  
  // Text
  text: {
    primary: 'hsl(0, 0%, 98%)',         // White text
    secondary: 'hsl(215, 15%, 70%)',    // Muted text
    tertiary: 'hsl(215, 12%, 55%)',     // Disabled text
  },
  
  // Accents
  accent: {
    violet: {
      DEFAULT: 'hsl(258, 90%, 66%)',    // Primary violet
      glow: 'hsl(258, 90%, 66%, 0.3)',  // Glow effect
    },
    cyan: {
      DEFAULT: 'hsl(189, 85%, 58%)',    // Cyan accent
      glow: 'hsl(189, 85%, 58%, 0.3)',
    },
  },
  
  // Status
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  danger: 'hsl(0, 84%, 60%)',
  info: 'hsl(199, 89%, 48%)',
}
```

### Typography
- **UI Font**: Inter (Google Fonts)
- **Code Font**: JetBrains Mono (Google Fonts)

### Component Styles
- **Card Radius**: 16px (rounded-2xl)
- **Border**: 1px solid with subtle glow on hover
- **Buttons**:
  - Primary: Gradient (violet → cyan), white text
  - Secondary: Outline with accent border
  - Danger: Solid red background

### Spacing
- Generous padding: `p-8` to `p-12` for sections
- Large gaps: `gap-8` to `gap-16` between elements

---

## Key Pages & Features

### 1. Landing Page (`/`)
- **Top Nav**: Product, Pricing, Docs, Security, Login, "Start Trial" CTA
- **Hero Section**: 
  - Gradient glow background
  - Headline: "Next-Gen SOC Platform"
  - Subheadline: "Purple Team + Security Tools"
  - 2 CTAs: "Start Free Trial" + "View Demo"
- **Trusted By**: Logo placeholders (6-8 companies)
- **Features**: 3 sections
  1. SOC Dashboard (real-time monitoring)
  2. Purple Team Scenarios (attack emulation)
  3. Tool Execution (security tooling)
- **Metrics Strip**: Events/sec, Sensors Online, MTTR, Detections
- **Customer Story**: Testimonial card with quote
- **Footer**: Docs, Legal, Security links
- **Welcome Modal**: First-visit popup (localStorage gated)
  - "Welcome to CyberDetect"
  - 2 CTAs: "View Live Demo" + "Read Docs"

### 2. Pricing Page (`/pricing`)
- **Toggle**: Monthly / Yearly (show savings)
- **3 Plans**:
  1. **Starter**: $99/mo (basic features)
  2. **Team**: $299/mo (highlighted, most popular)
  3. **Enterprise**: Custom pricing
- **Feature Comparison Table**: Detailed feature matrix
- **FAQ Accordion**: 6-8 common questions

### 3. Docs Home (`/docs`)
- **Search Bar**: Prominent search input
- **Categories**: 
  - Getting Started
  - APIs
  - Sensors
  - Tools
  - Purple Team
- **Sidebar Layout**: Persistent navigation
- **Sample Doc Page**: `/docs/getting-started`
  - Callouts (info, warning, success)
  - Code blocks with syntax highlighting
  - Table of contents

### 4. Dashboard (`/dashboard`)
- **Real-time Widgets** (mocked SSE):
  - **KPI Cards**: 4 metrics (events, alerts, sensors, jobs)
  - **Live Event Stream**: Scrolling event feed (updates every 1s)
  - **Alerts Table**: Recent alerts with severity badges
  - **Jobs Panel**: Running/completed jobs
  - **Sensor Health**: List of sensors with status indicators
- **Empty/Loading/Error States**: Graceful handling
- **SSE Hook**: `useSSE` that appends mock events every 1s

---

## Technical Implementation

### Tailwind Theme Setup
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: { /* tokens above */ },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### Mocked SSE Hook
```typescript
// hooks/useSSE.ts
export function useSSE(endpoint: string) {
  const [events, setEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const mockEvent = generateMockEvent();
      setEvents(prev => [mockEvent, ...prev].slice(0, 50));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { events, loading: false, error: null };
}
```

### Accessibility
- **Contrast**: WCAG AA compliant
- **Focus Rings**: Visible focus indicators
- **Keyboard Nav**: Full keyboard support
- **ARIA Labels**: Proper semantic HTML

---

## Dependencies (Already Installed)
✅ Next.js 14
✅ TypeScript
✅ TailwindCSS
✅ Radix UI (shadcn/ui base)
✅ lucide-react
✅ framer-motion
✅ class-variance-authority

---

## Implementation Order

1. ✅ **Theme Setup**: Update `tailwind.config.ts` with color tokens
2. ✅ **Root Layout**: Add Inter & JetBrains Mono fonts
3. ✅ **Reusable Components**: Button, Card, Badge, etc.
4. ✅ **Navbar & Footer**: Layout components
5. ✅ **Landing Page**: Hero, Features, Metrics, Modal
6. ✅ **Pricing Page**: Toggle, Cards, Table, FAQ
7. ✅ **Docs Pages**: Home, Layout, Sample Doc
8. ✅ **Dashboard**: KPIs, SSE Stream, Tables
9. ✅ **Polish**: Animations, hover effects, loading states
10. ✅ **Testing**: Build verification, accessibility audit

---

## Image Generation Prompt

```
Create a premium cybersecurity SaaS hero illustration in dark mode.
Style: minimal 3D + soft neon glow, no clutter, modern enterprise.
Colors: deep navy background, violet + cyan glows, subtle grid.
Elements: abstract shield + network nodes + streaming lines + small alert pulses.
Output: 4K, wide (16:9), leave empty space on left for headline.
No text, no logos, no brand names.
```

---

## Notes on Burp Suite Professional

⚠️ **Legal Notice**: The GitHub link for "Burp Suite Professional" likely contains cracked/patched software, which is illegal and violates licensing terms.

**Recommended Legal Alternatives**:
1. **Burp Suite Community Edition** (free, basic features)
2. **OWASP ZAP** (open-source, powerful)
3. **mitmproxy** (CLI-based, scriptable)
4. **Burp Suite Professional** (official license, ~$449/year)

For this project, we'll integrate **OWASP ZAP** in the Tools section as a legal, production-ready alternative.

---

## Success Criteria

- ✅ Premium dark aesthetic (Traefik-inspired)
- ✅ Gradient glows and smooth animations
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Real-time dashboard with mocked SSE
- ✅ First-visit modal with localStorage
- ✅ Feature comparison table
- ✅ FAQ accordion
- ✅ Docs with search & sidebar
- ✅ Production-quality code
- ✅ Accessibility compliant

---

**Ready to implement!** 🚀
