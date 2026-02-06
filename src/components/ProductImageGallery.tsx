import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const imageVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[32px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            className="object-cover w-full h-full"
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-matte/80 to-transparent opacity-60" />
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-3 px-6 pb-2 overflow-x-auto scrollbar-hide">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`
              relative flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden
              transition-all duration-300
              ${
                selectedIndex === index
                  ? 'border-2 border-heat opacity-100 scale-105'
                  : 'border border-white/10 opacity-60 hover:opacity-100 hover:scale-105'
              }
            `}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="object-cover w-full h-full"
            />
            {selectedIndex === index && (
              <div className="absolute inset-0 bg-heat/10" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
