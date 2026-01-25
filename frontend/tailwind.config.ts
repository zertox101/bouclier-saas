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
                // Semantic Backgrounds
                bg: {
                    0: "rgb(var(--bg-0) / <alpha-value>)",
                    1: "rgb(var(--bg-1) / <alpha-value>)",
                    2: "rgb(var(--bg-2) / <alpha-value>)",
                    3: "rgb(var(--bg-3) / <alpha-value>)",
                },
                // Text Levels
                text: {
                    1: "rgb(var(--text-1) / <alpha-value>)",
                    2: "rgb(var(--text-2) / <alpha-value>)",
                    3: "rgb(var(--text-3) / <alpha-value>)",
                },
                // Brand Purple
                p: {
                    400: "rgb(var(--p-400) / <alpha-value>)", // Primary Brand
                    500: "rgb(var(--p-500) / <alpha-value>)",
                    600: "rgb(var(--p-600) / <alpha-value>)", // Hover states
                    700: "rgb(var(--p-700) / <alpha-value>)",
                },
                // Neon Accents
                neon: {
                    1: "rgb(var(--neon-1) / <alpha-value>)",
                    2: "rgb(var(--neon-2) / <alpha-value>)",
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
                sans: ["var(--font-geist-sans)", "sans-serif"],
                mono: ["var(--font-geist-mono)", "monospace"],
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
                sm: "var(--radius-sm)",
                xl: "var(--radius-xl)",
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
                        boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)"
                    },
                    "50%": {
                        opacity: ".8",
                        boxShadow: "0 0 10px rgba(124, 58, 237, 0.2)"
                    }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in-up 0.5s ease-out forwards",
                "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
