"use server";

let store = { count: 0 };
export function sayHello() {
	console.log("Hello World");
	store.count++;
	return store.count;
}

export function getStore() {
	return store.count;
}
