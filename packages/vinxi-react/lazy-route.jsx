import React, { useLayoutEffect } from "react";
import { Fragment, createElement, forwardRef, lazy } from "react";
import { cleanupStyles, updateStyles } from "vinxi/lib/style";

import invariant from "./invariant.js";
import { renderAsset } from "./render-asset";

/**
 *
 * @param {string} id
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

			const mod = await import(
				/* @vite-ignore */ manifest.inputs[component.src].output.path
			);
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
				useLayoutEffect(() => {
					return () => {
						// remove style tags added by vite when a CSS file is imported
						cleanupStyles(styles);
					};
				}, []);
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
