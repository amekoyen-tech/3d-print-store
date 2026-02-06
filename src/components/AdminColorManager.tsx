import React, { useState, useRef } from 'react';
import { useColors } from '../hooks/useColors';
import { ColorSwatch } from '../types';
import { Plus, Trash2, Edit2, Save, X, Palette, Upload, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { Badge } from './ui/Badge';

const AdminColorManager: React.FC = () => {
  const { colors, loading, error, addColor, updateColor, deleteColor } = useColors();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<ColorSwatch, 'id'>>({
    name: '',
    hexCode: '#000000',
    material: 'PLA',
    inStock: true,
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const storageRef = ref(storage, `swatches/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("圖片上傳失敗 (Upload failed)");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    
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
      inStock: true,
      imageUrl: ''
    });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (color: ColorSwatch) => {
    setFormData({
      name: color.name,
      hexCode: color.hexCode,
      material: color.material,
      inStock: color.inStock,
      imageUrl: color.imageUrl || ''
    });
    setImagePreview(color.imageUrl || null);
    setEditingId(color.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除此顏色？ (Are you sure?)')) {
      await deleteColor(id);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3 text-white">
          色彩管理 (Color Management) <span className="text-xs bg-[#FF5722] text-black px-2 py-1 rounded font-bold">{colors.length}</span>
        </h2>
        {!isAdding && (
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
            className="flex items-center gap-2 px-6 py-3 bg-[#FF5722] text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#E64A19] transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> 新增顏色
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white/5 p-8 rounded-2xl border border-[#FF5722]/30 mb-12 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black uppercase text-white tracking-tighter flex items-center gap-2">
               {editingId ? <Edit2 className="text-blue-500" /> : <Plus className="text-[#FF5722]" />}
               {editingId ? '編輯色卡 (Edit Swatch)' : '建立新色卡 (New Swatch)'}
             </h3>
             <button onClick={() => { setIsAdding(false); resetForm(); }} className="text-gray-500 hover:text-white transition-colors">
               <X size={24} />
             </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-[#FF5722]">實體色卡照片 (Physical Photo)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden bg-black/40 ${imagePreview ? 'border-white/20' : 'border-white/10 hover:border-[#FF5722]/40'}`}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Upload size={24} className="mb-2 text-[#FF5722]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">更換照片 (Change)</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF5722] mx-auto" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-gray-600 mx-auto mb-3 group-hover:text-[#FF5722] transition-colors" />
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">點擊上傳實體照</p>
                      </>
                    )}
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            </div>

            {/* Other Fields */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">顏色名稱 (Name)</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[#FF5722] outline-none font-bold"
                  placeholder="Ex: 絲綢消光黑"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">標示色碼 (Hex Code)</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={formData.hexCode}
                    onChange={e => setFormData({...formData, hexCode: e.target.value})}
                    className="h-14 w-14 rounded-xl cursor-pointer bg-transparent border border-white/10 overflow-hidden"
                  />
                  <input 
                    required
                    type="text" 
                    value={formData.hexCode}
                    onChange={e => setFormData({...formData, hexCode: e.target.value})}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[#FF5722] outline-none font-mono font-bold"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">材質 (Material)</label>
                <select 
                  value={formData.material}
                  onChange={e => setFormData({...formData, material: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[#FF5722] outline-none font-bold appearance-none"
                >
                  <option value="PLA">PLA</option>
                  <option value="PLA+">PLA+</option>
                  <option value="PETG">PETG</option>
                  <option value="ABS">ABS</option>
                  <option value="TPU">TPU</option>
                  <option value="Resin">Resin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input 
                  type="checkbox" 
                  id="inStock"
                  checked={formData.inStock}
                  onChange={e => setFormData({...formData, inStock: e.target.checked})}
                  className="w-6 h-6 rounded-lg accent-[#FF5722] cursor-pointer"
                />
                <label htmlFor="inStock" className="text-sm font-black uppercase text-white cursor-pointer select-none">庫存充足 (In Stock)</label>
              </div>

              <div className="md:col-span-2 pt-6">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {uploading ? '圖片上傳中...' : (editingId ? <><Save size={20} /> 更新色卡</> : <><Plus size={20} /> 建立色卡</>)}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {loading && <div className="text-center py-12 animate-pulse text-[#FF5722] font-mono tracking-widest uppercase">Syncing Palette...</div>}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colors.map(color => (
          <div key={color.id} className="group relative bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/20 transition-all hover:shadow-2xl">
             <div className="flex items-center gap-4">
                {/* Visual Circle */}
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-14 h-14 rounded-full border-4 border-white/10 shadow-2xl relative z-10"
                    style={{ backgroundColor: color.hexCode }}
                  />
                  {color.imageUrl && (
                    <div className="absolute -right-2 -top-2 w-8 h-8 rounded-lg border-2 border-white/20 overflow-hidden z-20 bg-black">
                      <img src={color.imageUrl} alt="Actual" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="font-black text-white uppercase truncate tracking-tight">{color.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-mono text-gray-500 font-black uppercase tracking-widest">{color.material}</span>
                     {!color.inStock && <Badge variant="danger" size="sm" className="px-1 text-[8px]">OUT OF STOCK</Badge>}
                  </div>
                </div>
             </div>

             {/* Action Buttons Layer */}
             <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(color)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg text-gray-500 hover:text-blue-400 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(color.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
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
