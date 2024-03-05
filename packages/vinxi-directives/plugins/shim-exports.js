import { print, types, visit } from "recast";

import { parseAdvanced, parseLoose } from "../parse.js";
import { parseExportNamesInto } from "../utils.js";

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
				return { code, map: options.map };
			}

			const shouldApply = apply(code, id, options);

			if (!shouldApply) {
				return { code, map: options.map };
			}

			let ast = parseAdvanced(code, {
				sourceFileName: id,
				inputSourceMap: options.map,
			});

			if (ast.program.body.length === 0) {
				return { code, map: options.map };
			}

			function hasDir(node) {
				return node?.directives?.[0]?.value?.value === pragma;
			}

			if (hasDir(ast.program)) {
				onModuleFound?.(id);
				return await shimExports({
					runtime,
					ast,
					id,
					code,
					hash,
					options,
				});
			}

			const body = ast.program.body;

			function hasDirective(node) {
				return hasDir(node.body);
			}

			let needsReference = false;
			let splits = 0;
			const declarations = [];
			visit(body, {
				visitExportDefaultDeclaration(path) {
					if (
						path.node.declaration &&
						path.node.declaration.type === "FunctionDeclaration"
					) {
						const name = path.node.declaration.id?.name.toString();
						if (hasDirective(path.node.declaration)) {
							needsReference = true;
							const splitId = splits++;
							declarations.push(
								types.builders.exportNamedDeclaration.from({
									declaration: types.builders.functionDeclaration.from({
										async: path.node.declaration.async,
										generator: path.node.declaration.generator,
										id: types.builders.identifier(`$$function${splitId}`),
										params: path.node.declaration.params,
										body: types.builders.blockStatement([]),
									}),
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
													// types.builders.functionExpression.from({
													// 	// ...path.node.declaration,
													// 	params: path.node.declaration.params,
													// 	async: path.node.declaration.async,
													// 	body: types.builders.blockStatement([]),
													// }),
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
												// types.builders.functionExpression.from({
												// 	// ...path.node.declaration,
												// 	params: path.node.declaration.params,
												// 	async: path.node.declaration.async,
												// 	body: types.builders.blockStatement([]),
												// }),
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
						if (hasDirective(path.node.declaration)) {
							needsReference = true;
							const splitId = splits++;
							declarations.push(
								types.builders.exportNamedDeclaration.from({
									declaration: types.builders.functionDeclaration.from({
										async: path.node.declaration.async,
										generator: path.node.declaration.generator,
										id: types.builders.identifier(`$$function${splitId}`),
										params: path.node.declaration.params,
										body: types.builders.blockStatement([]),
									}),
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
													// types.builders.functionExpression.from({
													// 	// ...path.node.declaration,
													// 	params: path.node.declaration.params,
													// 	async: path.node.declaration.async,
													// 	body: types.builders.blockStatement([]),
													// }),
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
					const statements = path.get("body", "body", 0);
					const name = path.node.id;
					if (hasDirective(path.node)) {
						needsReference = true;
						const splitId = splits++;

						declarations.push(
							types.builders.exportNamedDeclaration.from({
								declaration: types.builders.functionDeclaration.from({
									async: path.node.async,
									generator: path.node.generator,
									id: types.builders.identifier(`$$function${splitId}`),
									params: path.node.params,
									body: types.builders.blockStatement([]),
								}),
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
				// 	}
				// 	return false;
				// },
				visitArrowFunctionExpression(path) {
					const statements = path.get("body", "body", 0);
					if (hasDirective(path.node)) {
						needsReference = true;
						const splitId = splits++;
						declarations.push(
							types.builders.exportNamedDeclaration.from({
								declaration: types.builders.functionDeclaration.from({
									async: path.node.async,
									generator: path.node.generator,
									id: types.builders.identifier(`$$function${splitId}`),
									params: path.node.params,
									body: types.builders.blockStatement([]),
								}),
							}),
						);
						path.replace(
							types.builders.callExpression(
								types.builders.identifier(runtime.function),
								[
									// types.builders.arrowFunctionExpression(
									// 	[],
									// 	types.builders.blockStatement([]),
									// ),
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
					if (hasDirective(path.node)) {
						needsReference = true;
						const splitId = splits++;
						declarations.push(
							types.builders.exportNamedDeclaration.from({
								declaration: types.builders.functionDeclaration.from({
									async: path.node.async,
									generator: path.node.generator,
									id: types.builders.identifier(`$$function${splitId}`),
									params: path.node.params,
									body: types.builders.blockStatement([]),
								}),
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
export async function shimExports({ runtime, ast, id, code, hash, options }) {
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
	return { code: newSrc, map: null };
}
