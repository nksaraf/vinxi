/// <reference types="vinxi/server" />
import { MetaProvider, renderTags } from "@solidjs/meta";
import {
	HydrationScript,
	NoHydration,
	Suspense,
	renderToStringAsync,
	ssr,
	useAssets,
} from "solid-js/web";
import { eventHandler } from "vinxi/runtime/server";

import App from "./app";
import { renderAsset } from "./render-asset";

export default eventHandler(async (event) => {
	const clientManifest = import.meta.env.MANIFEST["client"];
	const assets = await clientManifest.inputs["./app/client.tsx"].assets();
	const events = {};
	const tags = [];
	function Meta() {
		useAssets(() => ssr(renderTags(tags)) as any);
		return null;
	}

	const manifestJson = await clientManifest.json();
	const html = await renderToStringAsync(() => (
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
								src={clientManifest.inputs["./app/client.tsx"].output.path}
							/>
						</NoHydration>
					</>
				}
			/>
		</MetaProvider>
	));
	return html;
	// const stream = renderToPipeableStream(
	// 	<App assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>} />,
	// 	{
	// 		onAllReady: () => {
	// 			events["end"]?.();
	// 		},
	// 		bootstrapModules: [clientManifest.inputs["./app/client.tsx"].output.path],
	// 		bootstrapScriptContent: `window.manifest = ${JSON.stringify(
	// 			await clientManifest.json(),
	// 		)}`,
	// 	},
	// );

	// // @ts-ignore
	// stream.on = (event, listener) => {
	// 	events[event] = listener;
	// };

	// return stream;
});
