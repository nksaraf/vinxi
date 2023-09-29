import { readFileSync } from "fs";
import { join } from "vinxi/lib/path";

function getChunks(app, routerName, modIndex) {
	const router = app.getRouter(routerName);
	const bundlerManifest = JSON.parse(
		readFileSync(join(router.outDir, router.base, "manifest.json"), "utf-8"),
	);

	const chunks = Object.entries(bundlerManifest)
		.filter(
			([name, chunk]) => chunk.file.startsWith("c_") && name !== router.handler,
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
}

export const chunksServerVirtualModule =
	(
		{ routers } = {
			routers: ["server"],
		},
	) =>
	(app) => {
		const chunks = routers.map((router, index) =>
			getChunks(app, router, index),
		);

		return `
			 const chunks = {};
			 ${chunks.join("\n")}
			 export default function app() {
				 globalThis.$$chunks = chunks
			 }
		`;
	};
