export const CLIENT_REFERENCES_MANIFEST = `references-manifest.json`;
export const SERVER_REFERENCES_MANIFEST = "react-server-manifest.json";

export function hash(str) {
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		hash += str.charCodeAt(i);
	}

	return hash;
}
