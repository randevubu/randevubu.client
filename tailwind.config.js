/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--theme-background)',
        foreground: 'var(--theme-foreground)',
        primary: {
          DEFAULT: 'var(--theme-primary)',
          foreground: 'var(--theme-primaryForeground)',
          hover: 'var(--theme-primaryHover)',
        },
        secondary: {
          DEFAULT: 'var(--theme-secondary)',
          foreground: 'var(--theme-secondaryForeground)',
          hover: 'var(--theme-secondaryHover)',
        },
        accent: {
          DEFAULT: 'var(--theme-accent)',
          foreground: 'var(--theme-accentForeground)',
          hover: 'var(--theme-accentHover)',
        },
        border: 'var(--theme-border)',
        ring: 'var(--theme-ring)',
        success: 'var(--theme-success)',
        warning: 'var(--theme-warning)',
        error: 'var(--theme-error)',
        info: 'var(--theme-info)',
        card: {
          DEFAULT: 'var(--theme-card)',
          foreground: 'var(--theme-cardForeground)',
        },
        navbar: {
          DEFAULT: 'var(--theme-navbar)',
          foreground: 'var(--theme-navbarForeground)',
        },
      },
    },
  },
  plugins: [],
}