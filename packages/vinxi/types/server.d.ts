/// <reference types="vite/client" />

declare interface Window {
	MANIFEST: {
		readonly [key: string]: import("./manifest").Manifest;
	};
}

interface ImportMetaEnv {
	// more env variables...
	readonly MANIFEST: {
		readonly [key: string]: import("./manifest").Manifest;
	};
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "#vite-dev-server" {
	const viteServer: import("vite").ViteDevServer;
	export default viteServer;
}
