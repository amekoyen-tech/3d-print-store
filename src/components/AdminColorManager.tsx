import React, { useState } from 'react';
import { useColors } from '../hooks/useColors';
import { ColorSwatch } from '../types';
import { Plus, Trash2, Edit2, Save, X, Palette, Check } from 'lucide-react';

const AdminColorManager: React.FC = () => {
  const { colors, loading, error, addColor, updateColor, deleteColor } = useColors();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<ColorSwatch, 'id'>>({
    name: '',
    hexCode: '#000000',
    material: 'PLA',
    inStock: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateColor(editingId, formData);
        setEditingId(null);
      } else {
        await addColor(formData);
        setIsAdding(false);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      hexCode: '#000000',
      material: 'PLA',
      inStock: true
    });
  };

  const startEdit = (color: ColorSwatch) => {
    setFormData({
      name: color.name,
      hexCode: color.hexCode,
      material: color.material,
      inStock: color.inStock
    });
    setEditingId(color.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this color?')) {
      await deleteColor(id);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
          色彩管理 <span className="text-xs bg-[#FF5722] text-black px-2 py-1 rounded font-bold">{colors.length}</span>
        </h2>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-black font-bold rounded-lg hover:bg-[#E64A19] transition-colors"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? '取消' : '新增顏色'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded-2xl border border-[#FF5722]/30 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold mb-4">{editingId ? '編輯顏色' : '新增顏色'}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500">顏色名稱 (Name)</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-lg p-3 focus:border-[#FF5722] outline-none"
                placeholder="Ex: Matte Black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500">色碼 (Hex Code)</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={formData.hexCode}
                  onChange={e => setFormData({...formData, hexCode: e.target.value})}
                  className="h-12 w-12 rounded cursor-pointer bg-transparent"
                />
                <input 
                  required
                  type="text" 
                  value={formData.hexCode}
                  onChange={e => setFormData({...formData, hexCode: e.target.value})}
                  className="flex-grow bg-black border border-white/10 rounded-lg p-3 focus:border-[#FF5722] outline-none font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500">材質 (Material)</label>
              <select 
                value={formData.material}
                onChange={e => setFormData({...formData, material: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-lg p-3 focus:border-[#FF5722] outline-none"
              >
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="TPU">TPU</option>
                <option value="Resin">Resin</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input 
                type="checkbox" 
                id="inStock"
                checked={formData.inStock}
                onChange={e => setFormData({...formData, inStock: e.target.checked})}
                className="w-5 h-5 accent-[#FF5722]"
              />
              <label htmlFor="inStock" className="text-sm font-bold cursor-pointer">庫存充足 (In Stock)</label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
             <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors">
               <Save size={18} /> {editingId ? '更新' : '儲存'}
             </button>
          </div>
        </form>
      )}

      {loading && <div className="text-center py-12 animate-pulse text-[#FF5722]">Loading colors...</div>}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map(color => (
          <div key={color.id} className="bg-[#111] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
             <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white/10 shadow-inner"
                  style={{ backgroundColor: color.hexCode }}
                />
                <div>
                  <h4 className="font-bold">{color.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-mono text-gray-500 uppercase">{color.material}</span>
                     {!color.inStock && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Out of Stock</span>}
                  </div>
                </div>
             </div>
             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(color)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(color.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminColorManager;
