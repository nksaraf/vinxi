import { DehydrateRouter } from "@tanstack/react-start/client";
import { Link, Outlet, useRouter, useRouterContext } from "@tanstack/router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { createAssets } from "@vinxi/react";
import { Suspense } from "react";

export default function Root() {
	const router = useRouter();
	return (
		<html>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Document</title>
				<link rel="icon" href="/favicon.ico" />
				<Suspense>{router.context.assets}</Suspense>
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
				{/* Start rendering router matches */}
				<TanStackRouterDevtools position="bottom-right" />
				<DehydrateRouter />
			</body>
		</html>
	);
}
