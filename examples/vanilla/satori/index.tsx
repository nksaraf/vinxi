import satori from "satori";
import { eventHandler } from "vinxi/http";

export default eventHandler(async (event) => {
	const svg = await satori(<div style={{ color: "black" }}>hello, world</div>, {
		width: 600,
		height: 400,
		fonts: [
			{
				name: "Roboto",
				// Use `fs` (Node.js only) or `fetch` to read the font as Buffer/ArrayBuffer and provide `data` here.
				data: robotoArrayBuffer,
				weight: 400,
				style: "normal",
			},
		],
	});
	return svg;
});
