
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SaveButtonProps {
  onClick: () => void;
  isSaving: boolean;
}

const SaveButton = ({ onClick, isSaving }: SaveButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      className="bg-kbs-green hover:bg-kbs-green/90"
      disabled={isSaving}
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enregistrement...
        </>
      ) : (
        <>
          <Save size={16} className="mr-1" /> Enregistrer tous les changements
        </>
      )}
    </Button>
  );
};

export default SaveButton;
