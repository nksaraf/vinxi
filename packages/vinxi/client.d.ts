/// <reference types="vite/client" />

declare interface Window {
	manifest: any;
}

interface ImportMetaEnv {
	// more env variables...
	readonly manifest: any;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
