import { createElement } from "react";

/**
 *
 * @param {{ tag: string; attrs: Record<string, string>; children: any }} param0
 * @returns
 */
export function renderAsset({
	tag,
	attrs: { key, ...attrs } = {
		key: undefined,
	},
	children,
}) {
	switch (tag) {
		case "script":
			if (attrs.src) {
				return createElement("script", { ...attrs, key: attrs.src });
			} else {
				return createElement("script", {
					...attrs,
					key: key,
					dangerouslySetInnerHTML: {
						__html: children,
					},
				});
			}
		case "link":
			return createElement("link", { ...attrs, key: key });
		case "style":
			return createElement("style", {
				...attrs,
				key: key,
				dangerouslySetInnerHTML: { __html: children },
			});
	}
}
