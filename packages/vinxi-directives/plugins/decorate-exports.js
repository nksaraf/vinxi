import { print, types } from "recast";

import { parseAdvanced } from "../parse.js";
import { addLocalExportedNames } from "../utils.js";

export function decorateExports({
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
		...[...localNames.entries()].map(([local, exported]) => {
			// return an if block that checks if the export is a function and if so annotates it.
			return types.builders.ifStatement(
				types.builders.binaryExpression(
					"===",
					types.builders.unaryExpression(
						"typeof",
						types.builders.identifier(local),
					),
					types.builders.stringLiteral("function"),
				),
				types.builders.expressionStatement(
					types.builders.callExpression(
						types.builders.identifier(runtime.function),
						[
							types.builders.identifier(local),
							types.builders.stringLiteral(
								options.command === "build" ? hash(id) : id,
							),
							types.builders.stringLiteral(exported),
						],
					),
				),
			);
		}),
	];

	ast.program.directives = ast.program.directives?.filter(
		(node) => node.value !== directive,
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
				ast.program.directives = [];
				let result = await decorateExports({
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

			return { code, map: options.map };
		},
	};
}
