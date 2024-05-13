/**
 *
 * @param {{ attrs: Record<string, string>; children: string }[]} styles
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

/**
 *
 * @param {{ attrs: Record<string, string>; children: string }[]} styles
 */
export function preloadStyles(styles) {
	styles.forEach((style) => {
		if (!style.attrs.href) {
			return;
		}

		let element = document.head.querySelector(
			`link[href="${style.attrs.href}"]`,
		);
		if (!element) {
			// create a link preload element for the css file so it starts loading but doesnt get attached
			element = document.createElement("link");
			element.setAttribute("rel", "preload");
			element.setAttribute("as", "style");
			element.setAttribute("href", style.attrs.href);
			document.head.appendChild(element);
		}
	});
}

/**
 *
 * @param {{ attrs: Record<string, string>; children: string }[]} styles
 */
export function appendStyles(styles) {
	styles.forEach((style) => {
		let element = document.head.querySelector(
			`style[data-vite-dev-id="${style.attrs["data-vite-dev-id"]}"]`,
		);
		if (!element) {
			element = document.createElement("style");
			element.setAttribute("data-vite-dev-id", style.attrs["data-vite-dev-id"]);
			element.innerHTML = style.children;
			element.setAttribute("data-vite-ref", "0");
			document.head.appendChild(element);
		}

		element.setAttribute(
			"data-vite-ref",
			`${Number(element.getAttribute("data-vite-ref")) + 1}`,
		);
	});
}

/**
 *
 * @param {{ attrs: Record<string, string>}[]} styles
 */
export function cleanupStyles(styles) {
	styles.forEach((style) => {
		let element = document.head.querySelector(
			`style[data-vite-dev-id="${style.attrs["data-vite-dev-id"]}"]`,
		);

		if (!element) {
			return;
		}

		if (Number(element.getAttribute("data-vite-ref")) == 1) {
			element.remove();
		} else {
			element.setAttribute(
				"data-vite-ref",
				`${Number(element.getAttribute("data-vite-ref")) - 1}`,
			);
		}
	});
}
