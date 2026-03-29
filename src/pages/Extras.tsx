import { useState, useEffect } from "react";
  import { useLocation } from "react-router-dom";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Progress } from "@/components/ui/progress";
  import Header from "@/components/Header";
  import { ArrowLeft, CheckCircle2, Home, Shield, Wrench, LayoutGrid, Sun, Droplets, Waves, Truck, Car, Lock, CreditCard } from "lucide-react";
  import { usePreserveParams } from "@/hooks/usePreserveParams";

  interface Offer {
    id: string;
    title: string;
    question: string;
    baseUrl: string;
    isFinal: boolean;
    icon: React.ReactNode;
    color: string;
    description: string;
  }

  const offers: Offer[] = [
    {
      id: "allied-move-quote",
      title: "Moving Services",
      question: "Are you planning a move or considering relocating?",
      description: "Get free moving quotes from top-rated moving companies in your area.",
      baseUrl: "https://hefty.cc/api/offers/click?offer_id=18",
      isFinal: false,
      icon: <Truck className="w-8 h-8" />,
      color: "from-red-500 to-red-600",
    },
    {
      id: "nerdwallet-debt-relief",
      title: "Debt Relief",
      question: "Want to reduce your monthly debt payments?",
      description: "See if you qualify for a debt relief program that could lower what you owe.",
      baseUrl: "https://hefty.cc/api/offers/click?offer_id=21",
      isFinal: false,
      icon: <CreditCard className="w-8 h-8" />,
      color: "from-cyan-500 to-cyan-600",
    },
    {
        id: "vivint-free-install",
        title: "Home Security",
        question: "Want to protect your home with a free professional security install?",
        description: "Get a free Vivint smart home security installation — no upfront cost.",
        baseUrl: "https://hefty.cc/api/offers/click?offer_id=22",
        isFinal: false,
        icon: <Lock className="w-8 h-8" />,
        color: "from-sky-500 to-sky-600",
      },
      {
      id: "car-insurance-masters",
      title: "Car Insurance",
      question: "Want to save money on your car insurance?",
      description: "Compare rates from top insurance providers and save up to 40% today.",
      baseUrl: "https://hefty.cc/api/offers/click?offer_id=19",
      isFinal: false,
      icon: <Car className="w-8 h-8" />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      id: "walkin-tub",
      title: "Walk-In Tub",
      question: "Interested in a safer, more comfortable bathing experience?",
      description: "Learn about walk-in tub options with a free no-obligation quote.",
      baseUrl: "https://hefty.cc/api/offers/click?offer_id=15",
      isFinal: false,
      icon: <Waves className="w-8 h-8" />,
      color: "from-teal-500 to-teal-600",
    },
    {
      id: "windows",
      title: "Energy-Efficient Windows",
      question: "Want to cut your energy bills and boost curb appeal?",
      description: "Get new, energy-efficient windows with a free quote today.",
      baseUrl: "https://hefty.cc/api/offers/click?offer_id=14",
      isFinal: false,
      icon: <LayoutGrid className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
    },
    {
      id: "warranty",
      title: "AHS Home Warranty",
      question: "Tired of paying out of pocket for repairs?",
      description: "Learn how a home warranty can help protect your budget.",
      baseUrl: "https://hefty.cc/api/offers/click?offer_id=12",
      isFinal: false,
      icon: <Wrench className="w-8 h-8" />,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "adt",
      title: "ADT Security",
      question: "Ready to protect your home with professional security?",
      description: "Get a quick, no-obligation quote from ADT.",
      baseUrl: "https://hefty.cc/api/offers/click?offer_id=13",
      isFinal: true,
      icon: <Shield className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const Extras = () => {
    const navigate = usePreserveParams();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [redirectPath, setRedirectPath] = useState("/thank-you");

    const efTransactionId = new URLSearchParams(location.search).get("ef_transaction_id") || "";

    useEffect(() => {
      const stateData = (location.state as any)?.formData || {};
      const stateRedirect = (location.state as any)?.redirectPath;
      const storedData = localStorage.getItem("extrasFormData");
      const storedRedirect = localStorage.getItem("extrasRedirectPath");

      const hasValidData = (data: any) => {
        return data && (
          data.firstName ||
          data.first_name ||
          data.email ||
          data.phone ||
          Object.keys(data).length > 0
        );
      };

      if (hasValidData(stateData)) {
        setFormData(stateData);
        localStorage.setItem("extrasFormData", JSON.stringify(stateData));

        if (stateRedirect) {
          setRedirectPath(stateRedirect);
          localStorage.setItem("extrasRedirectPath", stateRedirect);
        } else if (storedRedirect) {
          setRedirectPath(storedRedirect);
        }
      } else if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (hasValidData(parsedData)) {
            setFormData(parsedData);
            if (storedRedirect) {
              setRedirectPath(storedRedirect);
            }
          }
        } catch (e) {
        }
      }
    }, [location, navigate]);

    useEffect(() => {
      if (!formData || Object.keys(formData).length === 0) {
        return;
      }

      const creditRating = formData.creditRating || formData.creditGrade || formData.credit_grade || "";
      const normalizedCredit = creditRating?.toLowerCase() || "";

      const hasValidCredit = normalizedCredit === "excellent" ||
        normalizedCredit === "good" ||
        normalizedCredit === "average";

      if (!hasValidCredit && creditRating) {
        const redirectTo = redirectPath || "/complete";
        navigate(redirectTo, { state: { formData }, replace: true });
      }
    }, [formData, navigate, redirectPath]);

    useEffect(() => {
      if (!formData || Object.keys(formData).length === 0) {
        return;
      }

      if (!(window as any).gtag) {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=AW-17489312990";
        document.head.appendChild(script);

        script.onload = () => {
          (window as any).dataLayer = (window as any).dataLayer || [];
          function gtag(...args: any[]) {
            (window as any).dataLayer.push(args);
          }
          (window as any).gtag = gtag;
          gtag("js", new Date());
          gtag("config", "AW-17489312990");
          checkAndFireConversion();
        };
      } else {
        checkAndFireConversion();
      }

      function checkAndFireConversion() {
        const creditRating = formData.creditRating || formData.creditGrade || formData.credit_grade || "";
        const bankruptcy = formData.bankruptcy || "";
        const normalizedCredit = creditRating?.toLowerCase() || "";
        const hasValidCredit = normalizedCredit === "excellent" ||
          normalizedCredit === "good" ||
          normalizedCredit === "average";
        const hasNoBankruptcy = bankruptcy === "No" || bankruptcy === "";

        if (hasValidCredit && hasNoBankruptcy && typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "conversion", {
            send_to: "AW-17489312990/4Dc5CKb8ir0bEN75xpNB",
            value: 1.0,
            currency: "USD",
          });
        }
      }
    }, [formData]);

    const buildOfferUrl = (baseUrl: string) => {
      const params = new URLSearchParams();
      const email = formData.email || "";
      const zip = formData.zip || formData.zipCode || formData.zip_code || "";
      const phone = formData.phone || "";
      const firstName = formData.firstName || formData.first_name || "";
      const lastName = formData.lastName || formData.last_name || "";
      const sessionId = formData.session_id || "";

      if (email) params.append("email", email);
      if (zip) params.append("zip", zip.toString());
      if (phone) params.append("phone", phone.toString().replace(/\D/g, ""));
      if (firstName) params.append("fname", firstName);
      if (lastName) params.append("lname", lastName);
      if (efTransactionId) params.append("sub1", efTransactionId);
      if (sessionId) params.append("session_id", sessionId);

      const queryString = params.toString();
      const separator = baseUrl.includes("?") ? "&" : "?";
      return queryString ? `${baseUrl}${separator}${queryString}` : baseUrl;
    };

    const handleYes = (offer: Offer) => {
      const offerUrl = buildOfferUrl(offer.baseUrl);

      const newTab = window.open(offerUrl, "_blank");
      if (!newTab || newTab.closed) {
        const tempLink = document.createElement("a");
        tempLink.href = offerUrl;
        tempLink.target = "_blank";
        tempLink.rel = "noopener noreferrer";
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      } else {
        newTab.focus();
      }

      if (offer.isFinal) {
        setTimeout(() => {
          navigate(redirectPath, { state: { formData } });
        }, 500);
      } else {
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 500);
      }
    };

    const handleNo = () => {
      if (offers[currentStep].isFinal) {
        navigate(redirectPath, { state: { formData } });
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    };

    const handleBack = () => {
      if (currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };

    const currentOffer = offers[currentStep];
    const firstName = formData.firstName || formData.first_name || "";
    const progress = ((currentStep + 1) / offers.length) * 100;

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
              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
                Almost done{firstName ? `, ${firstName}!` : "!"}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Based on the data you provided, your home is eligible for immediate upgrades.
                Please select all that apply to view your new mortgage payments.
              </p>
            </div>


          </div>

          <Card className="card-elegant shadow-xl border-0 bg-gradient-to-br from-background/95 to-muted/10 backdrop-blur overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
            <CardContent className="p-8 md:p-12">
              <div className="space-y-8">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${currentOffer.color} text-white shadow-lg mb-6 animate-in zoom-in duration-500`}>
                    {currentOffer.icon}
                  </div>
                  <CardTitle className="text-2xl md:text-3xl mb-3 text-primary">
                    {currentOffer.question}
                  </CardTitle>
                  <CardDescription className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                    {currentOffer.description}
                  </CardDescription>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                  <Button
                    onClick={() => handleYes(currentOffer)}
                    size="lg"
                    className="h-24 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Yes, I'm Interested
                  </Button>
                  <Button
                    onClick={handleNo}
                    size="lg"
                    variant="outline"
                    className="h-24 text-lg font-semibold border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                  >
                    No, Not Now
                  </Button>
                </div>

                {currentStep > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous Question
                    </Button>
                  </div>
                )}


              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  export default Extras;
  
