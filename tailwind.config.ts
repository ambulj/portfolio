import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        oled: '#000000',
        deck: '#06090c',
        'border-subtle': '#161e24',
        'border-active': '#283845',
        'ink-primary': '#e6edf3',
        'ink-secondary': '#8b949e',
        'accent-cyan': '#00f0ff',
        'accent-amber': '#f2c500',
        'accent-alert': '#ff3344',
      },
      fontFamily: {
        sans: ['var(--font-plex-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-plex-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      boxShadow: {
        'hud-cyan': '0 0 15px rgba(0, 240, 255, 0.15)',
        'hud-amber': '0 0 15px rgba(242, 197, 0, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
