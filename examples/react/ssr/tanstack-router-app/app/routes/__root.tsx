import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Meta, Scripts } from "@tanstack/react-router-server/client";
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{
	assets: React.ReactNode;
}>()({
	component: Root,
	meta: () => [
		{
			title: "Document",
		},
	],
	links: () => [
		{
			rel: "apple-touch-icon",
			sizes: "180x180",
			href: "/favicons/apple-touch-icon.png",
		},
	],
	scripts: () => [
		{
			src: "https://cdn.tailwindcss.com",
		},
	],
});

export default function Root() {
	return (
		<html>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<Meta/>
			</head>
			<body>
				<div className="p-2 flex gap-2 text-lg">
					<Link
						to="/"
						activeProps={{
							className: "font-bold",
						}}
						activeOptions={{ exact: true }}
					>
						Home
					</Link>{" "}
					<Link
						to={"/posts"}
						activeProps={{
							className: "font-bold",
						}}
					>
						Posts
					</Link>
				</div>
				<hr />
				<Outlet />
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
