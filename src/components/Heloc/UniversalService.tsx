import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
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
import AutoComplete from "../AutoComplete";
import states from "@/lib/states";
import { getStateData } from "@/lib/stateData";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const universalSchema = z.object({
  serviceType: z.string().min(1, "Please select a service"),
  mainGoal: z.string().min(1, "Please select your main goal"),
  homeType: z.string().min(1, "Please select home type"),
  propertyUse: z.string().min(1, "Please select property use"),
  homeValue: z.number().min(50000, "Home value must be at least $50,000"),
  mortgageBalance: z.number().min(0, "Mortgage balance cannot be negative"),
  additionalCash: z.string().min(1, "Please select cash amount"),
  hasFHALoan: z.string().optional(),
  mortgageLender: z.string().min(1, "Please select your mortgage lender"),
  interestRate: z.string().min(1, "Please select your interest rate"),
  employmentStatus: z.string().min(1, "Please select employment status"),
  income: z.number().min(1, "Please enter your annual income"),
  military: z.string().min(1, "Please select military status"),
  rateType: z.string().optional(),
  creditRating: z.string().min(1, "Credit rating is required"),
  bankruptcy: z.string().min(1, "Bankruptcy status is required"),
  numMortgageLates: z.string().min(1, "Please select number of late payments"),
  propertyAddress: z
    .string()
    .min(1, "Property address is required")
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
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "Please select a state"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address")
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
}).refine(
  (data) => {
    // Validate that mortgage balance doesn't exceed home value
    if (data.homeValue && data.mortgageBalance) {
      return data.mortgageBalance <= data.homeValue;
    }
    return true;
  },
  (data) => ({
    message: `Mortgage balance (${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(data.mortgageBalance || 0)}) cannot exceed home value (${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(data.homeValue || 0)})`,
    path: ["mortgageBalance"], // This will attach the error to the mortgageBalance field
  })
);

type UniversalForm = z.infer<typeof universalSchema>;

