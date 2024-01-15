/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import { readFileSync, writeFileSync } from "fs";

import { parseAdvanced } from "./parse.js";

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

					const childAst = parseAdvanced(clientImportCode ?? "", {});

					await parseExportNamesInto(vite, childAst.program.body, names, url);
					continue;
				}
			case "ExportDefaultDeclaration":
				names.push("default");
				continue;
			case "ExportNamedDeclaration":
				if (node.declaration) {
					if (
						node.declaration.type === "TSInterfaceDeclaration" ||
						node.declaration.type === "TSTypeAliasDeclaration" ||
						node.declaration.type === "TSDeclareFunction"
					) {
						continue;
					}
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
					if (node.exportKind === "type") {
						continue;
					}
					const specifiers = node.specifiers;
					for (let j = 0; j < specifiers.length; j++) {
						if (specifiers[j].exportKind === "type") {
							continue;
						}
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
