/// <reference types="vinxi/client" />
import { sayHello } from "./actions";
import "./style.css";

console.log(await sayHello());
alert("Hello world!");
