/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090B10',
          elevated: '#0F131D',
          card: '#141A28',
          secondary: '#1A2234',
          tertiary: '#242F46',
          hover: '#29354F',
        },
        border: {
          DEFAULT: '#222B3D',
          subtle: '#1C2433',
          focus: '#4F46E5',
          highlight: '#3B82F6',
        },
        accent: {
          blue: '#3B82F6',
          indigo: '#6366F1',
          purple: '#A855F7',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          cyan: '#06B6D4',
        },
        console: {
          text: '#F1F5F9',
          muted: '#94A3B8',
          dim: '#64748B',
          header: '#FFFFFF',
          badge: '#1E293B',
        },
        agent: {
          repo: '#38BDF8',
          debug: '#F43F5E',
          impact: '#F59E0B',
          test: '#10B981',
          review: '#A855F7',
          bob: '#818CF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-indigo': '0 0 20px -5px rgba(99, 102, 241, 0.3)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.3)',
        'elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
