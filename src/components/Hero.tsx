import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-new.png";
import { useBotProtection } from "@/hooks/useBotProtection";
import HoneypotFields from "@/components/HoneypotFields";
import SlideToUnlock from "@/components/ui/SlideToUnlock";
import { usePreserveParams } from "@/hooks/usePreserveParams";

const Hero = () => {
	const navigate = usePreserveParams();
	const { isBotDetected } = useBotProtection();

	const handlePreApprove = () => {
		// Check for bot behavior
		if (isBotDetected()) {
			// Redirect bots to decoy success page
			navigate("/application-received");
			return;
		}
		// Real user - proceed to service selection
		navigate("/start");
	};

	return (
		<section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden'>
			{/* Honeypot fields for bot detection */}
			<HoneypotFields />

			{/* Background Image */}
			<div className='absolute inset-0 z-0'>
				<img
					src={heroImage}
					alt='Beautiful modern home representing mortgage success'
					className='w-full h-full object-cover scale-105'
				/>
				{/* Enhanced overlay with better gradient */}
				<div className='absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/80 to-slate-700/75'></div>
				<div className='absolute inset-0 bg-black/15'></div>
			</div>

			{/* Content */}
			<div className='relative z-10 container mx-auto px-4 py-20 md:py-32 text-center'>
				<div className='max-w-5xl mx-auto'>
					{/* Trust Badge */}
					<div className='inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/30 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700'>
						<Star className='w-4 h-4 text-yellow-300 fill-yellow-300' />
						<span className='text-sm font-semibold text-white'>
							Trusted by 50,000+ Homeowners
						</span>
						<TrendingUp className='w-4 h-4 text-yellow-300' />
					</div>

					{/* Main Headline */}
					<h1 className='text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150'>
						Turn Your Home Into
						<br />
						<span className='block bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent mt-2'>
							Your Wealth
						</span>
					</h1>

					{/* Subheadline */}
					<p className='text-xl md:text-2xl lg:text-3xl mb-4 text-white/95 font-medium drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300'>
						Access Your Equity and Get an Average of{" "}
						<span className='text-yellow-300 font-bold'>$70K Cash</span>
					</p>
					<p className='text-lg md:text-xl mb-10 text-white/90 drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500'>
						Refinancing made easy — apply today and unlock your home's potential
					</p>

					{/* CTA Button - Slide to unlock for bot protection */}
					<div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700'>
						{/* Slide to unlock - requires human interaction */}
						<SlideToUnlock
							onUnlock={handlePreApprove}
							text="Slide to Continue"
							unlockText="Opening..."
							className="shadow-2xl"
						/>
					</div>

					{/* Key Benefits */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000'>
						<div className='bg-white/15 backdrop-blur-md rounded-2xl p-8 hover-lift border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/20'>
							<div className='text-4xl md:text-5xl font-extrabold text-yellow-300 mb-3 drop-shadow-lg'>
								24hrs
							</div>
							<div className='text-base font-semibold text-white'>Quick Approval</div>
						</div>
						<div className='bg-white/15 backdrop-blur-md rounded-2xl p-8 hover-lift border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/20'>
							<div className='text-4xl md:text-5xl font-extrabold text-yellow-300 mb-3 drop-shadow-lg'>$0</div>
							<div className='text-base font-semibold text-white'>Upfront Fees</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
