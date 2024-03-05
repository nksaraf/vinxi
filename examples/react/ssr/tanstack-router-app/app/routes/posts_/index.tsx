import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/posts/')({
	component: Page
})

export default function Page() {
	return <div>Select a post.</div>;
}
