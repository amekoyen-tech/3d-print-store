import React, { useState } from 'react';
import { Product } from '../types';
import { Clock, Hammer, Shield, Info, ArrowLeft, Package, Plus, Minus, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Lead time calculation
  const setupTime = 60; 
  const totalPrintTime = product.print_time_min * quantity;
  const leadTimeMin = (totalPrintTime + product.post_processing_time_min + setupTime) * 1.1;
  
  const days = Math.floor(leadTimeMin / (24 * 60));
  const remainingHours = Math.floor((leadTimeMin % (24 * 60)) / 60);

  const leadTimeDisplay = days > 0 
    ? `${days}天 ${remainingHours}小時` 
    : `${remainingHours}小時`;

  const totalPrice = product.price * quantity;

  const images = product.images || [];

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-12">
      <motion.button 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-[#FF5722] mb-8 transition-colors uppercase text-sm font-bold tracking-widest group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        返回工坊 (Back)
      </motion.button>

      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Left: Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="aspect-square bg-[#1A1A1A] border border-[#333] rounded-2xl overflow-hidden relative group">
            {images[0] ? (
              <img 
                src={images[0]} 
                alt={product.name}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700">NO IMAGE</div>
            )}
            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl border border-[#FF5722]/30 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
              <div className="p-2 bg-[#FF5722]/20 rounded-lg">
                <Package size={20} className="text-[#FF5722]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">材質 (Material)</p>
                <p className="text-sm font-black tracking-tight">{product.materials.join(' / ')}</p>
              </div>
            </div>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="aspect-square bg-[#1A1A1A] border border-[#333] rounded-xl cursor-pointer hover:border-[#FF5722] transition-colors overflow-hidden opacity-50 hover:opacity-100">
                   <img src={img} className="w-full h-full object-cover" alt={`view ${i}`} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none italic">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-3xl text-[#FF5722] font-mono font-bold">${product.price}.00</p>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest text-gray-400">
                現貨供應 (In Stock)
              </span>
            </div>
          </div>

          <div className="space-y-8 flex-grow">
            <div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Info size={14} className="text-[#FF5722]" /> 產品描述 (Description)
              </h3>
              <p className="text-gray-300 leading-relaxed font-light text-lg italic border-l-2 border-[#222] pl-6">
                "{product.description}"
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                數量 (Quantity)
              </h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-[#111] border border-[#333] rounded-xl p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-16 text-center font-mono text-2xl font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">總金額 (Total)</p>
                  <p className="text-2xl font-mono font-black text-white">${totalPrice}.00</p>
                </div>
              </div>
            </div>

            {/* Production Stats Box */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5722]/5 blur-3xl group-hover:bg-[#FF5722]/10 transition-colors" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg"><Clock size={18} className="text-gray-400" /></div>
                  <span className="text-xs uppercase font-bold tracking-widest text-gray-400">列印時間 (Print Time)</span>
                </div>
                <span className="font-mono text-lg">{Math.floor(totalPrintTime / 60)}h {totalPrintTime % 60}m</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg"><Hammer size={18} className="text-gray-400" /></div>
                  <span className="text-xs uppercase font-bold tracking-widest text-gray-400">後處理 (Post-Process)</span>
                </div>
                <span className="font-mono text-lg">{product.post_processing_time_min}m</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#FF5722]/10 rounded-xl"><Shield size={24} className="text-[#FF5722]" /></div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#FF5722] block mb-1">交貨保證</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">預估交期 (Lead Time)</span>
                  </div>
                </div>
                <motion.span 
                  key={leadTimeDisplay}
                  initial={{ scale: 1.1, color: '#FF5722' }}
                  animate={{ scale: 1, color: '#FFFFFF' }}
                  className="text-4xl font-black tracking-tighter"
                >
                  {leadTimeDisplay}
                </motion.span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className="mt-12 group relative w-full overflow-hidden rounded-2xl bg-[#FF5722] p-5 font-black uppercase tracking-[0.3em] text-black transition-all hover:bg-[#E64A19] active:scale-[0.98] shadow-[0_20px_40px_rgba(255,87,34,0.2)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              加入購物車 (ADD TO CART) <ShoppingCart size={20} />
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
