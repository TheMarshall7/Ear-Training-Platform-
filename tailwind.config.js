/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'warm-orange': '#f97316',
                'warm-orange-hover': '#ea580c',
                'soft-bg': '#f5f5f4', // stone-100
                'card-bg': '#ffffff',
                'dark-text': '#1c1917', // stone-900
            }
        },
    },
    plugins: [],
}
