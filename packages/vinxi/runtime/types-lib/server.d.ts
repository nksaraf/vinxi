/// <reference types="vite/client" />

declare interface Window {
	MANIFEST: any;
}

interface ImportMetaEnv {
	// more env variables...
	readonly MANIFEST: any;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "#vite-dev-server" {
	const viteServer: import("vite").ViteDevServer;
	export default viteServer;
}
