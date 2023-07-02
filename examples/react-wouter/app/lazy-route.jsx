import React, { useInsertionEffect } from "react";
import { Fragment, createElement, forwardRef, lazy } from "react";
import { cleanupStyles, updateStyles } from "vinxi/lib/style";

import { renderAsset } from "./render-asset";

/**
 *
 * @param {string} id
 * @param {any} clientManifest
 * @param {any} serverManifest
 * @returns {React.FC<any>}
 */
export default function lazyRoute(component, clientManifest, serverManifest) {
	return lazy(async () => {
		if (import.meta.env.DEV) {
			let manifest = import.meta.env.SSR ? serverManifest : clientManifest;

			const { default: Component } = await import(
				/* @vite-ignore */ manifest.inputs[component.src].output.path
			);
			let assets = await clientManifest.inputs?.[component.src].assets();
			const styles = assets.filter((asset) => asset.tag === "style");

			if (typeof window !== "undefined" && import.meta.hot) {
				import.meta.hot.on("css-update", (data) => {
					updateStyles(styles, data);
				});
			}

			const Comp = forwardRef((props, ref) => {
				useInsertionEffect(() => {
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
			const { default: Component } = await component.import();
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
