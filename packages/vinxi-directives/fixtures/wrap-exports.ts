"use runtime";

export const f1 = function () {};
export const f12 = async function (x) {};
export const f2 = () => {};
export const f23 = async (y) => {};
const f3 = () => {},
	f4 = function () {},
	f42 = async function (z) {};
export { f3, f4, f42 };

export function f5() {}
export async function f51() {}
function if6() {}
async function ff61() {}
export { if6 as f6, ff61 as f61 };

export default function f7() {}
export default async function f71() {}

export const x1 = 1;
export const x3 = <ABC />;
export function Component() {
	return <abc />;
}
const x2 = 1;