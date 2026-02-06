import React, { useState } from 'react';
import { Package, Truck, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { ContactForm } from './components/ContactForm';

interface TimeSpec {
  fast: number;
  mid: number;
  slow: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  printTime: TimeSpec;
  assemblyTime: TimeSpec;
  images: string[];
  material: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Stealth Desk Organizer',
    description: '極簡工業風桌面收納器，專為 Maker 設計。具備模組化隔層。',
    price: 450,
    printTime: { fast: 4, mid: 6, slow: 8 },
    assemblyTime: { fast: 0.5, mid: 1, slow: 1.5 },
    images: [
      'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585399817128-f6a1b949e71c?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'PLA+ / Carbon Fiber Black'
  },
  {
    id: 'p2',
    name: 'Cyberpunk Headphone Stand',
    description: '具備電路紋理設計的高強度耳機架。穩固支撐各種尺寸耳機。',
    price: 850,
    printTime: { fast: 12, mid: 16, slow: 20 },
    assemblyTime: { fast: 2, mid: 3, slow: 4 },
    images: [
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'PETG / Galaxy Orange'
  }
];

const calculateDelivery = (print: TimeSpec, assembly: TimeSpec): number => {
  const min = print.fast + assembly.fast;
  const mid = print.mid + assembly.mid;
  const max = print.slow + assembly.slow;
  return Math.round((min + 4 * mid + max) / 6);
};

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-dark-matte text-white selection:bg-heat selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-dark-matte/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-heat rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-heat/20">3D</div>
            <div className="flex flex-col">
              <span className="font-black tracking-tighter text-xl uppercase leading-none">Alex Print Lab</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Micro Factory</span>
            </div>
          </div>
          <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-white transition-colors">Inventory</a>
            <a href="#" className="hover:text-white transition-colors">Scheduling</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-24 relative">
          <div className="absolute -left-20 top-0 w-64 h-64 bg-heat/10 blur-[120px] rounded-full" />
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.85]">
            Precision <br /> 
            <span className="text-heat">Artisanship.</span>
          </h1>
          <p className="text-white/40 max-w-xl text-lg md:text-xl leading-relaxed font-medium">
            我們拒絕大規模量產。這裡每一件作品都標註了真實的列印與手工組裝數據，
            代表著 Alex 實驗室對品質的極致苛求。
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {PRODUCTS.map((product) => {
            const estimatedHours = calculateDelivery(product.printTime, product.assemblyTime);
            return (
              <div 
                key={product.id}
                className="maker-card group rounded-[32px] overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-matte/80 to-transparent opacity-60" />
                  <div className="absolute top-6 left-6 bg-dark-matte/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold tracking-[0.2em] border border-white/10 uppercase">
                    {product.material}
                  </div>
                </div>

                <div className="p-10 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{product.name}</h2>
                    <div className="flex flex-col items-end">
                      <span className="text-heat font-black text-2xl leading-none">${product.price}</span>
                      <span className="text-[10px] text-white/20 uppercase font-bold mt-1">TWD / UNIT</span>
                    </div>
                  </div>
                  <p className="text-white/50 mb-10 leading-relaxed font-medium">
                    {product.description}
                  </p>

                  {/* Stats Engine */}
                  <div className="mt-auto">
                    <div className="grid grid-cols-3 gap-6 p-6 bg-black/40 rounded-2xl border border-white/5 mb-8">
                      <div className="text-center">
                        <div className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-2">Print</div>
                        <div className="stats-font text-xl text-white font-medium">{product.printTime.mid} <span className="text-[10px] text-white/30">H</span></div>
                      </div>
                      <div className="text-center border-x border-white/5">
                        <div className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-2">Build</div>
                        <div className="stats-font text-xl text-white font-medium">{product.assemblyTime.mid} <span className="text-[10px] text-white/30">H</span></div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-heat/40 uppercase font-black tracking-widest mb-2">Lead</div>
                        <div className="stats-font text-xl text-heat font-bold">{estimatedHours} <span className="text-[10px] text-heat/50">H</span></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-xl hover:bg-heat hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-heat/20 group/btn"
                    >
                      開始客製訂購 <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer / Trust Info */}
      <section className="bg-dark-carbon py-24 px-6 border-t border-white/5 mt-12 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-heat/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
          <div className="flex gap-6">
            <div className="p-4 bg-white/5 rounded-2xl h-fit shadow-inner"><Package size={28} className="text-heat" /></div>
            <div>
              <h3 className="font-black mb-3 uppercase tracking-wider text-sm">台南面交匯款</h3>
              <p className="text-sm text-white/30 leading-relaxed font-medium">目前專注於台南地區面交服務，確保產品完美交付。亦支援銀行轉帳寄送。</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="p-4 bg-white/5 rounded-2xl h-fit shadow-inner"><CreditCard size={28} className="text-heat" /></div>
            <div>
              <h3 className="font-black mb-3 uppercase tracking-wider text-sm">付款資訊</h3>
              <p className="text-sm text-white/30 leading-relaxed font-mono">台南銀行 (004) <br />帳號：123-540-XXXXXX</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="p-4 bg-white/5 rounded-2xl h-fit shadow-inner"><Clock size={28} className="text-heat" /></div>
            <div>
              <h3 className="font-black mb-3 uppercase tracking-wider text-sm">智慧排程引擎</h3>
              <p className="text-sm text-white/30 leading-relaxed font-medium">交期採 PERT 三點估算法，排除過度樂觀誤差，提供最真實的交貨預估。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Order Modal */}
      {selectedProduct && (
        <ContactForm 
          productName={selectedProduct.name} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
