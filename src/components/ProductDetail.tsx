import React from 'react';
import { Product } from '../types';
import { Clock, Hammer, Shield, Info, ArrowLeft, Package } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const leadTimeMin = (product.print_time_min + product.post_processing_time_min) * 1.1; // 10% buffer as suggested
  const days = Math.floor(leadTimeMin / (24 * 60));
  const remainingHours = Math.floor((leadTimeMin % (24 * 60)) / 60);

  const leadTimeDisplay = days > 0 
    ? `${days}d ${remainingHours}h` 
    : `${remainingHours}h`;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12 animate-in fade-in duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-[#FF5722] mb-8 transition-colors uppercase text-sm font-bold tracking-widest"
      >
        <ArrowLeft size={18} />
        Back to Workshop
      </button>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#1A1A1A] border border-[#333] rounded-lg overflow-hidden relative">
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover grayscale-[20%]"
            />
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-[#FF5722]/30 px-4 py-2 rounded flex items-center gap-3">
              <Package size={20} className="text-[#FF5722]" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Ready to Print</p>
                <p className="text-sm font-black tracking-tight">{product.materials.join(' / ')}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {/* Mock thumbnails */}
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="aspect-square bg-[#1A1A1A] border border-[#333] rounded cursor-pointer hover:border-[#FF5722] transition-colors overflow-hidden opacity-50 hover:opacity-100">
                 <img src={product.images[0]} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
              {product.name}
            </h1>
            <p className="text-2xl text-[#FF5722] font-mono font-bold">${product.price}.00</p>
          </div>

          <div className="space-y-6 flex-grow">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info size={14} /> Description
              </h3>
              <p className="text-gray-300 leading-relaxed font-light italic">
                "{product.description}"
              </p>
            </div>

            {/* Production Stats Box */}
            <div className="bg-[#111] border-l-4 border-[#FF5722] p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#222] pb-3">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-[#FF5722]" />
                  <span className="text-sm uppercase font-bold tracking-tight">Est. Production Time</span>
                </div>
                <span className="font-mono text-xl">{Math.floor(product.print_time_min / 60)}h {product.print_time_min % 60}m</span>
              </div>

              <div className="flex justify-between items-center border-b border-[#222] pb-3">
                <div className="flex items-center gap-3">
                  <Hammer size={20} className="text-[#FF5722]" />
                  <span className="text-sm uppercase font-bold tracking-tight">Post-Processing</span>
                </div>
                <span className="font-mono text-xl">{product.post_processing_time_min}m</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-[#FF5722]" />
                  <span className="text-sm uppercase font-black tracking-widest text-[#FF5722]">Est. Lead Time</span>
                </div>
                <span className="text-3xl font-black tracking-tighter">{leadTimeDisplay}</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase text-right">* Includes machine queuing and cooling buffer</p>
            </div>
          </div>

          <button className="mt-8 w-full bg-[#FF5722] hover:bg-[#E64A19] text-black font-black py-4 uppercase tracking-[0.2em] transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(255,87,34,0.3)]">
            Initialize Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
