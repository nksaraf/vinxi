/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import { readFileSync } from "fs";
import { print, types, visit } from "recast";

import { parseAdvanced, parseLoose } from "./parse";

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
	for (let i = 0; i < ast.length; i++) {
		const node = ast[i];
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

export function wrapExports({
	code,
	id,
	ast,
	runtime,
	hash,
	options,
	directive,
}) {
	// onServerReference(moduleId);

	// If the same local name is exported more than once, we only need one of the names.
	const localNames = new Map();
	const localTypes = new Map();

	for (let i = 0; i < ast.program.body.length; i++) {
		const node = ast.program.body[i];
		switch (node.type) {
			case "ExportAllDeclaration":
				// If export * is used, the other file needs to explicitly opt into "use server" too.
				break;
			case "ExportDefaultDeclaration":
				if (node.declaration.type === "Identifier") {
					localNames.set(node.declaration.name, "default");
					// node.declaration = {
					// 	type: "CallExpression",
					// 	callee: {
					// 		type: "Identifier",
					// 		name: runtime.function,
					// 	},
					// 	arguments: [node.declaration],
					// };
					node.declaration = types.builders.callExpression(
						types.builders.identifier(runtime.function),
						[
							node.declaration,
							types.builders.stringLiteral(
								options.command === "build" ? hash(id) : id,
							),
							types.builders.stringLiteral("default"),
						],
					);
				} else if (node.declaration.type === "FunctionDeclaration") {
					node.declaration = types.builders.callExpression(
						types.builders.identifier(runtime.function),
						[
							types.builders.functionExpression(
								node.declaration.id,
								node.declaration.params,
								node.declaration.body,
								node.declaration.generator,
								node.declaration.async,
							),
							types.builders.stringLiteral(
								options.command === "build" ? hash(id) : id,
							),
							types.builders.stringLiteral("default"),
						],
					);
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
						const newDeclarations = [];
						for (let j = 0; j < declarations.length; j++) {
							addLocalExportedNames(localNames, declarations[j].id);
							const declaration = declarations[j];
							const name = declaration.id.name;
							newDeclarations.push(
								types.builders.variableDeclarator(
									types.builders.identifier(name),
									types.builders.callExpression(
										types.builders.identifier(runtime.function),
										[
											declaration.init,
											types.builders.stringLiteral(
												options.command === "build" ? hash(id) : id,
											),
											types.builders.stringLiteral(name),
										],
									),
								),
							);
						}
						node.declaration.declarations = newDeclarations;
					} else {
						const name = node.declaration.id.name;
						localNames.set(name, name);
						if (node.declaration.type === "FunctionDeclaration") {
							localTypes.set(name, "function");
						}
						node.declaration = types.builders.variableDeclaration("const", [
							types.builders.variableDeclarator(
								types.builders.identifier(name),
								types.builders.callExpression(
									types.builders.identifier(runtime.function),
									[
										types.builders.functionExpression(
											node.declaration.id,
											node.declaration.params,
											node.declaration.body,
											node.declaration.generator,
											node.declaration.async,
										),
										types.builders.stringLiteral(
											options.command === "build" ? hash(id) : id,
										),
										types.builders.stringLiteral(name),
									],
								),
							),
						]);
					}
				}
				if (node.specifiers) {
					const specifiers = node.specifiers;
					const newSpecifiers = [];
					for (let j = 0; j < specifiers.length; j++) {
						const specifier = specifiers[j];
						localNames.set(specifier.local.name, specifier.exported.name);
						const exportedName = specifier.exported.name;
						const localName = specifier.local?.name ?? exportedName;
						// add a new statement before i position in ast.program.body
						ast.program.body = [
							...ast.program.body.slice(0, i),
							types.builders.variableDeclaration("const", [
								types.builders.variableDeclarator(
									types.builders.identifier(exportedName + "$ref"),
									types.builders.callExpression(
										types.builders.identifier(runtime.function),
										[
											types.builders.identifier(localName),
											types.builders.stringLiteral(
												options.command === "build" ? hash(id) : id,
											),
											types.builders.stringLiteral(exportedName),
										],
									),
								),
							]),
							...ast.program.body.slice(i),
						];
						newSpecifiers.push(
							types.builders.exportSpecifier.from({
								exported: types.builders.identifier(exportedName),
								local: types.builders.identifier(exportedName + "$ref"),
							}),
						);
						i++;
					}

					node.specifiers = newSpecifiers;
				}
				continue;
		}
	}

	ast.program.body = [
		types.builders.importDeclaration(
			[
				types.builders.importSpecifier(
					types.builders.identifier(runtime.function),
				),
			],
			types.builders.stringLiteral(runtime.module),
		),
		...ast.program.body.filter((node) => node.directive !== directive),
	];

	let newSrc = print(ast).code;
	return newSrc;
}

