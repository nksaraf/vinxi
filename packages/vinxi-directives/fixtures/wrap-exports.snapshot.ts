import { createReference } from "~/runtime";

export const f1 = createReference(function () {}, "test", "f1");
export const f2 = createReference(() => {}, "test", "f2");
const f3 = () => {},
	f4 = function () {};
const f3$ref = createReference(f3, "test", "f3");
const f4$ref = createReference(f4, "test", "f4");
export { f3$ref as f3, f4$ref as f4 };
export const f5 = createReference(function f5() {}, "test", "f5");
function if6() {}
const f6$ref = createReference(if6, "test", "f6");
export { f6$ref as f6 };
export default createReference(function f7() {}, "test", "default");

export const x1 = createReference(1, "test", "x1");
const x2 = 1;
