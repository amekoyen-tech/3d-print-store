import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Clock, HardDrive, Zap, Box } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

// Helper function to optimize Unsplash image URLs
const optimizeImageUrl = (url: string, width = 400, quality = 80): string => {
  if (!url) return url;
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=${quality}&auto=format&fit=crop`;
  }
  return url;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const totalTime = product.print_time_min + product.post_processing_time_min;
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  // Detect if device is mobile (< 768px) for performance optimization
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardClassName = "group relative bg-[#111] border border-white/5 hover:border-[#FF5722]/50 transition-all duration-500 rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full shadow-2xl hover:-translate-y-1";

  // Mobile: Use simple div with CSS transitions (no Framer Motion)
  if (isMobile) {
    return (
      <div className={cardClassName} onClick={() => onClick(product)}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Product Image */}
        <div className="relative h-48 sm:h-64 overflow-hidden bg-white/5">
          {product.images?.[0] ? (
            <img
              src={optimizeImageUrl(product.images[0])}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <Box size={32} className="opacity-20 md:size-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-black/80 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
          單位售價: <span className="text-[#FF5722] ml-1">${product.price}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow relative z-10">
        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-[#FF5722] transition-colors duration-300">
          {product.name}
        </h3>

        <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed mb-4 sm:mb-6 font-light line-clamp-2">
          {product.description}
        </p>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-2 mt-auto pt-4 sm:pt-6 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-black tracking-widest">材質</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-300 font-mono">
              <Box size={10} className="text-[#FF5722] sm:size-12" />
              <span>{product.materials[0]}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-black tracking-widest">重量</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-300 font-mono">
              <HardDrive size={10} className="text-[#FF5722] sm:size-12" />
              <span>{product.weight_g}G</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-black tracking-widest">預估工時</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-300 font-mono">
              <Clock size={10} className="text-[#FF5722] sm:size-12" />
              <span>{hours}H {minutes}M</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-black tracking-widest">製造精度</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-300 font-mono">
              <Zap size={10} className="text-[#FF5722] sm:size-12" />
              <span>±0.1MM</span>
            </div>
          </div>
        </div>
      </div>

        {/* Industrial Accents */}
        <div className="h-[2px] w-0 bg-gradient-to-r from-[#FF5722] to-[#FF9800] transition-all duration-700 group-hover:w-full" />
      </div>
    );
  }

  // Desktop: Use Framer Motion for rich animations
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-[#111] border border-white/5 hover:border-[#FF5722]/50 transition-all duration-500 rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full shadow-2xl"
      onClick={() => onClick(product)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Product Image */}
      <div className="relative h-48 sm:h-64 overflow-hidden bg-white/5">
        {product.images?.[0] ? (
          <motion.img
            src={optimizeImageUrl(product.images[0])}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <Box size={32} className="opacity-20 md:size-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-black/80 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
          單位售價: <span className="text-[#FF5722] ml-1">${product.price}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow relative z-10">
        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-[#FF5722] transition-colors duration-300">
          {product.name}
        </h3>

        <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed mb-4 sm:mb-6 font-light line-clamp-2">
          {product.description}
        </p>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-2 mt-auto pt-4 sm:pt-6 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-black tracking-widest">材質</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-300 font-mono">
              <Box size={10} className="text-[#FF5722] sm:size-12" />
              <span>{product.materials[0]}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-black tracking-widest">重量</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-300 font-mono">
              <HardDrive size={10} className="text-[#FF5722] sm:size-12" />
              <span>{product.weight_g}G</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-black tracking-widest">預估工時</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-300 font-mono">
              <Clock size={10} className="text-[#FF5722] sm:size-12" />
              <span>{hours}H {minutes}M</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-black tracking-widest">製造精度</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-300 font-mono">
              <Zap size={10} className="text-[#FF5722] sm:size-12" />
              <span>±0.1MM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Accents */}
      <div className="h-[2px] w-0 bg-gradient-to-r from-[#FF5722] to-[#FF9800] transition-all duration-700 group-hover:w-full" />
    </motion.div>
  );
};

export default ProductCard;
