/// <reference types="vite/client" />

declare interface Window {
	MANIFEST: {
		readonly [key: string]: import("./manifest").Manifest;
	};
	manifest: any;
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
