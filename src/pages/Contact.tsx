import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactUs from "@/components/ContactUs";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24">
        <div className="container mx-auto px-4 max-w-4xl mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            Contact MortgageCo
          </h1>
          <p className="text-muted-foreground">
            Support URL for customer inquiries and SMS program assistance.
          </p>
        </div>
        <ContactUs />
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
