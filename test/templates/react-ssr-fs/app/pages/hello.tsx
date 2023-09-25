import { Link } from "wouter";

import "./hello.css";

export default function Hello() {
	return (
		<div>
			<Link href="/">Home</Link>
			<h1 data-test-id="title">Hello from Vinxi</h1>
			Hello world <Link href="/">Home 123</Link>
		</div>
	);
}
