async function greetServer(name: string) {
	"use server";
	console.log(`Hi, server. My name is ${name}.`);
}

export function App() {
	return (
		<div>
			<button onClick={() => greetServer("client")} data-test-id="button">
				Greet Server
			</button>
		</div>
	);
}
