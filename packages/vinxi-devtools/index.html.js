import { eventHandler } from "vinxi/server";

export default eventHandler(
	() => `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Document</title>
		<style></style>
	</head>
	<body>
		<div id="devtools"></div>
		<script src="/devtools-client.jsx" type="module"></script>
	</body>
</html>`,
);
