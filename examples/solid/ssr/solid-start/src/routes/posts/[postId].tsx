import { useParams } from "@solidjs/router";
import { Suspense, createResource } from "solid-js";

import { fetchPost } from "../../db";

export default function Page() {
	const params = useParams();
	const [postLoader] = createResource(
		() => params.postId,
		(postId) => fetchPost(postId),
	);

	return (
		<Suspense>
			<div class="space-y-2">
				<h4 class="text-xl font-bold underline">{postLoader()?.title}</h4>
				<div class="text-sm">{postLoader()?.body}</div>
			</div>
		</Suspense>
	);
}
