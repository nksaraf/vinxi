import { H3Event, useSession } from "vinxi/http";

export default async function handler(event: H3Event) {
	const config = { password: "some 32 charachter long password" };

	const readSession = async () => {
		const s = await useSession(event, config);
		return s.data?.userId;
	};

	const data = await Promise.all([readSession(), readSession(), readSession()]);

	return data;
}
