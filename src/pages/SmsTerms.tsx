import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SmsTerms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
            SMS Terms & Conditions
          </h1>

          <div className="prose prose-lg max-w-none text-foreground space-y-6">
            <p className="text-sm text-muted-foreground">Last Updated: January 2025</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Consent to Receive Text Messages</h2>
            <p>
              By providing your mobile phone number and opting in to receive text messages from
              Lender Locate LLC (NMLS #2719501), you consent to receive recurring automated
              transactional text messages related to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Loan application status updates</li>
              <li>Document submission requests and reminders</li>
              <li>Appointment confirmations and scheduling</li>
              <li>Account and membership notifications</li>
            </ul>
            <p>
              These messages are transactional in nature and relate directly to your loan
              application or account activity. No marketing or promotional content is sent via this
              channel.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Message Frequency</h2>
            <p>
              Message frequency varies based on your application status. You may receive multiple
              messages per week during active application periods.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Message and Data Rates</h2>
            <p>
              Message and data rates may apply. Check with your wireless carrier for details about
              your messaging plan.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Opt-Out Instructions</h2>
            <p>You may opt out at any time by replying STOP to any message.</p>
            <p>
              After opting out, you will receive a one-time confirmation message. You will no
              longer receive text messages from us unless you opt in again.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Help</h2>
            <p>
              For help, reply HELP to any message, call us at{" "}
              <a
                href="tel:+18667561777"
                className="text-secondary hover:underline font-semibold"
              >
                866-756-1777
              </a>
              , or email{" "}
              <a
                href="mailto:contact@lenderlocate.com"
                className="text-secondary hover:underline font-semibold"
              >
                contact@lenderlocate.com
              </a>
              .
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Carrier Disclaimer</h2>
            <p>
              Carriers are not liable for delayed or undelivered messages. Message delivery is
              subject to effective transmission from your network operator.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Consent Not Required for Purchase</h2>
            <p>
              Your consent to receive text messages is not a condition of purchasing any goods or
              services or obtaining a loan.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Privacy</h2>
            <p>
              We do not sell, rent, or share your mobile phone number with third parties for their
              marketing purposes. All categories exclude text messaging originator opt-in data and
              consent; this information will not be shared with any third parties.
            </p>
            <p>
              View our full{" "}
              <a href="/privacy-policy" className="text-secondary hover:underline font-semibold">
                Privacy Policy
              </a>{" "}
              for complete details on how we handle your personal information.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Supported Carriers</h2>
            <p>
              Major carriers supported include AT&amp;T, Verizon, T-Mobile, and most regional
              carriers. Service may not be available on all carriers.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
            <p>
              Lender Locate LLC
              <br />
              NMLS #2719501
              <br />
              5203 Juan Tabo Blvd NE, Ste 2B
              <br />
              Albuquerque, NM 87111
              <br />
              Phone: 866-756-1777
              <br />
              Email: contact@lenderlocate.com
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SmsTerms;
