export type Asset = LinkAsset | ScriptOrStyleAsset;

type LinkAsset = {
	tag: 'link';
	attrs: Record<string, string>
}

type ScriptOrStyleAsset = {
	tag: 'script' | 'style';
	attrs: Record<string, string>;
	children?: string;
}

export type Manifest = {
	/** Name of the router */
	name: string;
	/** Handler path for the router */
	handler: string;
	base: string;
	routes(): Promise<
		{
			/** Route path */
			route: string;
			/** Path to built artifact for this route */
			path: string;
		}[]
	>;
	target: "browser" | "server" | "static";
	type: string;
	inputs: {
		[key: string]: {
			/** Assets needed by this entry point */
			assets(): Promise<Asset[]>;
			import<T = { default: any; [k: string]: any }>(): Promise<T>;
			output: {
				/** Path to built artifact for this entry point. */
				path: string;
			};
		};
	};
	chunks: {
		[key: string]: {
			assets(): Promise<Asset[]>;
			import<T = { default: any; [k: string]: any }>(): Promise<T>;
			output: {
				path: string;
			};
		};
	};
	/**
	 * Seriazable JSON representation of the manifest
	 * Useful for sending to the client and hydrating the runtime
	 * by assigning it to `window.manifest`
	 */
	json(): object;
	/** Map of assets needed by the inputs and chunks */
	assets(): Promise<{ [key: string]: Asset[] }>;

	// @internal DO NOT USE, WILL LIKELY BE REMOVED
	dev: {
		server: import("vite").ViteDevServer;
	};
};
