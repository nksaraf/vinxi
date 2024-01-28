"use server";

import { getEvent } from "vinxi/http";

let store = { count: 0 };
export async function increment() {
	const event = getEvent();
	console.log("Hello World", event);
	store.count++;
	return store.count;
}

export async function getStore() {
	return store.count;
}
