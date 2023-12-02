/// <reference types="vinxi/types/client" />
import "vinxi/client";

import "./style.css";
import { world2 } from "./inline";

await world2(10);

document.getElementById("app").innerHTML = `Hello World`;
