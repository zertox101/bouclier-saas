import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                // Semantic Backgrounds - Deep Dark
                bg: {
                    0: "rgb(var(--bg-0) / <alpha-value>)", // #030308
                    1: "rgb(var(--bg-1) / <alpha-value>)", // #080812
                    2: "rgb(var(--bg-2) / <alpha-value>)", // #0F0F1C
                    3: "rgb(var(--bg-3) / <alpha-value>)", // #161626
                },
                // Text Levels
                text: {
                    1: "rgb(var(--text-1) / <alpha-value>)",
                    2: "rgb(var(--text-2) / <alpha-value>)",
                    3: "rgb(var(--text-3) / <alpha-value>)",
                },
                // Brand Purple
                p: {
                    400: "rgb(var(--p-400) / <alpha-value>)",
                    500: "rgb(var(--p-500) / <alpha-value>)",
                    600: "rgb(var(--p-600) / <alpha-value>)",
                    700: "rgb(var(--p-700) / <alpha-value>)",
                },
                // Neon Accents - CyberDetect Theme
                neon: {
                    1: "rgb(var(--neon-1) / <alpha-value>)", // Cyber Green #00FFAA
                    2: "rgb(var(--neon-2) / <alpha-value>)", // Electric Cyan #00C8FF
                    3: "rgb(var(--neon-3) / <alpha-value>)", // Cyber Magenta #FF00AA
                    4: "rgb(var(--neon-4) / <alpha-value>)", // Neon Purple #B478FF
                },
                // Borders
                border: {
                    1: "rgb(var(--border-1) / <alpha-value>)",
                    2: "rgb(var(--border-2) / <alpha-value>)",
                },
                // Functional
                success: "rgb(var(--success) / <alpha-value>)",
                warning: "rgb(var(--warning) / <alpha-value>)",
                danger: "rgb(var(--danger) / <alpha-value>)",
                info: "rgb(var(--info) / <alpha-value>)",
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
                mono: ["var(--font-geist-mono)", "JetBrains Mono", "Fira Code", "monospace"],
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
                sm: "var(--radius-sm)",
                xl: "var(--radius-xl)",
            },
            boxShadow: {
                "cyber-glow": "0 0 30px rgba(56, 189, 248, 0.3)",
                "cyber-glow-lg": "0 0 60px rgba(56, 189, 248, 0.4)",
                "cyber-cyan": "0 0 30px rgba(56, 189, 248, 0.3)",
                "cyber-magenta": "0 0 30px rgba(239, 68, 68, 0.3)",
                "neon-inset": "inset 0 0 30px rgba(56, 189, 248, 0.1)",
            },
            backgroundImage: {
                "cyber-gradient": "linear-gradient(135deg, rgb(var(--neon-1)) 0%, rgb(var(--neon-2)) 100%)",
                "cyber-radial": "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
                "dark-gradient": "linear-gradient(180deg, rgb(var(--bg-0)) 0%, rgb(var(--bg-1)) 100%)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in-up": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(10px)"
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)"
                    }
                },
                "pulse-glow": {
                    "0%, 100%": {
                        opacity: "1",
                        boxShadow: "0 0 20px rgba(56, 189, 248, 0.5)"
                    },
                    "50%": {
                        opacity: ".8",
                        boxShadow: "0 0 40px rgba(56, 189, 248, 0.3)"
                    }
                },
                "shimmer": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" }
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-15px)" }
                },
                "scan": {
                    "0%": { top: "0", opacity: "1" },
                    "50%": { opacity: "0.5" },
                    "100%": { top: "100%", opacity: "1" }
                },
                "spin-slow": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" }
                },
                "radar-sweep": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" }
                },
                "glow-pulse": {
                    "0%, 100%": {
                        filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))"
                    },
                    "50%": {
                        filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.8))"
                    }
                },
                "wiggle": {
                    "0%, 100%": { transform: "rotate(-10deg)" },
                    "50%": { transform: "rotate(10deg)" }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in-up 0.5s ease-out forwards",
                "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "shimmer": "shimmer 2s infinite",
                "float": "float 8s ease-in-out infinite",
                "scan": "scan 3s ease-in-out infinite",
                "spin-slow": "spin-slow 20s linear infinite",
                "radar": "radar-sweep 4s linear infinite",
                "glow-pulse": "glow-pulse 2s ease-in-out infinite",
                "wiggle": "wiggle 1s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
