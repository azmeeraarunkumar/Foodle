import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand Colors
                primary: {
                    DEFAULT: "#C6E94B",
                    dark: "#A8D42A",
                    light: "#E8F5A3",
                },
                secondary: {
                    DEFAULT: "#1F2937",
                    light: "#4B5563",
                },
                background: "#FFFFFF",
                surface: "#F9FAFB",
                success: "#22C55E",
                warning: "#F59E0B",
                error: "#EF4444",
                border: "#E5E7EB",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            fontSize: {
                h1: ["24px", { lineHeight: "32px", fontWeight: "700" }],
                h2: ["20px", { lineHeight: "28px", fontWeight: "600" }],
                h3: ["16px", { lineHeight: "24px", fontWeight: "600" }],
                body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
                "body-small": ["12px", { lineHeight: "16px", fontWeight: "400" }],
                caption: ["10px", { lineHeight: "14px", fontWeight: "500" }],
                button: ["14px", { lineHeight: "20px", fontWeight: "600" }],
                otp: ["48px", { lineHeight: "56px", fontWeight: "700" }],
            },
            spacing: {
                xs: "4px",
                sm: "8px",
                md: "16px",
                lg: "24px",
                xl: "32px",
                "2xl": "48px",
            },
            borderRadius: {
                small: "6px",
                medium: "12px",
                large: "16px",
                full: "9999px",
            },
            boxShadow: {
                card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                elevated: "0 10px 25px rgba(0,0,0,0.1), 0 6px 10px rgba(0,0,0,0.08)",
                "bottom-nav": "0 -2px 10px rgba(0,0,0,0.05)",
            },
        },
    },
    plugins: [],
};

export default config;
