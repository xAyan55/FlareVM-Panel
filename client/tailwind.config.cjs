/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#3b82f6",
                dark: {
                    DEFAULT: "#0f172a",
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617",
                },
                accent: "#ec4899",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                float: "float 6s ease-in-out infinite",
                glow: "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-12px)" },
                },
                glow: {
                    "0%": { boxShadow: "0 0 5px #3b82f6" },
                    "100%": { boxShadow: "0 0 20px #3b82f6, 0 0 40px #3b82f6" },
                },
            },
        },
    },
    plugins: [],
};
