import { useState, useEffect } from "react";
import AutoGoogleComplete from "@/components/AutoComplete";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import states from "@/lib/states";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const purchaseSchema = z.object({
	estimatedPrice: z
		.number()
		.min(90000, "Minimum price is $90,000")
		.max(10000000, "Maximum price is $10,000,000+"),
	downPaymentPct: z
		.number()
		.min(0, "Down payment cannot be negative")
		.max(100, "Down payment cannot exceed 100%"),
	employmentStatus: z.enum(
		["full-time", "part-time", "seasonal", "temporary"],
		{
			required_error: "Employment status is required",
		}
	),
	creditRating: z.enum(["excellent", "good", "average", "poor", "unknown"], {
		required_error: "Credit rating is required",
	}),
	contactAgent: z.boolean(),
	streetAddress: z
		.string()
		.min(1, "Please enter a valid address or use manual entry")
		.refine(
			(val) => {
				// Must contain at least one number and at least one letter
				const hasNumber = /\d/.test(val);
				const hasLetter = /[a-zA-Z]/.test(val);
				return hasNumber && hasLetter;
			},
			{
				message: "Address must contain a house number and street name (e.g., '123 Main Street')",
			}
		),
	zip: z.string()
		.regex(/^\d{5}$/, "ZIP code must be exactly 5 digits")
		.min(5, "ZIP code must be exactly 5 digits")
		.max(5, "ZIP code must be exactly 5 digits"),
	city: z.string().min(2, "City is required"),
	state: z.string().min(2, "Please select a state"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Please enter a valid email")
		.regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid email address"),
	phone: z.string()
		.regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
		.refine((val) => {
			// NANP rules: First digit cannot be 0 or 1
			if (val.startsWith("0") || val.startsWith("1")) {
				return false;
			}
			return true;
		}, "Phone number cannot start with 0 or 1")
		.refine((val) => {
			// Check for all same digits (e.g. 5555555555)
			if (/^(\d)\1+$/.test(val)) {
				return false;
			}
			// Check for 1234567890
			if (val === "1234567890") {
				return false;
			}
			return true;
		}, "Please enter a valid phone number"),
	smsConsent: z.boolean().refine((value) => value, {
		message: "You must agree to SMS consent before submitting.",
	}),
});

type PurchaseForm = z.infer<typeof purchaseSchema>;

const Service2 = ({
	selectedService,
	updateStep,
	onComplete,
	isSubmitting = false,
}: {
	selectedService: string;
	updateStep?: (step: number) => void;
	onComplete?: (data: any) => void;
	isSubmitting?: boolean;
}) => {
	const [step, setStep] = useState(2);
	const [showManualAddress, setShowManualAddress] = useState(false);
	const isGoDomain = window.location.hostname === 'go.mortgageco.com';

	// Keep parent in sync whenever our internal `step` changes
	useEffect(() => {
		if (updateStep) {
			updateStep(step);
		}
	}, [step, updateStep]);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		trigger,
		clearErrors,
		formState: { errors },
	} = useForm<PurchaseForm>({
		resolver: zodResolver(purchaseSchema),
		defaultValues: {
			estimatedPrice: 400000,
			downPaymentPct: 20,
			employmentStatus: undefined as any,
			creditRating: "unknown",
			contactAgent: true,
			streetAddress: "",
			zip: "",
			city: "",
			state: "",
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			smsConsent: false,
		},
	});

	// Auto-consent on go.mortgageco.com — no checkbox shown
	useEffect(() => {
		if (isGoDomain) {
			setValue("smsConsent", true);
		}
	}, [isGoDomain, setValue]);

	const onSubmit = (data: PurchaseForm) => {
		if (onComplete) onComplete(data);
	};

	const handleAddressSelect = async (addr: any) => {
		if (!addr) {
			// Show error if no address selected
			setValue("streetAddress", "");
			await trigger(["streetAddress"]);
			return;
		}

		const { address1, city, state, zipCode } = addr;

		// Validate that we have minimum required fields
		if (!address1 || !city || !state) {
			// Show error message for invalid address
			setValue("streetAddress", "");
			await trigger(["streetAddress"]);
			return;
		}

		// Validate that address contains at least one number and one letter
		const address = address1 || "";
		const hasNumber = /\d/.test(address);
		const hasLetter = /[a-zA-Z]/.test(address);

		if (!hasNumber || !hasLetter) {
			// If address doesn't meet validation, show error and don't proceed
			setValue("streetAddress", address);
			await trigger(["streetAddress"]);
			return;
		}

		setValue("streetAddress", address1);
		setValue("city", city);
		setValue("state", state);
		setValue("zip", zipCode || "");
		setShowManualAddress(false);

		// Validate the address fields
		const isValid = await trigger(["streetAddress", "city", "state"]);

		if (isValid) {
			nextStep(8);
		}
	};

	const nextStep = async (targetStep: number) => {
		// Define validation fields for each step
		const stepFields: Record<number, string[]> = {
			2: ["estimatedPrice"],
			3: ["downPaymentPct"],
			4: ["employmentStatus"],
			5: ["creditRating"],
			6: ["contactAgent"],
			7: ["streetAddress", "city", "state", "zip"],
			8: ["firstName", "lastName", "email", "phone"],
		};

		const fieldsToValidate = stepFields[step];
		if (fieldsToValidate && fieldsToValidate.length > 0) {
			const isValid = await trigger(fieldsToValidate as any);
			if (!isValid) {
				return; // Don't proceed if validation fails
			}
		}

		// Clear errors for fields that are not in the current step
		// This prevents showing validation errors for fields the user hasn't reached yet
		const allFields = Object.values(stepFields).flat();
		const currentStepFields = stepFields[step] || [];
		const fieldsToClear = allFields.filter(field => !currentStepFields.includes(field));

		// Clear errors for fields not in current step
		fieldsToClear.forEach(field => {
			clearErrors(field as any);
		});

		setStep(targetStep);
		// Update parent progress
		if (updateStep) {
			updateStep(targetStep);
		}
	};

	const goToStep = (targetStep: number) => {
		setStep(targetStep);
		// Update parent progress
		if (updateStep) {
			updateStep(targetStep);
		}
	};

	const estimatedPrice = watch("estimatedPrice");
	const downPaymentPct = watch("downPaymentPct");

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				{step === 2 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								What is estimated price of your new home?
							</CardTitle>
							<CardDescription>
								Use the slider to select your estimated home value
							</CardDescription>
						</div>
						<div className='space-y-4 w-full'>
							<Label className='text-base font-medium'>
								Home Value: ${estimatedPrice?.toLocaleString()}
							</Label>
							<div className='flex gap-4 w-full'>
								<Slider
									value={[estimatedPrice]}
									onValueChange={(value) =>
										setValue("estimatedPrice", value[0])
									}
									min={90000}
									max={10000000}
									step={1000}
									className='w-full'
								/>
							</div>
							<div className='flex justify-between text-sm text-muted-foreground'>
								<span>$90,000</span>
								<span>$10,000,000</span>
							</div>
							{errors.estimatedPrice && (
								<p className='text-sm text-red-500'>
									{errors.estimatedPrice.message}
								</p>
							)}
						</div>
						<div className='flex gap-2 pt-4 justify-between w-full'>
							<Button variant='outline' onClick={() => goToStep(1)}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button variant='default' onClick={() => nextStep(3)}>
								Next
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</div>
					</div>
				)}

				{step === 3 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								What is your estimated down payment %?
							</CardTitle>
							<CardDescription>
								Use the slider to select your estimated down payment %
							</CardDescription>
						</div>
						<div className='space-y-4 w-full'>
							<Label className='text-base font-medium'>
								Down Payment: {downPaymentPct}%
							</Label>
							<div className='flex items-center gap-4 w-full'>
								<Slider
									value={[downPaymentPct]}
									onValueChange={(value) =>
										setValue("downPaymentPct", value[0])
									}
									min={0}
									max={100}
									step={1}
									className='w-full'
								/>
							</div>
							<div className='flex justify-between text-sm text-muted-foreground'>
								<span>0%</span>
								<span>100%</span>
							</div>
						</div>
						<div className='flex gap-2 pt-4 w-full justify-between'>
							<Button variant='outline' onClick={() => goToStep(2)}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button variant='default' onClick={() => nextStep(4)}>
								Next
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</div>
					</div>
				)}

				{step === 4 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								What is your employment status?
							</CardTitle>
						</div>
						<div className='w-full'>
							<Select
								value={watch("employmentStatus") || ""}
								onValueChange={async (value) => {
									setValue("employmentStatus", value as any);
									// Auto-advance to next step after selection
									//   setTimeout(() => nextStep(5), 500);
									nextStep(5);
								}}
							>
								<SelectTrigger className='w-full h-12 text-base px-4 py-3 rounded-lg border-2 transition-all duration-200 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900'>
									<SelectValue placeholder='Select employment status *' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='full-time'>
										<div className='flex flex-col items-start'>
											<span className='font-medium'>Full-time</span>
											<span className='text-sm text-muted-foreground'>
												Regular 40+ hours per week
											</span>
										</div>
									</SelectItem>
									<SelectItem value='part-time'>
										<div className='flex flex-col items-start'>
											<span className='font-medium'>Part-time</span>
											<span className='text-sm text-muted-foreground'>
												Less than 40 hours per week
											</span>
										</div>
									</SelectItem>
									<SelectItem value='seasonal'>
										<div className='flex flex-col items-start'>
											<span className='font-medium'>Seasonal</span>
											<span className='text-sm text-muted-foreground'>
												Work during specific seasons
											</span>
										</div>
									</SelectItem>
									<SelectItem value='temporary'>
										<div className='flex flex-col items-start'>
											<span className='font-medium'>Temporary</span>
											<span className='text-sm text-muted-foreground'>
												Short-term contract work
											</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
							{errors.employmentStatus && (
								<p className='text-sm text-red-500 mt-2'>
									{errors.employmentStatus.message}
								</p>
							)}
						</div>
						<div className='flex gap-2 pt-4 justify-between w-full'>
							<Button variant='outline' onClick={() => goToStep(3)}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button variant='default' onClick={() => nextStep(5)}>
								Next
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</div>
					</div>
				)}

				{step === 5 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								What's Your Credit Rating?
							</CardTitle>
							<CardDescription>
								Select the option that best describes your credit score
							</CardDescription>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-5 gap-4 w-full'>
							{[
								{
									key: "excellent",
									title: "Excellent",
									subtitle: "680 or above",
									color: "text-green-600",
									icon: "⭐"
								},
								{ key: "good", title: "Good", subtitle: "620-679", color: "text-blue-600", icon: "👍" },
								{ key: "average", title: "Average", subtitle: "550-619", color: "text-yellow-600", icon: "📊" },
								{ key: "poor", title: "Poor", subtitle: "549 or below", color: "text-red-600", icon: "📉" },
								{ key: "unknown", title: "Don't know", subtitle: "", color: "text-slate-500", icon: "❓" },
							].map((c) => (
								<label
									key={c.key}
									className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md text-center ${watch("creditRating") === c.key
											? "border-primary bg-slate-50 shadow-md"
											: "border-slate-200 bg-white"
										}`}
								>
									<input
										type='radio'
										{...register("creditRating")}
										value={c.key}
										className='hidden'
										onChange={() => {
											// Auto-advance to next step after selection
											//   setTimeout(() => nextStep(6), 500);
											nextStep(6);
										}}
									/>
									<div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${watch("creditRating") === c.key
											? "bg-primary text-white"
											: "bg-slate-100 text-slate-600"
										}`}>
										{c.icon}
									</div>
									<div className='font-semibold text-lg text-slate-900'>{c.title}</div>
									<div className='text-sm text-slate-600 mt-1'>
										{c.subtitle}
									</div>
								</label>
							))}
						</div>
						<div className='flex gap-2 pt-4 justify-between w-full'>
							<Button variant='outline' onClick={() => goToStep(4)}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button variant='default' onClick={() => nextStep(6)}>
								Next
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</div>
					</div>
				)}

				{step === 6 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								Would you like to be contacted by a real estate agent in your
								area?
							</CardTitle>
							<CardDescription>
								Contacting an agent can help you find the perfect home faster.
							</CardDescription>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
							<button
								type='button'
								onClick={() => {
									setValue("contactAgent", true);
									// Auto-advance to next step after selection
									//   setTimeout(() => nextStep(7), 500);
									nextStep(7);
								}}
								className={`p-6 border-2 rounded-lg cursor-pointer flex items-center space-x-4 transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md ${watch("contactAgent") === true
										? "border-primary bg-slate-50 shadow-md"
										: "border-slate-200 bg-white"
									}`}
							>
								<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch("contactAgent") === true
										? "border-primary bg-primary"
										: "border-slate-300"
									}`}>
									{watch("contactAgent") === true && (
										<div className='w-2 h-2 bg-white rounded-full'></div>
									)}
								</div>
								<div className='font-semibold text-lg text-slate-900'>Yes</div>
							</button>
							<button
								type='button'
								onClick={() => {
									setValue("contactAgent", false);
									// Auto-advance to next step after selection
									//   setTimeout(() => nextStep(7), 500);
									nextStep(7);
								}}
								className={`p-6 border-2 rounded-lg cursor-pointer flex items-center space-x-4 transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md ${watch("contactAgent") === false
										? "border-primary bg-slate-50 shadow-md"
										: "border-slate-200 bg-white"
									}`}
							>
								<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch("contactAgent") === false
										? "border-primary bg-primary"
										: "border-slate-300"
									}`}>
									{watch("contactAgent") === false && (
										<div className='w-2 h-2 bg-white rounded-full'></div>
									)}
								</div>
								<div className='font-semibold text-lg text-slate-900'>No</div>
							</button>
						</div>
						<div className='flex gap-2 pt-4 justify-between w-full'>
							<Button variant='outline' onClick={() => goToStep(5)}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button variant='default' onClick={() => nextStep(7)}>
								Next
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</div>
					</div>
				)}

				{step === 7 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								What's your property address?{" "}
							</CardTitle>
							<CardDescription>
								For verification only. We do not mail
							</CardDescription>
						</div>

						{!showManualAddress && (
							<div className='w-full'>
								<div>
									<label className='block text-sm mb-2'>Street Address</label>
									<AutoGoogleComplete
										defaultValue={watch("streetAddress") as any}
										onSelect={handleAddressSelect}
									/>
									{errors.streetAddress && (
										<p className='text-sm text-red-500 mt-1'>
											{errors.streetAddress.message}
										</p>
									)}
								</div>
								<div className='mt-2 w-fit'>
									<button
										type='button'
										className='text-sm text-primary underline hover:text-primary/80'
										onClick={() => setShowManualAddress(true)}
									>
										Couldn't find the address? Enter manually
									</button>
								</div>
							</div>
						)}

						{showManualAddress && (
							<div className='space-y-4 p-4 border rounded-lg bg-muted/20 w-full'>
								<div className='flex justify-between items-center'>
									<h4 className='font-medium text-xl text-center'>
										Manual Address Entry
									</h4>
									<button
										type='button'
										className='text-sm text-muted-foreground hover:text-foreground'
										onClick={() => setShowManualAddress(false)}
									>
										Use autocomplete instead
									</button>
								</div>
								<Input
									{...register("streetAddress", {
										required: "Street address is required",
										validate: (val) => {
											// Must contain at least one number and one letter
											const hasNumber = /\d/.test(val);
											const hasLetter = /[a-zA-Z]/.test(val);
											if (!hasNumber || !hasLetter) {
												return "Address must contain a house number and street name (e.g., '123 Main Street')";
											}
											return true;
										},
									})}
									placeholder='Enter your street address with house number (e.g., "123 Main Street") *'
									className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.streetAddress ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
								/>
								{errors.streetAddress && (
									<p className='text-sm text-red-500'>
										{errors.streetAddress.message}
									</p>
								)}
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									<div>
										<Input
											{...register("zip")}
											placeholder='Zip Code *'
											type="text"
											inputMode="numeric"
											maxLength={5}
											onChange={(e) => {
												// Only allow numbers
												const value = e.target.value.replace(/\D/g, '');
												// Limit to 5 digits
												const limitedValue = value.slice(0, 5);
												setValue("zip", limitedValue);
												trigger("zip");
											}}
											className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.zip ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
										/>
										{errors.zip && (
											<p className='text-sm text-red-500 mt-1'>
												{errors.zip.message}
											</p>
										)}
									</div>
									<div>
										<Input
											{...register("city")}
											placeholder='City *'
											className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.city ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
										/>
										{errors.city && (
											<p className='text-sm text-red-500 mt-1'>
												{errors.city.message}
											</p>
										)}
									</div>
									<div>
										<select
											{...register("state")}
											className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 w-full text-slate-900 ${errors.state ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
												}`}
										>
											<option value=''>Select state *</option>
											{states.map((s) => (
												<option key={s.iso_code} value={s.iso_code}>
													{s.name}
												</option>
											))}
										</select>
										{errors.state && (
											<p className='text-sm text-red-500 mt-1'>
												{errors.state.message}
											</p>
										)}
									</div>
								</div>
							</div>
						)}

						<div className='flex gap-2 pt-4 w-full justify-between'>
							<Button variant='outline' onClick={() => goToStep(6)}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button variant='default' onClick={() => nextStep(8)}>
								Next
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</div>
					</div>
				)}

				{step === 8 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								How do we contact you?
							</CardTitle>
							<CardDescription>
								Your personal details are encrypted and protected with the
								highest security standards.{" "}
							</CardDescription>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
							<Input
								{...register("firstName")}
								placeholder='First Name *'
								className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
							/>
							<Input
								{...register("lastName")}
								placeholder='Last Name *'
								className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
							/>
							<Input
								{...register("email")}
								placeholder='Email *'
								className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
							/>
							<Input
								{...register("phone")}
								type='tel'
								placeholder='Phone Number *'
								maxLength={10}
								pattern='[0-9]{10}'
								title='Phone number must be exactly 10 digits'
								className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
							/>
						</div>

							{!isGoDomain && (
								<>
								<label className='w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed'>
									<input type='hidden' id='leadid_tcpa_disclosure' className='hidden' />
									<div className='flex items-start gap-2'>
										<input
											type='checkbox'
											className='mt-0.5 h-4 w-4 accent-primary'
											{...register("smsConsent")}
										/>
										<span>
											By clicking "Submit", you agree to receive calls and text messages at
											the number you provide, including via automated technology
											(autodialer/artificial or prerecorded voice), from MortgageCo about
											your request. Consent isn't required to buy and you can reply STOP to
											cancel. Message/data rates may apply.
										</span>
									</div>
								</label>
								{errors.smsConsent && (
									<p className='w-full text-sm text-red-500'>
										{errors.smsConsent.message}
									</p>
								)}
								</>
							)}

						<div className='flex gap-2 pt-4 w-full justify-between'>
							<Button variant='outline' onClick={() => goToStep(7)}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button type='submit' variant='hero' disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
									Submitting...
								</>
							) : (
								"Submit"
							)}
						</Button>
						</div>

							<div className='text-xs text-muted-foreground pt-4'>
								By clicking, you authorize MortgageCo and/or one of their partners to
								contact you via phone, text or email.
							</div>
						</div>
					)}
			</form>
		</div>
	);
};

export default Service2;
