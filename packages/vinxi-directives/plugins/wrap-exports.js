import { print, types, visit } from "recast";

import { parseAdvanced } from "../parse.js";
import { addLocalExportedNames } from "../utils.js";

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
				return { code, map: options.map };
			}

			const shouldApply = apply(code, id, options);

			if (!shouldApply) {
				return { code, map: options.map };
			}

			function hasDir(node) {
				return node?.directives?.[0]?.value?.value === pragma;
			}

			function hasFunctionDirective(node) {
				return hasDir(node.body);
			}

			const ast = parseAdvanced(code, {
				sourceFileName: id,
				inputSourceMap: options.map,
			});

			if (ast.length === 0) {
				return { code, map: options.map };
			}

			if (hasDir(ast.program)) {
				let result = await wrapExports({
					runtime,
					ast,
					id,
					code,
					hash,
					options,
					directive: pragma,
				});
				onModuleFound?.(id);
				return result;
			}

			const body = ast.program.body;

			let needsReference = false;
			let splits = 0;

			function functionDeclaration(node) {
				return types.builders.functionDeclaration.from({
					async: node.async,
					generator: node.generator,
					id: types.builders.identifier(`$$function${splits - 1}`),
					params: node.params,
					body: types.builders.blockStatement(node.body.body),
				});
			}

			const declarations = [];
			visit(body, {
				visitExportDefaultDeclaration(path) {
					if (
						path.node.declaration &&
						path.node.declaration.type === "FunctionDeclaration"
					) {
						const name = path.node.declaration.id?.name.toString();
						if (hasFunctionDirective(path.node.declaration)) {
							needsReference = true;
							const splitId = splits++;
							declarations.push(
								types.builders.exportNamedDeclaration.from({
									declaration: functionDeclaration(path.node.declaration),
								}),
								...(name?.length
									? [
											types.builders.exportDefaultDeclaration(
												types.builders.identifier(name),
											),
									  ]
									: []),
							);

							if (name?.length) {
								path.replace(
									types.builders.variableDeclaration("let", [
										types.builders.variableDeclarator(
											types.builders.identifier(name),
											types.builders.callExpression(
												types.builders.identifier(runtime.function),
												[
													types.builders.identifier(`$$function${splitId}`),
													types.builders.stringLiteral(
														options.command === "build" ? hash(id) : id,
													),
													types.builders.stringLiteral(`$$function${splitId}`),
												],
											),
										),
									]),
								);
							} else {
								path.replace(
									types.builders.exportDefaultDeclaration(
										types.builders.callExpression(
											types.builders.identifier(runtime.function),
											[
												types.builders.identifier(`$$function${splitId}`),
												types.builders.stringLiteral(
													options.command === "build" ? hash(id) : id,
												),
												types.builders.stringLiteral(`$$function${splitId}`),
											],
										),
									),
								);
							}

							onModuleFound?.(id);
						}
					}
					return this.traverse(path);
				},
				visitExportNamedDeclaration(path) {
					if (
						path.node.declaration &&
						path.node.declaration.type === "FunctionDeclaration"
					) {
						const name = path.node.declaration.id?.name.toString();
						if (hasFunctionDirective(path.node.declaration)) {
							needsReference = true;
							const splitId = splits++;
							declarations.push(
								types.builders.exportNamedDeclaration.from({
									declaration: functionDeclaration(path.node.declaration),
								}),
							);
							path.replace(
								types.builders.exportNamedDeclaration(
									types.builders.variableDeclaration("const", [
										types.builders.variableDeclarator(
											types.builders.identifier(name),
											types.builders.callExpression(
												types.builders.identifier(runtime.function),
												[
													types.builders.identifier(`$$function${splitId}`),
													types.builders.stringLiteral(
														options.command === "build" ? hash(id) : id,
													),
													types.builders.stringLiteral(`$$function${splitId}`),
												],
											),
										),
									]),
								),
							);
							onModuleFound?.(id);
						}
					}

					return this.traverse(path);
				},
				visitFunctionDeclaration(path) {
					const name = path.node.id;
					if (hasFunctionDirective(path.node)) {
						needsReference = true;
						const splitId = splits++;

						declarations.push(
							types.builders.exportNamedDeclaration.from({
								declaration: functionDeclaration(path.node),
							}),
						);
						path.replace(
							types.builders.variableDeclaration("const", [
								types.builders.variableDeclarator(
									name,
									types.builders.callExpression(
										types.builders.identifier(runtime.function),
										[
											types.builders.identifier(`$$function${splitId}`),
											types.builders.stringLiteral(
												options.command === "build" ? hash(id) : id,
											),
											types.builders.stringLiteral(`$$function${splitId}`),
										],
									),
								),
							]),
						);
						onModuleFound?.(id);
						this.traverse(path);
					}
					return this.traverse(path);
				},
				visitArrowFunctionExpression(path) {
					if (hasFunctionDirective(path.node)) {
						needsReference = true;
						const splitId = splits++;
						declarations.push(
							types.builders.exportNamedDeclaration.from({
								declaration: functionDeclaration(path.node),
							}),
						);
						path.replace(
							types.builders.callExpression(
								types.builders.identifier(runtime.function),
								[
									types.builders.identifier(`$$function${splitId}`),
									types.builders.stringLiteral(
										options.command === "build" ? hash(id) : id,
									),
									types.builders.stringLiteral(`$$function${splitId}`),
								],
							),
						);
						onModuleFound?.(id);
						this.traverse(path);
					}
					return this.traverse(path);
				},
				visitFunctionExpression(path) {
					const name = path.node.id?.name.toString();
					if (hasFunctionDirective(path.node)) {
						needsReference = true;
						const splitId = splits++;
						declarations.push(
							types.builders.exportNamedDeclaration.from({
								declaration: functionDeclaration(path.node),
							}),
						);
						path.replace(
							types.builders.callExpression(
								types.builders.identifier(runtime.function),
								[
									types.builders.identifier(`$$function${splitId}`),
									types.builders.stringLiteral(
										options.command === "build" ? hash(id) : id,
									),
									types.builders.stringLiteral(`$$function${splitId}`),
								],
							),
						);
						this.traverse(path);
					}
					return this.traverse(path);
				},
			});

			ast.program.body = [...body, ...declarations];

			if (needsReference) {
				const result = print(ast, {
					sourceMapName: id,
					inputSourceMap: options.map,
				});
				return {
					code:
						`import { ${runtime.function} } from '${runtime.module}';\n` +
						result.code,
					map: result.map,
				};
			}

			return { code, map: options.map };
		},
	};
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
							types.builders.functionExpression.from({
								body: node.declaration.body,
								params: node.declaration.params,
								async: node.declaration.async,
								id: node.declaration.id,
								generator: node.declaration.generator,
							}),
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

						if (
							node.declaration.type === "TSTypeAliasDeclaration" ||
							node.declaration.type === "TSInterfaceDeclaration" ||
							node.declaration.type === "TSDeclareFunction"
						) {
							continue;
						}
						node.declaration = types.builders.variableDeclaration("const", [
							types.builders.variableDeclarator(
								types.builders.identifier(name),
								types.builders.callExpression(
									types.builders.identifier(runtime.function),
									[
										types.builders.functionExpression.from({
											body: node.declaration.body,
											params: node.declaration.params,
											async: node.declaration.async,
											id: node.declaration.id,
											generator: node.declaration.generator,
										}),
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
					if (node.exportKind === "type") {
						continue;
					}
					const specifiers = node.specifiers;
					const newSpecifiers = [];
					for (let j = 0; j < specifiers.length; j++) {
						const specifier = specifiers[j];
						if (specifier.exportKind === "type") {
							newSpecifiers.push(specifier);
							continue;
						}
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

	ast.program.directives = ast.program.directives?.filter(
		(node) => node.value === directive,
	);
	const result = print(ast, {
		sourceMapName: id,
		inputSourceMap: options.map,
	});
	return {
		code: result.code,
		map: result.map,
	};
}
