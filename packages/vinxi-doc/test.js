const d = await import("./doc.js");
const docs = await d.doc("../vinxi/dist/types/runtime/server.d.ts");

function reprType(type) {
	switch (type.kind) {
		case "array":
			return `${reprType(type.array)}[]`;
	}

	if (type.kind === "union") {
		return type.union.map(reprType).join(" | ");
	} else if (type.kind === "typeRef") {
		if (type.typeRef.typeParams?.length) {
			return `${type.typeRef.typeName}<${type.typeRef.typeParams
				.map(reprType)
				.join(", ")}>`;
		} else {
			return type.typeRef.typeName;
		}
	} else if (type.repr?.length) {
		return type.repr;
	}
}

function generateMarkdown(doc) {
	let markdown = `## \`${doc.name}\`\n\n`;

	// Function Signature
	let signature = `function ${doc.name}<T>(\n`;
	signature += doc.functionDef.params
		.map((param) => `\t${param.name}: ${reprType(param.tsType)}`)
		.join(",\n");
	signature += `\n): ${reprType(doc.functionDef.returnType)};\n`;
	markdown += `## Function Signature\n\`\`\`tsx\n${signature}\n\`\`\`\n`;

	// Overview
	// const fileLink = `${doc.location.filename}:${doc.location.line}:${doc.location.col}`;
	// markdown += `### Overview\n`;
	// markdown += `**Location**: [${doc.location.filename
	// 	.split("/")
	// 	.pop()}](${fileLink})\n\n`;
	// markdown += `**Export Type**: ${
	// 	doc.kind.charAt(0).toUpperCase() + doc.kind.slice(1)
	// }\n\n`;

	// Description
	if (doc.jsDoc && doc.jsDoc.doc) {
		markdown += `**Description**:\n${doc.jsDoc.doc}\n\n`;
	}

	// Parameters
	if (doc.functionDef.params && doc.functionDef.params.length > 0) {
		markdown += `### Parameters\n\n`;
		doc.functionDef.params.forEach((param) => {
			markdown += `1. **${param.name}**: \`${reprType(param.tsType)}\`\n`;
			markdown += `   - Description: Not specified\n`;
			markdown += `   - Optional: ${param.optional ? "Yes" : "No"}\n\n`;
		});
	}

	// Returns
	markdown += `### Returns\n\n`;
	markdown += `- **Type**: \`${reprType(doc.functionDef.returnType)}\`\n`;
	if (doc.jsDoc && doc.jsDoc.tags) {
		const returnTag = doc.jsDoc.tags.find((tag) => tag.kind === "return");
		if (returnTag) {
			markdown += `- **Description**: ${returnTag.doc}\n`;
		}
	}

	// Additional Details
	// markdown += `\n### Additional Details\n\n`;
	// markdown += `- **Async Function**: ${
	// 	doc.functionDef.isAsync ? "Yes" : "No"
	// }\n`;
	// markdown += `- **Generator Function**: ${
	// 	doc.functionDef.isGenerator ? "Yes" : "No"
	// }\n`;
	// markdown += `- **Type Parameters**: ${
	// 	doc.functionDef.typeParams && doc.functionDef.typeParams.length > 0
	// 		? "Yes"
	// 		: "No"
	// }\n`;

	return markdown.replace("<br>", "\n");
}

// Example usage with your JSON description
const jsonDescription = {
	// ... (your JSON data here)
};

docs
	.filter((doc) => doc.kind === "function")
	.forEach((doc) => {
		console.log(generateMarkdown(doc));
	});

export {};
