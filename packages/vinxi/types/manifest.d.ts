export type Asset = string;

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
	mode: string;
	inputs: {
		[key: string]: {
			/** Assets needed by this entry point */
			assets(): Promise<Asset[]>;

			output: {
				/** Path to built artifact for this entry point. */
				path: string;
			};
		};
	};
	chunks: {
		[key: string]: {
			assets(): Promise<Asset[]>;
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
};
