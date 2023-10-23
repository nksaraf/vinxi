export const f1 = function (input, options) {
	"use runtime";
	console.log("hello");
};
const f11 = function (input, options) {
	"use runtime";
	console.log("hello");
};
export const fn2 = (input, options) => {};
export const f2 = (input, options) => {
	"use runtime";
	console.log("hello");
};
const f3 = (input, options) => {
		"use runtime";
		console.log("hello");
	},
	f4 = function (input, options) {};
export { f3, f4 };

export function f5(input, options) {
	"use runtime";
	console.log("hello");
}
function if6(input, options) {
	"use runtime";
	console.log("hello");
}
export { if6 as f6 };

// export default function f7() {
// 	"use runtime";
// 	console.log("hello");
// }

export const x1 = 1;
const x2 = 1;
const y = <Abc />;
