/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e0e9fe',
                    200: '#c1d3fe',
                    300: '#92b2fd',
                    400: '#5c86f9',
                    500: '#3350e8',
                    600: '#2537cc',
                    700: '#1e2ba4',
                    800: '#1d2784',
                    900: '#1d256b',
                    950: '#111640',
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
