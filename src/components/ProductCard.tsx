import React from 'react';
import { Product } from '../types';
import { Clock, HardDrive, Zap, Box } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const totalTime = product.print_time_min + product.post_processing_time_min;
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  return (
    <div 
      className="group relative glass-card hover:bg-white/[0.08] border-white/5 hover:border-[#FF5722]/50 transition-all duration-500 rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={() => onClick(product)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
          單位售價: <span className="text-[#FF5722] ml-1">${product.price}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-grow relative z-10">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-[#FF5722] transition-colors duration-300">
          {product.name}
        </h3>

        <p className="text-gray-400 text-xs leading-relaxed mb-6 font-light line-clamp-2">
          {product.description}
        </p>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-auto pt-6 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">材質</span>
            <div className="flex items-center gap-2 text-[10px] text-gray-300 font-mono">
              <Box size={12} className="text-[#FF5722]" />
              <span>{product.materials[0]}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">重量</span>
            <div className="flex items-center gap-2 text-[10px] text-gray-300 font-mono">
              <HardDrive size={12} className="text-[#FF5722]" />
              <span>{product.weight_g}G</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">預估工時</span>
            <div className="flex items-center gap-2 text-[10px] text-gray-300 font-mono">
              <Clock size={12} className="text-[#FF5722]" />
              <span>{hours}H {minutes}M</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">製造精度</span>
            <div className="flex items-center gap-2 text-[10px] text-gray-300 font-mono">
              <Zap size={12} className="text-[#FF5722]" />
              <span>±0.1MM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Accents */}
      <div className="h-[2px] w-0 bg-gradient-to-r from-[#FF5722] to-[#FF9800] transition-all duration-700 group-hover:w-full" />
    </div>
  );
};

export default ProductCard;
