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
