export const x = () =>
	y(() => {
		"use runtime";
		console.log("hello");
	});
