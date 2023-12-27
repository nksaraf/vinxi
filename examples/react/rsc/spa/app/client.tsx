/// <reference types="vinxi/types/client" />
import { createModuleLoader } from "@vinxi/react-server-dom/runtime";
import React, { Suspense, startTransition } from "react";
import { Root, createRoot, hydrateRoot } from "react-dom/client";
import "vinxi/client";

import { sayHello } from "./actions";
import { fetchServerAction } from "./fetchServerAction";
import { ServerComponent } from "./server-component";

document.addEventListener("click", async (e) => {
	console.log(sayHello, "hello");

	const result = await fetchServerAction(
		import.meta.env.SERVER_BASE_URL + "/_server",
		sayHello["$$id"],
		[],
	);
	console.log(result);
	// sayHello();
});

globalThis.__vite__ = createModuleLoader({
	loadModule: async (id) => {
		return import.meta.env.MANIFEST["client"].chunks[id].import();
	},
});

createRoot(document).render(<ServerComponent url={window.location.pathname} />);
