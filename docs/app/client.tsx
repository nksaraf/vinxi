/// <reference types="vinxi/types/client" />
import { CH } from "@code-hike/mdx/components";
import "@code-hike/mdx/styles";
import { MDXProvider } from "@mdx-js/react";
import { lazyRoute } from "@vinxi/react";
import { pathToRegexp } from "path-to-regexp";
import { Suspense, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { Link } from "react-router-dom";
import "vinxi/client";

import { Heading } from "./components/Heading";
import { Layout } from "./components/Layout";
import { Router } from "./router";
import "./style.css";

// const routes = fileRoutes.map((route) => ({
// 	path: route.path,
// 	component: lazyRoute(route.$component, import.meta.env.MANIFEST["client"]),
// 	sections: route.$$sections?.require().sections ?? [],
// }));

// const convertPathToRegexp = (path) => {
// 	let keys = [];

// 	// we use original pathToRegexp package here with keys
// 	const regexp = pathToRegexp(path, keys, { strict: true });
// 	return { keys, regexp };
// };

// const customMatcher = makeCachedMatcher(convertPathToRegexp);

function App({ assets, children }) {
	return (
		<>
			{assets}
			{children}
		</>
	);
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<App assets={<Suspense>{/* <Assets /> */}</Suspense>}>
		<Suspense>
			<MDXProvider
				components={{
					CH,
					h1: (props) => <Heading level={1} {...props} />,
					h2: (props) => <Heading level={2} {...props} />,
					h3: (props) => <Heading level={3} {...props} />,
					a: ({ href, ...props }) => <Link to={href} {...props} />,
					Info: (props) => (
						<div
							className="mb-4 bg-blue-950 text-blue-200 text-sm bg-opacity-50 border-blue-500 border rounded-md px-4 py-1 -mx-4 w-calc(100%_+_theme(spacing.2))"
							{...props}
						/>
					),
				}}
			>
				{/* <Router matcher={customMatcher} base={(window as any).base}>
					<AppLayout>
						{routes.map((route) => (
							<Route
								path={route.path}
								key={route.path}
								component={route.component}
							/>
						))}
					</AppLayout>
				</Router> */}
				<Router />
			</MDXProvider>
		</Suspense>
		{/* </div> */}
		{/* </div> */}
	</App>,
);

function AppLayout({ children }) {
	// const router = useRouter();
	// const pathname = usePathname();
	// const sections = useMemo(() => {
	// 	const matched = routes.find(
	// 		(route) => router.matcher(route.path, pathname)[0],
	// 	);
	// 	return matched.sections;
	// }, [routes, router, pathname]);
	// console.log(sections);
	return <Layout sections={[]}>{children}</Layout>;
}
