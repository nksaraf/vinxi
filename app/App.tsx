import React from "react";
import { HelloWorld } from "@/components/HelloWorld";

function Providers({ children }) {
  return <>{children}</>;
}

export function App() {
  return (
    <Providers>
      <HelloWorld />
    </Providers>
  );
}
