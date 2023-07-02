// import routeConfig from "../route-config";
// import lazyRoute from "./lazy-route";

// /**
//  *
//  * @returns {{ path: string; filePath: string, component: () => JSX.Element }[]}
//  */
// export default function loadRoutes(clientManifest, serverManifest) {
// 	return routeConfig.map((route) => {
// 		route.component = lazyRoute(route.filePath, clientManifest, serverManifest);
// 		return route;
// 	});
// }
