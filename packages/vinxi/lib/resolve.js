import { isAbsolute, join, relative } from "./path.js";

/**
 * @template {string | undefined} T
 * @param {T} path
 * @param {string} root
 * @returns {T}
 */
function absoluteAppPath(path, root) {
	//@ts-ignore
	return path ? (isAbsolute(path) ? path : join(root, path)) : path;
}

/**
 * @template {string | undefined} T
 * @param {T} path
 * @param {string} root
 * @returns {T}
 */
export function relativeAppPath(path, root) {
	//@ts-ignore
	return path ? relative(root, absoluteAppPath(path, root)) : path;
}

export const resolve = {
	relative: relativeAppPath,
	absolute: absoluteAppPath,
};
