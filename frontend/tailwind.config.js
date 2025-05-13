/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#2E7D32',
            light: '#4CAF50',
            dark: '#1B5E20',
          },
          accent: {
            DEFAULT: '#FF8F00',
            light: '#FFB74D',
            dark: '#E65100',
          },
          background: {
            DEFAULT: '#FFFBF5',
            paper: '#FFFFFF',
          },
          text: {
            DEFAULT: '#333333',
            light: '#757575',
            dark: '#212121',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        borderRadius: {
          DEFAULT: '0.5rem',
        },
        boxShadow: {
          card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    plugins: [],
  }