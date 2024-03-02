import { Fragment, createElement } from "react";
import { lazy } from "react";
import { updateStyles } from "vinxi/css";

import { renderAsset } from "./render-asset.js";

export { renderAsset };
export const createAssets = (src, manifest) =>
	lazy(async () => {
		const assets = await manifest.inputs[src].assets();
		const styles = assets.filter((asset) => asset.tag === "style");

		if (typeof window !== "undefined" && import.meta.hot) {
			import.meta.hot.on("css-update", (data) => {
				updateStyles(styles, data);
			});
		}

		return {
			default: function Assets() {
				return createElement(
					Fragment,
					undefined,
					...assets.map((asset) => renderAsset(asset)),
				);
			},
		};
	});
