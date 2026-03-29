import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { useBotProtection } from "@/hooks/useBotProtection";
import { ArrowRight } from "lucide-react";
import { usePreserveParams } from "@/hooks/usePreserveParams";

const Header = () => {
	const navigate = usePreserveParams();
	const { isBotDetected } = useBotProtection();

	const handleGetStarted = () => {
		// Bot check
		if (isBotDetected()) {
			navigate("/application-received");
		} else {
			navigate("/start");
		}
	};

	return (
		<header className='fixed top-0 w-full bg-white/95 backdrop-blur-lg z-50 border-b border-border shadow-sm'>
			<div className='container mx-auto px-4 py-4 flex items-center justify-between'>
				<Link to={"/"} className='flex items-center space-x-3 group'>
					<img src={logo} alt='MortgageCo' width={160} className='transition-transform group-hover:scale-105' />
					<span className='text-xs text-muted-foreground font-medium hidden lg:inline-block mt-1'>
						Trusted Mortgage Solutions
					</span>
				</Link>

				<nav className='flex items-center space-x-8'>
					<div className='hidden md:flex items-center space-x-6'>
						<a
							href='#services'
							className='text-foreground hover:text-primary transition-colors font-medium'
						>
							Services
						</a>
						<a
							href='#rates'
							className='text-foreground hover:text-primary transition-colors font-medium'
						>
							Rates
						</a>
						<a
							href='#contact'
							className='text-foreground hover:text-primary transition-colors font-medium'
						>
							Contact
						</a>
					</div>

					<Button
						variant='cta'
						size='sm'
						onClick={handleGetStarted}
						className="group shadow-lg hover:shadow-xl transition-all duration-300"
					>
						Get Pre-Approved
						<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
					</Button>
				</nav>
			</div>
		</header>
	);
};

export default Header;
