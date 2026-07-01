// Tailwind CSS v4 uses the dedicated PostCSS plugin.
// Design tokens live in src/app/globals.css under @theme (no tailwind.config needed).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
