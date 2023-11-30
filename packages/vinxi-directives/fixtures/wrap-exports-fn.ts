import db from "~/server/db";

export const fn2 = () => {};
const user = (path: string) =>
	`https://hacker-news.firebaseio.com/v0/${path}.json`;
export const fn3 = (param) => {
	"use runtime";
	console.log("hello", db.get(param));
};
export const fn31 = async (param, param2) => {
	"use runtime";
	console.log("hello", db.get(param), param2);
};
export const f1 = async function (param) {
	"use runtime";
	console.log("hello", db.get(param));
};

function Component() {
	const fn = function () {
		"use runtime";
		console.log("hello");
	};

	const x = async (param) => {
		"use runtime";
		console.log("hello", db.get(param));
	};

	return (
		<div
			onClick={async () => {
				"use runtime";
				console.log("hello");
			}}
		/>
	);
}

export const f2 = () => {
	"use runtime";
	console.log("hello");
};

export function y(param) {
	"use runtime";
	console.log("hello", db.get(param));
}

function z(param) {
	"use runtime";
	console.log("hello", db.get(param));
}

export default function (param) {
	"use runtime";
	console.log("hello", db.get(param));
}

export default function hello(param) {
	"use runtime";
	console.log("hello", db.get(param));
}

export default (param) => {
	"use runtime";
	hello(param);
	console.log("hello", db.get(param));
};

const f3 = (input, options) => {
		"use runtime";
		console.log("hello");
	},
	f4 = function (input, options) {};
export { f3, f4 };

function if6(input, options) {
	"use runtime";
	console.log("hello");
}
export { if6 as f6 };

export const fnxy = (input, options) => {};

export const x1 = 1;
const x2 = 1;
const t = <Abc />;
