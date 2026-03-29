import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import AutoComplete from "../AutoComplete";
import states from "@/lib/states";

const Service1 = ({
  currentStep,
  selectedService,
  register,
  watch,
  setValue,
  formState,
  nextStep,
}: any) => {
  // service1 now uses react-hook-form methods passed from parent
  const errors = formState?.errors || {};

  // Watch slider values
  const homeValue = watch("homeValue") || 250000;
  const mortgageBalance = watch("mortgageBalance") || 150000;

  // State for manual address entry
  const [showManualAddress, setShowManualAddress] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddressSelect = (addr: any) => {
    if (!addr) return;
    const { address1, city, state, zipCode } = addr;
    // Keep backward-compatible `propertyAddress` for the heloc form,
    // but also set the individual fields so validation and later steps
    // can rely on them (matches Service2 behavior).
    setValue("propertyAddress", address1 || "");
    setValue("city", city || "");
    setValue("state", state || "");
    setValue("zip", zipCode || "");
    setShowManualAddress(false);

    // Auto-advance to next step after address selection
    // setTimeout(() => nextStep(), 500);
    nextStep();
  };
  return (
    <>
      {/* Step 1: How much is your home worth? */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <CardTitle className="text-2xl mb-2">
              How much is your home worth?
            </CardTitle>
            <CardDescription>
              Use the slider to select your estimated home value
            </CardDescription>
          </div>
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Home Value: {formatCurrency(homeValue)}
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[homeValue]}
                onValueChange={(value) => setValue("homeValue", value[0])}
                min={50000}
                max={10000000}
                step={10000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>$50,000</span>
              <span>$10,000,000</span>
            </div>
            {errors.homeValue && (
              <p className="text-sm text-red-500">{errors.homeValue.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Approximate Mortgage Balance */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <CardTitle className="text-2xl mb-2">
              Approximate Mortgage Balance
            </CardTitle>
            <CardDescription>
              Use the slider to select your current outstanding mortgage balance
            </CardDescription>
          </div>
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Mortgage Balance: {formatCurrency(mortgageBalance)}
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[mortgageBalance]}
                onValueChange={(value) => setValue("mortgageBalance", value[0])}
                min={50000}
                max={1800000}
                step={10000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>$50,000</span>
              <span>$1,800,000</span>
            </div>
            {errors.mortgageBalance && (
              <p className="text-sm text-red-500">
                {errors.mortgageBalance.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Military Service */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <CardTitle className="text-2xl mb-2">Military Service</CardTitle>
            <CardDescription>
              Are you or your spouse active or veteran military?
            </CardDescription>
          </div>
          <div className="grid gap-4">
            <div
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md ${
                watch("military") === "yes"
                  ? "border-primary bg-slate-50 shadow-md"
                  : "border-slate-200 bg-white"
              }`}
              onClick={() => {
                setValue("military", "yes");
                // Auto-advance to next step after selection
                // setTimeout(() => nextStep(), 500);
                nextStep();
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    watch("military") === "yes"
                      ? "border-primary bg-primary"
                      : "border-slate-300"
                  }`}
                >
                  {watch("military") === "yes" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-lg text-slate-900">
                    Yes
                  </div>
                  <div className="text-sm text-slate-600">
                    I am or my spouse is active or veteran military
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md ${
                watch("military") === "no"
                  ? "border-primary bg-slate-50 shadow-md"
                  : "border-slate-200 bg-white"
              }`}
              onClick={() => {
                setValue("military", "no");
                // Auto-advance to next step after selection
                // setTimeout(() => nextStep(), 500);
                nextStep();
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    watch("military") === "no"
                      ? "border-primary bg-primary"
                      : "border-slate-300"
                  }`}
                >
                  {watch("military") === "no" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-lg text-slate-900">No</div>
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

      {/* Step 4: Credit Rating */}
      {currentStep === 5 && (
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
                value: "excellent",
                label: "Excellent",
                description: "680 or above",
                color: "text-green-600",
                icon: "⭐",
              },
              {
                value: "good",
                label: "Good",
                description: "620-679",
                color: "text-blue-600",
                icon: "👍",
              },
              {
                value: "average",
                label: "Average",
                description: "550-619",
                color: "text-yellow-600",
                icon: "📊",
              },
              {
                value: "poor",
                label: "Poor",
                description: "549 or below",
                color: "text-red-600",
                icon: "📉",
              },
              {
                value: "unknown",
                label: "Don't Know",
                description: "",
                color: "text-slate-500",
                icon: "❓",
              },
            ].map((option) => (
              <div
                key={option.value}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md text-center ${
                  watch("creditRating") === option.value
                    ? "border-primary bg-slate-50 shadow-md"
                    : "border-slate-200 bg-white"
                }`}
                onClick={() => {
                  setValue("creditRating", option.value);
                  // Auto-advance to next step after selection
                  //   setTimeout(() => nextStep(), 500);
                  nextStep();
                }}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
                    watch("creditRating") === option.value
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {option.icon}
                </div>
                <div className="font-semibold text-lg text-slate-900">
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
              Please select your credit rating
            </p>
          )}
        </div>
      )}

      {/* Step 5: Bankruptcy/Foreclosure */}
      {currentStep === 6 && (
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
                value: "no",
                label: "No",
                description: "No bankruptcy or foreclosure",
                status: "clean",
              },
              {
                value: "bankruptcy",
                label: "Bankruptcy",
                description: "I have had a bankruptcy in the last 7 years",
                status: "warning",
              },
              {
                value: "foreclosure",
                label: "Foreclosure",
                description: "I have had a foreclosure in the last 7 years",
                status: "warning",
              },
              {
                value: "both",
                label: "Both",
                description: "I have had both bankruptcy and foreclosure",
                status: "critical",
              },
            ].map((option) => (
              <div
                key={option.value}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-slate-50 hover:shadow-md ${
                  watch("bankruptcy") === option.value
                    ? "border-primary bg-slate-50 shadow-md"
                    : "border-slate-200 bg-white"
                }`}
                onClick={() => {
                  setValue("bankruptcy", option.value);
                  // Auto-advance to next step after selection
                  //   setTimeout(() => nextStep(), 500);
                  nextStep();
                }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      watch("bankruptcy") === option.value
                        ? "border-primary bg-primary"
                        : "border-slate-300"
                    }`}
                  >
                    {watch("bankruptcy") === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-slate-900">
                      {option.label}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {option.description}
                    </div>
                  </div>
                  {option.status === "clean" && (
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  )}
                  {option.status === "warning" && (
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  )}
                  {option.status === "critical" && (
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.bankruptcy && (
            <p className="text-sm text-red-500">
              Please select a bankruptcy status
            </p>
          )}
        </div>
      )}

      {/* Step 6: Property Address */}
      {currentStep === 7 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <CardTitle className="text-2xl mb-2">Property Address</CardTitle>
            <CardDescription>
              Enter the address of the property you want to refinance
            </CardDescription>
          </div>
          <div className="space-y-4">
            <Label htmlFor="propertyAddress" className="text-base font-medium">
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
                <Input
                  {...register("propertyAddress", {
                    required: "Property address is required",
                  })}
                  placeholder="Enter your street address *"
                  className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${
                    errors.propertyAddress
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      {...register("zip")}
                      placeholder="Zip Code *"
                      className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${
                        errors.zip
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                    {errors.zip && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.zip.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...register("city")}
                      placeholder="City *"
                      className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${
                        errors.city
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <select
                      {...register("state")}
                      className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 w-full text-slate-900 ${
                        errors.state
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
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

      {/* Step 8: Contact Info */}
      {currentStep === 8 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <CardTitle className="text-2xl mb-2">Contact Information</CardTitle>
            <CardDescription>
              Finally, let's get your contact details to send you your options
            </CardDescription>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-base font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${
                    errors.firstName
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Enter your first name *"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-base font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${
                    errors.lastName
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Enter your last name *"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
                  className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Enter your email address *"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                  className={`h-12 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-slate-900 placeholder-slate-500 ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Phone Number *"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="Phone number must be exactly 10 digits"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Service1;
