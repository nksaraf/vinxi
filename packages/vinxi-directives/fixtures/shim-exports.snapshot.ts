import { createReference } from "~/runtime";

export const f1 = createReference(() => {}, "test", "f1");
export const f2 = createReference(() => {}, "test", "f2");
export const f3 = createReference(() => {}, "test", "f3");
export const f4 = createReference(() => {}, "test", "f4");
export const f5 = createReference(() => {}, "test", "f5");
export const f6 = createReference(() => {}, "test", "f6");
export default createReference(() => {}, "test", "default");
export const x1 = createReference(() => {}, "test", "x1");
