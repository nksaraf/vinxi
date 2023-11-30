/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import { readFileSync } from "fs";

import { parseLoose } from "./parse.js";

/**
 *
 * @param {{ resolve }} vite
 * @param {string} specifier
 * @param {string} parentURL
 * @returns
 */
export async function resolveClientImport(vite, specifier, parentURL) {
	const resolved = await vite.resolve(specifier, parentURL, {
		skipSelf: true,
	});

	if (!resolved) {
		throw new Error("Could not resolve " + specifier + " from " + parentURL);
	}

	return { url: resolved.id };
}

export async function parseExportNamesInto(vite, ast, names, parentURL) {
	for (let i = 0; i < ast.program.body.length; i++) {
		const node = ast.program.body[i];
		switch (node.type) {
			case "ExportAllDeclaration":
				if (node.exported) {
					addExportNames(names, node.exported);
					continue;
				} else {
					const { url } = await resolveClientImport(
						vite,
						node.source.value,
						parentURL,
					);

					const clientImportCode = readFileSync(url, "utf8");

					const childBody = parseLoose(clientImportCode ?? "").body;

					await parseExportNamesInto(vite, childBody, names, url);
					continue;
				}
			case "ExportDefaultDeclaration":
				names.push("default");
				continue;
			case "ExportNamedDeclaration":
				if (node.declaration) {
					if (node.declaration.type === "VariableDeclaration") {
						const declarations = node.declaration.declarations;
						for (let j = 0; j < declarations.length; j++) {
							addExportNames(names, declarations[j].id);
						}
					} else {
						addExportNames(names, node.declaration.id);
					}
				}
				if (node.specifiers) {
					const specifiers = node.specifiers;
					for (let j = 0; j < specifiers.length; j++) {
						addExportNames(names, specifiers[j].exported);
					}
				}
				continue;
		}
	}
}

export function addLocalExportedNames(names, node) {
	switch (node.type) {
		case "Identifier":
			names.set(node.name, node.name);
			return;
		case "ObjectPattern":
			for (let i = 0; i < node.properties.length; i++)
				addLocalExportedNames(names, node.properties[i]);
			return;
		case "ArrayPattern":
			for (let i = 0; i < node.elements.length; i++) {
				const element = node.elements[i];
				if (element) addLocalExportedNames(names, element);
			}
			return;
		case "Property":
			addLocalExportedNames(names, node.value);
			return;
		case "AssignmentPattern":
			addLocalExportedNames(names, node.left);
			return;
		case "RestElement":
			addLocalExportedNames(names, node.argument);
			return;
		case "ParenthesizedExpression":
			addLocalExportedNames(names, node.expression);
			return;
	}
}

export function addExportNames(names, node) {
	switch (node.type) {
		case "Identifier":
			names.push(node.name);
			return;
		case "ObjectPattern":
			for (let i = 0; i < node.properties.length; i++)
				addExportNames(names, node.properties[i]);
			return;
		case "ArrayPattern":
			for (let i = 0; i < node.elements.length; i++) {
				const element = node.elements[i];
				if (element) addExportNames(names, element);
			}
			return;
		case "Property":
			addExportNames(names, node.value);
			return;
		case "AssignmentPattern":
			addExportNames(names, node.left);
			return;
		case "RestElement":
			addExportNames(names, node.argument);
			return;
		case "ParenthesizedExpression":
			addExportNames(names, node.expression);
			return;
	}
}

