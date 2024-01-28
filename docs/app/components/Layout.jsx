// import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
// import { Navigation } from "@/components/Navigation";
// import { Prose } from "@/components/Prose";
import { SectionProvider } from "@/components/SectionProvider";
import { motion } from "framer-motion";
import Link from "next/link";

import { Navigation } from "./Navigation";
import { Prose } from "./Prose";

export function Layout({ children, sections = [] }) {
	return (
		<SectionProvider sections={sections}>
			<div className="lg:ml-72 xl:ml-80">
				<motion.header
					layoutScroll
					className="fixed inset-y-0 left-0 z-40 contents w-72 overflow-y-auto border-r border-zinc-900/10 px-6 pt-4 pb-8 dark:border-white/10 lg:block xl:w-80"
				>
					<div className="hidden lg:flex">
						<Link href="/" aria-label="Home">
							<Logo className="h-6 dark:filter-none filter invert" />
						</Link>
					</div>
					<Header />
					<Navigation className="hidden lg:mt-10 lg:block" />
				</motion.header>
				<div className="relative px-4 pt-14 sm:px-6 lg:px-8">
					<main className="py-16">
						<Prose
							as="article"
							className={"max-w-full px-4 pt-8 sm:px-6 lg:px-8"}
						>
							{children}
						</Prose>
					</main>
					{/* <Footer /> */}
				</div>
			</div>
		</SectionProvider>
	);
}
