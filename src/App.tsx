import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Capture URL tracking params (s1, utm_source, etc.) into localStorage immediately
import '@/services/api';
import Index from "./pages/Index";
import Heloc from "./pages/Heloc";
import Cashout from "./pages/Cashout";
import Refinance from "./pages/Refinance";
import NotFound from "./pages/NotFound";
import Purchase from "@/pages/Purchase";
import Sell from "@/pages/Sell";
import ThankYou from "@/pages/ThankYou";
import Complete from "@/pages/Complete";
import Extras from "@/pages/Extras";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsConditions from "@/pages/TermsConditions";
import CCPA from "@/pages/CCPA";
import ApplicationReceived from "@/pages/ApplicationReceived";
import SmsTerms from "@/pages/SmsTerms";
import Contact from "@/pages/Contact";
import Start from "@/pages/Start";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/start" element={<Start />} />
          <Route path="/application-received" element={<ApplicationReceived />} />
          <Route path="/heloc" element={<Heloc />} />
          <Route path="/cashout" element={<Cashout />} />
          <Route path="/refinance" element={<Refinance />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/extras" element={<Extras />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/complete" element={<Complete />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/sms-terms" element={<SmsTerms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ccpa" element={<CCPA />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
