import React from "react";

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
				return <script {...attrs} key={attrs.src} />;
			} else {
				return (
					<script
						{...attrs}
						key={key}
						dangerouslySetInnerHTML={{
							__html: children,
						}}
					/>
				);
			}
		case "link":
			return <link {...attrs} key={key} />;
		case "style":
			return (
				<style
					{...attrs}
					key={key}
					dangerouslySetInnerHTML={{ __html: children }}
				/>
			);
	}
}
