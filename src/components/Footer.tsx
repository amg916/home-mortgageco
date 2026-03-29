import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className='bg-primary text-primary-foreground py-16'>
			<div className='container mx-auto px-4'>
				{/* Main Footer Content */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-12'>
					{/* Company Info */}
					<div className='md:col-span-2'>
						<div className='flex items-center space-x-2 mb-6'>
							<img src={logo} alt='MortgageCo' width={180} className='brightness-0 invert' />
						</div>
						<p className='text-primary-foreground/80 mb-6 max-w-md leading-relaxed'>
							Your trusted partner in mortgage solutions. We help homeowners
							unlock their home's equity and achieve their financial goals
							through expert guidance and competitive rates.
						</p>
						<div className='space-y-2 text-primary-foreground/80'>
							<p>
								<strong>Legal Entity:</strong> Lender Locate LLC (DBA MortgageCo)
							</p>
							<p>
								<strong>NMLS:</strong> 2719501
							</p>
							<p>
								<strong>Phone:</strong> 866-756-1777
							</p>
							<p>
								<strong>Email:</strong> contact@lenderlocate.com
							</p>
							<p>
								<strong>Address:</strong> 5203 Juan Tabo Blvd NE, Ste 2B, Albuquerque, NM 87111, United States
							</p>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className='text-xl font-semibold mb-6'>Services</h3>
						<ul className='space-y-3 text-primary-foreground/80'>
							<li>
								<Link to='/start' className='hover:text-secondary transition-colors'>
									HELOC
								</Link>
							</li>
							<li>
								<Link to='/start' className='hover:text-secondary transition-colors'>
									Cash Out Refinance
								</Link>
							</li>
							<li>
								<Link to='/start' className='hover:text-secondary transition-colors'>
									Rate & Term Refinance
								</Link>
							</li>
							<li>
								<Link to='/start' className='hover:text-secondary transition-colors'>
									Home Purchase
								</Link>
							</li>
							<li>
								<Link to='/start' className='hover:text-secondary transition-colors'>
									Home Selling
								</Link>
							</li>
						</ul>
					</div>

					{/* Resources */}
					<div>
						<h3 className='text-xl font-semibold mb-6'>Resources</h3>
						<ul className='space-y-3 text-primary-foreground/80'>
							<li>
								<Link to='/sms-terms' className='hover:text-secondary transition-colors'>SMS Terms</Link>
							</li>
							<li>
								<Link to='/privacy-policy' className='hover:text-secondary transition-colors'>Privacy Policy</Link>
							</li>
							<li>
								<Link to='/terms-conditions' className='hover:text-secondary transition-colors'>Terms & Conditions</Link>
							</li>
							<li>
								<Link to='/ccpa' className='hover:text-secondary transition-colors'>CCPA</Link>
							</li>
							<li>
								<Link to='/contact' className='hover:text-secondary transition-colors'>Contact</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Compliance & Legal */}
				<div className='border-t border-primary-foreground/20 pt-8'>
					<div className='flex flex-col md:flex-row justify-between items-center'>
						<div className='flex flex-wrap gap-4 md:gap-8 mb-4 md:mb-0 justify-center md:justify-start'>
							<Link
								to='/privacy-policy'
								className='text-primary-foreground/80 hover:text-secondary transition-colors text-sm'
							>
								Privacy Policy
							</Link>
							<Link
								to='/terms-conditions'
								className='text-primary-foreground/80 hover:text-secondary transition-colors text-sm'
							>
								Terms and Conditions
							</Link>
							<Link
								to='/sms-terms'
								className='text-primary-foreground/80 hover:text-secondary transition-colors text-sm'
							>
								SMS Terms
							</Link>
							<Link
								to='/ccpa'
								className='text-primary-foreground/80 hover:text-secondary transition-colors text-sm'
							>
								CCPA
							</Link>
							<Link
								to='/contact'
								className='text-primary-foreground/80 hover:text-secondary transition-colors text-sm'
							>
								Contact
							</Link>
						</div>
						<p className='text-primary-foreground/60 text-sm'>
							© 2026 Lender Locate LLC. All rights reserved.
						</p>
					</div>

					{/* Compliance Logos */}
					<div className='flex justify-center items-center mt-8 space-x-8 opacity-60'>
						<div className='text-xs text-center'>
							<div className='bg-primary-foreground/10 rounded p-2 mb-1'>
								<span className='text-lg font-bold'>FDIC</span>
							</div>
							<p>FDIC Insured</p>
						</div>
						<div className='text-xs text-center'>
							<div className='bg-primary-foreground/10 rounded p-2 mb-1'>
								<span className='text-lg font-bold'>BBB</span>
							</div>
							<p>A+ Rating</p>
						</div>
						<div className='text-xs text-center'>
							<div className='bg-primary-foreground/10 rounded p-2 mb-1'>
								<span className='text-lg font-bold'>EQUAL</span>
							</div>
							<p>Equal Housing Lender</p>
						</div>
					</div>

					{/* Disclaimer */}
					<div className='mt-8 text-xs text-primary-foreground/60 text-center max-w-4xl mx-auto'>
						<p>
							MortgageCo is a licensed mortgage broker. All loan
							applications are subject to credit approval. Rates and terms may
							vary based on credit score, loan amount, and other factors. This
							is not a commitment to lend. Please consult with a mortgage
							professional for personalized advice.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
