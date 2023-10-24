import manifest from "../lib/manifest/client-manifest";

if (import.meta.env.DEVTOOLS && import.meta.env.DEV) {
	window.onload = async () => {
		const { default: mount } = await import("@vinxi/devtools/mount");
		await mount();
	};
}

globalThis.MANIFEST = manifest;
