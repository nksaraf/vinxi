import { add, useRandomNumber } from "@lib/math";
import React from "react";

export function App() {
  let a = useRandomNumber();
  let b = useRandomNumber();
  return (
    <div>
      Hello World! Did you know that {a} + {b} = {add(a, b)}
    </div>
  );
}
