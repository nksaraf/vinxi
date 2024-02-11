/**
 *
 * @param {any} listener
 * @returns
 */
export async function listen(listener) {
	const { listen: _listen } = await import("@vinxi/listhen");

	let pos = process.argv.indexOf("--port");
	let port = 3000;
	if (pos > -1 && process.argv.length > pos + 1) {
		port = parseInt(process.argv[pos + 1], 10);
	} else if (process.env.PORT) {
		port = parseInt(process.env.PORT, 10);
	}

	return await _listen(listener, {
		port,
	});
}
