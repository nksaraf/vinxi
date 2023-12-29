import { createReference } from "~/runtime";

export const f1 = createReference(function () {}, "test", "f1");
export const f12 = createReference(async function (x) {}, "test", "f12");
export const f2 = createReference(() => {}, "test", "f2");
export const f23 = createReference(async (y) => {}, "test", "f23");
const f3 = () => {},
	f4 = function () {},
	f42 = async function (z) {};
const f3$ref = createReference(f3, "test", "f3");
const f4$ref = createReference(f4, "test", "f4");
const f42$ref = createReference(f42, "test", "f42");
export { f3$ref as f3, f4$ref as f4, f42$ref as f42 };
export const f5 = createReference(function f5() {}, "test", "f5");
export const f51 = createReference(async function f51() {}, "test", "f51");
function if6() {}
async function ff61() {}
const f6$ref = createReference(if6, "test", "f6");
const f61$ref = createReference(ff61, "test", "f61");
export { f6$ref as f6, f61$ref as f61 };
export default createReference(function f7() {}, "test", "default");
export default createReference(async function f71() {}, "test", "default");
export const x1 = createReference(1, "test", "x1");
export const x3 = createReference(<ABC />, "test", "x3");

export const Component = createReference(
	function Component() {
		return <abc />;
	},
	"test",
	"Component",
);

const x2 = 1;
