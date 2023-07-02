import { lazy } from "solid-js";
import { updateStyles } from "vinxi/lib/style";

import { renderAsset } from "./render-asset";

export const createAssets = () =>
	lazy(async () => {
		const assets = await import.meta.env.MANIFEST["client"].inputs[
			import.meta.env.HANDLER
		].assets();

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
