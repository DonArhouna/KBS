
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ActionButtonProps {
  onClick: () => void;
  variant: 'edit' | 'delete' | 'view' | 'primary';
  children: ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const ActionButton = ({ onClick, variant, children, disabled = false, size = 'sm' }: ActionButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'edit':
        return "bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300";
      case 'delete':
        return "bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300";
      case 'view':
        return "bg-green-500 hover:bg-green-600 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300";
      case 'primary':
        return "bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300";
      default:
        return "rounded-xl";
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      className={getVariantStyles()}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
