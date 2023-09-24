/// <reference types="vinxi/types/client" />
import { sayHello } from "./actions";
import "./style.css";

console.log(await sayHello());
console.log("Hello world!");

document.getElementById("app").innerHTML = `Hello World`;
