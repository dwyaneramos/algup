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
        accent: '#CB30E0',
        'accent-light': '#e899f2',
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
