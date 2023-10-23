"use runtime";

export const f1 = function () {};
export const f2 = () => {};
const f3 = () => {},
	f4 = function () {};
export { f3, f4 };

export function f5() {}
function if6() {}
export { if6 as f6 };

export default function f7() {}

export const x1 = 1;
const x2 = 1;
