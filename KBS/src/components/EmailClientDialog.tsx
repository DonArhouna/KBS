
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { openEmailClient } from "@/services/emailService";

interface EmailClientDialogProps {
  children: React.ReactNode;
}

const EmailClientDialog = ({ children }: EmailClientDialogProps) => {
  const handleEmailClient = (clientType: 'gmail' | 'outlook' | 'default') => {
    openEmailClient(clientType);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Choisir un client de messagerie
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            onClick={() => handleEmailClient('gmail')}
            className="w-full justify-start bg-red-600 hover:bg-red-700"
          >
            <Mail className="mr-2 h-4 w-4" />
            Gmail
          </Button>
          <Button
            onClick={() => handleEmailClient('outlook')}
            className="w-full justify-start bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="mr-2 h-4 w-4" />
            Outlook
          </Button>
          <Button
            onClick={() => handleEmailClient('default')}
            className="w-full justify-start bg-gray-600 hover:bg-gray-700"
          >
            <Mail className="mr-2 h-4 w-4" />
            Client par défaut
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailClientDialog;
