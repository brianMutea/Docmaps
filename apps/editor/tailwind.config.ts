import type { Config } from "tailwindcss";
import { tailwindThemeExtension } from "../../packages/ui/theme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/contexts/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/hooks/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/*.{js,ts,jsx,tsx}",
    "../../packages/ui/theme/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      ...tailwindThemeExtension,
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};

export default config;
