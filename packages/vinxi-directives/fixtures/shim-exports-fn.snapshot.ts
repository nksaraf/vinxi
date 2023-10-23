import { createReference } from "~/runtime";

export const f1 = createReference(() => {}, "test?split=0", "default");
const f11 = createReference(() => {}, "test?split=1", "default");
export const fn2 = () => {};
export const f2 = createReference(() => {}, "test?split=2", "default");

const f3 = createReference(() => {}, "test?split=3", "default"),
	f4 = function () {};
export { f3, f4 };

export const f5 = createReference(() => {}, "test?split=4", "default");
const if6 = createReference(() => {}, "test?split=5", "default");

export { if6 as f6 };
export const x1 = 1;
const x2 = 1;
