import { COLOR_ACCENT, COLOR_ACCENT_LIGHT } from "@/utils/constants/colors";

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        accent: COLOR_ACCENT,
        'accent-light': COLOR_ACCENT_LIGHT,
        muted: '#9ca3af',
      },
      fontFamily: {
        'inter-regular': 'Inter_400Regular',
        'inter-medium': 'Inter_500Medium',
        'inter-semibold': 'Inter_600SemiBold',
        'inter-bold': 'Inter_700Bold',
        'inter-extrabold': 'Inter_800ExtraBold',
      },
    },
  },
  plugins: [],
};
