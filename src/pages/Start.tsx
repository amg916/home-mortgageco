import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Landmark, DollarSign, RefreshCw, ShoppingCart, Home } from "lucide-react";
import Header from "@/components/Header";
import { useBotProtection } from "@/hooks/useBotProtection";
import { usePreserveParams } from "@/hooks/usePreserveParams";
import AnimatedOnScroll from "@/components/ui/scroll-motion";

const services = [
  {
    key: "heloc",
    icon: Landmark,
    title: "HELOC",
    description: "Access your home's equity with a flexible line of credit",
    path: "/heloc",
    color: "from-blue-500 to-blue-600",
  },
  {
    key: "cashout",
    icon: DollarSign,
    title: "Cash Out",
    description: "Convert your home equity into cash for any purpose",
    path: "/cashout",
    color: "from-purple-500 to-purple-600",
  },
  {
    key: "refinance",
    icon: RefreshCw,
    title: "Refinance",
    description: "Lower your payments or change your loan terms",
    path: "/refinance",
    color: "from-green-500 to-green-600",
  },
  {
    key: "purchase",
    icon: ShoppingCart,
    title: "Purchase",
    description: "Find the perfect mortgage for your new home",
    path: "/purchase",
    color: "from-orange-500 to-orange-600",
  },
  {
    key: "sell",
    icon: Home,
    title: "Sell",
    description: "Maximize your home's value with expert guidance",
    path: "/sell",
    color: "from-red-500 to-red-600",
  },
];

const Start = () => {
  const navigate = usePreserveParams();
  const { isBotDetected } = useBotProtection();

  const handleSelect = (path: string, title: string) => {
    if (isBotDetected()) {
      navigate("/application-received");
      return;
    }
    navigate(path, { state: { preselectedService: title } });
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
        </div>

        <Card className="card-elegant shadow-xl border-0 bg-gradient-to-br from-background/95 to-muted/10 backdrop-blur">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CardTitle className="text-2xl mb-2">
                  Which service are you looking for?
                </CardTitle>
                <CardDescription className="text-base">
                  Select a service to get started with your application
                </CardDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((svc, index) => {
                  const Icon = svc.icon;
                  return (
                    <AnimatedOnScroll key={svc.key} delay={index * 0.04}>
                      <button
                        onClick={() => handleSelect(svc.path, svc.title)}
                        className="w-full p-6 rounded-xl border-2 border-slate-200 bg-white hover:border-primary/50 hover:shadow-lg transition-all duration-200 group text-left"
                      >
                        <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${svc.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-semibold text-lg text-slate-900 mb-1">{svc.title}</div>
                        <p className="text-sm text-muted-foreground">{svc.description}</p>
                      </button>
                    </AnimatedOnScroll>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Start;
