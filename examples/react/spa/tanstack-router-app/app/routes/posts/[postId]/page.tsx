import {
	createLoaderOptions,
	useLoaderInstance,
} from "@tanstack/react-loaders";
import { ErrorComponent, Route, RouteOptions } from "@tanstack/react-router";

import { NotFoundError } from "../../../error";

export const loader = async ({ context: { loaderClient, loaderOptions } }) => {
	await loaderClient.load(loaderOptions);
};

export default function Page({ useRouteContext }) {
	const { loaderOptions } = useRouteContext();
	const { data: post } = useLoaderInstance(loaderOptions);
	console.log(post);

	return (
		<div className="space-y-2">
			<h4 className="text-xl font-bold underline">{post.title}</h4>
			<div className="text-sm">{post.body}</div>
		</div>
	);
}

type Config = Omit<RouteOptions, "id" | "component" | "getParentRoute">;

export const config = {
	errorComponent: ErrorBoundary,
	beforeLoad: ({ params: { postId } }) => {
		return {
			loaderOptions: createLoaderOptions({
				key: "post",
				variables: postId,
			}),
		};
	},
} satisfies Config;

function ErrorBoundary({ error }) {
	if (error instanceof NotFoundError) {
		return <div>{error.message}</div>;
	}

	return <ErrorComponent error={error} />;
}
