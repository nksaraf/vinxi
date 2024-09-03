import { describe, expect, it } from "vitest";

import { hash } from "./chunks";

describe("hash", () => {
	it("should create different hashes for abc and cba", () => {
		expect(hash("abc")).not.toEqual(hash("cba"));
	});
});
