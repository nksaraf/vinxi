// import { defineEventHandler, fromNodeMiddleware, toNodeListener } from "h3";
// import {
// 	createCall,
// 	createFetch,
// 	createFetch as createLocalFetch,
// } from "unenv/runtime/fetch/index";

export default function plugin(app) {
	// @ts-ignore
	// globalThis.$fetch = createFetch(app.localCall);
	globalThis.$handle = (event) => app.h3App.handler(event);
}
