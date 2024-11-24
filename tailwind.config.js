/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

module.exports = {
    content: [
        "./client/**/*.{js,jsx,ts,tsx}",
        flowbite.content(),
    ],
    theme: {
        extend: {},
    },
    plugins: [flowbite.plugin()],
};
