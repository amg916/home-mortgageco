import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

const ContactUs = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState("");

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	// Validation functions
	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePhone = (phone: string): boolean => {
		const cleanPhone = phone.replace(/\D/g, '');
		return cleanPhone.length >= 10 && cleanPhone.length <= 15;
	};

	const validateForm = (): string[] => {
		const errors: string[] = [];

		if (!formData.name || formData.name.trim().length < 2) {
			errors.push('Name must be at least 2 characters long');
		}

		if (!formData.email) {
			errors.push('Email address is required');
		} else if (!validateEmail(formData.email)) {
			errors.push('Please enter a valid email address');
		}

		if (formData.phone && !validatePhone(formData.phone)) {
			errors.push('Please enter a valid phone number (10-15 digits)');
		}

		if (!formData.message || formData.message.trim().length < 10) {
			errors.push('Message must be at least 10 characters long');
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitMessage("");

		// Validate form
		const validationErrors = validateForm();
		if (validationErrors.length > 0) {
			setSubmitMessage(`Please fix the following errors:\n• ${validationErrors.join('\n• ')}`);
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/api/contact-form`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			let result;
			const contentType = response.headers.get("content-type");

			if (contentType && contentType.includes("application/json")) {
				result = await response.json();
			} else {
				// Handle non-JSON responses (like 404 HTML pages)
				const text = await response.text();
				throw new Error(`Server returned ${response.status}: ${response.statusText}`);
			}

			if (response.ok) {
				setSubmitMessage(
					result.message || "Thank you for your message! We'll get back to you soon."
				);
				setFormData({ name: "", email: "", phone: "", message: "" });
			} else {
				setSubmitMessage(
					result.message || "An error occurred. Please try again."
				);
			}
		} catch (error) {
			setSubmitMessage(
				"Unable to connect to the server. Please check your connection and try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section
			className='py-16 bg-gradient-to-br from-muted/20 to-background'
			id='contact'
		>
			<div className='container mx-auto px-4 max-w-6xl'>
				<div className='text-center mb-12'>
					<h2 className='text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent'>
						Contact Us
					</h2>
					<p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
						Ready to start your mortgage journey? Get in touch with our experts
						today.
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Contact Form */}
					<Card className='bg-white shadow-xl border-2 border-border/50 rounded-2xl'>
						<CardHeader>
							<CardTitle className='text-2xl'>Send us a Message</CardTitle>
							<CardDescription>
								Fill out the form below and we'll get back to you within 24
								hours.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className='space-y-6'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='name'>Full Name</Label>
										<Input
											id='name'
											name='name'
											type='text'
											placeholder='Your full name'
											value={formData.name}
											onChange={handleChange}
											required
											className='bg-background/50'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='phone'>Phone Number</Label>
										<Input
											id='phone'
											name='phone'
											type='tel'
											placeholder='(555) 123-4567'
											value={formData.phone}
											onChange={handleChange}
											className='bg-background/50'
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='email'>Email Address</Label>
									<Input
										id='email'
										name='email'
										type='email'
										placeholder='your.email@example.com'
										value={formData.email}
										onChange={handleChange}
										required
										className='bg-background/50'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='message'>Message</Label>
									<Textarea
										id='message'
										name='message'
										placeholder='Tell us about your mortgage needs...'
										value={formData.message}
										onChange={handleChange}
										required
										rows={4}
										className='bg-background/50 resize-none'
									/>
								</div>

								{submitMessage && (
									<div className={`p-4 rounded-lg mb-4 ${
										submitMessage.includes("error") || submitMessage.includes("Error") || submitMessage.includes("fix") || submitMessage.includes("Unable")
											? "bg-red-50 text-red-700 border border-red-200 text-left"
											: "bg-green-50 text-green-700 border border-green-200 text-center"
									}`}>
										<div className="whitespace-pre-line">
											{submitMessage}
										</div>
									</div>
								)}

								<Button
									type='submit'
									disabled={isSubmitting}
									className='w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{isSubmitting ? "Sending..." : "Send Message"}
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<div className='space-y-6'>
						<Card className='bg-white shadow-xl border-2 border-border/50 rounded-2xl'>
							<CardHeader>
								<CardTitle className='text-2xl text-primary'>Get in Touch</CardTitle>
								<CardDescription>
									Multiple ways to reach our mortgage experts
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div className='flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/50 transition-colors'>
									<div className='flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
										<Phone className='w-6 h-6 text-primary' />
									</div>
									<div>
										<h3 className='font-semibold text-lg text-primary'>Phone</h3>
										<a href='tel:+18667561777' className='text-muted-foreground hover:text-primary transition-colors'>
											866-756-1777
										</a>
										<p className='text-sm text-muted-foreground'>
											Mon-Fri 9AM-6PM EST
										</p>
									</div>
								</div>

								<div className='flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/50 transition-colors'>
									<div className='flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
										<Mail className='w-6 h-6 text-primary' />
									</div>
									<div>
										<h3 className='font-semibold text-lg text-primary'>Email</h3>
										<a
											href='mailto:contact@lenderlocate.com'
											className='text-muted-foreground hover:text-primary transition-colors'
										>
											contact@lenderlocate.com
										</a>
										<p className='text-sm text-muted-foreground'>
											We'll respond within 24 hours
										</p>
									</div>
								</div>

								<div className='flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/50 transition-colors'>
									<div className='flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
										<MapPin className='w-6 h-6 text-primary' />
									</div>
									<div>
										<h3 className='font-semibold text-lg text-primary'>Office</h3>
										<p className='text-muted-foreground'>5203 Juan Tabo Blvd NE, Ste 2B</p>
										<p className='text-muted-foreground'>
											Albuquerque, NM 87111, United States
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className='bg-gradient-to-br from-primary/5 via-red-50/50 to-primary/5 shadow-xl border-2 border-primary/10 rounded-2xl'>
							<CardContent className='pt-6'>
								<div className='text-center'>
									<h3 className='font-bold text-xl mb-3 text-primary'>
										Why Choose MortgageCo?
									</h3>
									<p className='text-muted-foreground text-sm leading-relaxed'>
										With over 10 years of experience and thousands of satisfied
										customers, we're committed to finding you the best mortgage
										rates available.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ContactUs;