async function shimExports({ runtime, ast, id, code, hash, options }) {
	const names = [];
	await parseExportNamesInto(options.vite, ast, names, id);

	let newSrc = `import { ${runtime.function} } from '${runtime.module}';\n`;
	for (let i = 0; i < names.length; i++) {
		const name = names[i];
		if (name === "default") {
			newSrc += `export default ${runtime.function}(`;
		} else {
			newSrc += "export const " + name + ` = ${runtime.function}(`;
		}
		newSrc += `() => {}, "${
			options.command === "build" ? hash(id) : id
		}", "${name}");\n`;
	}
	return newSrc;
}

export function shimExportsPlugin({
	runtime,
	hash,
	pragma,
	apply,
	onModuleFound,
}) {
	return {
		name: "shim-exports",
		async transform(code, id, options, applied) {
			if (code.indexOf(pragma) === -1) {
				return false;
			}

			const shouldApply = apply(code, id, options);

			if (!shouldApply) {
				return false;
			}

			const ast = parseLoose(code);

			if (ast.length === 0) {
				return;
			}

			const body = ast.body;

			for (let i = 0; i < body.length; i++) {
				const node = body[i];
				if (node.type !== "ExpressionStatement" || !node.directive) {
					break;
				}
				if (node.directive === pragma) {
					onModuleFound?.(id);
					return await shimExports({
						runtime,
						ast: body,
						id,
						code,
						hash,
						options,
					});
				}
			}

			let needsReference = false;
			let splits = 0;
			visit(body, {
				visitExportNamedDeclaration(path) {
					if (
						path.node.declaration &&
						path.node.declaration.type === "FunctionDeclaration"
					) {
						const name = path.node.declaration.id?.name.toString();
						const statements = path.get("declaration", "body", "body", 0);
						if (
							statements.node.type === "ExpressionStatement" &&
							statements.node.directive == pragma
						) {
							needsReference = true;
							const splitId = splits++;
							path.replace(
								types.builders.exportNamedDeclaration(
									types.builders.variableDeclaration("const", [
										types.builders.variableDeclarator(
											types.builders.identifier(name),
											types.builders.callExpression(
												types.builders.identifier(runtime.function),
												[
													types.builders.arrowFunctionExpression(
														[],
														types.builders.blockStatement([]),
													),
													types.builders.stringLiteral(
														options.command === "build"
															? hash(id + `?split=${splitId}`)
															: id + `?split=${splitId}`,
													),
													types.builders.stringLiteral("default"),
												],
											),
										),
									]),
								),
							);
							onModuleFound?.(id + `?split=${splitId}`);
						}
					}

					return this.traverse(path);
				},
				visitFunctionDeclaration(path) {
					const statements = path.get("body", "body", 0);
					const name = path.node.id;
					if (
						statements.node.type === "ExpressionStatement" &&
						statements.node.directive == pragma
					) {
						needsReference = true;
						const splitId = splits++;
						path.replace(
							types.builders.variableDeclaration("const", [
								types.builders.variableDeclarator(
									name,
									types.builders.callExpression(
										types.builders.identifier(runtime.function),
										[
											types.builders.arrowFunctionExpression(
												[],
												types.builders.blockStatement([]),
											),
											types.builders.stringLiteral(
												options.command === "build"
													? hash(id + `?split=${splitId}`)
													: id + `?split=${splitId}`,
											),
											types.builders.stringLiteral("default"),
										],
									),
								),
							]),
						);
						onModuleFound?.(id + `?split=${splitId}`);
						this.traverse(path);
					}
					return this.traverse(path);
				},
				// 	}
				// 	return false;
				// },
				visitArrowFunctionExpression(path) {
					const statements = path.get("body", "body", 0);
					if (
						statements.node.type === "ExpressionStatement" &&
						statements.node.directive == pragma
					) {
						needsReference = true;
						const splitId = splits++;
						path.replace(
							types.builders.callExpression(
								types.builders.identifier(runtime.function),
								[
									types.builders.arrowFunctionExpression(
										[],
										types.builders.blockStatement([]),
									),
									types.builders.stringLiteral(
										options.command === "build"
											? hash(id + `?split=${splitId}`)
											: id + `?split=${splitId}`,
									),
									types.builders.stringLiteral("default"),
								],
							),
						);
						onModuleFound?.(id + `?split=${splitId}`);
						this.traverse(path);
					}
					return false;
				},
				visitFunctionExpression(path) {
					const name = path.node.id?.name.toString();
					const statements = path.get("body", "body", 0);
					if (
						statements.node.type === "ExpressionStatement" &&
						statements.node.directive == pragma
					) {
						needsReference = true;
						const splitId = splits++;
						path.replace(
							types.builders.callExpression(
								types.builders.identifier(runtime.function),
								[
									types.builders.arrowFunctionExpression(
										[],
										types.builders.blockStatement([]),
									),
									types.builders.stringLiteral(
										options.command === "build"
											? hash(id + `?split=${splitId}`)
											: id + `?split=${splitId}`,
									),
									types.builders.stringLiteral("default"),
								],
							),
						);
						this.traverse(path);
					}
					return false;
				},
			});

			ast.body = body;

			if (needsReference) {
				console.log(print(ast, {}).code);
				return (
					`import { ${runtime.function} } from '${runtime.module}';\n` +
					print(ast).code
				);
			}

			return code;

			// const body = await shimExports({
			// 	runtime,
			// 	ast,
			// 	id,
			// 	code,
			// 	hash,
			// 	options,
			// });
			// return body;
		},
	};
}

