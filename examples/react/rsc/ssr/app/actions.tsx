"use server";

import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs-lite";

const storage = createStorage({
	driver: fsDriver({ base: "./tmp" }),
});

export async function sayHello() {
	console.log("Hello World");
	await storage.setItem(
		"count",
		(Number(await storage.getItem("count")) ?? 0) + 1,
	);
	return Number(await storage.getItem("count")) ?? 0;
}

export async function getStore() {
	return Number(await storage.getItem("count")) ?? 0;
}
