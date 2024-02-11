import defu from "defu";
import { createRouter as createRadixRouter, toRouteMatcher } from "radix3";
import { getQuery, joinURL, withQuery, withoutBase } from "ufo";

import {
	eventHandler,
	proxyRequest,
	sendRedirect,
	setHeaders,
} from "../runtime/server.js";

export function createRouteRulesHandler(ctx) {
	const _routeRulesMatcher = toRouteMatcher(
		createRadixRouter({ routes: ctx.routeRules }),
	);

	function getRouteRules(event) {
		event.context._nitro = event.context._nitro || {};
		if (!event.context._nitro.routeRules) {
			event.context._nitro.routeRules = getRouteRulesForPath(
				withoutBase(event.path.split("?")[0], "/"),
			);
		}
		return event.context._nitro.routeRules;
	}
	function getRouteRulesForPath(path) {
		return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
	}

	return eventHandler((event) => {
		const routeRules = getRouteRules(event);
		if (routeRules.headers) {
			setHeaders(event, routeRules.headers);
		}
		if (routeRules.redirect) {
			return sendRedirect(
				event,
				routeRules.redirect.to,
				routeRules.redirect.statusCode,
			);
		}
		if (routeRules.proxy) {
			let target = routeRules.proxy.to;
			if (target.endsWith("/**")) {
				let targetPath = event.path;
				const strpBase = routeRules.proxy._proxyStripBase;
				if (strpBase) {
					targetPath = withoutBase(targetPath, strpBase);
				}
				target = joinURL(target.slice(0, -3), targetPath);
			} else if (event.path.includes("?")) {
				const query = getQuery(event.path);
				target = withQuery(target, query);
			}
			return proxyRequest(event, target, {
				fetch: ctx.localFetch,
				...routeRules.proxy,
			});
		}
	});
}
