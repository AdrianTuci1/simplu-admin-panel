export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Production optimizations
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
}

