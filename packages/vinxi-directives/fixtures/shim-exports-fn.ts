export const f1 = function () {
	"use runtime";
	console.log("hello");
};
const f11 = function () {
	"use runtime";
	console.log("hello");
};
export const fn2 = () => {};
export const f2 = () => {
	"use runtime";
	console.log("hello");
};
const f3 = () => {
		"use runtime";
		console.log("hello");
	},
	f4 = function () {};
export { f3, f4 };

export function f5() {
	"use runtime";
	console.log("hello");
}
function if6() {
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