export function decorateExports({ code, id, ast, runtime, hash, options }) {
	// onServerReference(moduleId);

	// If the same local name is exported more than once, we only need one of the names.
	const localNames = new Map();
	const localTypes = new Map();

	for (let i = 0; i < ast.length; i++) {
		const node = ast[i];
		switch (node.type) {
			case "ExportAllDeclaration":
				// If export * is used, the other file needs to explicitly opt into "use server" too.
				break;
			case "ExportDefaultDeclaration":
				if (node.declaration.type === "Identifier") {
					localNames.set(node.declaration.name, "default");
				} else if (node.declaration.type === "FunctionDeclaration") {
					if (node.declaration.id) {
						localNames.set(node.declaration.id.name, "default");
						localTypes.set(node.declaration.id.name, "function");
					} else {
						// TODO: This needs to be rewritten inline because it doesn't have a local name.
					}
				}
				continue;
			case "ExportNamedDeclaration":
				if (node.declaration) {
					if (node.declaration.type === "VariableDeclaration") {
						const declarations = node.declaration.declarations;
						for (let j = 0; j < declarations.length; j++) {
							addLocalExportedNames(localNames, declarations[j].id);
						}
					} else {
						const name = node.declaration.id.name;
						localNames.set(name, name);
						if (node.declaration.type === "FunctionDeclaration") {
							localTypes.set(name, "function");
						}
					}
				}
				if (node.specifiers) {
					const specifiers = node.specifiers;
					for (let j = 0; j < specifiers.length; j++) {
						const specifier = specifiers[j];
						localNames.set(specifier.local.name, specifier.exported.name);
					}
				}
				continue;
		}
	}

	let newSrc =
		`import { ${runtime.function} } from '${runtime.module}';\n` +
		code +
		"\n\n;";
	localNames.forEach(function (exported, local) {
		if (localTypes.get(local) !== "function") {
			// We first check if the export is a function and if so annotate it.
			newSrc += "if (typeof " + local + ' === "function") ';
		}
		newSrc += `${runtime.function}(` + local + ",";
		newSrc += `"${
			options.command === "build" ? hash(id) : id
		}", "${exported}");\n`;
	});
	return newSrc;
}

// export function splitPlugin({ runtime, hash, pragma, apply, onModuleFound }) {
// 	return {
// 		name: "split-exports",
// 		async split(code, id, options) {
// 			if (code.indexOf(pragma) === -1) {
// 				return code;
// 			}

// 			const shouldApply = apply(code, id, options);

// 			if (!shouldApply) {
// 				return code;
// 			}

// 			const ast = parseLoose(code, {
// 				ecmaVersion: "2024",
// 				sourceType: "module",
// 			});

// 			if (ast.length === 0) {
// 				return code;
// 			}

// 			const body = ast.body;

// 			let needsReference = false;
// 			let splits = 0;

// 			let pickedFn = null;

// 			visit(body, {
// 				visitExportNamedDeclaration(path) {
// 					if (
// 						path.node.declaration &&
// 						path.node.declaration.type === "FunctionDeclaration"
// 					) {
// 						const name = path.node.declaration.id?.name.toString();
// 						if (hasDirective(path.node.declaration)) {
// 							needsReference = true;
// 							if (splits === options.split) {
// 								pickedFn = types.builders.exportDefaultDeclaration(
// 									types.builders.functionDeclaration.from({
// 										async: true,
// 										id: name ? types.builders.identifier(name) : null,
// 										params: path.node.declaration.params,
// 										body: types.builders.blockStatement(
// 											path.node.declaration.body.body.slice(1),
// 										),
// 									}),
// 								);
// 							}
// 							splits++;
// 							return false;
// 						}
// 					}

