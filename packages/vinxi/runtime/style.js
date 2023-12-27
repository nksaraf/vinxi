/**
 *
 * @param {*} styles
 * @param {*} data
 */
export function updateStyles(styles, data) {
	let styleAsset = styles.find(
		(s) => s.attrs["data-vite-dev-id"] === data.file,
	);
	if (styleAsset) {
		styleAsset.children = data.contents;
	}
}

export function appendStyles(styles) {
	styles.forEach((style) => {
		let element = document.head.querySelector(
			`style[data-vite-dev-id="${style.attrs["data-vite-dev-id"]}"]`,
		);
		if (!element) {
			element = document.createElement("style");
			element.setAttribute("data-vite-dev-id", style.attrs["data-vite-dev-id"]);
			element.innerHTML = style.children;
			document.head.appendChild(element);
		}
	});
}

export function cleanupStyles(styles) {
	styles.forEach((style) => {
		let element = document.head.querySelector(
			`style[data-vite-dev-id="${style.attrs["data-vite-dev-id"]}"]`,
		);
		if (element) {
			element.remove();
		}
	});
}
