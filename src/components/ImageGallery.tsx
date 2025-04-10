
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

interface ImageGalleryProps {
  images: {
    path: string;
    type: 'poster' | 'backdrop';
  }[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  const backdrops = images.filter(img => img.type === 'backdrop');
  const posters = images.filter(img => img.type === 'poster');
  
  // Show only backdrops if available, otherwise show posters
  const displayImages = backdrops.length > 0 ? backdrops : posters;
  
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 mb-8">
      <h2 className="text-lg font-medium mb-4">Gallery</h2>
      
      <Carousel className="w-full">
        <CarouselContent>
          {displayImages.map((image, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div 
                className="aspect-video relative overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setFullscreenImage(image.path)}
              >
                <img
                  src={image.path}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
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
        <DialogContent className="sm:max-w-6xl max-h-[90vh] p-0 bg-black/90 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <DialogClose className="absolute right-4 top-4 z-10">
              <Button size="icon" variant="ghost" className="text-white bg-black/50 rounded-full hover:bg-black/70">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
            
            {fullscreenImage && (
              <img
                src={fullscreenImage}
                alt="Fullscreen view"
                className="max-h-[85vh] max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;
