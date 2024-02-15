// https://vitepress.dev/guide/custom-theme
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import "@shikijs/vitepress-twoslash/style.css";
import type { Theme } from "vitepress";
import type { EnhanceAppContext } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";

import "./style.css";

export default {
	extends: DefaultTheme,
	Layout: () => {
		return h(DefaultTheme.Layout, null, {
			// https://vitepress.dev/guide/extending-default-theme#layout-slots
		});
	},
	enhanceApp({ app }: EnhanceAppContext) {
		app.use(TwoslashFloatingVue);
	},
} satisfies Theme;
