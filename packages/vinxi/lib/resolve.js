import { isAbsolute, join, relative } from "pathe";

function absoluteAppPath(path, router, appConfig) {
	return path
		? isAbsolute(path)
			? path
			: join(router.root ?? appConfig.root, path)
		: undefined;
}
export function relativeAppPath(path, router, appConfig) {
	return path
		? relative(
				router.root ?? appConfig.root,
				absoluteAppPath(path, router, appConfig),
		  )
		: undefined;
}

export const resolve = {
	relative: relativeAppPath,
	absolute: absoluteAppPath,
};
