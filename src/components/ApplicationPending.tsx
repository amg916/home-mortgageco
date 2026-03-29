import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import Header from "@/components/Header";

type Props = {
	title?: string;
	description?: React.ReactNode;
};

const ApplicationPending = ({
	title = "Application Submitted Successfully!",
	description,
}: Props) => {
	const navigate = useNavigate();

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4'>
			<Header />
			<Card className='max-w-2xl w-full card-elegant'>
				<CardHeader className='text-center pb-6'>
					<img
						src={logo}
						alt='MortgageCo'
						width={160}
						className='mx-auto mb-8'
					/>
					<CheckCircle className='w-8 h-8 text-green-600 mx-auto' />

					<CardTitle className='text-3xl font-bold text-primary mt-4'>
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					{description ? (
						<div className='text-muted-foreground leading-relaxed text-center'>
							{description}
						</div>
					) : (
						<>
							<p className='text-muted-foreground leading-relaxed text-center text-lg font-medium mb-4'>
								Thank you for submitting your mortgage application!
							</p>
							<p className='text-muted-foreground leading-relaxed text-center'>
								Someone from MortgageCo will call you soon to discuss
								your application and guide you through the next steps.
							</p>
							<p className='text-muted-foreground leading-relaxed text-center mt-4'>
								In the meantime, feel free to explore our website or contact us
								if you have any questions.
							</p>
						</>
					)}

					<div className='flex gap-4 pt-4'>
						<Button
							variant='outline'
							onClick={() => navigate("/")}
							className='w-full'
						>
							Return to Home
						</Button>
						<Button
							size='lg'
							className='w-full'
							variant='hero'
							onClick={() => window.open('https://secure.yourscoreandmore.com/landing.html', '_blank')}
						>
							<CreditCard className='w-5 h-5 mr-2' />
							Get Your Credit Score
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ApplicationPending;
