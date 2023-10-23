/// <reference types="vinxi/types/client" />
import "vinxi/client";

import { sayHello } from "./actions";
import { world } from "./server-functions";
import "./style.css";

export async function world2() {
	"use server";
	console.log("hello world 2");
}

async function world3() {
	"use server";
	console.log("hello world 3");
}

console.log(world3);

console.log(await world(), await world2(), await world3(), await sayHello());
console.log("Hello world!");

document.getElementById("app").innerHTML = `Hello World`;