export function splitPlugin({ runtime, hash, pragma, apply, onModuleFound }) {
	return {
		name: "shim-exports",
		async split(code, id, options) {
			if (code.indexOf(pragma) === -1) {
				return false;
			}

			const shouldApply = apply(code, id, options);

			if (!shouldApply) {
				return false;
			}

			const ast = parseLoose(code, {
				ecmaVersion: "2024",
				sourceType: "module",
			});

			if (ast.length === 0) {
				return;
			}

			const body = ast.body;

			let needsReference = false;
			let splits = 0;

			let pickedFn = null;

			visit(body, {
				visitExportNamedDeclaration(path) {
					if (
						path.node.declaration &&
						path.node.declaration.type === "FunctionDeclaration"
					) {
						const name = path.node.declaration.id?.name.toString();
						const statements = path.get("declaration", "body", "body", 0);
						if (
							statements.node.type === "ExpressionStatement" &&
							statements.node.directive == pragma
						) {
							needsReference = true;
							if (splits === options.split) {
								pickedFn = types.builders.exportDefaultDeclaration(
									types.builders.functionDeclaration(
										name ? types.builders.identifier(name) : null,
										path.node.declaration.params,
										types.builders.blockStatement(
											path.node.declaration.body.body.slice(1),
										),
									),
								);
							}
							splits++;
							return false;
						}
					}

					return this.traverse(path);
				},
				visitFunctionDeclaration(path) {
					const statements = path.get("body", "body", 0);
					const name = path.node.id;
					if (
						statements.node.type === "ExpressionStatement" &&
						statements.node.directive == pragma
					) {
						needsReference = true;
						if (splits === options.split) {
							pickedFn = types.builders.exportDefaultDeclaration(
								types.builders.functionDeclaration(
									name,
									path.node.params,
									types.builders.blockStatement(path.node.body.body.slice(1)),
								),
							);
						}
						splits++;
						return false;
					}
					return this.traverse(path);
				},
				visitArrowFunctionExpression(path) {
					const statements = path.get("body", "body", 0);
					if (
						statements.node.type === "ExpressionStatement" &&
						statements.node.directive == pragma
					) {
						needsReference = true;
						if (splits === options.split) {
							pickedFn = types.builders.exportDefaultDeclaration(
								types.builders.arrowFunctionExpression(
									path.node.params,
									types.builders.blockStatement(path.node.body.body.slice(1)),
								),
							);
						}
						splits++;
						return false;
					}
					return false;
				},
				// visitFunctionExpression(path) {
				// 	const name = path.node.id?.name.toString();
				// 	const statements = path.get("body", "body", 0);
				// 	if (
				// 		statements.node.type === "ExpressionStatement" &&
				// 		statements.node.directive == pragma
				// 	) {
				// 		needsReference = true;
				// 		path.replace(
				// 			types.builders.callExpression(
				// 				types.builders.identifier(runtime.function),
				// 				[
				// 					types.builders.arrowFunctionExpression(
				// 						[],
				// 						types.builders.blockStatement([]),
				// 					),
				// 					types.builders.stringLiteral(
				// 						options.command === "build"
				// 							? hash(id)
				// 							: id + `?split=${splits++}`,
				// 					),
				// 					types.builders.stringLiteral("default"),
				// 				],
				// 			),
				// 		);
				// 		this.traverse(path);
				// 	}
				// 	return false;
				// },
			});

			ast.body = [pickedFn];

			// if (needsReference) {
			// 	return (
			// 		`import { ${runtime.function} } from '${runtime.module}';\n` +
			// 		print(ast).code
			// 	);
			// }

			return print(ast).code;
		},
	};
}

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
// 					onModuleFound(id);
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
			const ast = parseLoose(code, {
				ecmaVersion: "2024",
				sourceType: "module",
			}).body;

			if (ast.length === 0) {
				return;
			}

			onModuleFound(id, options);

			const body = await decorateExports({
				runtime,
				ast,
				id,
				code,
				hash,
				options,
			});
			return body;
		},
		apply(code, id, options) {
			if (code.indexOf(pragma) === -1) {
				return false;
			}

			const shouldApply = apply(code, id, options);

			if (!shouldApply) {
				return false;
			}

			const body = parseLoose(code, {
				ecmaVersion: "2024",
				sourceType: "module",
			}).body;

			for (let i = 0; i < body.length; i++) {
				const node = body[i];
				if (node.type !== "ExpressionStatement" || !node.directive) {
					break;
				}
				if (node.directive === pragma) {
					return { body };
				}
			}

			return false;
		},
	};
}

export function wrapExportsPlugin({
	runtime,
	hash,
	pragma,
	apply,
	onModuleFound,
}) {
	return {
		name: "wrap-exports",
		async transform(code, id, options) {
			if (code.indexOf(pragma) === -1) {
				return false;
			}

			const shouldApply = apply(code, id, options);

			if (!shouldApply) {
				return false;
			}

			const ast = parseAdvanced(code);

			if (ast.length === 0) {
				return;
			}

			const body = ast.program.body;

			for (let i = 0; i < body.length; i++) {
				const node = body[i];
				if (node.type !== "ExpressionStatement" || !node.directive) {
					break;
				}
				if (node.directive === pragma) {
					onModuleFound(id);
					return await wrapExports({
						runtime,
						ast,
						id,
						code,
						hash,
						options,
						directive: pragma,
					});
				}
			}

			return code;
		},
	};
}
