import React from "react";
import { lazy } from "react";
import { updateStyles } from "vinxi/lib/style";

import { renderAsset } from "./render-asset";

export const createAssets = (src) =>
	lazy(async () => {
		const clientManifest = import.meta.env.MANIFEST["client"];
		const assets = await clientManifest.inputs[src].assets();
		const styles = assets.filter((asset) => asset.tag === "style");

		if (typeof window !== "undefined" && import.meta.hot) {
			import.meta.hot.on("css-update", (data) => {
				updateStyles(styles, data);
			});
		}

		return {
			default: function Assets() {
				return <>{assets.map((asset) => renderAsset(asset))}</>;
			},
		};
	});
