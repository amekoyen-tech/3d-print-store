import React, { useState, useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useProducts } from '../hooks/useProducts';
import { Order, Product, ColorSwatch, OrderStatus } from '../types';
import { Factory, Printer, Hammer, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';

type ProductionFilter = 'all' | 'accepted' | 'printing' | 'post_processing';

export default function AdminProductionDashboard() {
  const { orders, updateOrderStatus } = useOrders();
  const { products } = useProducts();
  const { confirm, alert } = useDialog();
  const [filter, setFilter] = useState<ProductionFilter>('all');

  // 篩選生產中的訂單
  const productionOrders = useMemo(() => {
    const filtered = orders.filter(o =>
      ['accepted', 'printing', 'post_processing'].includes(o.status)
    );
    if (filter === 'all') return filtered;
    return filtered.filter(o => o.status === filter);
  }, [orders, filter]);

  // 計算總待製作項目數
  const totalItems = useMemo(() =>
    productionOrders.reduce((sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    , 0)
  , [productionOrders]);

  // 狀態轉換處理
  const handleStartPrinting = async (orderId: string) => {
    const confirmed = await confirm(
      '確定已確認材料並開始列印此訂單？',
      '開始列印'
    );
    if (!confirmed) return;

    try {
      await updateOrderStatus(orderId, 'printing');
      await alert('訂單已移至列印階段', '成功', 'success');
    } catch (err: any) {
      await alert('狀態更新失敗: ' + err.message, '錯誤', 'error');
    }
  };

  const handleMoveToPostProcessing = async (orderId: string) => {
    const confirmed = await confirm(
      '確定列印已完成，移至後處理階段？',
      '後處理'
    );
    if (!confirmed) return;

    try {
      await updateOrderStatus(orderId, 'post_processing');
      await alert('訂單已移至後處理階段', '成功', 'success');
    } catch (err: any) {
      await alert('狀態更新失敗: ' + err.message, '錯誤', 'error');
    }
  };

  const handleComplete = async (orderId: string) => {
    const confirmed = await confirm(
      '確定此訂單已完成所有製作流程？',
      '標記完成'
    );
    if (!confirmed) return;

    try {
      await updateOrderStatus(orderId, 'completed');
      await alert('訂單已標記為完成', '成功', 'success');
    } catch (err: any) {
      await alert('狀態更新失敗: ' + err.message, '錯誤', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
          <Factory size={24} className="text-[#FF5722]" />
          生產儀表板
          <span className="text-xs bg-[#FF5722] text-black px-2 py-1 rounded font-bold">
            {totalItems} 項待製作
          </span>
        </h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-[#111] p-1 rounded-lg border border-white/10 w-fit">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={productionOrders.length}
        >
          全部
        </FilterButton>
        <FilterButton
          active={filter === 'accepted'}
          onClick={() => setFilter('accepted')}
          count={productionOrders.filter(o => o.status === 'accepted').length}
          color="blue"
        >
          待確認材料
        </FilterButton>
        <FilterButton
          active={filter === 'printing'}
          onClick={() => setFilter('printing')}
          count={productionOrders.filter(o => o.status === 'printing').length}
          color="orange"
        >
          列印中
        </FilterButton>
        <FilterButton
          active={filter === 'post_processing'}
          onClick={() => setFilter('post_processing')}
          count={productionOrders.filter(o => o.status === 'post_processing').length}
          color="purple"
        >
          後處理中
        </FilterButton>
      </div>

      {/* Order List */}
      <div className="grid gap-6">
        {productionOrders.map(order => (
          <ProductionOrderCard
            key={order.id}
            order={order}
            products={products}
            onStartPrinting={handleStartPrinting}
            onMoveToPostProcessing={handleMoveToPostProcessing}
            onComplete={handleComplete}
          />
        ))}

        {productionOrders.length === 0 && (
          <div className="text-center py-20 text-gray-500 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm font-mono uppercase tracking-widest">
            目前沒有生產中的訂單
          </div>
        )}
      </div>
    </div>
  );
}

// FilterButton 子組件
const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
  color?: 'blue' | 'orange' | 'purple';
}> = ({ active, onClick, count, children, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    orange: 'bg-[#FF5722]/20 text-[#FF5722] border-[#FF5722]/30',
    purple: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
        active
          ? color ? colorClasses[color] : 'bg-[#FF5722] text-black border-[#FF5722]'
          : 'bg-transparent text-gray-500 hover:bg-white/5 border-transparent'
      } border`}
    >
      {children}
      <span className={`text-micro px-1.5 py-0.5 rounded-full ${
        active ? 'bg-black/20' : 'bg-white/10'
      }`}>
        {count}
      </span>
    </button>
  );
};

// ProductionOrderCard 子組件
const ProductionOrderCard: React.FC<{
  order: Order;
  products: Product[];
  onStartPrinting: (id: string) => void;
  onMoveToPostProcessing: (id: string) => void;
  onComplete: (id: string) => void;
}> = ({ order, products, onStartPrinting, onMoveToPostProcessing, onComplete }) => {
  const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('zh-TW') : '';

  // 計算總工時
  const totalMinutes = useMemo(() => {
    return order.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return sum;
      return sum + (product.print_time_min + product.post_processing_time_min) * item.quantity;
    }, 0);
  }, [order.items, products]);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${
            order.status === 'accepted' ? 'bg-blue-500 animate-pulse' :
            order.status === 'printing' ? 'bg-[#FF5722] animate-pulse' :
            'bg-purple-500 animate-pulse'
          }`} />
          <div>
            <h3 className="font-bold text-lg">{order.customer?.name || '無姓名'}</h3>
            <p className="text-xs text-gray-500 font-mono">{dateStr}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-black uppercase tracking-widest border ${
          order.status === 'accepted' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
          order.status === 'printing' ? 'text-[#FF5722] bg-[#FF5722]/10 border-[#FF5722]/20' :
          'text-purple-500 bg-purple-500/10 border-purple-500/20'
        }`}>
          {order.status === 'accepted' && '已接單'}
          {order.status === 'printing' && '列印中'}
          {order.status === 'post_processing' && '後處理中'}
        </div>
      </div>

      {/* Product List */}
      <div className="p-6 space-y-4">
        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">
          產品列表 (Products)
        </h4>

        <div className="space-y-3">
          {order.items.map((item, idx) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;

            return (
              <div key={idx} className="bg-[#080808] p-4 rounded-xl border border-white/5 flex gap-4">
                {/* Product Image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border border-white/10"
                  />
                )}

                {/* Product Info */}
                <div className="flex-grow space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm">{item.name} x{item.quantity}</h5>
                  </div>

                  {/* Color Info */}
                  {item.selectedColor && item.selectedColor !== 'default' ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: (item.selectedColor as ColorSwatch).hexCode }}
                      />
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-xs font-bold">{(item.selectedColor as ColorSwatch).name}</p>
                          <p className="text-micro text-gray-500">{(item.selectedColor as ColorSwatch).material}</p>
                        </div>
                        {(item.selectedColor as ColorSwatch).inStock ? (
                          <span className="text-micro text-green-500 flex items-center gap-1">
                            <CheckCircle2 size={12} /> 庫存充足
                          </span>
                        ) : (
                          <span className="text-micro text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> 需補貨
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">預設顏色（無客製化）</p>
                  )}

                  {/* Time Info */}
                  <div className="flex gap-4 text-micro text-gray-500 font-mono">
                    <span>列印: {product.print_time_min}min</span>
                    <span>後處理: {product.post_processing_time_min}min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Workload */}
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-white/5">
          <Clock size={14} className="text-[#FF5722]" />
          <span>總工時預估: {hours}h {minutes}min</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        {order.status === 'accepted' && (
          <div className="flex gap-3">
            <button
              onClick={() => onStartPrinting(order.id)}
              className="flex-1 bg-[#FF5722] text-black py-3 rounded-xl font-bold uppercase text-xs hover:bg-[#E64A19] transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={16} /> 確認材料並開始列印
            </button>
          </div>
        )}

        {order.status === 'printing' && (
          <button
            onClick={() => onMoveToPostProcessing(order.id)}
            className="w-full bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 py-3 rounded-xl font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Hammer size={16} /> 標記為後處理階段
          </button>
        )}

        {order.status === 'post_processing' && (
          <button
            onClick={() => onComplete(order.id)}
            className="w-full bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 py-3 rounded-xl font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} /> 標記為完成
          </button>
        )}
      </div>
    </div>
  );
};
