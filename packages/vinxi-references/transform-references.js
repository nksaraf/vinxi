/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import { parse } from "acorn-loose";
import { readFileSync } from "fs";
import { print, parse as recastParse, types } from "recast";

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

					const childBody = parse(clientImportCode ?? "", {
						ecmaVersion: "2024",
						sourceType: "module",
					}).body;

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

export function wrapExports({ code, id, ast, runtime, hash, options }) {
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

	console.log();

	let newSrc =
		`import { ${runtime.function} } from '${runtime.module}';\n` +
		print(ast).code;
	// 	code +
	// 	"\n\n;";
	// localNames.forEach(function (exported, local) {
	// 	if (localTypes.get(local) !== "function") {
	// 		// We first check if the export is a function and if so annotate it.
	// 		newSrc += "if (typeof " + local + ' === "function") ';
	// 	}
	// 	newSrc += `${runtime.function}(` + local + ",";
	// 	newSrc += `"${
	// 		options.command === "build" ? hash(id) : id
	// 	}", "${exported}");\n`;
	// });
	return newSrc;
}

async function shimExports({ runtime, ast, id, code, hash, options }) {
	const names = [];
	// onServerReference(moduleId);
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
		async transform(code, id, options) {
			const ast = parse(code, {
				ecmaVersion: "2024",
				sourceType: "module",
			}).body;

			if (ast.length === 0) {
				return;
			}

			onModuleFound(id);

			const body = await shimExports({
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

			const body = parse(code, {
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
			const ast = parse(code, {
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

			const body = parse(code, {
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
		async transform(code, id, options, ctx) {
			console.log('parsingg')
			const ast = await parseModule(code);
			console.log('parsingg done')

			if (ast.program.body.length === 0) {
				return;
			}

			onModuleFound(id, options);

			const body = await wrapExports({
				runtime,
				ast,
				id,
				code,
				hash,
				options,
			});
			return body;
		},
		async apply(code, id, options) {
			if (code.indexOf(pragma) === -1) {
				return false;
			}

			const shouldApply = apply(code, id, options);

			if (!shouldApply) {
				return false;
			}

			const body = (await parseModule(code)).program.body;

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

async function parseModule(code) {
	const acorn = await import("acorn");
	const {tsPlugin} = await import("acorn-typescript");
	const ast = recastParse(code, {
		parser: {
			parse(source) {
				var comments = [];
				var tokens = [];

				const ast = acorn.Parser.extend(tsPlugin()).parse(source, {
					allowHashBang: true,
					allowImportExportEverywhere: true,
					allowReturnOutsideFunction: true,
					locations: true,
					onComment: comments,
					onToken: tokens,
					// additional options
					ecmaVersion: 2024,
					sourceType: "module",
				});

				if (!ast.comments) {
					ast.comments = comments;
				}
				if (!ast.tokens) {
					ast.tokens = tokens;
				}
				return ast;
			},
		},
	});

	console.log('parsing done')
	return ast;
}

export function transformReferences({
	hash = (str) => str,
	onReference = (type, ref) => {},
	runtime = "",
	transforms = [
		shimExportsPlugin({
			runtime: {
				module: runtime,
				function: "createServerReference",
			},
			onModuleFound: (mod) => onReference("server", mod),
			hash: hash,
			apply: (code, id, options) => {
				return !options.ssr;
			},
			pragma: "use server",
		}),
		decorateExportsPlugin({
			runtime: {
				module: runtime,
				function: "createServerReference",
			},
			onModuleFound: (mod) => onReference("server", mod),
			hash: hash,
			apply: (code, id, options) => {
				return options.ssr;
			},
			pragma: "use server",
		}),
		shimExportsPlugin({
			runtime: {
				module: runtime,
				function: "createClientReference",
			},
			onModuleFound: (mod) => onReference("client", mod),
			hash: hash,
			apply: (code, id, options) => {
				return options.ssr;
			},
			pragma: "use client",
		}),
	],
} = {}) {
	let command;
	return {
		name: "vite-server-references",
		enforce: "pre",
		configResolved(config) {
			command = config.command;
		},
		async transform(code, id, options) {
			const vite = this;
			const opts = {
				...(options ?? {}),
			};
			opts.command = command;
			opts.vite = vite;
			for (var transform of transforms) {
				if (await transform.apply(code, id, opts)) {
					return await transform.transform(code, id, opts);
				}
			}
		},
	};
}
