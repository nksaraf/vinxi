import { H3Event, updateSession } from "vinxi/http";

export default async function handler(event: H3Event) {
	const config = { password: "some 32 charachter long password" };
	await updateSession(event, config, { userId: 1 });
	return "ok";
}
