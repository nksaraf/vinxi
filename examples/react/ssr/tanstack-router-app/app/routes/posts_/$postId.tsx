import { createFileRoute } from '@tanstack/react-router'
import { fetchPost } from "../../db";
import { NotFoundError } from "../../error";
import React from "react";
import { ErrorComponent } from "@tanstack/react-router";

export const Route = createFileRoute('/posts/$postId')({
	component: Page,
	errorComponent: ErrorBoundary,
	loader: ({params}) => fetchPost(params.postId)
})
export default function Page() {
	const post = Route.useLoaderData()

	return (
		<div className="space-y-2">
			<h4 className="text-xl font-bold underline">{post.title}</h4>
			<div className="text-sm">{post.body}</div>
		</div>
	);
}

function ErrorBoundary({ error }) {
	if (error instanceof NotFoundError) {
		return <div>{error.message}</div>;
	}

	return <ErrorComponent error={error} />;
}
