import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCards from "@/components/ServiceCards";
import ComparisonSection from "@/components/ComparisonSection";
import Testimonials from "@/components/Testimonials";

import Footer from "@/components/Footer";
import AnimatedOnScroll from "@/components/ui/scroll-motion";
import Lenders from "@/components/Lenders";

const Index = () => {
	return (
		<div className='min-h-screen bg-background'>
			<Header />
			<AnimatedOnScroll>
				<Hero />
			</AnimatedOnScroll>
			<Lenders />

			<AnimatedOnScroll delay={0.08}>
				<ServiceCards />
			</AnimatedOnScroll>

			<AnimatedOnScroll delay={0.12}>
				<ComparisonSection />
			</AnimatedOnScroll>

			<AnimatedOnScroll delay={0.16}>
				<Testimonials />
			</AnimatedOnScroll>

			<Footer />
		</div>
	);
};

export default Index;
