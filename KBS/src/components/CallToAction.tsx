
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type CallToActionProps = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor?: string;
};

const CallToAction = ({ 
  title, 
  description, 
  buttonText, 
  buttonLink,
  bgColor = "bg-kbs-beige"
}: CallToActionProps) => {
  return (
    <section className={`${bgColor} py-16 md:py-20`}>
      <div className="container-custom text-center">
        <h2 className="mb-4 text-kbs-brown">{title}</h2>
        <p className="mx-auto max-w-2xl text-lg mb-8 text-gray-700">{description}</p>
        <Link to={buttonLink}>
          <Button size="lg" className="bg-kbs-green hover:bg-kbs-green/90 text-white px-6 py-6 h-auto">
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
