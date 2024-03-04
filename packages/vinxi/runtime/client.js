import manifest from "../lib/manifest/client-manifest";

// if (import.meta.env.DEVTOOLS && import.meta.env.DEV) {
// 	window.onload = async () => {
// 		const { default: mount } = await import("@vinxi/devtools/mount");
// 		await mount();
// 	};
// }

if (typeof window !== "undefined" && import.meta.hot) {
	import.meta.hot.on("css-update", (data) => {
		for (const el of document.querySelectorAll(
			`style[data-vite-dev-id="${data.file}"]`,
		)) {
			el.innerHTML = data.contents;
		}
	});
}

//
globalThis.MANIFEST = manifest;
