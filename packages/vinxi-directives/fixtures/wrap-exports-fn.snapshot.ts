import { createReference } from "~/runtime";
import db from "~/server/db";

export const fn2 = () => {};
export const fn3 = createReference($$function0, "test", "$$function0");
export const fn31 = createReference($$function1, "test", "$$function1");
export const f1 = createReference($$function2, "test", "$$function2");

function Component() {
	const fn = createReference($$function3, "test", "$$function3");
	const x = createReference($$function4, "test", "$$function4");
	return <div onClick={createReference($$function5, "test", "$$function5")} />;
}

export const f2 = createReference($$function6, "test", "$$function6");
export const y = createReference($$function7, "test", "$$function7");
const z = createReference($$function8, "test", "$$function8");
export default createReference($$function9, "test", "$$function9");
let hello = createReference($$function10, "test", "$$function10");
export default createReference($$function11, "test", "$$function11");
const f3 = createReference($$function12, "test", "$$function12"),
	f4 = function (input, options) {};
export { f3, f4 };
const if6 = createReference($$function13, "test", "$$function13");
export { if6 as f6 };
export const fnxy = (input, options) => {};
export const x1 = 1;
const x2 = 1;
const t = <Abc />;

export function $$function0(param) {
	console.log("hello", db.get(param));
}

export async function $$function1(param, param2) {
	console.log("hello", db.get(param), param2);
}

export async function $$function2(param) {
	console.log("hello", db.get(param));
}

export function $$function3() {
	console.log("hello");
}

export async function $$function4(param) {
	console.log("hello", db.get(param));
}

export async function $$function5() {
	console.log("hello");
}

export function $$function6() {
	console.log("hello");
}

export function $$function7(param) {
	console.log("hello", db.get(param));
}

export function $$function8(param) {
	console.log("hello", db.get(param));
}

export function $$function9(param) {
	console.log("hello", db.get(param));
}

export function $$function10(param) {
	console.log("hello", db.get(param));
}

export default hello;

export function $$function11(param) {
	hello(param);
	console.log("hello", db.get(param));
}

export function $$function12(input, options) {
	console.log("hello");
}

export function $$function13(input, options) {
	console.log("hello");
}
