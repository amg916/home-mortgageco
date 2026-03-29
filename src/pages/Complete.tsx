import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import Header from "@/components/Header";
import rocketMortgageLogo from "@/assets/rocket-mortgage.png";
import nafLogo from "@/assets/new-american-funding.jpg";

const providers = [
  {
    id: "quicken",
    name: "Quicken Loans",
    title: "Get Your Best Mortgage Rate Today",
    description: [
      "Competitive rates from America's largest mortgage lender",
      "Fast, easy online application process",
      "Expert advisors available to guide you",
      "Trusted by millions of homeowners nationwide",
    ],
    baseUrl: "https://hefty.cc/api/offers/click?offer_id=16",
    logo: rocketMortgageLogo,
  },
  {
    id: "naf",
    name: "New American Funding",
    title: "Flexible Mortgage Solutions for Every Buyer",
    description: [
      "Wide range of loan programs to fit your needs",
      "Bilingual loan officers available",
      "Quick approvals with personalized service",
      "Helping families achieve homeownership since 2003",
    ],
    baseUrl: "https://hefty.cc/api/offers/click?offer_id=17",
    logo: nafLogo,
  },
];

const Complete = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const formData = (location.state as any)?.formData || {};
  const email = formData.email || "";
  const zip = formData.zip || formData.zipCode || "";
  const phone = formData.phone || "";
  const firstName = formData.firstName || formData.first_name || "";
  const lastName = formData.lastName || formData.last_name || "";

  const efTransactionId = new URLSearchParams(location.search).get("ef_transaction_id") || "";
  const sessionId = formData.session_id || "";

  const buildProviderUrl = (baseUrl: string) => {
    const params = new URLSearchParams();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-6">
      <Header />
      <div className="container mx-auto px-4 max-w-3xl mt-12 mb-12">
        {/* Success Message Card */}
        <Card className="mb-6 card-elegant shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          <CardHeader className="text-center pb-6 pt-7">
            <div className="mb-4 animate-in fade-in duration-700">
              <img
                src={logo}
                alt="MortgageCo"
                width={160}
                className="mx-auto drop-shadow-sm"
              />
            </div>
            <div className="flex justify-center mb-4 animate-in zoom-in duration-700 delay-150">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-lg ring-3 ring-green-50">
                <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={2.5} />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary mt-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Application Received
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-7 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <p className="text-foreground leading-relaxed text-center text-lg font-semibold">
              Thank you for your interest in our services.
            </p>
            <p className="text-muted-foreground leading-relaxed text-center text-sm max-w-xl mx-auto">
              We have received your application and will review it carefully.
              Based on the information provided, we may need additional time to
              process your request.
            </p>
            <p className="text-muted-foreground leading-relaxed text-center text-sm max-w-xl mx-auto mt-3">
              If we need any further information, someone from our team will reach
              out to you.
            </p>
          </CardContent>
        </Card>

        {/* Providers Section */}
        <Card className="mb-6 card-elegant shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-200 via-red-300 to-red-200"></div>
          <CardHeader className="text-center pb-4 pt-6 bg-gradient-to-b from-background to-muted/30">
            <CardTitle className="text-lg md:text-xl font-bold text-primary mb-2">
              While you wait, we have matched you with the following
              professionals in your area:
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium">
              We highly recommend comparing quotes from both.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pb-6 px-5">
            {providers.map((provider, index) => (
              <div
                key={provider.id}
                onClick={() => {
                  const url = buildProviderUrl(provider.baseUrl);
                  window.open(url, "_blank");
                }}
                className="border-2 border-red-200 rounded-lg p-4 bg-white hover:shadow-lg hover:border-red-400 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 to-red-50/0 group-hover:from-red-50/50 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row gap-4 items-start relative z-10">
                  {/* Logo */}
                  <div className="flex-shrink-0 flex items-center justify-center sm:justify-start w-full sm:w-auto">
                    <div className="w-28 h-16 bg-white rounded-md flex items-center justify-center border-2 border-gray-200 p-2 group-hover:border-gray-300 group-hover:shadow-md transition-all duration-300">
                      {provider.logo ? (
                        <img
                          src={provider.logo}
                          alt={provider.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-xs text-gray-400 text-center px-2">
                          {provider.name}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-primary mb-2 group-hover:text-primary/90 transition-colors">
                      {provider.title}
                    </h3>
                    <ul className="space-y-1">
                      {provider.description.map((item, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start group-hover:text-foreground/80 transition-colors">
                          <span className="text-primary mr-2 mt-0.5 flex-shrink-0 font-bold">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Complete;
