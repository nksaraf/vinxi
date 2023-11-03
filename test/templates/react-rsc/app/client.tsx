/// <reference types="vinxi/types/client" />
import { createModuleLoader } from "@vinxi/react-server-dom/runtime";
import { createRoot } from "react-dom/client";
import "vinxi/client";

import { ServerComponent } from "./server-component";

globalThis.__vite__ = createModuleLoader({
	loadModule: async (id) => {
		return import.meta.env.MANIFEST["client"].chunks[id].import();
	},
});

createRoot(document).render(<ServerComponent url={window.location.pathname} />);
