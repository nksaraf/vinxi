import { Loader, LoaderClient } from "@tanstack/react-loaders";

import { fetchPost, fetchPosts } from "./db";

const postsLoader = new Loader({
	fn: fetchPosts,
});
const postLoader = new Loader({
	fn: fetchPost,
	onInvalidate: () => {
		postsLoader.invalidate();
	},
});
export const testLoader = new Loader({
	fn: async (wait: number) => {
		await new Promise((r) => setTimeout(r, wait));
		return {
			test: new Date().toLocaleString(),
		};
	},
});
export const createLoaderClient = () =>
	new LoaderClient({
		getLoaders: () => ({
			posts: postsLoader,
			post: postLoader,
			test: testLoader,
		}),
	});

declare module "@tanstack/react-loaders" {
	interface Register {
		loaderClient: ReturnType<typeof createLoaderClient>;
	}
}
