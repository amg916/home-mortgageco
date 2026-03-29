import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import UniversalService from "@/components/Heloc/UniversalService";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { useTokenCapture } from "@/hooks/useTokenCapture";
import { toast } from "sonner";
import { usePreserveParams } from "@/hooks/usePreserveParams";

const Refinance = () => {
  const navigate = usePreserveParams();
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const [selectedService, setSelectedService] = useState<string | null>(
    "Refinance"
  );
  const { isSubmitting, error, submitLead } = useLeadSubmission();
  const { jornayaLeadId, trustedFormCertUrl, isLoading: tokensLoading } = useTokenCapture();

  const totalSteps = 17; // Service selection (step 1) + 16 form steps (combined property use and type into one step)
  const progress = (currentStep / totalSteps) * 100;

  // Auto-advance to step 2 since service is preselected (step 1 is service selection)
  useEffect(() => {
    setCurrentStep(2);
  }, []);

  // Handle form submission - submit directly (modal disabled)
  const handleFormSubmit = async (formData: any) => {
    // Include captured tokens with form submission
    const tokens = {
      jornayaLeadId,
      trustedFormCertUrl
    };

    const session_id = formData.session_id || sessionStorage.getItem("hftp_sid");
    const enrichedFormData = session_id ? { ...formData, session_id } : formData;

    const success = await submitLead("Refinance", enrichedFormData, tokens, false);

    if (success) {
      toast.success("Application submitted successfully!");
      
      const creditRating = enrichedFormData.creditRating || "";
      const normalizedCredit = creditRating.toLowerCase();
      const hasValidCredit = normalizedCredit === "excellent" || 
                            normalizedCredit === "good" || 
                            normalizedCredit === "average";
      
      if (hasValidCredit) {
        navigate("/extras", {
          state: { formData: enrichedFormData, redirectPath: "/thank-you" },
        });
      } else {
        navigate("/complete", {
          state: { formData: enrichedFormData },
        });
      }
    } else {
      toast.error(error || "Failed to submit application. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <Header />
      <div className="container mx-auto px-4 max-w-4xl mt-16">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 bg-primary/5 hover:bg-primary/20 hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 text-primary">
              Refinance Your Mortgage - Lower Your Payments
            </h1>
            <p className="text-muted-foreground text-lg">
              Get better rates, reduce monthly payments, or change your loan
              terms.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-end items-center mb-2">
              <span className="text-base font-semibold text-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-3 bg-muted/70">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>
        </div>

        <Card className="card-elegant shadow-xl border-0 bg-gradient-to-br from-background/95 to-muted/10 backdrop-blur">
          <CardContent className="p-8">
            <UniversalService
              selectedService={selectedService}
              updateStep={setCurrentStep}
              onComplete={handleFormSubmit}
            />
          </CardContent>
        </Card>

        {/* TCPA Text outside the Card shadow - only show on final step */}
        {currentStep === 17 && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 leading-relaxed space-y-2">
              By clicking Complete Application, you agree to: (1) our <a href="https://securerights.org/tc/" className="text-primary underline hover:text-primary/80">TERMS OF USE</a>, which include a Class Waiver and Mandatory Arbitration Agreement, (2) our <a href="https://securerights.org/privacy/" className="text-primary underline hover:text-primary/80">PRIVACY POLICY</a>, and (3) receive notices and other <a href="https://securerights.org/electroniccommunications/" className="text-primary underline hover:text-primary/80">COMMUNICATIONS ELECTRONICALLY</a>. By clicking Complete Application, you: (a) provide your express written consent and binding signature under the ESIGN Act for Leadpoint, Inc. dba SecureRights, a Delaware corporation, to share your information with up to four (4) of its <a href="https://securerights.org/networkmembers/" className="text-primary underline hover:text-primary/80">PREMIER PARTNERS</a> and/or third parties acting on their behalf to contact you via telephone, mobile device (including SMS and MMS) and/or email, including but not limited to texts or calls made using an automated telephone dialing system, AI-generated voice and text messages, or pre-recorded or artificial voice messages, regarding financial services or other offers related to homeownership; (b) understand that your consent is valid even if your telephone number is currently listed on any state, federal, local or corporate Do Not Call list; (c) represent that you are the wireless subscriber or customary user of the wireless number(s) provided with authority to consent; (d) understand your consent is not required in order to obtain any good or service; (e) represent that you have received and reviewed the <a href="https://securerights.org/licenses/" className="text-primary underline hover:text-primary/80">MORTGAGE BROKER DISCLOSURES</a> for your state; and (f) provide your consent under the Fair Credit Reporting Act for SecureRights and/or its <a href="https://securerights.org/networkmembers/" className="text-primary underline hover:text-primary/80">PREMIER PARTNERS</a> to obtain information from your personal credit profile to prequalify you for credit options and connect you with an appropriate partner. You may choose to speak with an individual service provider by dialing (844) 326-3442. Leadpoint, Inc. NMLS 3175.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Refinance;
