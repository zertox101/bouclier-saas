# CyberDetect / Bouclier - Premium UI/UX Redesign Handoff

## 1. Design System Validation (QA Checklist)

Ensure all development aligns with the "Deep Space" Premium SOC aesthetic.

### Visual Regression
- [ ] **Contrast**: Verify text readability on glass backgrounds. `text-text-1` on `bg-p-600` must pass WCAG AA.
- [ ] **Glass Effect**: Ensure `backdrop-filter: blur(14px)` is supported. Fallback to opaque `bg-bg-2` if not.
- [ ] **Glows**: Neon glows (box-shadows) should strictly occur on `:hover` or `:focus-visible` to save GPU.
- [ ] **Borders**: All cards must have `border-white/5` or `border-border-1`. No raw CSS borders without variables.

### Interaction & States
- [ ] **Hover**: All interactive elements (Buttons, Cards, Links) must have a `transition-all duration-300`.
- [ ] **Focus**: `focus-visible` ring must be `neon-1` (Purple).
- [ ] **Loading**: Buttons must show a spinner or "Loading..." state when `disabled`.
- [ ] **Empty States**: Tables/Lists must have a defined Empty State (icon + text).

### Responsive
- [ ] **Mobile**: Sidebar becomes a Bottom Nav or Hamburger menu (currently hidden on mobile in layout, verify implementation).
- [ ] **Grid**: Dashboard KPIs stack 1 per row on mobile (`grid-cols-1`), 4 on desktop.
- [ ] **Touch**: Buttons min-height 44px on mobile.

## 2. Nano Banana Pro - Slider Image Prompts

Use these prompts in Midjourney v6 or DALL-E 3 to generate the background assets for the Landing Page slider.

### Global Settings
*Style*: Cybersecurity, Dark Data Visualization, HUD, Glassmorphism, 8k Resolution, Unreal Engine 5 Render.
*Colors*: Deep Violet, Neon Purple, Cyber Blue, Black.

### Slide 1: Global Threat Map
**Desktop (1920x800)**:
> wide angle shot of a holographic 3D globe floating in a dark operations room, glowing purple connection lines between continents, cybersecurity data streams, depth of field, cinematic lighting --ar 21:9 --v 6.0
**Mobile (1080x1350)**:
> vertical close up of holographic 3D globe with cyber attacks hitting europe, neon purple geometric data lines, dark background --ar 4:5 --v 6.0
**Overlay Text**:
> Title: "Global Threat Intelligence"
> Sub: "Real-time visualization of attack vectors."

### Slide 2: AI Analyst Core
**Desktop (1920x800)**:
> abstract representation of an artificial intelligence core, glowing purple neural network nodes, digital brain processing binary code, dark futuristic environment, intricate detail --ar 21:9 --v 6.0
**Mobile (1080x1350)**:
> vertical macro shot of AI neural nodes glowing violet, connecting digital synapses, cybernetic aesthetic --ar 4:5 --v 6.0
**Overlay Text**:
> Title: "Autonomous Defense AI"
> Sub: "Sentinel v4.2 predicts and neutralizes threats."

### Slide 3: Network Topology
**Desktop (1920x800)**:
> complex network topology graph detailed visualization, thousands of nodes and edges, isometric view, glowing blue and purple data packets moving, dark interface style --ar 21:9 --v 6.0
**Mobile (1080x1350)**:
> vertical view of network nodes connected by laser lines, digital infrastructure mapping, dark blue and purple --ar 4:5 --v 6.0
**Overlay Text**:
> Title: "Full Stack Visibility"
> Sub: "Map every asset from Cloud to Edge."

### Slide 4: Purple Team / Red Teaming
**Desktop (1920x800)**:
> cinematic shot of a hacker silhouette typing on a transparent holographic keyboard, red and purple code reflections, matrix style code rain in background, mysterious atmosphere --ar 21:9 --v 6.0
**Mobile (1080x1350)**:
> vertical shot of digital code rain in red and violet, glitch effect, cyber warfare concept --ar 4:5 --v 6.0
**Overlay Text**:
> Title: "Adversary Emulation"
> Sub: "Test your defenses with continuous simulated attacks."

### Slide 5: Forensic Data Streams
**Desktop (1920x800)**:
> infinite tunnel of binary data and hex code, fast motion blur, glowing purple and teal numbers, entering hyperspace of information --ar 21:9 --v 6.0
**Mobile (1080x1350)**:
> vertical data stream tunnel, looking up, matrix numbers falling, cyber security aesthetic --ar 4:5 --v 6.0
**Overlay Text**:
> Title: "Deep Forensics"
> Sub: "Instant access to petabytes of historical logs."

### Slide 6: Compliance Shield
**Desktop (1920x800)**:
> a massive glowing digital shield made of glass and light protecting a city of data, futuristic concept art, strong perspective, symbol of safety --ar 21:9 --v 6.0
**Mobile (1080x1350)**:
> vertical close up of a digital shield emblem glowing neon purple, sleek metallic texture --ar 4:5 --v 6.0
**Overlay Text**:
> Title: "Audit-Ready Compliance"
> Sub: "ISO, SOC2, and GDPR reports in one click."

## 3. Implementation Guide

### Quick Start
```bash
# Install dependencies (if not already)
npm install lucide-react framer-motion clsx tailwind-merge date-fns geist

# Run Development Server
npm run dev
```

### Configuration
1. **Fonts**: `geist` font family is configured in `src/lib/fonts.ts` and applied in `layout.tsx`.
2. **Colors**: Edit `src/app/globals.css` to adjust CSS variables.
3. **Icons**: Using `lucide-react` for all UI icons.

### SSE Connection (Real-time)
To hook up the real backend to the Frontend:
1. Open `src/components/ui/core.tsx`.
2. Locate `SseStatusIndicator`.
3. In your main dashboard `page.tsx`, import your SSE hook (e.g. `useEventSource`) and pass the status.
```typescript
const { status, lastEvent } = useEventSource('/api/v1/stream');
// ...
<SseStatusIndicator status={status} lastEvent={lastEvent} />
```
