import { useMemo } from "react";

export function add(a, b) {
  return a + b;
}

export function useRandomNumber() {
  return useMemo(() => Math.floor(Math.random() * 100), []);
}
