import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import AdminProductForm from '../components/AdminProductForm';
import AdminProductList from '../components/AdminProductList';
import AdminOrderList from '../components/AdminOrderList';
import AdminColorManager from '../components/AdminColorManager';
import { Product } from '../types';
import { ArrowLeft, ShieldCheck, LayoutList, Archive, Palette } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { products, loading, error, addProduct, deleteProduct, updateProduct } = useProducts();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'colors'>('orders');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleFormSubmit = async (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      await addProduct(productData);
    }
  };

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
            <h1 className="font-black text-lg md:text-xl tracking-tight flex items-center gap-3">
              D*3<span className="text-[#FF5722]">.</span>管理後台
              <span className="hidden sm:flex px-2 py-0.5 bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-[10px] tracking-widest rounded-full items-center gap-1">
                <ShieldCheck size={10} /> ACCESS GRANTED
              </span>
            </h1>
          </div>
          
          <div className="flex bg-[#111] p-1 rounded-lg border border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-[#FF5722] text-black shadow-lg shadow-[#FF5722]/20' : 'text-gray-500 hover:text-white'}`}
            >
              <Archive size={14} /> 訂單 (Orders)
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-[#FF5722] text-black shadow-lg shadow-[#FF5722]/20' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutList size={14} /> 產品 (Products)
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'colors' ? 'bg-[#FF5722] text-black shadow-lg shadow-[#FF5722]/20' : 'text-gray-500 hover:text-white'}`}
            >
              <Palette size={14} /> 色彩 (Colors)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {activeTab === 'products' ? (
          <>
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
                    <AdminProductForm 
                      onSubmit={handleFormSubmit} 
                      initialData={editingProduct}
                      onCancel={() => setEditingProduct(null)}
                    />
                  </div>
                </div>
                
                <div className="lg:col-span-7 xl:col-span-8">
                  <AdminProductList 
                    products={products} 
                    onDelete={deleteProduct} 
                    onEdit={(p) => {
                      setEditingProduct(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'orders' ? (
          <AdminOrderList />
        ) : (
          <AdminColorManager />
        )}
      </main>
    </div>
  );
};

export default AdminPage;
