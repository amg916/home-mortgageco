import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ReadyToSpeakModalProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
  isLoading?: boolean;
}

const ReadyToSpeakModal = ({ open, onYes, onNo, isLoading = false }: ReadyToSpeakModalProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center bg-primary/10">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            One Last Question!
          </DialogTitle>
          <DialogDescription className="text-base mt-4">
            Are you ready to speak with a mortgage specialist within 48 hours?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={onYes}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Yes, I'm Ready to Speak with a Specialist
          </Button>
          
          <Button
            onClick={onNo}
            disabled={isLoading}
            variant="outline"
            className="w-full border-red-600 text-red-600 hover:bg-red-50 h-12 text-base font-semibold"
          >
            No, I'll Review My Options First
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-4">
          Your information has been submitted. A specialist will contact you based on your preference.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ReadyToSpeakModal;

