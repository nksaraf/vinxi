import { useLoader } from "@tanstack/react-loaders";
import { ErrorComponent, Link, Outlet } from "@tanstack/router";

export const loader = async ({ context }) => {
	const postsLoader = context.loaderClient.loaders.posts;

	await postsLoader.load();

	return () =>
		useLoader({
			loader: postsLoader,
		});
};

export function ErrorBoundary({ error }) {
	return <ErrorComponent error={error} />;
}

export function Loading() {
	return <div>Loading</div>;
}

export default function Page({ useLoader }) {
	const postsLoader = useLoader()();
	return (
		<div className="p-2 flex gap-2">
			<ul className="list-disc pl-4">
				{[
					...postsLoader.state.data,
					{ id: "i-do-not-exist", title: "Non-existent Post" },
				]?.map((post) => {
					return (
						<li key={post.id} className="whitespace-nowrap">
							<Link
								to={"/posts/$postId"}
								params={{
									postId: post.id,
								}}
								className="block py-1 text-blue-800 hover:text-blue-600"
								activeProps={{ className: "text-black font-bold" }}
							>
								<div>{post.title.substring(0, 20)}</div>
							</Link>
						</li>
					);
				})}
			</ul>
			<hr />
			<Outlet />
		</div>
	);
}
