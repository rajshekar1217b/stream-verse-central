
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
  
  const backdrops = images.filter(img => img.type === 'backdrop');
  const posters = images.filter(img => img.type === 'poster');
  
  let displayImages = images;
  if (activeTab === 'backdrops') displayImages = backdrops;
  if (activeTab === 'posters') displayImages = posters;
  
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          Gallery
        </h2>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'backdrops' | 'posters')}>
          <TabsList className="grid grid-cols-3 h-8 w-auto">
            <TabsTrigger value="all" className="text-xs">All ({images.length})</TabsTrigger>
            <TabsTrigger value="backdrops" className="text-xs">Backdrops ({backdrops.length})</TabsTrigger>
            <TabsTrigger value="posters" className="text-xs">Posters ({posters.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent>
          {displayImages.map((image, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div 
                className="aspect-video relative overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity group"
                onClick={() => setFullscreenImage(image.path)}
              >
                <img
                  src={image.path}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
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
