/// <reference types="vinxi/types/server" />
/// <reference types="@cloudflare/workers-types"	/>
import { renderAsset } from "@vinxi/react";
import { Suspense } from "react";
import { renderToReadableStream } from "react-dom/server.edge";
import { getManifest } from "vinxi/manifest";

import { miniflareEventHandler } from "../dev-server";
import App from "./app";

declare global {
	interface ImportMetaEnv {
		KV: KVNamespace;
	}
}

export default miniflareEventHandler(async (event) => {
	const { env } = event.context.cloudflare;
	const clientManifest = getManifest("client");
	const assets = await clientManifest.inputs[clientManifest.handler].assets();
	console.log(
		await env.KV.put(
			"counter",
			JSON.stringify(Number((await env.KV.get("counter")) ?? 0) + 1),
		),
	);

	const counter = JSON.parse((await env.KV.get("counter")) ?? "0");
	console.log(counter);
	const stream = await renderToReadableStream(
		<App assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>}>
			{counter}
		</App>,
		{
			bootstrapModules: [
				clientManifest.inputs[clientManifest.handler].output.path,
			],
			bootstrapScriptContent: `window.manifest = ${JSON.stringify(
				await clientManifest.json(),
			)}`,
		},
	);

	event.node.res.setHeader("Content-Type", "text/html");
	return stream;
});
