
import { ReactNode, useState, useEffect } from "react";

type PageBannerProps = {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  children?: ReactNode;
};

const PageBanner = ({ title, subtitle, imageSrc, children }: PageBannerProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shouldShowImage, setShouldShowImage] = useState(false);

  // Préchargement de l'image de bannière
  useEffect(() => {
    if (!imageSrc) {
      setShouldShowImage(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Petit délai pour éviter l'effet de flash
      setTimeout(() => setShouldShowImage(true), 50);
    };
    img.onerror = () => {
      setShouldShowImage(true); // Utiliser le fallback
    };
    img.loading = 'eager';
    img.fetchPriority = 'high';
    img.src = imageSrc;
  }, [imageSrc]);

  const backgroundStyle = () => {
    if (!imageSrc || !shouldShowImage) {
      return {
        background: 'linear-gradient(135deg, #008751, #8cc63f)',
        minHeight: '320px'
      };
    }

    if (imageLoaded && shouldShowImage) {
      return {
        backgroundImage: `linear-gradient(to right, rgba(0,135,81,0.8), rgba(0,0,0,0.3)), url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '320px'
      };
    }

    // Pendant le chargement, utiliser le gradient
    return {
      background: 'linear-gradient(135deg, #008751, #8cc63f)',
      minHeight: '320px'
    };
  };

  return (
    <>
      {/* Préchargement de l'image dans le head */}
      {imageSrc && <link rel="preload" as="image" href={imageSrc} />}
      
      <div className="relative overflow-hidden">
        <div 
          className={`h-64 md:h-80 flex items-center transition-opacity duration-300 ${
            shouldShowImage ? 'opacity-100' : 'opacity-95'
          }`}
          style={backgroundStyle()}
        >
          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-white mb-4">{title}</h1>
              {subtitle && <p className="text-white/90 text-lg md:text-xl">{subtitle}</p>}
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageBanner;
