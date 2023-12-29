import { sayHello } from "./actions";
import { world } from "./server-functions";

export async function world2(x) {
	"use server";
	await world3(x, 1);
	console.log("hello world 2", x);
}

async function world3(x, y) {
	"use server";
	console.log("hello world 3", x, y);
}
