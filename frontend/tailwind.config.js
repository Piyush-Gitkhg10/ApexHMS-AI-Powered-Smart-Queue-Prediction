/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class", // <--- ADD THIS EXACT LINE HERE
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                inter: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
};
