import { readFileSync } from "fs";
import { join } from "vinxi/lib/path";

import { viteManifestPath } from "./manifest-path.js";

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

/**
 *
 * @param {string} str
 * @returns
 */
export function hash(str) {
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		hash += str.charCodeAt(i);
	}

	return hash;
}

/**
 *
 * @param {string} s
 * @returns
 */
export function chunkify(s) {
	return `${CHUNK_PREFIX}${hash(s)}`;
}
