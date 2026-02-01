import React from 'react';
import { Product } from '../types';
import { Trash2, AlertTriangle, Box } from 'lucide-react';

interface AdminProductListProps {
  products: Product[];
  onDelete: (id: string) => Promise<void>;
}

const AdminProductList: React.FC<AdminProductListProps> = ({ products, onDelete }) => {
  const handleDelete = async (id: string) => {
    if (window.confirm('確定刪除此產品？此動作無法復原。\n(Are you sure you want to delete this product?)')) {
      await onDelete(id);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 p-12 text-center">
        <AlertTriangle className="mx-auto mb-4 text-gray-500" size={48} />
        <p className="text-gray-400 font-mono">尚無產品資料 (No products found)</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <div className="flex items-center gap-3 mb-6">
        <Box className="text-[#FF5722]" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
          庫存管理 (Inventory)
        </h2>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <div 
            key={product.id}
            className="group flex items-center gap-4 bg-black/40 border border-white/10 p-4 hover:border-[#FF5722]/50 transition-colors"
          >
            <div className="w-16 h-16 bg-white/5 overflow-hidden border border-white/5 relative">
              {product.images?.[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs">NO IMG</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold truncate tracking-wide">{product.name}</h3>
              <p className="text-gray-500 text-xs font-mono mt-1 truncate">
                ID: {product.id}
              </p>
              <div className="flex gap-4 mt-2 text-xs font-mono text-gray-400">
                <span>${product.price}</span>
                <span className="text-[#FF5722]">|</span>
                <span>{product.weight_g}g</span>
                <span className="text-[#FF5722]">|</span>
                <span>{product.print_time_min}m</span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(product.id)}
              className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/50 transition-all group-hover:opacity-100"
              title="刪除 (Delete)"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductList;
