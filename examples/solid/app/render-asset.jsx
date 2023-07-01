/** @jsxImportSource solid-js */
import { Link, Style } from "@solidjs/meta";

const assetMap = {
  style: (props) => <Style {...props.attrs}>{props.children}</Style>,
  link: (props) => <Link {...props.attrs} />,
  script: (props) => {
    return props.src ? <script {...props}></script> : null;
  },
};

export function renderAsset(asset) {
  let { tag, attrs: { key, ...attrs } = { key: undefined }, children } = asset;
  return assetMap[tag]({ attrs, key, children });
}
