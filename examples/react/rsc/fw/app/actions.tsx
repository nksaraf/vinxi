"use server";

let store = { count: 0 };
export function sayHello() {
	store.count++;
	return store.count;
}

export function getStore() {
	return store.count;
}
