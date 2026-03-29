import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import AutoGoogleComplete from "@/components/AutoComplete";
import states from "@/lib/states";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const sellSchema = z.object({
	reasonToSell: z.string().min(1, "Please select a reason"),
	propertyType: z.string().min(1, "Please select a property type"),
	timeToSell: z.string().min(1, "Please select how soon you'd like to sell"),
	occupancy: z.string().min(1, "Please select occupancy status"),
	mortgagePayments: z.string().min(1, "Please select mortgage payment status"),
	streetAddress: z
		.string()
		.min(1, "Street address is required")
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
	city: z.string().min(2, "City  is required"),
	state: z.string().min(2, "Please select a state"),
	estimatedValue: z
		.number()
		.min(50000, "Minimum value is $50,000")
		.max(5000000, "Maximum value is $5,000,000"),
	contactAgent: z.boolean(),
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

type SellForm = z.infer<typeof sellSchema>;

const reasonOptions = [
	"Financial Hardship",
	"Inherited",
	"Relocating",
	// "Looking For Realtor",
	"Downsizing",
	"Divorce",
	"Repairs/Damage",
	"Tired Landlord",
	"Not ready to sell just curious on value",
	"Other",
];

const propertyTypes = [
	{ id: "Single Family", title: "Single Family", icon: "🏠" },
	{ id: "Multi-Family", title: "Multi-Family", icon: "🏘️" },
	{ id: "Condo/Town Home", title: "Condo/Town Home", icon: "🏢" },
	{ id: "Mobile Home", title: "Mobile Home", icon: "🚐" },
];

const timeOptions = [
	{ id: "ASAP", title: "ASAP", icon: "⚡" },
	{ id: "Within 3 Months", title: "Within 3 Months", icon: "📅" },
	{ id: "Within 6 Months", title: "Within 6 Months", icon: "🗓️" },
	{ id: "I'm in no rush", title: "I'm in no rush", icon: "🐌" },
];

const occupancyOptions = [
	{ id: "Owner Occupied", title: "Owner Occupied", icon: "👤" },
	{ id: "Tenant Occupied", title: "Tenant Occupied", icon: "👥" },
	{ id: "Vacant", title: "Vacant", icon: "🏠" },
];

const mortgageOptions = [
	{ id: "No", title: "No", icon: "✅" },
	{ id: "Yes - 1 month", title: "Yes - 1 month", icon: "⚠️" },
	{ id: "Yes - 2 months", title: "Yes - 2 months", icon: "🔶" },
	{ id: "Yes - 3+ months", title: "Yes - 3+ months", icon: "🔴" },
];

const Service3 = ({
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
	const [step, setStep] = useState(1);
	const [showManualAddress, setShowManualAddress] = useState(false);
	const isGoDomain = window.location.hostname === 'go.mortgageco.com';

	// Update parent step when component initializes and on step changes
	useEffect(() => {
		if (updateStep) {
			updateStep(step + 1); // +1 because parent has selection step
		}
	}, [step, updateStep]);

	const goToStep = (targetStep: number) => {
		setStep(targetStep);
	};

	const nextStep = async (targetStep: number) => {
		// Define validation fields for each step
		const stepFields: Record<number, string[]> = {
			1: ["reasonToSell"],
			2: ["propertyType"],
			3: ["timeToSell"],
			4: ["occupancy"],
			5: ["mortgagePayments"],
			6: ["streetAddress", "city", "state", "zip"],
			7: ["estimatedValue"],
			8: ["contactAgent"],
			9: ["firstName", "lastName", "email", "phone"],
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
			updateStep(targetStep + 1); // +1 because parent has selection step
		}
	};

	const prevStep = () => {
		setStep((s) => {
			const next = Math.max(1, s - 1);
			// inform parent of new step (parent steps are offset by +1)
			if (updateStep) updateStep(next + 1);
			return next;
		});
	};

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		trigger,
		clearErrors,
		formState: { errors },
	} = useForm<SellForm>({
		resolver: zodResolver(sellSchema),
		defaultValues: {
			reasonToSell: "",
			propertyType: "",
			timeToSell: "",
			occupancy: "",
			mortgagePayments: "",
			streetAddress: "",
			zip: "",
			city: "",
			state: "",
			estimatedValue: 300000,
			contactAgent: true,
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			smsConsent: false,
		},
	});

	// Set contactAgent to true by default when reaching step 8 (real estate agent question)
	useEffect(() => {
		if (step === 8) {
			setValue("contactAgent", true);
		}
	}, [step, setValue]);

	// Auto-consent on go.mortgageco.com — no checkbox shown
	useEffect(() => {
		if (isGoDomain) {
			setValue("smsConsent", true);
		}
	}, [isGoDomain, setValue]);

	const onSubmit = (data: SellForm) => {
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
		const isValid = await trigger(["streetAddress", "city", "state", "zip"]);

		if (isValid) {
			nextStep(7);
		}
	};

	const estimatedValue = watch("estimatedValue");

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				{step === 1 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								Reason for wanting to sell?
							</CardTitle>
							<CardDescription>
								Select the option that best describes your situation
							</CardDescription>
						</div>
						<div className='w-full'>
							<select
								{...register("reasonToSell")}
								onChange={async (e) => {
									setValue("reasonToSell", e.target.value);
									await trigger("reasonToSell");
									if (e.target.value) {
										setTimeout(() => nextStep(2), 300);
									}
								}}
								className={`w-full p-3 rounded border ${errors.reasonToSell ? "border-red-500" : ""
									}`}
							>
								<option value=''>- Select -</option>
								{reasonOptions.map((reason) => (
									<option key={reason} value={reason}>
										{reason}
									</option>
								))}
							</select>
							{errors.reasonToSell && (
								<p className='text-sm text-red-500'>
									{errors.reasonToSell.message}
								</p>
							)}
						</div>
						<div className='flex gap-2 pt-4 w-full justify-between'>
							<Button
								variant='outline'
								onClick={() => {
									if (updateStep) updateStep(1);
								}}
							>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button variant='default' onClick={() => nextStep(2)}>
								Next
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</div>
					</div>
				)}

				{step === 2 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								What's your property type?
							</CardTitle>
							<CardDescription>
								Select the option that best describes your property
							</CardDescription>
						</div>
						<div className='w-full'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
								{propertyTypes.map((type) => (
									<button
										key={type.id}
										type='button'
										onClick={async () => {
											setValue("propertyType", type.id);
											await trigger("propertyType");
											setTimeout(() => nextStep(3), 300);
										}}
										className={`p-6 rounded-lg border-2 transition-all duration-200 text-center hover:border-primary hover:bg-slate-50 hover:shadow-md ${watch("propertyType") === type.id
												? "border-primary bg-slate-50 shadow-md"
												: "border-slate-200 bg-white"
											}`}
									>
										<div className={`w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center text-3xl ${watch("propertyType") === type.id
												? "bg-primary text-white"
												: "bg-slate-100 text-slate-600"
											}`}>
											{type.icon}
										</div>
										<div className='font-semibold text-sm text-slate-900'>{type.title}</div>
									</button>
								))}
							</div>
							{errors.propertyType && (
								<p className='text-sm text-red-500 mt-3'>
									{errors.propertyType.message}
								</p>
							)}
						</div>
						<div className='flex gap-2 pt-4 w-full justify-between'>
							<Button variant='outline' onClick={prevStep}>
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
								How soon would you like to sell?
							</CardTitle>
							<CardDescription>
								Select the option that best describes your timeline
							</CardDescription>
						</div>
						<div className='w-full'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
								{timeOptions.map((option) => (
									<button
										key={option.id}
										type='button'
										onClick={async () => {
											setValue("timeToSell", option.id);
											await trigger("timeToSell");
											setTimeout(() => nextStep(4), 300);
										}}
										className={`p-6 rounded-lg border-2 transition-all duration-200 text-center hover:border-primary hover:bg-slate-50 hover:shadow-md ${watch("timeToSell") === option.id
												? "border-primary bg-slate-50 shadow-md"
												: "border-slate-200 bg-white"
											}`}
									>
										<div className={`w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center text-3xl ${watch("timeToSell") === option.id
												? "bg-primary text-white"
												: "bg-slate-100 text-slate-600"
											}`}>
											{option.icon}
										</div>
										<div className='font-semibold text-sm text-slate-900'>{option.title}</div>
									</button>
								))}
							</div>
							{errors.timeToSell && (
								<p className='text-sm text-red-500 mt-2'>
									{errors.timeToSell.message}
								</p>
							)}
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
								What's your occupancy status?
							</CardTitle>
							<CardDescription>
								Select the option that best describes your situation
							</CardDescription>
						</div>
						<div className='w-full'>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
								{occupancyOptions.map((option) => (
									<button
										key={option.id}
										type='button'
										onClick={async () => {
											setValue("occupancy", option.id);
											await trigger("occupancy");
											setTimeout(() => nextStep(5), 300);
										}}
										className={`p-6 rounded-lg border-2 transition-all duration-200 text-center hover:border-primary hover:bg-slate-50 hover:shadow-md ${watch("occupancy") === option.id
												? "border-primary bg-slate-50 shadow-md"
												: "border-slate-200 bg-white"
											}`}
									>
										<div className={`w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center text-3xl ${watch("occupancy") === option.id
												? "bg-primary text-white"
												: "bg-slate-100 text-slate-600"
											}`}>
											{option.icon}
										</div>
										<div className='font-semibold text-sm text-slate-900'>{option.title}</div>
									</button>
								))}
							</div>
							{errors.occupancy && (
								<p className='text-sm text-red-500 mt-2'>
									{errors.occupancy.message}
								</p>
							)}
						</div>
						<div className='flex gap-2 pt-4 w-full justify-between'>
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
								Are you behind on your mortgage payments?
							</CardTitle>
							<CardDescription>
								Select the option that best describes your situation
							</CardDescription>
						</div>
						<div className='w-full'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
								{mortgageOptions.map((option) => (
									<button
										key={option.id}
										type='button'
										onClick={async () => {
											setValue("mortgagePayments", option.id);
											await trigger("mortgagePayments");
											setTimeout(() => nextStep(6), 300);
										}}
										className={`p-6 rounded-lg border-2 transition-all duration-200 text-center hover:border-primary hover:bg-slate-50 hover:shadow-md ${watch("mortgagePayments") === option.id
												? "border-primary bg-slate-50 shadow-md"
												: "border-slate-200 bg-white"
											}`}
									>
										<div className={`w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center text-3xl ${watch("mortgagePayments") === option.id
												? "bg-primary text-white"
												: "bg-slate-100 text-slate-600"
											}`}>
											{option.icon}
										</div>
										<div className='font-semibold text-sm text-slate-900'>{option.title}</div>
									</button>
								))}
							</div>
							{errors.mortgagePayments && (
								<p className='text-sm text-red-500 mt-2'>
									{errors.mortgagePayments.message}
								</p>
							)}
						</div>
						<div className='flex gap-2 pt-4 w-full justify-between'>
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
						<div className='text-center mb-4'>
							<CardTitle className='text-2xl mb-2'>
								What's your property address?{" "}
							</CardTitle>
							<CardDescription>
								For verification only. We do not mail.{" "}
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
								<div className='mt-2'>
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
							<div className='space-y-4 flex flex-col items-center p-4 border rounded-lg bg-muted/20 w-full'>
								<div className='flex justify-between items-center w-full'>
									<h4 className='font-medium'>Manual Address Entry</h4>
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
									<p className='text-sm text-red-500 mt-1'>
										{errors.streetAddress.message}
									</p>
								)}
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
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

						<div className='flex gap-2 pt-4'>
							<Button variant='outline' onClick={() => goToStep(5)}>
								Back
							</Button>
							<Button variant='default' onClick={() => nextStep(7)}>
								Next
							</Button>
						</div>
					</div>
				)}

				{step === 7 && (
					<div className='space-y-4 flex flex-col items-center'>
						<div className='text-center mb-6'>
							<CardTitle className='text-2xl mb-2'>
								What is your estimated home value?{" "}
							</CardTitle>
							<CardDescription>
								Use the slider to select your estimated home value
							</CardDescription>
						</div>
						<div className='space-y-4 w-full'>
							<Label className='text-base font-medium'>
								Home Value: ${estimatedValue.toLocaleString()}
							</Label>
							<div className='flex items-center gap-4'>
								<Slider
									value={[estimatedValue]}
									onValueChange={(value) =>
										setValue("estimatedValue", value[0])
									}
									min={50000}
									max={5000000}
									step={5000}
									className='w-full'
								/>
							</div>
							<div className='flex justify-between text-sm text-muted-foreground'>
								<span>$50,000</span>
								<span>$50,000,000</span>
							</div>
							{errors.estimatedValue && (
								<p className='text-sm text-red-500'>
									{errors.estimatedValue.message}
								</p>
							)}
						</div>

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
								Would you like to be contacted by a real estate agent in your
								area?{" "}
							</CardTitle>
							<CardDescription>
								They can provide a more accurate valuation and help with the
								selling process.
							</CardDescription>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
							<button
								type='button'
								onClick={() => setValue("contactAgent", true)}
								className={`p-6 rounded-lg border-2 transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md ${watch("contactAgent") === true
										? "border-primary bg-slate-50 shadow-md"
										: "border-slate-200 bg-white"
									}`}
							>
								<div className='flex items-center space-x-3'>
									<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch("contactAgent") === true
											? "border-primary bg-primary"
											: "border-slate-300"
										}`}>
										{watch("contactAgent") === true && (
											<div className='w-2 h-2 bg-white rounded-full'></div>
										)}
									</div>
									<div className='font-semibold text-lg text-slate-900'>Yes, please contact me</div>
								</div>
							</button>
							<button
								type='button'
								onClick={() => setValue("contactAgent", false)}
								className={`p-6 rounded-lg border-2 transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md ${watch("contactAgent") === false
										? "border-primary bg-slate-50 shadow-md"
										: "border-slate-200 bg-white"
									}`}
							>
								<div className='flex items-center space-x-3'>
									<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch("contactAgent") === false
											? "border-primary bg-primary"
											: "border-slate-300"
										}`}>
										{watch("contactAgent") === false && (
											<div className='w-2 h-2 bg-white rounded-full'></div>
										)}
									</div>
									<div className='font-semibold text-lg text-slate-900'>No, I'm just curious about value</div>
								</div>
							</button>
						</div>
						<div className='flex gap-2 pt-4 w-full justify-between'>
							<Button variant='outline' onClick={() => goToStep(7)}>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Previous
							</Button>
							<Button variant='default' onClick={() => nextStep(9)}>
								Next
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</div>
					</div>
				)}

				{step === 9 && (
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
							<div>
								<Input
									{...register("firstName")}
									placeholder='First Name *'
									className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
								/>
								{errors.firstName && (
									<p className='text-sm text-red-500 mt-1'>{errors.firstName.message}</p>
								)}
							</div>
							<div>
								<Input
									{...register("lastName")}
									placeholder='Last Name *'
									className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
								/>
								{errors.lastName && (
									<p className='text-sm text-red-500 mt-1'>{errors.lastName.message}</p>
								)}
							</div>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
							<div>
								<Input
									{...register("email")}
									type='email'
									placeholder='Email Address *'
									className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
								/>
								{errors.email && (
									<p className='text-sm text-red-500 mt-1'>
										{errors.email.message}
									</p>
								)}
							</div>
							<div>
								<Input
									{...register("phone")}
									type='tel'
									placeholder='Phone Number *'
									className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
									maxLength={10}
									pattern='[0-9]{10}'
									title='Phone number must be exactly 10 digits'
								/>
								{errors.phone && (
									<p className='text-sm text-red-500 mt-1'>
										{errors.phone.message}
									</p>
								)}
							</div>
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
											By clicking "Submit Application", you agree to receive calls and
											text messages at the number you provide, including via automated
											technology (autodialer/artificial or prerecorded voice), from
											MortgageCo about your request. Consent isn't required to buy and you
											can reply STOP to cancel. Message/data rates may apply.
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
							<Button variant='outline' onClick={() => goToStep(8)}>
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
								"Submit Application"
							)}
						</Button>
						</div>
					</div>
				)}
			</form>
		</div>
	);
};

export default Service3;