// 					return this.traverse(path);
// 				},
// 				visitFunctionDeclaration(path) {
// 					const statements = path.get("body", "body", 0);
// 					const name = path.node.id;
// 					if (
// 						statements.node.type === "ExpressionStatement" &&
// 						statements.node.directive == pragma
// 					) {
// 						needsReference = true;
// 						if (splits === options.split) {
// 							pickedFn = types.builders.exportDefaultDeclaration(
// 								types.builders.functionDeclaration.from({
// 									async: true,
// 									id: name,
// 									params: path.node.params,
// 									body: types.builders.blockStatement(
// 										path.node.body.body.slice(1),
// 									),
// 								}),
// 							);
// 						}
// 						splits++;
// 						return false;
// 					}
// 					return this.traverse(path);
// 				},
// 				visitArrowFunctionExpression(path) {
// 					const statements = path.get("body", "body", 0);
// 					if (
// 						statements.node.type === "ExpressionStatement" &&
// 						statements.node.directive == pragma
// 					) {
// 						needsReference = true;
// 						if (splits === options.split) {
// 							pickedFn = types.builders.exportDefaultDeclaration(
// 								types.builders.arrowFunctionExpression(
// 									path.node.params,
// 									types.builders.blockStatement(path.node.body.body.slice(1)),
// 								),
// 							);
// 						}
// 						splits++;
// 						return false;
// 					}
// 					return false;
// 				},
// 				// visitFunctionExpression(path) {
// 				// 	const name = path.node.id?.name.toString();
// 				// 	const statements = path.get("body", "body", 0);
// 				// 	if (
// 				// 		statements.node.type === "ExpressionStatement" &&
// 				// 		statements.node.directive == pragma
// 				// 	) {
// 				// 		needsReference = true;
// 				// 		path.replace(
// 				// 			types.builders.callExpression(
// 				// 				types.builders.identifier(runtime.function),
// 				// 				[
// 				// 					types.builders.arrowFunctionExpression(
// 				// 						[],
// 				// 						types.builders.blockStatement([]),
// 				// 					),
// 				// 					types.builders.stringLiteral(
// 				// 						options.command === "build"
// 				// 							? hash(id)
// 				// 							: id + `?split=${splits++}`,
// 				// 					),
// 				// 					types.builders.stringLiteral("default"),
// 				// 				],
// 				// 			),
// 				// 		);
// 				// 		this.traverse(path);
// 				// 	}
// 				// 	return false;
// 				// },
// 			});

// 			ast.body = [pickedFn];

// 			// if (needsReference) {
// 			// 	return (
// 			// 		`import { ${runtime.function} } from '${runtime.module}';\n` +
// 			// 		print(ast).code
// 			// 	);
// 			// }

// 			return print(ast).code;
// 		},
// 	};
// }

// export function shimExportsPlugin({
// 	runtime,
// 	hash,
// 	pragma,
// 	apply,
// 	onModuleFound,
// }) {
// 	return {
// 		name: "shim-exports",
// 		async transform(code, id, options, applied) {
// 			if (code.indexOf(pragma) === -1) {
// 				return false;
// 			}

// 			const shouldApply = apply(code, id, options);

// 			if (!shouldApply) {
// 				return false;
// 			}

// 			const ast = parseLoose(code, {
// 				ecmaVersion: "2024",
// 				sourceType: "module",
// 			});

// 			if (ast.length === 0) {
// 				return;
// 			}

// 			const body = ast.body;

// 			for (let i = 0; i < body.length; i++) {
// 				const node = body[i];
// 				if (node.type !== "ExpressionStatement" || !node.directive) {
// 					break;
// 				}
// 				if (node.directive === pragma) {
// 					onModuleFound?.(id);
// 					return await shimExports({
// 						runtime,
// 						ast: body,
// 						id,
// 						code,
// 						hash,
// 						options,
// 					});
// 				}
// 			}

// 			let needsReference = false;
// 			let splits = 0;

// 			visit(body, {
// 				visitExportNamedDeclaration(path) {
// 					if (
// 						path.node.declaration &&
// 						path.node.declaration.type === "FunctionDeclaration"
// 					) {
// 						const name = path.node.declaration.id?.name.toString();
// 						const statements = path.get("declaration", "body", "body", 0);
// 						if (
// 							statements.node.type === "ExpressionStatement" &&
// 							statements.node.directive == pragma
// 						) {
// 							needsReference = true;
// 							path.replace(
// 								types.builders.exportNamedDeclaration(
// 									types.builders.variableDeclaration("const", [
// 										types.builders.variableDeclarator(
// 											types.builders.identifier(name),
// 											types.builders.callExpression(
// 												types.builders.identifier(runtime.function),
// 												[
// 													types.builders.functionExpression(
// 														name ? types.builders.identifier(name) : null,
// 														[],
// 														types.builders.blockStatement(
// 															path.node.declaration.body.body.slice(1),
// 														),
// 													),
// 													types.builders.stringLiteral(
// 														options.command === "build"
// 															? hash(id)
// 															: id + `?split=${splits++}`,
// 													),
// 													types.builders.stringLiteral("default"),
// 												],
// 											),
// 										),
// 									]),
// 								),
// 							);
// 						}
// 					}

