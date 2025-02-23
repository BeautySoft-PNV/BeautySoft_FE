/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter-Regular", "Playfair Display"],
        "inter-bold": ["Inter-Bold", "Playfair Display"],
        "inter-extrabold": ["Inter-ExtraBold", "Playfair Display"],
        "inter-semibold": ["Inter-SemiBold", "Playfair Display"],
        "inter-medium": ["Inter-Medium", "Playfair Display"],
        "inter-light": ["Inter-Light", "Playfair Display"],
        "inter-extralight": ["Inter-ExtraLight", "Playfair Display"],
        "inter-black": ["Inter-Black", "Playfair Display"],
      },
    },
    colors: {
      primary: {
        100: "#D9FBE0",
        200: "#B4F8CA",
        300: "#8AECB3",
        400: "#69D9A3",
        DEFAULT: "#ED1E51",
        600: "#2BA583",
        700: "#1E8A76",
        800: "#136F67",
        900: "#0B5B5C",
        901: "#3e6606",
      },
      neutral: {
        DEFAULT: "#FFFFFF",
        100: "#F2F4F7",
        200: "#E3E6EA",
        300: "#B7BBC1",
        400: "#777B84",
        500: "#263238",
      },
      semantic: {
        success: "#3CC18E",
        error: "#FF6F69",
        warning: "#F7BA34",
        info: "#4C85EA",
      },
      accent: {
        1: "#934E42",
        2: "#CC753A",
        3: "#E4944B",
        4: "#F98A8A",
        5: "#F5B8A3",
      },
    },
  },
  plugins: [],
};
