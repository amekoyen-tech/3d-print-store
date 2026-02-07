import React, { useState } from 'react';
import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import { Settings, Cpu, Layers, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, loading, error } = useProducts();

  if (selectedProduct) {
    return (
      <ProductDetail 
        product={selectedProduct} 
        onBack={() => setSelectedProduct(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF5722] selection:text-black overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 industrial-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 industrial-grid-dots opacity-30 pointer-events-none" />
      {/* Heavy blur effects hidden on mobile for better performance */}
      <div className="hidden md:block fixed -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#FF5722] blur-[150px] rounded-full opacity-5 pointer-events-none" />
      <div className="hidden md:block fixed -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-white blur-[150px] rounded-full opacity-5 pointer-events-none" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-end z-50 max-w-7xl mx-auto">
         <Link 
           to="/track" 
           className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-[#FF5722]/50 transition-all group"
         >
            <div className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white text-gray-400 transition-colors">
              訂單追蹤 (Track Order)
            </span>
         </Link>
      </nav>

      {/* Header / Hero */}
      <header className="relative pt-16 md:pt-24 pb-12 md:pb-16 px-6 md:px-8 max-w-7xl mx-auto z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-10">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 py-1 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FF5722]">
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-[#FF5722] animate-pulse" />
              <Settings className="animate-spin-slow" size={12} />
              <span className="text-[8px] md:text-[9px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase">系統狀態：正常運作</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-[9rem] font-black mb-6 leading-[0.8] tracking-tighter">
              D*3 <span className="whitespace-nowrap"><span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>三滴</span><span className="text-[#FF5722]">.</span>工作室</span>
            </h1>
            
            <p className="text-gray-400 max-w-xl font-light text-base md:text-xl leading-relaxed">
              為現代遠見者打造的專業 3D 製造空間。 
              以 <span className="text-white font-medium">絕不妥協的品質</span> 交付精密工程零件與手作創意。
            </p>
          </div>
          
          <div className="flex gap-8 md:gap-16 text-left md:text-right border-l border-white/10 pl-8 md:pl-12 pb-2">
            <div>
              <p className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 md:mb-2">累計產量</p>
              <p className="text-3xl md:text-5xl font-mono tracking-tighter">1.2<span className="text-[#FF5722]">K</span></p>
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 md:mb-2">製造精度</p>
              <p className="text-3xl md:text-5xl font-mono tracking-tighter">±0.1<span className="text-[#FF5722]">MM</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-8 max-w-7xl mx-auto relative z-10 mt-8 md:mt-12">
        <div className="flex items-center gap-4 md:gap-6 mb-10 md:mb-16">
          <div className="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <Layers size={14} className="text-[#FF5722]" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">現貨清單 (INVENTORY)</span>
          </div>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        {loading && (
          <div className="text-center py-20 animate-pulse font-mono text-[#FF5722]">
            正在同步庫存數據... (SYNCING DATA)
          </div>
        )}

        {error && (
          <div className="text-center py-20 font-mono text-red-500 border border-red-500/20 bg-red-500/5 p-8">
            無法連接至數據庫 (CONNECTION ERROR)
            <br/>
            <span className="text-sm opacity-50">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={(p) => setSelectedProduct(p)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer Industrial Decoration */}
      <footer className="mt-20 px-6 max-w-7xl mx-auto">
        <div className="border-t border-[#222] pt-12 flex flex-col md:flex-row justify-between gap-8 text-gray-600 text-[10px] font-bold uppercase tracking-widest pb-12">
          <div className="flex gap-12">
            <div className="flex items-center gap-2">
              <Cpu size={12} /> System v2.0.26
            </div>
            <div>Build: STABLE</div>
          </div>
          <div className="flex gap-8 items-center">
            <span>© 2026 Alex Print Lab | All Rights Reserved</span>
            <Link to="/admin" className="hover:text-[#FF5722] transition-colors" title="Admin Access">
               <Lock size={12} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