// 					return this.traverse(path);
// 				},
// 				visitFunctionDeclaration(path) {
// 					const statements = path.get("body", "body", 0);
// 					const name = path.node.id;
// 					if (
// 						statements.node.type === "ExpressionStatement" &&
// 						statements.node.directive == pragma
// 					) {
// 						needsReference = true;
// 						path.replace(
// 							types.builders.variableDeclaration("const", [
// 								types.builders.variableDeclarator(
// 									name,
// 									types.builders.callExpression(
// 										types.builders.identifier(runtime.function),
// 										[
// 											types.builders.functionExpression(
// 												name,
// 												[],
// 												types.builders.blockStatement(
// 													path.node.body.body.slice(1),
// 												),
// 											),
// 											types.builders.stringLiteral(
// 												options.command === "build"
// 													? hash(id)
// 													: id + `?split=${splits++}`,
// 											),
// 											types.builders.stringLiteral("default"),
// 										],
// 									),
// 								),
// 							]),
// 						);
// 						this.traverse(path);
// 					}
// 				},
// 				// 	}
// 				// 	return false;
// 				// },
// 				visitArrowFunctionExpression(path) {
// 					const statements = path.get("body", "body", 0);
// 					if (
// 						statements.node.type === "ExpressionStatement" &&
// 						statements.node.directive == pragma
// 					) {
// 						needsReference = true;
// 						path.replace(
// 							types.builders.callExpression(
// 								types.builders.identifier(runtime.function),
// 								[
// 									types.builders.arrowFunctionExpression(
// 										[],
// 										types.builders.blockStatement(path.node.body.body.slice(1)),
// 									),
// 									types.builders.stringLiteral(
// 										options.command === "build"
// 											? hash(id)
// 											: id + `?split=${splits++}`,
// 									),
// 									types.builders.stringLiteral("default"),
// 								],
// 							),
// 						);
// 						this.traverse(path);
// 					}
// 					return false;
// 				},
// 				visitFunctionExpression(path) {
// 					const name = path.node.id?.name.toString();
// 					const statements = path.get("body", "body", 0);
// 					if (
// 						statements.node.type === "ExpressionStatement" &&
// 						statements.node.directive == pragma
// 					) {
// 						needsReference = true;
// 						path.replace(
// 							types.builders.callExpression(
// 								types.builders.identifier(runtime.function),
// 								[
// 									types.builders.functionExpression(
// 										name ? types.builders.identifier(name) : null,
// 										[],
// 										types.builders.blockStatement(path.node.body.body.slice(1)),
// 									),
// 									types.builders.stringLiteral(
// 										options.command === "build"
// 											? hash(id)
// 											: id + `?split=${splits++}`,
// 									),
// 									types.builders.stringLiteral("default"),
// 								],
// 							),
// 						);
// 						this.traverse(path);
// 					}
// 					return false;
// 				},
// 			});

// 			ast.body = body;

// 			if (needsReference) {
// 				return (
// 					`import { ${runtime.function} } from '${runtime.module}';\n` +
// 					print(ast).code
// 				);
// 			}

// 			return code;

// 			// const body = await shimExports({
// 			// 	runtime,
// 			// 	ast,
// 			// 	id,
// 			// 	code,
// 			// 	hash,
// 			// 	options,
// 			// });
// 			// return body;
// 		},
// 	};
// }

export function decorateExportsPlugin({
	runtime,
	hash,
	pragma,
	apply,
	onModuleFound,
}) {
	return {
		name: "decorate-exports",
		async transform(code, id, options, ctx) {
			if (code.indexOf(pragma) === -1) {
				return code;
			}

			const shouldApply = apply(code, id, options);

			if (!shouldApply) {
				return code;
			}

			const body = parseLoose(code).body;

			for (let i = 0; i < body.length; i++) {
				const node = body[i];
				if (node.type !== "ExpressionStatement" || !node.directive) {
					break;
				}
				if (node.directive === pragma) {
					onModuleFound?.(id);
					return await decorateExports({
						runtime,
						ast: body,
						id,
						code,
						hash,
						options,
					});
				}
			}

			return code;
		},
	};
}
