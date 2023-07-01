import React from "react";
import {
	Fragment,
	createElement,
	forwardRef,
	lazy,
	useLayoutEffect,
} from "react";

import { renderAsset } from "./render-asset";

export default function lazyRoute(id, clientManifest, serverManifest) {
	return lazy(async () => {
		if (import.meta.env.DEV) {
			let manifest = import.meta.env.SSR ? serverManifest : clientManifest;

			const { default: Component } = await import(
				/* @vite-ignore */ manifest.inputs[id].output.path
			);
			let assets = await clientManifest.inputs?.[id].assets();
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

			const Comp = forwardRef((props, ref) => {
				useLayoutEffect(() => {
					return () => {
						// remove style tags added by vite when a CSS file is imported
						styles.forEach((style) => {
							let element = document.head.querySelector(
								`style[data-vite-dev-id="${style["data-vite-dev-id"]}"]`,
							);
							if (element) {
								element.remove();
							}
						});
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
			let manifest = import.meta.env.SSR ? serverManifest : clientManifest;
			const { default: Component } = await import(
				/* @vite-ignore */ manifest.inputs[id].output.path
			);
			let assets = await clientManifest.inputs?.[id].assets();
			const Comp = forwardRef((props, ref) => {
				return createElement(
					Fragment,
					null,
					...assets.map(({ tag: Asset, key, ...props }) => (
						<Asset key={key} {...props} />
					)),
					createElement(Component, { ...props, ref: ref }),
				);
			});
			return { default: Comp };
		}
	});
}
