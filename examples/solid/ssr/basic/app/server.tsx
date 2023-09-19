/// <reference types="vinxi/server" />
import { MetaProvider, renderTags } from "@solidjs/meta";
import { renderAsset } from "@vinxi/solid";
import {
	HydrationScript,
	NoHydration,
	Suspense,
	renderToStream,
	renderToStringAsync,
	ssr,
	useAssets,
} from "solid-js/web";
import { eventHandler } from "vinxi/runtime/server";

import App from "./app";

export default eventHandler(async (event) => {
	const clientManifest = import.meta.env.MANIFEST["client"];
	const assets = await clientManifest.inputs[clientManifest.handler].assets();
	const tags = [];
	function Meta() {
		useAssets(() => ssr(renderTags(tags)) as any);
		return null;
	}

	const manifestJson = await clientManifest.json();
	const stream = renderToStream(() => (
		<MetaProvider tags={tags}>
			<App
				assets={
					<>
						<NoHydration>
							<Meta />
						</NoHydration>
						<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>
					</>
				}
				scripts={
					<>
						<NoHydration>
							<HydrationScript />
							<script
								innerHTML={`window.manifest = ${JSON.stringify(manifestJson)}`}
							></script>
							<script
								type="module"
								src={clientManifest.inputs[clientManifest.handler].output.path}
							/>
						</NoHydration>
					</>
				}
			/>
		</MetaProvider>
	));

	event.node.res.setHeader("Content-Type", "text/html");
	return stream;
});
