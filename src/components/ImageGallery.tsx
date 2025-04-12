
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageGalleryProps {
  images: {
    path: string;
    type: 'poster' | 'backdrop';
  }[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'backdrops' | 'posters'>('all');
  
  // Handle potential images formatting issues
  const normalizedImages = React.useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return [];
    }
    
    // Make sure all images have proper paths (not undefined or empty)
    return images.filter(img => img && img.path && img.type);
  }, [images]);
  
  const backdrops = normalizedImages.filter(img => img.type === 'backdrop');
  const posters = normalizedImages.filter(img => img.type === 'poster');
  
  let displayImages = normalizedImages;
  if (activeTab === 'backdrops') displayImages = backdrops;
  if (activeTab === 'posters') displayImages = posters;
  
  if (normalizedImages.length === 0) {
    return null;
  }

  const handleNextImage = () => {
    if (fullscreenImage) {
      const currentIndex = normalizedImages.findIndex(img => img.path === fullscreenImage);
      const nextIndex = (currentIndex + 1) % normalizedImages.length;
      setFullscreenImage(normalizedImages[nextIndex].path);
    }
  };

  const handlePreviousImage = () => {
    if (fullscreenImage) {
      const currentIndex = normalizedImages.findIndex(img => img.path === fullscreenImage);
      const prevIndex = (currentIndex - 1 + normalizedImages.length) % normalizedImages.length;
      setFullscreenImage(normalizedImages[prevIndex].path);
    }
  };

  // Handle keyboard navigation in fullscreen mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'ArrowLeft') {
      handlePreviousImage();
    } else if (e.key === 'Escape') {
      setFullscreenImage(null);
    }
  };

  return (
    <div className="mt-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          Gallery ({normalizedImages.length} images)
        </h2>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'backdrops' | 'posters')}>
          <TabsList className="grid grid-cols-3 h-8 w-auto">
            <TabsTrigger value="all" className="text-xs">All ({normalizedImages.length})</TabsTrigger>
            <TabsTrigger value="backdrops" className="text-xs">Backdrops ({backdrops.length})</TabsTrigger>
            <TabsTrigger value="posters" className="text-xs">Posters ({posters.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent>
          {displayImages.map((image, index) => (
            <CarouselItem key={index} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <div 
                className="aspect-video relative overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity group"
                onClick={() => setFullscreenImage(image.path)}
              >
                <img
                  src={image.path}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/1280x720?text=Image+Error';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {image.type}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-end gap-2 mt-2">
          <CarouselPrevious className="static transform-none" />
          <CarouselNext className="static transform-none" />
        </div>
      </Carousel>
      
      {/* Fullscreen image dialog */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent 
          className="sm:max-w-6xl max-h-[90vh] p-0 bg-black/90 border-none"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <DialogClose className="absolute right-4 top-4 z-10">
              <Button size="icon" variant="ghost" className="text-white bg-black/50 rounded-full hover:bg-black/70">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
            
            {/* Navigation arrows */}
            <Button 
              size="icon"
              variant="ghost" 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full hover:bg-black/70 z-10"
              onClick={handlePreviousImage}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous</span>
            </Button>
            
            <Button 
              size="icon"
              variant="ghost" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full hover:bg-black/70 z-10"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next</span>
            </Button>
            
            {fullscreenImage && (
              <img
                src={fullscreenImage}
                alt="Fullscreen view"
                className="max-h-[85vh] max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/1280x720?text=Image+Error';
                }}
              />
            )}
            
            {/* Image counter */}
            {fullscreenImage && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                {normalizedImages.findIndex(img => img.path === fullscreenImage) + 1} / {normalizedImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;
