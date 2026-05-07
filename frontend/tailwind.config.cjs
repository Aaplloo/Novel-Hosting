/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#fdfbf7',
        pencil: '#2d2d2d',
        erased: '#e5e0d8',
        correction: '#ff4d4d',
        ballpoint: '#2d5da1',
        postit: '#fff9c4',
      },
      fontFamily: {
        sans: ['Patrick Hand', 'cursive'],
        hand: ['Patrick Hand', 'cursive'],
        marker: ['Kalam', 'cursive'],
      },
      borderRadius: {
        wobbly: '255px 15px 225px 15px / 15px 225px 15px 255px',
        wobblyMd: '42px 16px 38px 18px / 18px 40px 16px 36px',
        wobblySm: '18px 10px 16px 12px / 12px 18px 10px 16px',
      },
      boxShadow: {
        sketch: '4px 4px 0px 0px #2d2d2d',
        sketchSm: '2px 2px 0px 0px #2d2d2d',
        sketchLg: '8px 8px 0px 0px #2d2d2d',
        paper: '3px 3px 0px 0px rgba(45, 45, 45, 0.16)',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%': { transform: 'translateY(-6px) rotate(1deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 2.4s ease-in-out infinite',
        floaty: 'floaty 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
