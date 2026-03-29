import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

/**
 * Decoy success page for bots
 * Real users never see this - only bots that fail honeypot checks
 */
const ApplicationReceived = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center px-4 py-20">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary mb-4">
                        Application Received!
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        Thank you for your interest! A mortgage specialist will contact you
                        within 24-48 hours to discuss your options.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Reference ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ApplicationReceived;
