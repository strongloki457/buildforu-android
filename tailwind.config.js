/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf1",
          100: "#d8f6df",
          200: "#b4ecc0",
          300: "#82dd95",
          400: "#4ec666",
          500: "#22c55e",
          600: "#166534",
          700: "#14532d",
          800: "#123d25",
          900: "#102e1e"
        },
        slate: {
          950: "#08120d"
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"]
      },
      boxShadow: {
        glass: "0 20px 60px -24px rgba(20, 83, 45, 0.35)",
        soft: "0 16px 40px -22px rgba(15, 23, 42, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(34, 197, 94, 0.2), transparent 36%), radial-gradient(circle at top right, rgba(22, 101, 52, 0.18), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,244,241,0.98))"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        shimmer: "shimmer 2.2s linear infinite",
        float: "float 7s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
