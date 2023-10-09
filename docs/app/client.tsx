/// <reference types="vinxi/types/client" />
import "@code-hike/mdx/styles";
import { MDXProvider } from "@mdx-js/react";
import { lazyRoute } from "@vinxi/react";
import { pathToRegexp } from "path-to-regexp";
import { Suspense, useMemo } from "react";
import ReactDOM from "react-dom/client";
import "vinxi/client";
import fileRoutes from "vinxi/routes";
import { Link, Route, Router, useRouter } from "wouter";
import makeCachedMatcher from "wouter/matcher";
import { usePathname } from "wouter/use-location";

import { Heading } from "./components/Heading";
import { Layout } from "./components/Layout";
import "./style.css";

const routes = fileRoutes.map((route) => ({
	path: route.path,
	component: lazyRoute(route.$component, import.meta.env.MANIFEST["client"]),
	sections: route.$$sections?.require().sections ?? [],
}));

const convertPathToRegexp = (path) => {
	let keys = [];

	// we use original pathToRegexp package here with keys
	const regexp = pathToRegexp(path, keys, { strict: true });
	return { keys, regexp };
};

const customMatcher = makeCachedMatcher(convertPathToRegexp);

function App({ assets, children }) {
	return (
		<>
			{assets}
			{children}
		</>
	);
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<MDXProvider
		components={{
			a: Link,
		}}
	>
		<App assets={<Suspense>{/* <Assets /> */}</Suspense>}>
			{/* <div className="w-full flex flex-row justify-center"> */}
			{/* <div className="prose max-w-[80vw] dark:prose-invert"> */}
			<Suspense>
				<MDXProvider
					components={{
						h1: (props) => <Heading level={1} {...props} />,
						h2: (props) => <Heading level={2} {...props} />,
						h3: (props) => <Heading level={3} {...props} />,
					}}
				>
					<Router matcher={customMatcher} base={(window as any).base}>
						<AppLayout>
							{routes.map((route) => (
								<Route
									path={route.path}
									key={route.path}
									component={route.component}
								/>
							))}
						</AppLayout>
					</Router>
				</MDXProvider>
			</Suspense>
			{/* </div> */}
			{/* </div> */}
		</App>
	</MDXProvider>,
);

function AppLayout({ children }) {
	const router = useRouter();
	const pathname = usePathname();
	const sections = useMemo(() => {
		const matched = routes.find(
			(route) => router.matcher(route.path, pathname)[0],
		);
		return matched.sections;
	}, [routes, router, pathname]);
	console.log(sections);
	return <Layout sections={sections}>{children}</Layout>;
}
