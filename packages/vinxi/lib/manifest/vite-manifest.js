"use strict";

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @returns Array of asset URLs
 */
const findAssetsInViteManifest = (manifest, id, assetMap = new Map()) => {
	const stack = [];

	/**
	 * @param {string} id
	 */
	function traverse(id) {
		if (stack.includes(id)) {
			return [];
		}

		const cached = assetMap.get(id);
		if (cached) {
			return cached;
		}
		const chunk = manifest[id];
		if (!chunk) {
			return [];
		}

		stack.push(id);

		const assets = [
			...(chunk.assets || []),
			...(chunk.css || []),
			...(chunk.imports?.flatMap(traverse) || []),
		];
		const imports = chunk.imports?.flatMap(traverse) || [];
		const all = [...assets, ...imports].filter(Boolean);
		all.push(chunk.file);
		assetMap.set(id, all);

		stack.pop();

		return Array.from(new Set(all));
	}
	return traverse(id);
};

export default findAssetsInViteManifest;
