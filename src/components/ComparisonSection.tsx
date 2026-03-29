import { Button } from "@/components/ui/button";
import { TrendingDown, Clock, Banknote, CheckCircle } from "lucide-react";
import AnimatedOnScroll from "@/components/ui/scroll-motion";
import { useBotProtection } from "@/hooks/useBotProtection";
import { usePreserveParams } from "@/hooks/usePreserveParams";

const comparisonOptions = [
	{
		icon: TrendingDown,
		title: "Lower Your Interest Rate",
		description:
			"If eligible, you can lower your interest rate. This could lead to lower payments and less money paid towards interest.",
		benefits: ["Save Money", "Lower Payments"],
		cta: "Lower My Rate",
		color: "from-blue-500 to-blue-600",
	},
	{
		icon: Clock,
		title: "Shorten Your Loan Term",
		description:
			"Shorten your loan term when refinancing from a 30-year term to a 15-year term. You may also lower your rate.",
		benefits: ["Become mortgage-free quickly", "Pay less interest"],
		cta: "Shorten My Term",
		color: "from-green-500 to-green-600",
	},
	{
		icon: Banknote,
		title: "Leverage Your Home's Equity",
		description:
			"Take cash out of your home to apply for improvements, renovations, or other necessary expenses.",
		benefits: ["Renovations", "Pay for other debts or emergencies"],
		cta: "Cash Out",
		color: "from-purple-500 to-purple-600",
	},
];

const ComparisonSection = () => {
	const navigate = usePreserveParams();
	const { isBotDetected } = useBotProtection();

	const handleButtonClick = (optionTitle: string) => {
		// Bot protection check
		if (isBotDetected()) {
			navigate("/application-received");
			return;
		}

		navigate("/start");
	};

	return (
		<section id='rates' className='py-24 bg-background'>
			<div className='container mx-auto px-4'>
				{/* Header */}
				<div className='text-center mb-16'>
					<h2 className='text-4xl md:text-5xl font-bold text-primary mb-4'>
						Compare Mortgage Refinance Offers
					</h2>
					<p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
						Choose the refinancing option that best fits your financial goals
						and unlock your home's potential.
					</p>
				</div>

				{/* Comparison Cards */}
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
					{comparisonOptions.map((option, index) => {
						const Icon = option.icon;
						return (
							<AnimatedOnScroll key={index} delay={index * 0.06}>
								<div className='relative bg-white rounded-3xl p-8 border-2 border-border/50 hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden h-full flex flex-col'>
									{/* Background Gradient */}
									<div
										className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
									></div>

									<div className='relative z-10 flex flex-col h-full'>
										{/* Icon */}
										<div
											className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${option.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}
										>
											<Icon className='w-8 h-8 text-white' />
										</div>

										{/* Title */}
										<h3 className='text-xl font-bold text-primary mb-4'>
											{option.title}
										</h3>

										{/* Description */}
										<p className='text-muted-foreground mb-6 leading-relaxed text-sm'>
											{option.description}
										</p>

										{/* Benefits */}
										<div className='mb-6 flex-grow'>
											<p className='text-xs font-semibold text-primary mb-3 uppercase tracking-wide'>
												Why should I {option.title.toLowerCase()}?
											</p>
											<div className='space-y-2.5'>
												{option.benefits.map((benefit, benefitIndex) => (
													<div key={benefitIndex} className='flex items-start'>
														<CheckCircle className='w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5' />
														<span className='text-sm text-foreground leading-relaxed'>{benefit}</span>
													</div>
												))}
											</div>
										</div>

										{/* CTA Button */}
										<Button
											variant='outline'
											className='w-full border-2 border-primary text-primary hover:bg-primary hover:text-white group-hover:scale-105 transition-all duration-300 font-semibold rounded-lg mt-auto'
											onClick={() => handleButtonClick(option.title)}
										>
											{option.cta}
										</Button>
									</div>
								</div>
							</AnimatedOnScroll>
						);
					})}
				</div>

				{/* Bottom CTA */}
				<div className='text-center mt-20'>
					<div className='inline-block bg-gradient-to-r from-red-50 via-pink-50 to-red-50 rounded-3xl p-10 shadow-xl border border-red-100 max-w-2xl'>
						<h3 className='text-3xl font-bold text-primary mb-4'>
							Ready to Get Started?
						</h3>
						<p className='text-muted-foreground mb-8 text-lg'>
							Get personalized rates and see how much you could save with
							refinancing.
						</p>
						<Button
							variant='cta'
							size='lg'
							className='bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold px-10 py-6 rounded-full'
							onClick={() => handleButtonClick("refinance")}
						>
							View Your New Payments
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ComparisonSection;
