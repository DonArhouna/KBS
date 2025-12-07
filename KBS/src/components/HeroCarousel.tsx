
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroCarouselProps {
  images: string[];
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const HeroCarousel = ({ images, title = "", subtitle = "", children }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auto-rotation du carrousel
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Préchargement immédiat et prioritaire de toutes les images
  useEffect(() => {
    if (images.length === 0) {
      setIsInitialLoad(false);
      return;
    }

    const preloadImages = async () => {
      const loadPromises = images.map((src, index) => {
        return new Promise<number>((resolve) => {
          if (!src || typeof src !== 'string') {
            console.warn(`Invalid image source at index ${index}:`, src);
            resolve(index);
            return;
          }

          const img = new Image();
          img.onload = () => {
            console.log(`Image loaded successfully: ${src}`);
            setImagesLoaded(prev => new Set([...prev, index]));
            resolve(index);
          };
          img.onerror = (error) => {
            console.error(`Failed to load image: ${src}`, error);
            resolve(index); // Continue even if image fails to load
          };
          img.loading = 'eager';
          img.fetchPriority = 'high';
          img.src = src;
        });
      });

      await Promise.all(loadPromises);
      // Always set initial load to false after attempting to load images
      setTimeout(() => setIsInitialLoad(false), 200);
    };

    preloadImages();
  }, [images]);

  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentIndex] || images[0];
  const hasValidImages = images.length > 0 && images[0];
  const isCurrentImageLoaded = imagesLoaded.has(currentIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const getBackgroundStyle = () => {
    if (!hasValidImages) {
      return { 
        background: 'linear-gradient(135deg, #008751, #8cc63f)',
        minHeight: '400px'
      };
    }
    
    return {
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url('${currentImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '400px'
    };
  };

  return (
    <>
      {hasValidImages && images.slice(0, 2).map((image, index) => (
        <link key={index} rel="preload" as="image" href={image} />
      ))}
      
      <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            isCurrentImageLoaded ? 'opacity-100' : 'opacity-90'
          }`}
          style={getBackgroundStyle()}
        />

        <div className="absolute inset-0 bg-black/20" />

        <div className="container-custom relative z-10">
          <div className="max-w-2xl animate-fade-in">
            {/* Affichage conditionnel du titre et sous-titre */}
            {title && (
              <h1 className="text-white mb-4 drop-shadow-lg">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-white/90 text-lg mb-8 drop-shadow-md">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </div>

        {hasMultipleImages && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-2xl"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-2xl"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white scale-110' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}

        {hasValidImages && isInitialLoad && !isCurrentImageLoaded && (
          <div className="absolute bottom-4 right-4 z-20">
            <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </section>
    </>
  );
};

export default HeroCarousel;
