import mountDevtools from "@vinxi/devtools/mount";

import manifest from "../lib/manifest/client-manifest";

if (import.meta.env.DEVTOOLS && import.meta.env.DEV) {
	mountDevtools();
}

globalThis.MANIFEST = manifest;
