import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import AdminProductForm from '../components/AdminProductForm';
import AdminProductList from '../components/AdminProductList';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { products, loading, error, addProduct, deleteProduct } = useProducts();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF5722] selection:text-black pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 industrial-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 industrial-grid-dots opacity-30 pointer-events-none" />

      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-[1px] bg-white/10" />
            <h1 className="font-black text-xl tracking-tight flex items-center gap-3">
              ALEX<span className="text-[#FF5722]">.</span>ADMIN
              <span className="px-2 py-0.5 bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-[10px] tracking-widest rounded-full flex items-center gap-1">
                <ShieldCheck size={10} /> ACCESS GRANTED
              </span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {loading && (
          <div className="text-center py-20 animate-pulse font-mono text-[#FF5722]">
            載入系統數據中... (SYSTEM LOADING)
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-6 text-red-500 mb-8 font-mono">
            錯誤: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24">
                <AdminProductForm onSubmit={addProduct} />
              </div>
            </div>
            
            <div className="lg:col-span-7 xl:col-span-8">
              <AdminProductList products={products} onDelete={deleteProduct} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
