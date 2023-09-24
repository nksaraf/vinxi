import { hydrate } from "solid-js/web";
import "vinxi/client";

export function mount(fn, element) {
	return hydrate(fn, element);
}
