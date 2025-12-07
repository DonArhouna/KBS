
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface AdminCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const AdminCard = ({ title, children, className = "" }: AdminCardProps) => {
  return (
    <Card className={`bg-white rounded-2xl shadow-lg border-0 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-kbs-green to-kbs-light text-white rounded-t-2xl">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white rounded-b-2xl">
        {children}
      </CardContent>
    </Card>
  );
};

export default AdminCard;
