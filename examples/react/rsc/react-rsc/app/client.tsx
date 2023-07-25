/// <reference types="vinxi/client" />
import { createModuleLoader } from "@vinxi/react-server-dom-vite/runtime";
import React, { Suspense, startTransition } from "react";
import { Root, hydrateRoot } from "react-dom/client";
import "vinxi/runtime/client";

import { ServerComponent } from "./server-component";

globalThis.__vite__ = createModuleLoader({
	loadModule: import.meta.env.DEV
		? async (id) => {
				return import(
					/* @vite-ignore */ import.meta.env.MANIFEST["client"].inputs[id]
						.output.path
				);
		  }
		: async (id) => {
				return import("/_build/" + id + ".js");
		  },
});

startTransition(() => {
	hydrateRoot(document, <ServerComponent url={window.location.pathname} />);
});