const UniversalService = ({
  selectedService,
  updateStep,
  onComplete,
  isSubmitting: externalIsSubmitting = false,
}: {
  selectedService: string;
  updateStep?: (step: number) => void;
  onComplete?: (data: any) => Promise<void> | void;
  isSubmitting?: boolean;
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [homeValueInput, setHomeValueInput] = useState<string>("");
  const [mortgageBalanceInput, setMortgageBalanceInput] = useState<string>("");
  const [incomeInput, setIncomeInput] = useState<string>("");
  const [hasPrefilledFromState, setHasPrefilledFromState] = useState(false);
  const [selectedHomeValueRange, setSelectedHomeValueRange] = useState<string | null>(null);
  const [selectedMortgageRange, setSelectedMortgageRange] = useState<string | null>(null);
  const isGoDomain = window.location.hostname === 'go.mortgageco.com';

  // Update parent step when component initializes and on step changes
  useEffect(() => {
    if (updateStep) {
      updateStep(step + 1); // +1 because parent has selection step
    }
  }, [step, updateStep]);

  // Explicit step tracking via pixel global
  // Steps are offset +1 to match canonical map (step 1 = Campaign Select / service selection)
  const STEP_NAMES: Record<number, string> = {
    2: "Loan Goal", 3: "Property Details", 4: "Property Address",
    5: "Home Value", 6: "Mortgage Balance", 7: "Cash Out Amount",
    8: "Military Service", 9: "FHA Loan", 10: "Rate Type",
    11: "Mortgage Lender", 12: "Interest Rate", 13: "Employment Income",
    14: "Credit Rating", 15: "Financial History", 16: "Mortgage Payments",
    17: "Contact Information",
  };
  useEffect(() => {
    const pixelStep = step + 1; // +1 because step 1 = Campaign Select (service selection)
    const stepName = STEP_NAMES[pixelStep];
    if (!stepName) return;
    if (typeof (window as any).hftp_track === "function") {
      (window as any).hftp_track(pixelStep, stepName);
    }
  }, [step]);

  // Fire step 1 (Campaign Select) once on mount — service is auto-selected
  useEffect(() => {
    if (typeof (window as any).hftp_track === "function") {
      (window as any).hftp_track(1, "Campaign Select");
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<UniversalForm>({
    resolver: zodResolver(universalSchema),
    defaultValues: {
      serviceType: selectedService || "",
      mainGoal: "",
      homeType: "Single Family",
      propertyUse: "Primary Residence",
      homeValue: 250000,
      mortgageBalance: 150000,
      additionalCash: "",
      hasFHALoan: "",
      mortgageLender: "",
      interestRate: "",
      employmentStatus: "",
      income: 0,
      military: "",
      rateType: "",
      creditRating: "",
      bankruptcy: "",
      numMortgageLates: "",
      propertyAddress: "",
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

  // Watch form values
  const currentState = watch("state");
  const currentHomeValue = watch("homeValue");
  const currentMortgageBalance = watch("mortgageBalance");

  // Watch income value
  const currentIncome = watch("income");

  // Home value ranges
  const homeValueRanges = [
    { label: "$100k - $200k", min: 100000, max: 200000 },
    { label: "$200k - $300k", min: 200000, max: 300000 },
    { label: "$300k - $500k", min: 300000, max: 500000 },
    { label: "$500k - $750k", min: 500000, max: 750000 },
    { label: "$750k - $1M", min: 750000, max: 1000000 },
    { label: "$1M - $3M", min: 1000000, max: 3000000 },
    { label: "$3M+", min: 3000000, max: 10000000 },
  ];

  // Mortgage balance ranges
  const mortgageRanges = [
    { label: "$50k - $100k", min: 50000, max: 100000 },
    { label: "$100k - $200k", min: 100000, max: 200000 },
    { label: "$200k - $300k", min: 200000, max: 300000 },
    { label: "$300k - $500k", min: 300000, max: 500000 },
    { label: "$500k - $750k", min: 500000, max: 750000 },
    { label: "$750k - $1M", min: 750000, max: 1000000 },
    { label: "$1M+", min: 1000000, max: 1800000 },
  ];

  // Helper to get range for a value
  const getRangeForValue = (value: number, ranges: typeof homeValueRanges) => {
    return ranges.find(range => value >= range.min && value <= range.max) || ranges[ranges.length - 1];
  };

  // Auto-select home value range when value changes
  useEffect(() => {
    if (currentHomeValue > 0 && !selectedHomeValueRange) {
      const range = getRangeForValue(currentHomeValue, homeValueRanges);
      setSelectedHomeValueRange(range.label);
    }
  }, [currentHomeValue, selectedHomeValueRange, homeValueRanges]);

  // Auto-select mortgage range when value changes
  useEffect(() => {
    if (currentMortgageBalance > 0 && !selectedMortgageRange) {
      const range = getRangeForValue(currentMortgageBalance, mortgageRanges);
      setSelectedMortgageRange(range.label);
    }
  }, [currentMortgageBalance, selectedMortgageRange, mortgageRanges]);

  // Auto-consent on go.mortgageco.com — no checkbox shown
  useEffect(() => {
    if (isGoDomain) {
      setValue("smsConsent", true);
    }
  }, [isGoDomain, setValue]);

  // Prefill home value, mortgage balance, and income based on state selection
  useEffect(() => {
    // Only prefill if:
    // 1. State is selected and valid (2+ characters)
    // 2. We haven't already prefilled from state
    // 3. Home value and mortgage balance are still at defaults (250000 and 150000)
    // 4. Income is still at default (0) or not set
    if (
      currentState &&
      currentState.length >= 2 &&
      !hasPrefilledFromState &&
      currentHomeValue === 250000 &&
      currentMortgageBalance === 150000 &&
      (currentIncome === 0 || !currentIncome)
    ) {
      const stateData = getStateData(currentState);
      if (stateData) {
        setValue("homeValue", stateData.homeValue);
        setValue("mortgageBalance", stateData.mortgageBalance);
        // Auto-select ranges for prefilled values
        const homeRange = getRangeForValue(stateData.homeValue, homeValueRanges);
        setSelectedHomeValueRange(homeRange.label);
        const mortgageRange = getRangeForValue(stateData.mortgageBalance, mortgageRanges);
        setSelectedMortgageRange(mortgageRange.label);
        // Only prefill income if state has income data
        if (stateData.income !== undefined) {
          setValue("income", stateData.income);
        }
        setHasPrefilledFromState(true);
      }
    }
  }, [currentState, currentHomeValue, currentMortgageBalance, currentIncome, setValue, hasPrefilledFromState]);


  const nextStep = async () => {
    const militaryValue = watch("military");

    // Define validation fields for each step
    const stepFields: Record<number, string[]> = {
      1: ["mainGoal"],
      2: ["propertyUse", "homeType"],
      3: ["propertyAddress", "city", "state", "zip"], // Property address - moved before home value, mortgage balance, and income
      4: ["homeValue"],
      5: ["mortgageBalance"],
      6: ["additionalCash"],
      7: ["military"],
      8: ["hasFHALoan"],
      9: ["rateType"],
      10: ["mortgageLender"],
      11: ["interestRate"],
      12: ["employmentStatus", "income"],
      13: ["creditRating"],
      14: ["bankruptcy"],
      15: ["numMortgageLates"],
      16: isGoDomain ? ["firstName", "lastName", "email", "phone"] : ["firstName", "lastName", "email", "phone", "smsConsent"],
    };

    const fieldsToValidate = stepFields[step];
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);
      if (!isValid) {
        // Wait a bit for errors to be set, then show toast
        setTimeout(() => {
          // Special handling for mortgage balance error
          const mortgageError = errors.mortgageBalance;
          if (mortgageError) {
            toast.error("Validation Error", {
              description: mortgageError.message || "Mortgage balance cannot exceed home value",
            });
            return;
          }

          // Check other field errors
          const fieldErrors = fieldsToValidate
            .map((field) => {
              const error = errors[field as keyof typeof errors];
              return error?.message;
            })
            .filter(Boolean);

          if (fieldErrors.length > 0) {
            toast.error("Validation Error", {
              description: fieldErrors[0] || "Please fill in all required fields correctly",
            });
          }
        }, 50);
        return; // Don't proceed if validation fails
      }
    }

    // Clear errors for fields that are not in the current step
    const allFields = Object.values(stepFields).flat();
    const currentStepFields = stepFields[step] || [];
    const fieldsToClear = allFields.filter(
      (field) => !currentStepFields.includes(field)
    );

    fieldsToClear.forEach((field) => {
      clearErrors(field as any);
    });

    // Handle conditional step skipping based on military status
    let nextStepNumber = step + 1;

    // If on step 7 (military) and answered Yes, skip FHA (step 8) and Rate Type (step 9)
    if (step === 7 && militaryValue === "Yes") {
      // Auto-fill values for skipped questions
      setValue("hasFHALoan", "No");
      setValue("rateType", "1"); // 1 = Fixed Rate
      // Skip to step 10 (mortgage lender)
      nextStepNumber = 10;
    }

    if (nextStepNumber <= 16) {
      setStep(nextStepNumber);
      if (updateStep) {
        updateStep(nextStepNumber + 1); // +1 because parent has selection step
      }
    } else {
      // Submit the form — guard against double submission
      if (isSubmittingLocal || externalIsSubmitting) return;
      setIsSubmittingLocal(true);
      try {
        const formData = watch();
        if (onComplete) await onComplete(formData);
      } finally {
        setIsSubmittingLocal(false);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const newStep = step - 1;
      setStep(newStep);
      if (updateStep) {
        updateStep(newStep + 1); // +1 because parent has selection step
      }
    } else {
      // If we're on step 1 of UniversalService, go back to service selection
      if (updateStep) {
        updateStep(1); // Go back to service selection step
      }
    }
  };

  const handleAddressSelect = async (addr: any) => {
    if (!addr) return;
    const { address1, city, state, zipCode } = addr;

    // Validate that address contains at least one number and one letter
    const address = address1 || "";
    const hasNumber = /\d/.test(address);
    const hasLetter = /[a-zA-Z]/.test(address);

    if (!hasNumber || !hasLetter) {
      // If address doesn't meet validation, show error and don't proceed
      setValue("propertyAddress", address);
      await trigger("propertyAddress");
      return;
    }

    setValue("propertyAddress", address);
    setValue("city", city || "");
    setValue("state", state || "");
    setValue("zip", zipCode || "");
    setShowManualAddress(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format currency in short form (e.g., $1.5M, $900K)
  const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) {
      const millions = value / 1000000;
      return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
    } else if (value >= 1000) {
      const thousands = value / 1000;
      return `$${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
    }
    return formatCurrency(value);
  };

  const homeValue = currentHomeValue || 250000;
  const mortgageBalance = currentMortgageBalance || 150000;
  const income = currentIncome || 0;

  return (
    <div>
      <form onSubmit={handleSubmit((data) => onComplete?.(data))}>
        {/* Step 1: What's your main goal for exploring loan options? */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                What's your main goal for exploring loan options?
              </CardTitle>
              <CardDescription>
                Select the option that best describes your primary objective
              </CardDescription>
            </div>
            <div className="grid gap-4">
              {[
                { value: "Cash Out", label: "Cash Out" },
                { value: "Lowest Payment", label: "Lowest Payment" },
                { value: "Home Improvement", label: "Home Improvement" },
                { value: "Debt Consolidation", label: "Debt Consolidation" },
                { value: "Change in Loan Terms", label: "Change in Loan Terms" },
                { value: "Convert to Adjustable Rate", label: "Convert to Adjustable Rate" },
                { value: "Convert to Fixed Rate", label: "Convert to Fixed Rate" },
                { value: "Lower My Interest Rate", label: "Lower My Interest Rate" },
              ].map((goal) => (
                <div
                  key={goal.value}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-primary hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] relative ${watch("mainGoal") === goal.value
                      ? "border-green-500 bg-green-50/50 shadow-lg scale-[1.02] ring-2 ring-green-500/20"
                      : "border-slate-200 bg-white"
                    }`}
                  onClick={() => {
                    setValue("mainGoal", goal.value);
                    setTimeout(() => nextStep(), 300);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${watch("mainGoal") === goal.value
                          ? "border-primary bg-primary scale-110"
                          : "border-slate-300"
                        }`}
                    >
                      {watch("mainGoal") === goal.value && (
                        <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200"></div>
                      )}
                    </div>
                    <div className={`font-semibold text-lg transition-colors duration-300 ${watch("mainGoal") === goal.value ? "text-green-700" : "text-slate-900"
                      }`}>
                      {goal.label}
                    </div>
                  </div>
                  {watch("mainGoal") === goal.value && (
                    <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                  )}
                </div>
              ))}
            </div>
            {errors.mainGoal && (
              <p className="text-sm text-red-500">{errors.mainGoal.message}</p>
            )}
          </div>
        )}

        {/* Step 2: Property Use and Property Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">Tell us about the property</CardTitle>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="propertyUse" className="text-base font-medium">
                  Property is used as
                </Label>
                <Select
                  value={watch("propertyUse")}
                  onValueChange={(value) => {
                    setValue("propertyUse", value);
                    trigger("propertyUse");
                  }}
                >
                  <SelectTrigger className={`h-12 text-base border-2 hover:shadow-md transition-all duration-300 mt-2 ${errors.propertyUse
                      ? "border-red-500 hover:border-red-500"
                      : watch("propertyUse") && !errors.propertyUse
                        ? "border-green-500 hover:border-green-500"
                        : "border-slate-300 hover:border-primary"
                    }`}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primary Residence">Primary residence</SelectItem>
                    <SelectItem value="Second Home">Second Home</SelectItem>
                    <SelectItem value="Investment Property">Investment Property</SelectItem>
                  </SelectContent>
                </Select>
                {errors.propertyUse && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.propertyUse.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="homeType" className="text-base font-medium">
                  Property type
                </Label>
                <Select
                  value={watch("homeType")}
                  onValueChange={(value) => {
                    setValue("homeType", value);
                    trigger("homeType");
                  }}
                >
                  <SelectTrigger className={`h-12 text-base border-2 hover:shadow-md transition-all duration-300 mt-2 ${errors.homeType
                      ? "border-red-500 hover:border-red-500"
                      : watch("homeType") && !errors.homeType
                        ? "border-green-500 hover:border-green-500"
                        : "border-slate-300 hover:border-primary"
                    }`}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single Family">Single Family</SelectItem>
                    <SelectItem value="Condo/Town Home">Condo/Town Home</SelectItem>
                    <SelectItem value="Mobile Home">Mobile Home</SelectItem>
                    <SelectItem value="Manufactured Home">Manufactured Home</SelectItem>
                  </SelectContent>
                </Select>
                {errors.homeType && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.homeType.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Property Address */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">Property Address</CardTitle>
              <CardDescription>
                Enter the address of the property. We'll use your state to help prefill your home value, mortgage balance, and income estimates.
              </CardDescription>
            </div>
            <div className="space-y-4">
              <Label
                htmlFor="propertyAddress"
                className="text-base font-medium"
              >
                Property Address
              </Label>

              {!showManualAddress && (
                <>
                  <AutoComplete
                    onSelect={handleAddressSelect}
                    defaultValue={watch("propertyAddress") || ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowManualAddress(true)}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Couldn't find the address? Enter manually
                  </Button>
                </>
              )}

              {showManualAddress && (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      {...register("propertyAddress", {
                        required: "Property address is required",
                        validate: (val) => {
                          // Must contain at least one number and at least one letter
                          const hasNumber = /\d/.test(val);
                          const hasLetter = /[a-zA-Z]/.test(val);
                          if (!hasNumber || !hasLetter) {
                            return "Address must contain a house number and street name (e.g., '123 Main Street')";
                          }
                          return true;
                        },
                      })}
                      placeholder="Enter your street address with house number (e.g., '123 Main Street') *"
                      className={`h-12 px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-300 text-slate-900 placeholder-slate-500 ${errors.propertyAddress
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : watch("propertyAddress") && !errors.propertyAddress && /\d/.test(watch("propertyAddress")) && /[a-zA-Z]/.test(watch("propertyAddress"))
                            ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }`}
                    />
                    {watch("propertyAddress") && !errors.propertyAddress && /\d/.test(watch("propertyAddress")) && /[a-zA-Z]/.test(watch("propertyAddress")) && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Input
                        {...register("zip")}
                        placeholder="Zip Code *"
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
                        className={`h-12 px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-300 text-slate-900 placeholder-slate-500 ${errors.zip
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : watch("zip") && !errors.zip && /^\d{5}$/.test(watch("zip"))
                              ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                              : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          }`}
                      />
                      {watch("zip") && !errors.zip && /^\d{5}$/.test(watch("zip")) && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                      )}
                      {errors.zip && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.zip.message}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        {...register("city")}
                        placeholder="City *"
                        className={`h-12 px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-300 text-slate-900 placeholder-slate-500 ${errors.city
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : watch("city") && !errors.city && watch("city").length >= 2
                              ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                              : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          }`}
                      />
                      {watch("city") && !errors.city && watch("city").length >= 2 && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                      )}
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        {...register("state")}
                        className={`h-12 px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-300 w-full text-slate-900 ${errors.state
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : watch("state") && !errors.state && watch("state").length >= 2
                              ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                              : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          }`}
                      >
                        <option value="">Select state</option>
                        {states.map((s) => (
                          <option key={s.iso_code} value={s.iso_code}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {watch("state") && !errors.state && watch("state").length >= 2 && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-200 pointer-events-none" />
                      )}
                      {errors.state && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowManualAddress(false)}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Use Google Autocomplete instead
                  </Button>
                </div>
              )}

              {errors.propertyAddress && (
                <p className="text-sm text-red-500">
                  {errors.propertyAddress.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Estimate your home's value */}
        {step === 4 && (() => {
          const currentRange = selectedHomeValueRange
            ? homeValueRanges.find(r => r.label === selectedHomeValueRange) || getRangeForValue(currentHomeValue, homeValueRanges)
            : getRangeForValue(currentHomeValue, homeValueRanges);

          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CardTitle className="text-2xl mb-2">
                  Your Home's Estimated Value
                </CardTitle>
                <CardDescription className="text-base">
                  Select your home value range, then refine the exact amount.
                </CardDescription>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Select your home value range:
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {homeValueRanges.map((range) => (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => {
                          setSelectedHomeValueRange(range.label);
                          // Set value to middle of range if not already in range
                          if (currentHomeValue < range.min || currentHomeValue > range.max) {
                            setValue("homeValue", Math.round((range.min + range.max) / 2));
                          }
                        }}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${selectedHomeValueRange === range.label
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-slate-200 bg-white text-slate-900 hover:border-primary/50"
                          }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedHomeValueRange && (
                  <div className="border-2 border-primary rounded-lg p-6 space-y-4">
                    <Label className="text-base font-medium block">
                      Refine your home value:
                    </Label>
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold text-primary">
                        {formatCurrencyShort(currentHomeValue)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <Slider
                        value={[currentHomeValue]}
                        onValueChange={(value) => {
                          const newValue = Math.max(currentRange.min, Math.min(currentRange.max, value[0]));
                          setValue("homeValue", newValue);
                        }}
                        min={currentRange.min}
                        max={currentRange.max}
                        step={5000}
                        className="w-full transition-all duration-300"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrencyShort(currentRange.min)}</span>
                        <span>{formatCurrencyShort(currentRange.max)}</span>
                      </div>
                    </div>
                    <Input
                      type="text"
                      value={homeValueInput || formatCurrency(currentHomeValue)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        setHomeValueInput(rawValue ? formatCurrency(parseInt(rawValue, 10)) : "");
                        if (rawValue) {
                          const numValue = parseInt(rawValue, 10);
                          const clampedValue = Math.max(currentRange.min, Math.min(currentRange.max, numValue));
                          if (numValue >= currentRange.min && numValue <= currentRange.max) {
                            setValue("homeValue", numValue);
                          }
                        }
                      }}
                      onFocus={(e) => {
                        setHomeValueInput(currentHomeValue.toString());
                      }}
                      onBlur={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        if (rawValue) {
                          const numValue = parseInt(rawValue, 10);
                          const clampedValue = Math.max(currentRange.min, Math.min(currentRange.max, numValue));
                          setValue("homeValue", clampedValue);
                        }
                        setHomeValueInput("");
                      }}
                      placeholder={formatCurrency(currentHomeValue)}
                      className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-300 text-slate-900 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 ${errors.homeValue
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : !errors.homeValue && currentHomeValue >= 50000
                            ? "border-green-500 focus:border-green-500 focus:ring-green-200"
                            : "border-slate-300 focus:border-primary"
                        }`}
                    />
                  </div>
                )}
                {errors.homeValue && (
                  <p className="text-sm text-red-500">
                    {errors.homeValue.message}
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Step 5: Your current mortgage balance */}
        {step === 5 && (() => {
          // Filter mortgage ranges based on home value
          const maxMortgage = currentHomeValue && currentHomeValue > 50000 ? Math.min(currentHomeValue, 1800000) : 1800000;
          const availableMortgageRanges = mortgageRanges.filter(range => range.min <= maxMortgage);

          const currentRange = selectedMortgageRange
            ? mortgageRanges.find(r => r.label === selectedMortgageRange) || getRangeForValue(currentMortgageBalance, mortgageRanges)
            : getRangeForValue(currentMortgageBalance, mortgageRanges);

          // Ensure current range doesn't exceed home value
          const effectiveRange = {
            ...currentRange,
            max: Math.min(currentRange.max, maxMortgage)
          };

          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CardTitle className="text-2xl mb-2">
                  Your Current Mortgage Balance
                </CardTitle>
                <CardDescription className="text-base">
                  Select your mortgage balance range, then refine the exact amount.
                </CardDescription>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Select your mortgage balance range:
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableMortgageRanges.map((range) => {
                      const effectiveMax = Math.min(range.max, maxMortgage);
                      const rangeLabel = effectiveMax < range.max ? `${formatCurrencyShort(range.min)} - ${formatCurrencyShort(effectiveMax)}` : range.label;

                      return (
                        <button
                          key={range.label}
                          type="button"
                          onClick={() => {
                            setSelectedMortgageRange(range.label);
                            // Set value to middle of range if not already in range
                            if (currentMortgageBalance < range.min || currentMortgageBalance > effectiveMax) {
                              setValue("mortgageBalance", Math.round((range.min + effectiveMax) / 2));
                            }
                          }}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${selectedMortgageRange === range.label
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-slate-200 bg-white text-slate-900 hover:border-primary/50"
                            }`}
                        >
                          {rangeLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedMortgageRange && (
                  <div className="border-2 border-primary rounded-lg p-6 space-y-4">
                    <Label className="text-base font-medium block">
                      Refine your mortgage balance:
                    </Label>
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold text-primary">
                        {formatCurrencyShort(currentMortgageBalance)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <Slider
                        value={[currentMortgageBalance]}
                        onValueChange={async (value) => {
                          const newValue = Math.max(effectiveRange.min, Math.min(effectiveRange.max, value[0]));
                          setValue("mortgageBalance", newValue);
                          // Trigger validation
                          const isValid = await trigger("mortgageBalance");
                          if (!isValid && errors.mortgageBalance) {
                            toast.error("Validation Error", {
                              description: errors.mortgageBalance.message || "Mortgage balance cannot exceed home value",
                            });
                          }
                        }}
                        min={effectiveRange.min}
                        max={effectiveRange.max}
                        step={5000}
                        className="w-full transition-all duration-300"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrencyShort(effectiveRange.min)}</span>
                        <span>{formatCurrencyShort(effectiveRange.max)}</span>
                      </div>
                    </div>
                    <Input
                      type="text"
                      value={mortgageBalanceInput || formatCurrency(currentMortgageBalance)}
                      onChange={async (e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        setMortgageBalanceInput(rawValue ? formatCurrency(parseInt(rawValue, 10)) : "");
                        if (rawValue) {
                          const numValue = parseInt(rawValue, 10);
                          const clampedValue = Math.max(effectiveRange.min, Math.min(effectiveRange.max, numValue));
                          if (numValue >= effectiveRange.min && numValue <= effectiveRange.max) {
                            setValue("mortgageBalance", numValue);
                            // Trigger validation
                            const isValid = await trigger("mortgageBalance");
                            if (!isValid) {
                              setTimeout(() => {
                                if (errors.mortgageBalance) {
                                  toast.error("Validation Error", {
                                    description: errors.mortgageBalance.message || "Mortgage balance cannot exceed home value",
                                  });
                                }
                              }, 100);
                            }
                          }
                        }
                      }}
                      onFocus={(e) => {
                        setMortgageBalanceInput(currentMortgageBalance.toString());
                      }}
                      onBlur={async (e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        if (rawValue) {
                          const numValue = parseInt(rawValue, 10);
                          const clampedValue = Math.max(effectiveRange.min, Math.min(effectiveRange.max, numValue));
                          setValue("mortgageBalance", clampedValue);
                          // Trigger validation
                          const isValid = await trigger("mortgageBalance");
                          if (!isValid && errors.mortgageBalance) {
                            toast.error("Validation Error", {
                              description: errors.mortgageBalance.message || "Mortgage balance cannot exceed home value",
                            });
                          }
                        }
                        setMortgageBalanceInput("");
                      }}
                      placeholder={formatCurrency(currentMortgageBalance)}
                      className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-300 text-slate-900 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 ${errors.mortgageBalance
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : !errors.mortgageBalance && currentMortgageBalance > 0 && currentMortgageBalance <= currentHomeValue
                            ? "border-green-500 focus:border-green-500 focus:ring-green-200"
                            : "border-slate-300 focus:border-primary"
                        }`}
                    />
                  </div>
                )}
                {errors.mortgageBalance && (
                  <p className="text-sm text-red-500">
                    {errors.mortgageBalance.message}
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Step 6: How much additional cash do you wish to borrow? */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                How much additional cash do you wish to borrow?
              </CardTitle>
              <CardDescription>
                Select the amount of additional cash you need
              </CardDescription>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <Label htmlFor="additionalCash" className="text-base font-medium">
                Additional Cash Amount
              </Label>
              <Select
                value={watch("additionalCash")}
                onValueChange={(value) => {
                  setValue("additionalCash", value);
                  setTimeout(() => nextStep(), 300);
                }}
              >
                <SelectTrigger className="h-12 text-base border-2 hover:border-primary hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder="Select amount..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None ($0)</SelectItem>
                  <SelectItem value="1 - 5,000">$1 - $5,000</SelectItem>
                  <SelectItem value="5,001 - 10,000">
                    $5,001 - $10,000
                  </SelectItem>
                  <SelectItem value="10,001 - 15,000">
                    $10,001 - $15,000
                  </SelectItem>
                  <SelectItem value="15,001 - 20,000">
                    $15,001 - $20,000
                  </SelectItem>
                  <SelectItem value="20,001 - 25,000">
                    $20,001 - $25,000
                  </SelectItem>
                  <SelectItem value="25,001 - 30,000">
                    $25,001 - $30,000
                  </SelectItem>
                  <SelectItem value="30,001 - 35,000">
                    $30,001 - $35,000
                  </SelectItem>
                  <SelectItem value="35,001 - 40,000">
                    $35,001 - $40,000
                  </SelectItem>
                  <SelectItem value="40,001 - 45,000">
                    $40,001 - $45,000
                  </SelectItem>
                  <SelectItem value="45,001 - 50,000">
                    $45,001 - $50,000
                  </SelectItem>
                  <SelectItem value="Over 50,000">Over $50,000</SelectItem>
                </SelectContent>
              </Select>
              {errors.additionalCash && (
                <p className="text-sm text-red-500">
                  {errors.additionalCash.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 7: Military Service */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">Military Service</CardTitle>
              <CardDescription>
                Are you or your spouse active or veteran military?
              </CardDescription>
            </div>
            <div className="grid gap-4">
              <div
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-primary hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] ${watch("military") === "Yes"
                    ? "border-primary bg-primary/5 shadow-lg scale-[1.02] ring-2 ring-primary/20"
                    : "border-slate-200 bg-white"
                  }`}
                onClick={() => {
                  setValue("military", "Yes");
                  setTimeout(() => nextStep(), 300);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${watch("military") === "Yes"
                        ? "border-primary bg-primary scale-110"
                        : "border-slate-300"
                      }`}
                  >
                    {watch("military") === "Yes" && (
                      <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200"></div>
                    )}
                  </div>
                  <div>
                    <div className={`font-semibold text-lg transition-colors duration-300 ${watch("military") === "Yes" ? "text-primary" : "text-slate-900"
                      }`}>
                      Yes
                    </div>
                    <div className="text-sm text-slate-600">
                      I am or my spouse is active or veteran military
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-primary hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] ${watch("military") === "No"
                    ? "border-primary bg-primary/5 shadow-lg scale-[1.02] ring-2 ring-primary/20"
                    : "border-slate-200 bg-white"
                  }`}
                onClick={() => {
                  setValue("military", "No");
                  setTimeout(() => nextStep(), 300);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${watch("military") === "No"
                        ? "border-primary bg-primary scale-110"
                        : "border-slate-300"
                      }`}
                  >
                    {watch("military") === "No" && (
                      <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200"></div>
                    )}
                  </div>
                  <div>
                    <div className={`font-semibold text-lg transition-colors duration-300 ${watch("military") === "No" ? "text-primary" : "text-slate-900"
                      }`}>No</div>
                    <div className="text-sm text-slate-600">
                      Neither I nor my spouse has military experience
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {errors.military && (
              <p className="text-sm text-red-500">
                Please select a military status
              </p>
            )}
          </div>
        )}

        {/* Step 8: FHA Loan */}
        {step === 8 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                Do you currently have an FHA loan?
              </CardTitle>
              <CardDescription>
                FHA loans have specific refinancing benefits and requirements
              </CardDescription>
            </div>
            <div className="grid gap-4">
              {[
                { value: "Yes", description: "I have an FHA loan" },
                { value: "No", description: "I have a conventional loan" },
                {
                  value: "I don't know",
                  description: "I'm not sure what type of loan I have",
                },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-primary hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] ${watch("hasFHALoan") === option.value
                      ? "border-primary bg-primary/5 shadow-lg scale-[1.02] ring-2 ring-primary/20"
                      : "border-slate-200 bg-white"
                    }`}
                  onClick={() => {
                    setValue("hasFHALoan", option.value);
                    setTimeout(() => nextStep(), 300);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${watch("hasFHALoan") === option.value
                          ? "border-primary bg-primary scale-110"
                          : "border-slate-300"
                        }`}
                    >
                      {watch("hasFHALoan") === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200"></div>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-lg transition-colors duration-300 ${watch("hasFHALoan") === option.value ? "text-primary" : "text-slate-900"
                        }`}>
                        {option.value}
                      </div>
                      <div className="text-sm text-slate-600">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.hasFHALoan && (
              <p className="text-sm text-red-500">
                {errors.hasFHALoan.message}
              </p>
            )}
          </div>
        )}

        {/* Step 9: Rate Type */}
        {step === 9 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                Do you know what your desired rate type is?
              </CardTitle>
              <CardDescription>
                Choose the type of interest rate you prefer for your loan
              </CardDescription>
            </div>
            <div className="grid gap-4">
              {[
                {
                  value: "1",
                  label: "Fixed Rate",
                  description: "Interest rate stays the same for the life of the loan",
                },
                {
                  value: "2",
                  label: "Adjustable Rate",
                  description: "Interest rate can change over time based on market conditions",
                },
                {
                  value: "3",
                  label: "Fixed/Adjustable",
                  description: "I want to discuss both fixed and adjustable options",
                },
                {
                  value: "4",
                  label: "Unknown",
                  description: "I'm not sure which rate type I want (defaults to Fixed)",
                },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-primary hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] ${watch("rateType") === option.value
                      ? "border-primary bg-primary/5 shadow-lg scale-[1.02] ring-2 ring-primary/20"
                      : "border-slate-200 bg-white"
                    }`}
                  onClick={() => {
                    setValue("rateType", option.value);
                    setTimeout(() => nextStep(), 300);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${watch("rateType") === option.value
                          ? "border-primary bg-primary scale-110"
                          : "border-slate-300"
                        }`}
                    >
                      {watch("rateType") === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200"></div>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-lg transition-colors duration-300 ${watch("rateType") === option.value ? "text-primary" : "text-slate-900"
                        }`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-slate-600">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.rateType && (
              <p className="text-sm text-red-500">
                {errors.rateType.message}
              </p>
            )}
          </div>
        )}

        {/* Step 10: Who do you make your mortgage payment to? */}
        {step === 10 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                Who do you make your mortgage payment to?
              </CardTitle>
              <CardDescription>
                Select your current mortgage lender or servicer
              </CardDescription>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <Label htmlFor="mortgageLender" className="text-base font-medium">
                Mortgage Lender
              </Label>
              <Select
                value={watch("mortgageLender")}
                onValueChange={(value) => {
                  setValue("mortgageLender", value);
                  setTimeout(() => nextStep(), 300);
                }}
              >
                <SelectTrigger className="h-12 text-base border-2 hover:border-primary hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder="Select your lender..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="Wells Fargo">Wells Fargo</SelectItem>
                  <SelectItem value="Bank of America">Bank of America</SelectItem>
                  <SelectItem value="Chase">Chase</SelectItem>
                  <SelectItem value="Citibank">Citibank</SelectItem>
                  <SelectItem value="Quicken Loans">Quicken Loans</SelectItem>
                  <SelectItem value="Loan Depot">Loan Depot</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.mortgageLender && (
                <p className="text-sm text-red-500">
                  {errors.mortgageLender.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 11: What is your mortgage interest rate? */}
        {step === 11 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                What is your mortgage interest rate?
              </CardTitle>
              <CardDescription>
                OK to estimate - select the rate closest to your current
                mortgage
              </CardDescription>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <Label htmlFor="interestRate" className="text-base font-medium">
                Interest Rate
              </Label>
              <Select
                value={watch("interestRate")}
                onValueChange={(value) => {
                  setValue("interestRate", value);
                  setTimeout(() => nextStep(), 300);
                }}
              >
                <SelectTrigger className="h-12 text-base border-2 hover:border-primary hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder="Select your interest rate..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11+">11%+</SelectItem>
                  <SelectItem value="10.75">10.75%</SelectItem>
                  <SelectItem value="10.50">10.50%</SelectItem>
                  <SelectItem value="10.25">10.25%</SelectItem>
                  <SelectItem value="10.00">10.00%</SelectItem>
                  <SelectItem value="9.75">9.75%</SelectItem>
                  <SelectItem value="9.50">9.50%</SelectItem>
                  <SelectItem value="9.25">9.25%</SelectItem>
                  <SelectItem value="9.00">9.00%</SelectItem>
                  <SelectItem value="8.75">8.75%</SelectItem>
                  <SelectItem value="8.50">8.50%</SelectItem>
                  <SelectItem value="8.25">8.25%</SelectItem>
                  <SelectItem value="8.00">8.00%</SelectItem>
                  <SelectItem value="7.75">7.75%</SelectItem>
                  <SelectItem value="7.50">7.50%</SelectItem>
                  <SelectItem value="7.25">7.25%</SelectItem>
                  <SelectItem value="7.00">7.00%</SelectItem>
                  <SelectItem value="6.75">6.75%</SelectItem>
                  <SelectItem value="6.50">6.50%</SelectItem>
                  <SelectItem value="6.25">6.25%</SelectItem>
                  <SelectItem value="6.00">6.00%</SelectItem>
                  <SelectItem value="5.75">5.75%</SelectItem>
                  <SelectItem value="5.50">5.50%</SelectItem>
                  <SelectItem value="5.25">5.25%</SelectItem>
                  <SelectItem value="5.00">5.00%</SelectItem>
                  <SelectItem value="4.75">4.75%</SelectItem>
                  <SelectItem value="4.50">4.50%</SelectItem>
                  <SelectItem value="4.25">4.25%</SelectItem>
                  <SelectItem value="4.00">4.00%</SelectItem>
                  <SelectItem value="3.75">3.75%</SelectItem>
                  <SelectItem value="3.50">3.50%</SelectItem>
                  <SelectItem value="3.25">3.25%</SelectItem>
                  <SelectItem value="3.00">3.00%</SelectItem>
                  <SelectItem value="2.75">2.75%</SelectItem>
                  <SelectItem value="2.50">2.50%</SelectItem>
                  <SelectItem value="2.25">2.25%</SelectItem>
                  <SelectItem value="2.00">2.00%</SelectItem>
                </SelectContent>
              </Select>
              {errors.interestRate && (
                <p className="text-sm text-red-500">
                  {errors.interestRate.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 12: Employment & income */}
        {step === 12 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                Employment & income
              </CardTitle>
              <CardDescription>
                Enter your total household income before taxes so we can match you with qualified programs.
              </CardDescription>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="employmentStatus" className="text-base font-medium">
                  Employment status
                </Label>
                <Select
                  value={watch("employmentStatus")}
                  onValueChange={(value) => {
                    setValue("employmentStatus", value);
                    trigger("employmentStatus");
                  }}
                >
                  <SelectTrigger className="h-12 text-base border-2 hover:border-primary hover:shadow-md transition-all duration-300 mt-2">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Self-Employed">Self-employed</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                    <SelectItem value="Not Employed">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentStatus && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.employmentStatus.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="income" className="text-base font-medium">
                  Annual income (before taxes)
                </Label>
                <Input
                  id="income"
                  type="text"
                  value={incomeInput || (income > 0 ? formatCurrency(income) : "")}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    setIncomeInput(rawValue ? formatCurrency(parseInt(rawValue, 10)) : "");
                    if (rawValue) {
                      const numValue = parseInt(rawValue, 10);
                      if (numValue >= 1) {
                        setValue("income", numValue);
                      }
                    }
                  }}
                  onFocus={(e) => {
                    setIncomeInput(income > 0 ? income.toString() : "");
                  }}
                  onBlur={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    if (rawValue) {
                      const numValue = parseInt(rawValue, 10);
                      if (numValue >= 1) {
                        setValue("income", numValue);
                      }
                    }
                    setIncomeInput("");
                  }}
                  placeholder="e.g. 120,000"
                  className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-300 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 mt-2 ${errors.income
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : !errors.income && income > 0
                        ? "border-green-500 focus:border-green-500 focus:ring-green-200"
                        : "border-slate-300 focus:border-primary"
                    }`}
                />
                {errors.income && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.income.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 13: Credit Rating */}
        {step === 13 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                What's Your Credit Rating?
              </CardTitle>
              <CardDescription>
                Select the range that best describes your credit score
              </CardDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  value: "Excellent",
                  label: "Excellent",
                  description: "680 or above",
                  color: "text-green-600",
                  icon: "⭐",
                },
                {
                  value: "Good",
                  label: "Good",
                  description: "620-679",
                  color: "text-blue-600",
                  icon: "👍",
                },
                {
                  value: "Average",
                  label: "Average",
                  description: "550-619",
                  color: "text-yellow-600",
                  icon: "📊",
                },
                {
                  value: "Poor",
                  label: "Poor",
                  description: "549 or below",
                  color: "text-red-600",
                  icon: "📉",
                },
                {
                  value: "Needs Improvement",
                  label: "Don't Know",
                  description: "",
                  color: "text-slate-500",
                  icon: "❓",
                },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:border-primary hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] text-center ${watch("creditRating") === option.value
                      ? "border-primary bg-primary/5 shadow-lg scale-105 ring-2 ring-primary/20"
                      : "border-slate-200 bg-white"
                    }`}
                  onClick={() => {
                    setValue("creditRating", option.value);
                    setTimeout(() => nextStep(), 300);
                  }}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl transition-all duration-300 ${watch("creditRating") === option.value
                        ? "bg-primary text-white scale-110 shadow-lg"
                        : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {option.icon}
                  </div>
                  <div className={`font-semibold text-lg transition-colors duration-300 ${watch("creditRating") === option.value ? "text-primary" : "text-slate-900"
                    }`}>
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-slate-600 mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.creditRating && (
              <p className="text-sm text-red-500">
                {errors.creditRating.message}
              </p>
            )}
          </div>
        )}

        {/* Step 14: Bankruptcy/Foreclosure */}
        {step === 14 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">Financial History</CardTitle>
              <CardDescription>
                Have you had a bankruptcy or foreclosure in the last 2 years?
              </CardDescription>
            </div>
            <div className="grid gap-4">
              {[
                {
                  value: "No",
                  label: "No",
                  description: "No bankruptcy or foreclosure",
                  status: "clean",
                },
                {
                  value: "Bankruptcy",
                  label: "Bankruptcy",
                  description: "I have had a bankruptcy in the last 2 years",
                  status: "warning",
                },
                {
                  value: "Foreclosure",
                  label: "Foreclosure",
                  description: "I have had a foreclosure in the last 2 years",
                  status: "warning",
                },
                {
                  value: "Both",
                  label: "Both",
                  description: "I have had both bankruptcy and foreclosure",
                  status: "critical",
                },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-primary hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] ${watch("bankruptcy") === option.value
                      ? "border-primary bg-primary/5 shadow-lg scale-[1.02] ring-2 ring-primary/20"
                      : "border-slate-200 bg-white"
                    }`}
                  onClick={() => {
                    setValue("bankruptcy", option.value);
                    setTimeout(() => nextStep(), 300);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${watch("bankruptcy") === option.value
                          ? "border-primary bg-primary scale-110"
                          : "border-slate-300"
                        }`}
                    >
                      {watch("bankruptcy") === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-lg transition-colors duration-300 ${watch("bankruptcy") === option.value ? "text-primary" : "text-slate-900"
                        }`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {option.description}
                      </div>
                    </div>
                    {option.status === "clean" && (
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    )}
                    {option.status === "warning" && (
                      <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                    )}
                    {option.status === "critical" && (
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.bankruptcy && (
              <p className="text-sm text-red-500">
                {errors.bankruptcy.message}
              </p>
            )}
          </div>
        )}

        {/* Step 15: Mortgage Late Payments */}
        {step === 15 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">Mortgage Payment History</CardTitle>
              <CardDescription>
                How many late payments have you had on your mortgage in the past 12 months?
              </CardDescription>
            </div>
            <div className="grid gap-4">
              {[
                {
                  value: "0",
                  label: "0",
                  description: "No late payments",
                },
                {
                  value: "1",
                  label: "1",
                  description: "One late payment",
                },
                {
                  value: "2",
                  label: "2+",
                  description: "Two or more late payments",
                },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:border-primary hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] ${watch("numMortgageLates") === option.value
                      ? "border-primary bg-primary/5 shadow-lg scale-[1.02] ring-2 ring-primary/20"
                      : "border-slate-200 bg-white"
                    }`}
                  onClick={() => {
                    setValue("numMortgageLates", option.value);
                    setTimeout(() => nextStep(), 300);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${watch("numMortgageLates") === option.value
                          ? "border-primary bg-primary scale-110"
                          : "border-slate-300"
                        }`}
                    >
                      {watch("numMortgageLates") === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200"></div>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-lg transition-colors duration-300 ${watch("numMortgageLates") === option.value ? "text-primary" : "text-slate-900"
                        }`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-slate-600">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.numMortgageLates && (
              <p className="text-sm text-red-500">
                {errors.numMortgageLates.message}
              </p>
            )}
          </div>
        )}

        {/* Step 16: Contact Info */}
        {step === 16 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CardTitle className="text-2xl mb-2">
                Contact Information
              </CardTitle>
              <CardDescription>
                Finally, let's get your contact details to send you your options
              </CardDescription>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="firstName" className="text-base font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    className={`h-12 px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-300 text-slate-900 placeholder-slate-500 ${errors.firstName
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : watch("firstName") && !errors.firstName && watch("firstName").length >= 1
                          ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                          : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    placeholder="Enter your first name *"
                  />
                  {watch("firstName") && !errors.firstName && watch("firstName").length >= 1 && (
                    <CheckCircle2 className="absolute right-3 top-9 w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                  )}
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <Label htmlFor="lastName" className="text-base font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                    className={`h-12 px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-300 text-slate-900 placeholder-slate-500 ${errors.lastName
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : watch("lastName") && !errors.lastName && watch("lastName").length >= 1
                          ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                          : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    placeholder="Enter your last name *"
                  />
                  {watch("lastName") && !errors.lastName && watch("lastName").length >= 1 && (
                    <CheckCircle2 className="absolute right-3 top-9 w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                  )}
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Enter a valid email address",
                      },
                    })}
                    className={`h-12 px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-300 text-slate-900 placeholder-slate-500 ${errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : watch("email") && !errors.email && /^\S+@\S+$/i.test(watch("email"))
                          ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                          : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    placeholder="Enter your email address *"
                  />
                  {watch("email") && !errors.email && /^\S+@\S+$/i.test(watch("email")) && (
                    <CheckCircle2 className="absolute right-3 top-9 w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                  )}
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <Label htmlFor="phone" className="text-base font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, '');
                      // Limit to 10 digits
                      const limitedValue = value.slice(0, 10);
                      setValue("phone", limitedValue);
                      trigger("phone");
                    }}
                    className={`h-12 px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-300 text-slate-900 placeholder-slate-500 ${errors.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : watch("phone") && !errors.phone && /^\d{10}$/.test(watch("phone"))
                          ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                          : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    placeholder="Phone Number *"
                    pattern="[0-9]{10}"
                    title="Phone number must be exactly 10 digits"
                  />
                  {watch("phone") && !errors.phone && /^\d{10}$/.test(watch("phone")) && (
                    <CheckCircle2 className="absolute right-3 top-9 w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                  )}
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {!isGoDomain && (
              <>
                <label className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed">
                  <input type="hidden" id="leadid_tcpa_disclosure" className="hidden" />
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-primary"
                      {...register("smsConsent")}
                    />
                    <span>
                      I agree to receive calls and text messages from MortgageCo at the
                      phone number provided, including via automated technology, regarding
                      my mortgage application. Message frequency varies. Message and data
                      rates may apply. Consent is not required to purchase. Reply STOP to
                      stop, HELP for help. View our{" "}
                      <a href="/sms-terms" className="text-primary underline">
                        SMS Terms
                      </a>{" "}
                      and{" "}
                      <a href="/privacy-policy" className="text-primary underline">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </div>
                </label>
                {errors.smsConsent && (
                  <p className="text-sm text-red-500 mt-2">{errors.smsConsent.message}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="min-w-[120px] hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Previous
          </Button>

          <Button
            type="button"
            onClick={nextStep}
            variant={step === 16 ? "hero" : "default"}
            disabled={step === 16 && (isSubmittingLocal || externalIsSubmitting)}
            className="min-w-[120px] hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {step === 16 && (isSubmittingLocal || externalIsSubmitting) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {step === 16 ? "Complete Application" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UniversalService;
