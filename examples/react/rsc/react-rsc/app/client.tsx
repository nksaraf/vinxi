/// <reference types="vinxi/client" />
import React, { Suspense, startTransition } from "react";
import { Root, hydrateRoot } from "react-dom/client";
import { createModuleLoader } from "react-server-dom-vite/runtime";
import "vinxi/runtime/client";

import { ServerComponent } from "./server-component";

globalThis.__vite__ = createModuleLoader({
	loadModule: async (id) => {
		return import(
			/* @vite-ignore */ import.meta.env.MANIFEST["client"].inputs[id].output
				.path
		);
	},
});

startTransition(() => {
	hydrateRoot(document, <ServerComponent url={window.location.pathname} />);
});
