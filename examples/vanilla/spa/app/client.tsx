/// <reference types="vinxi/types/client" />
import "vinxi/client";

import { sayHello } from "./actions";
import { world } from "./server-functions";
import "./style.css";

export async function world2(x) {
	"use server";
	console.log("hello world 2", x);
}

async function world3(x, y) {
	"use server";
	console.log("hello world 3", x, y);
}

const world4 = async (x, y) => {
	"use server";
	console.log("hello world 4", x, y);
};

console.log(
	await world(),
	await world2(1),
	await world3(2, 3),
	await world4(5, 6),
	await sayHello(),
);
console.log("Hello world!");

document.getElementById("app").innerHTML = `Hello World`;
