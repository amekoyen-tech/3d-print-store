import React, { useState } from 'react';
import { Product } from './types';
import productsData from './data/products.json';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import { Settings, Cpu, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const products: Product[] = productsData as Product[];

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
      <div className="fixed -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#FF5722] blur-[150px] rounded-full opacity-5 pointer-events-none" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-white blur-[150px] rounded-full opacity-5 pointer-events-none" />

      {/* Header / Hero */}
      <header className="relative pt-24 pb-16 px-8 max-w-7xl mx-auto z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FF5722]">
              <div className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
              <Settings className="animate-spin-slow" size={14} />
              <span className="text-[9px] font-black tracking-[0.4em] uppercase">系統狀態：正常運作</span>
            </div>
            
            <h1 className="text-8xl md:text-[10rem] font-black leading-[0.8] tracking-tighter">
              ALEX<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>PRINT</span>
              <span className="text-[#FF5722]">.</span>LAB
            </h1>
            
            <p className="text-gray-400 max-w-xl font-light text-xl leading-relaxed">
              為現代遠見者打造的工業級 3D 製造。 
              以 <span className="text-white font-medium">絕不妥協的品質</span> 交付精密工程零件。
            </p>
          </div>
          
          <div className="flex gap-16 text-right border-l border-white/10 pl-12 pb-2">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">累計產量</p>
              <p className="text-5xl font-mono tracking-tighter">1.2<span className="text-[#FF5722]">K</span></p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">製造精度</p>
              <p className="text-5xl font-mono tracking-tighter">±0.1<span className="text-[#FF5722]">MM</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 max-w-7xl mx-auto relative z-10 mt-12">
        <div className="flex items-center gap-6 mb-16">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <Layers size={18} className="text-[#FF5722]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">現貨清單</span>
          </div>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={(p) => setSelectedProduct(p)} 
            />
          ))}
        </div>
      </main>

      {/* Footer Industrial Decoration */}
      <footer className="mt-20 px-6 max-w-7xl mx-auto">
        <div className="border-t border-[#222] pt-12 flex flex-col md:flex-row justify-between gap-8 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex gap-12">
            <div className="flex items-center gap-2">
              <Cpu size={12} /> System v2.0.26
            </div>
            <div>Build: STABLE</div>
          </div>
          <div>© 2026 Alex Print Lab | All Rights Reserved</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
