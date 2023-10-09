/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./app/**/*.tsx",
		"./app/**/*.ts",
		"./app/**/*.js",
		"./app/**/*.jsx",
	],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography")],
};
