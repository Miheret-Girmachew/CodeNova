// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ✅ This is correct. It tells Tailwind to look for a .dark class.
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✅ We are REPLACING your old colors with these.
      // These colors now read directly from your CSS variables in index.css.
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: 'var(--destructive)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // You can keep your custom font families if you like
        serif: ['Georgia', 'Times New Roman', 'serif'],
        // I recommend adding a sans-serif for UI elements for better readability
        sans: ['Inter', 'system-ui', 'sans-serif'], 
      }
    },
  },
  // ✅ Add the official animation plugin for better transitions
  plugins: [require("tailwindcss-animate")],
};