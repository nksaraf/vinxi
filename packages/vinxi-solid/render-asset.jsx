/** @jsxImportSource solid-js */
import { Link, Style, useHead } from "@solidjs/meta";
import { splitProps } from "solid-js";

function Script(props) {
	const [{ id }, scriptProps] = splitProps(props, ["id"]);
	useHead({
		tag: "script",
		props: scriptProps,
		setting: {
			close: true,
		},
		id,
	});
}

const assetMap = {
	style: (props) => <Style {...props.attrs}>{props.children}</Style>,
	link: (props) => <Link {...props.attrs} />,
	script: (props) => {
		return props.attrs.src ? (
			<Script {...props.attrs} id={props.key}>
				{" "}
			</Script>
		) : null;
	},
};

export function renderAsset(asset) {
	let { tag, attrs: { key, ...attrs } = { key: undefined }, children } = asset;
	return assetMap[tag]({ attrs, key, children });
}
