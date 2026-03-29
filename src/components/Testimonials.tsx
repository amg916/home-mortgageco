import { Star, Quote } from "lucide-react";
import AnimatedOnScroll from "@/components/ui/scroll-motion";

const testimonials = [
	{
		name: "Michael R",
		review:
			"I dropped my info on other sites and my phone wouldn't stop ringing. MortgageCo's pattern was different—I reached out when I was ready and they actually helped me bridge the gap when I needed cash fast. Total lifesaver.",
		rating: 5,
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
	},
	{
		name: "Jenna P",
		review:
			"Didn't know mortgageco.com, so I checked. Licensed, straight shooters, and the service was on point. Took their call, wrapped my kitchen remodel last week—appreciate you all.",
		rating: 5,
		avatar:
			"https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face",
	},
	{
		name: "Arturo M",
		review:
			"I was overwhelmed and honestly thought no one could help. Sam at mortgageco.com slowed down, listened, and got it done. Getting that money changed everything.",
		rating: 5,
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
	},
];

const Testimonials = () => {
	return (
		<section className='py-24 bg-gradient-to-b from-background to-muted/30'>
			<div className='container mx-auto px-4'>
				{/* Header */}
				<div className='text-center mb-16'>
					<h2 className='text-4xl md:text-5xl font-bold text-primary mb-4'>
						Zero Upfront Fees to Get Pre-Approved!
					</h2>
					<p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
						Join thousands of satisfied homeowners who have transformed their
						financial future with MortgageCo.
					</p>
				</div>

				{/* Testimonials Grid */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto'>
					{testimonials.map((testimonial, index) => (
						<AnimatedOnScroll key={index} delay={index * 0.04}>
							<div className='bg-white rounded-2xl p-8 hover-lift relative border-2 border-border/50 hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col'>
								{/* Quote Icon */}
								<div className='absolute top-6 right-6 opacity-5'>
									<Quote className='w-16 h-16 text-primary' />
								</div>

								{/* Stars */}
								<div className='flex space-x-1 mb-6'>
									{[...Array(testimonial.rating)].map((_, starIndex) => (
										<Star
											key={starIndex}
											className='w-5 h-5 text-yellow-400 fill-yellow-400'
										/>
									))}
								</div>

								{/* Review Text */}
								<p className='text-foreground mb-8 leading-relaxed italic flex-grow'>
									"{testimonial.review}"
								</p>

								{/* Author */}
								<div className='flex items-center pt-4 border-t border-border/50'>
									<img
										src={testimonial.avatar}
										alt={testimonial.name}
										className='w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-primary/20'
									/>
									<div>
										<p className='font-semibold text-primary'>
											{testimonial.name}
										</p>
										<p className='text-sm text-muted-foreground'>
											Verified Customer
										</p>
									</div>
								</div>
							</div>
						</AnimatedOnScroll>
					))}
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
