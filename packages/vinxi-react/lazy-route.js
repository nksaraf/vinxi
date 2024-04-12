import { Fragment, createElement, forwardRef, lazy } from "react";
import { useLayoutEffect } from "react";
import { cleanupStyles, preloadStyles, updateStyles } from "vinxi/css";

import invariant from "./invariant.js";
import { renderAsset } from "./render-asset.js";

/**
 *
 * @param {{ src: string; import(): Promise<any> }} component
 * @param {any} clientManifest
 * @param {any} serverManifest
 * @returns {React.FC<any>}
 */
export default function lazyRoute(
	component,
	clientManifest,
	serverManifest,
	exported = "default",
) {
	return lazy(async () => {
		if (import.meta.env.DEV) {
			let manifest = import.meta.env.SSR ? serverManifest : clientManifest;

			const mod = await manifest.inputs[component.src].import();
			invariant(
				mod[exported],
				`Module ${component.src} does not export ${exported}`,
			);
			const Component = mod[exported];
			let assets = await clientManifest.inputs?.[component.src].assets();
			const styles = assets.filter((asset) => asset.tag === "style");

			if (typeof window !== "undefined" && import.meta.hot) {
				import.meta.hot.on("css-update", (data) => {
					updateStyles(styles, data);
				});
			}

			const Comp = forwardRef((props, ref) => {
				if (typeof window !== "undefined") { 
					useLayoutEffect(() => {
					return () => {
						// remove style tags added by vite when a CSS file is imported
						cleanupStyles(styles);
					};
				}, []);
				}
				return createElement(
					Fragment,
					null,
					...assets.map((asset) => renderAsset(asset)),
					createElement(Component, { ...props, ref: ref }),
				);
			});
			return { default: Comp };
		} else {
			const mod = await component.import();

			const Component = mod[exported];
			let assets = await clientManifest.inputs?.[component.src].assets();

			if (typeof window !== "undefined") {
				const styles = assets.filter(
					(asset) => asset.attrs.rel === "stylesheet",
				);
				preloadStyles(styles);
			}

			const Comp = forwardRef((props, ref) => {
				return createElement(
					Fragment,
					null,
					...assets.map((asset) => renderAsset(asset)),
					createElement(Component, { ...props, ref: ref }),
				);
			});
			return { default: Comp };
		}
	});
}
