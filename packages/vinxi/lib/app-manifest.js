import { createDevManifest } from "./manifest/dev-server-manifest.js";
import { createProdManifest } from "./manifest/prod-server-manifest.js";

export default function plugin() {
	globalThis.MANIFEST =
		process.env.NODE_ENV === "production"
			? createProdManifest(globalThis.app)
			: createDevManifest(globalThis.app);
}
