import { useLoader } from "@tanstack/react-loaders";
import { ErrorComponent } from "@tanstack/router";

import { NotFoundError } from "../../NotFoundError";

export const loader = async ({
	context: { loaderClient },
	params: { postId },
}) => {
	const postLoader = loaderClient.loaders.post;
	await postLoader.load({
		variables: postId,
	});

	// Return a curried hook!
	return () =>
		useLoader({
			loader: postLoader,
			variables: postId,
		});
};

export default function Page({ useLoader }) {
	const {
		state: { data: post },
	} = useLoader()();
	console.log("post", post);

	return (
		<div className="space-y-2">
			<h4 className="text-xl font-bold underline">{post.title}</h4>
			<div className="text-sm">{post.body}</div>
		</div>
	);
}

export function ErrorBoundary({ error }) {
	if (error instanceof NotFoundError) {
		return <div>{error.message}</div>;
	}

	return <ErrorComponent error={error} />;
}
