import { createReference } from "~/runtime";

export const x = () => y(createReference($$function0, "test", "$$function0"));

export function $$function0() {
	console.log("hello");
}
