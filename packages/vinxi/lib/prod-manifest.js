import { createProdManifest } from "./manifest/prod-server-manifest.js";

export default function plugin(app) {
	globalThis.MANIFEST = createProdManifest(globalThis.app);
}
