import React from "react";
import { lazy } from "react";

import { renderAsset } from "./render-asset";

export const createAssets = () =>
	lazy(async () => {
		const assets = await import.meta.env.MANIFEST["client"].inputs[
			import.meta.env.HANDLER
		].assets();

		const styles = assets.filter((asset) => asset.tag === "style");

		if (typeof window !== "undefined" && import.meta.hot) {
			import.meta.hot.on("css-update", (data) => {
				let styleAsset = styles.find(
					(s) => s["data-vite-dev-id"] === data.file,
				);
				if (styleAsset) {
					styleAsset.children = data.contents;
				}

				for (const el of document.querySelectorAll(
					`style[data-vite-dev-id="${data.file}"]`,
				)) {
					el.innerHTML = data.contents;
				}
			});
		}

		return {
			default: function Assets() {
				return <>{assets.map((asset) => renderAsset(asset))}</>;
			},
		};
	});
