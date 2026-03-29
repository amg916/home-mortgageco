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
import Service2 from "@/components/Heloc/Service2";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { useTokenCapture } from "@/hooks/useTokenCapture";
import { toast } from "sonner";
import { usePreserveParams } from "@/hooks/usePreserveParams";

const Purchase = () => {
  const navigate = usePreserveParams();
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { isSubmitting, error, submitLead } = useLeadSubmission();
  const { jornayaLeadId, trustedFormCertUrl, isLoading: tokensLoading } = useTokenCapture();
  const [formData, setFormData] = useState<any>({});

  // Add selection step as step 1; other steps shift by +1
  // Service2 has 7 form steps (2-8), so total is 8
  // UniversalService has 16 form steps, so total is 17
  const totalSteps = selectedService === "Purchase" ? 8 : 17;
  const progress = (currentStep / totalSteps) * 100;

  // Function to update step from child component
  const updateStep = (step: number) => {
    setCurrentStep(step);
  };

  // Handle form submission - submit directly without modal
  const handleFormSubmit = async (data: any) => {
    setFormData(data);
    const tokens = { jornayaLeadId, trustedFormCertUrl };
    const session_id = sessionStorage.getItem("hftp_sid") || data.session_id;
    const enrichedData = session_id ? { ...data, session_id } : data;

    const success = await submitLead("Purchase", enrichedData, tokens, true);

    if (success) {
      toast.success("Application submitted successfully!");
      const creditRating = enrichedData.creditRating || "";
      const normalizedCredit = creditRating.toLowerCase();
      const hasValidCredit = normalizedCredit === "excellent" || normalizedCredit === "good" || normalizedCredit === "average";
      if (hasValidCredit) {
        navigate("/extras", { state: { formData: enrichedData, redirectPath: "/complete" } });
      } else {
        navigate("/complete", { state: { formData: enrichedData } });
      }
    } else {
      toast.error(error || "Failed to submit application. Please try again.");
    }
  };

  // If the user navigated from a service card with a preselected service, auto-select and advance
  useEffect(() => {
    const pre = (location.state as any)?.preselectedService as
      | string
      | undefined;
    if (pre) {
      setSelectedService(pre);
      // Jump to step 2 (the first form step)
      setCurrentStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

          {currentStep !== 1 && (
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2 text-primary">
                Mortgage Rates Just Changed — Millions Are Refinancing or
                Cashing Out
              </h1>
              <p className="text-muted-foreground text-lg">
                Low rates. Quick approvals. You could save hundreds every month.{" "}
              </p>
            </div>
          )}

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
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CardTitle className="text-2xl mb-2">
                    Which service are you looking for?
                  </CardTitle>
                  <CardDescription>
                    Select a service to get the right application flow
                  </CardDescription>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["HELOC", "Cash Out", "Refinance", "Purchase", "Sell"].map(
                    (svc) => (
                      <button
                        key={svc}
                        onClick={() => {
                          if (svc === "HELOC")
                            return navigate("/heloc", {
                              state: { preselectedService: svc },
                            });
                          if (svc === "Cash Out") return navigate("/cashout");
                          if (svc === "Refinance")
                            return navigate("/refinance");
                          if (svc === "Sell")
                            return navigate("/sell", {
                              state: { preselectedService: svc },
                            });
                          setSelectedService(svc);
                        }}
                        className={`p-6 rounded-lg border-2 hover:shadow-md transition-all duration-200 ${
                          selectedService === svc
                            ? "bg-primary text-primary-foreground shadow-md border-primary"
                            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      >
                        <div className="font-semibold text-lg">{svc}</div>
                      </button>
                    )
                  )}
                </div>
                <div className="flex gap-2 pt-6 w-full justify-between">
                  <Button variant="outline" disabled>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      if (!selectedService) return;
                      setCurrentStep(2);
                    }}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {selectedService && currentStep > 1 && (
              <>
                {selectedService === "Purchase" ? (
                  <Service2
                    selectedService={selectedService}
                    updateStep={updateStep}
                    onComplete={handleFormSubmit}
                    isSubmitting={isSubmitting}
                  />
                ) : (
                  <UniversalService
                    selectedService={selectedService}
                    updateStep={updateStep}
                    onComplete={handleFormSubmit}
                    isSubmitting={isSubmitting}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* TCPA Text for UniversalService (if used) */}
        {currentStep === 17 && selectedService !== "Purchase" && (
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

export default Purchase;
