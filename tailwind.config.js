/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['"Instrument Sans"', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                glass: 'inset 0 0 20px rgba(255, 255, 255, 0.02)',
                'glass-hover': 'inset 0 0 30px rgba(255, 255, 255, 0.05)',
            },
            animation: {
                flow: "flow 3s linear infinite",
            },
            keyframes: {
                flow: {
                    "0%": { left: "0", opacity: "0" },
                    "10%": { opacity: "1" },
                    "90%": { opacity: "1" },
                    "100%": { left: "100%", opacity: "0" }
                }
            }
        },
    },
    plugins: [],
}
