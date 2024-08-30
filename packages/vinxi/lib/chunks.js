import { readFileSync } from "fs";

import { viteManifestPath } from "./manifest-path.js";
import { join } from "./path.js";

const CHUNK_PREFIX = "c_";

/**
 *
 * @param {import('vinxi').App} app
 * @param {string} routerName
 * @param {number} modIndex
 * @returns
 */
function getChunks(app, routerName, modIndex) {
	const router = app.getRouter(routerName);
	if (router.target !== "server") {
		return "";
	}

	try {
		const bundlerManifest = JSON.parse(
			readFileSync(viteManifestPath(router), "utf-8"),
		);

		const chunks = Object.entries(bundlerManifest)
			.filter(
				([name, chunk]) =>
					chunk.file.startsWith(CHUNK_PREFIX) && name !== router.handler,
			)
			.map(([name, chunk], index) => {
				const chunkPath = join(router.outDir, router.base, chunk.file);
				return `
				import * as mod_${index}_${modIndex} from '${chunkPath}';
				chunks['${chunk.file}'] = mod_${index}_${modIndex}
			`;
			})
			.join("\n");
		return chunks;
	} catch (e) {
		return "";
	}
}

export const chunksServerVirtualModule =
	() => (/** @type {import('vinxi').App}*/ app) => {
		const chunks = app.config.routers.map((router, index) =>
			getChunks(app, router.name, index),
		);

		return `
			 const chunks = {};
			 ${chunks.join("\n")}
			 export default function app() {
				 globalThis.$$chunks = chunks
			 }
		`;
	};

const hashes = new Map();
const regexReturnCharacters = /\r/g;

/**
 * djb2 hashing
 *
 * @param {string} input
 * @returns {string}
 *
 * Source: https://github.com/sveltejs/svelte/blob/0203eb319b5d86138236158e3ae6ecf29e26864c/packages/svelte/src/utils.js#L7
 * Source License: MIT
 */
export function hash(input) {
	const cachedResult = hashes.get(input);
	if (cachedResult) return cachedResult;

	let str = input.replace(regexReturnCharacters, "");
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	const result = (hash >>> 0).toString(36);
	hashes.set(input, result);

	return result;
}

/**
 *
 * @param {string} s
 * @returns
 */
export function chunkify(s) {
	return `${CHUNK_PREFIX}${hash(s)}`;
}
