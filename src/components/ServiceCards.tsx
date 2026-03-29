import { Button } from "@/components/ui/button";
import {
	Home,
	DollarSign,
	RefreshCw,
	ShoppingCart,
	Landmark,
} from "lucide-react";
import AnimatedOnScroll from "@/components/ui/scroll-motion";
import { useBotProtection } from "@/hooks/useBotProtection";
import { usePreserveParams } from "@/hooks/usePreserveParams";

const services = [
	{
		icon: Landmark,
		title: "HELOC",
		description:
			"Access your home's equity with a flexible line of credit. Perfect for renovations or major expenses.",
		features: [
			"Flexible access to funds",
			"Interest-only payments",
			"Competitive rates",
		],
		cta: "Get HELOC",
	},
	{
		icon: DollarSign,
		title: "Cash Out",
		description:
			"Convert your home equity into cash for investments, debt consolidation, or life goals.",
		features: [
			"Up to 80% loan-to-value",
			"Fixed interest rates",
			"Fast processing",
		],
		cta: "Get Cash",
	},
	{
		icon: RefreshCw,
		title: "Refinance",
		description:
			"Lower your monthly payments or access equity by refinancing your current mortgage.",
		features: ["Lower interest rates", "Reduced payments", "No hidden fees"],
		cta: "Refinance Now",
	},
	{
		icon: ShoppingCart,
		title: "Purchase",
		description:
			"Find the perfect mortgage for your new home with our streamlined purchase process.",
		features: ["Fast pre-approval", "Competitive rates", "Expert guidance"],
		cta: "Get Pre-Approved",
	},
	{
		icon: Home,
		title: "Sell",
		description:
			"Maximize your home's value with our selling expertise and seamless transaction process.",
		features: ["Market analysis", "Professional staging", "Quick closing"],
		cta: "Start Selling",
	},
];

const ServiceCards = () => {
	const navigate = usePreserveParams();
	const { isBotDetected } = useBotProtection();

	const handleServiceClick = (title: string) => {
		// Bot protection check
		if (isBotDetected()) {
			// Redirect bots to decoy success page
			navigate("/application-received");
			return;
		}

		// Real user - proceed to service selection
		navigate("/start");
	};

	return (
		<section id='services' className='py-24 bg-gradient-to-b from-background via-muted/20 to-background'>
			<div className='container mx-auto px-4'>
				<div className='text-center mb-16'>
					<h2 className='text-4xl md:text-5xl font-bold text-primary mb-4'>
						Mortgage Solutions That Work For You
					</h2>
					<p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
						Whether you're buying, refinancing, or accessing equity, we have the
						perfect solution for your financial goals.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto auto-rows-fr'>
					{services.map((service, index) => {
						const Icon = service.icon;
						return (
							<AnimatedOnScroll key={index} delay={index * 0.04}>
								<div
									className='bg-white rounded-3xl p-8 hover-lift group cursor-pointer h-full flex flex-col border-2 border-border/50 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden'
									onClick={() => handleServiceClick(service.title)}
								>
									{/* Subtle background gradient on hover */}
									<div className='absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none'></div>

									<div className='relative z-10'>
										{/* Icon Container - Larger and better styled */}
										<div className='flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl'>
											<Icon className='w-10 h-10 text-white' strokeWidth={2.5} />
										</div>

										{/* Title */}
										<h3 className='text-2xl font-bold text-primary mb-4 group-hover:text-primary/90 transition-colors'>
											{service.title}
										</h3>

										{/* Description */}
										<p className='text-muted-foreground mb-6 leading-relaxed text-base'>
											{service.description}
										</p>

										{/* Features List */}
										<ul className='space-y-3 mb-6 flex-grow'>
											{service.features.map((feature, featureIndex) => (
												<li
													key={featureIndex}
													className='flex items-start text-sm text-foreground/90 group-hover:text-foreground transition-colors'
												>
													<div className='w-2 h-2 bg-gradient-to-br from-primary to-primary/70 rounded-full mr-3 flex-shrink-0 mt-1.5 group-hover:scale-125 transition-transform'></div>
													<span className='leading-relaxed'>{feature}</span>
												</li>
											))}
										</ul>

										{/* CTA Button */}
										<div className='mt-auto pt-4'>
											<Button
												variant='default'
												size='lg'
												className='w-full group-hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl rounded-xl font-semibold text-base py-6'
											>
												{service.cta}
												<svg
													className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
												</svg>
											</Button>
										</div>
									</div>
								</div>
							</AnimatedOnScroll>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default ServiceCards;
