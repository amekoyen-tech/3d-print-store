import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface AdminProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => Promise<void>;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    materials: '',
    weight_g: '',
    print_time_min: '',
    post_processing_time_min: '',
    price: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const newProduct: Omit<Product, 'id'> = {
        name: formData.name,
        materials: formData.materials.split(',').map(s => s.trim()).filter(Boolean),
        weight_g: Number(formData.weight_g),
        print_time_min: Number(formData.print_time_min),
        post_processing_time_min: Number(formData.post_processing_time_min),
        price: Number(formData.price),
        images: imageUrl ? [imageUrl] : [],
        description: formData.description,
      };

      await onSubmit(newProduct);
      
      // Reset form
      setFormData({
        name: '',
        materials: '',
        weight_g: '',
        print_time_min: '',
        post_processing_time_min: '',
        price: '',
        description: '',
      });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      alert('產品已新增 (Product Added)');
    } catch (error) {
      console.error(error);
      alert('新增失敗 (Failed to add)');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722] transition-colors font-mono text-sm";
  const labelClass = "block text-[#FF5722] text-xs font-bold uppercase tracking-widest mb-2";

  return (
    <form onSubmit={handleSubmit} className="bg-black/40 border border-white/10 p-8 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5722]" />
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
        <Plus className="text-[#FF5722]" />
        新增產品 (Add Product)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>產品名稱 (Name)</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="例如: 工業齒輪 XL"
          />
        </div>

        <div>
          <label className={labelClass}>適用材料 (Materials)</label>
          <input
            name="materials"
            value={formData.materials}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="PLA, PETG, ABS (逗號分隔)"
          />
        </div>

        <div>
          <label className={labelClass}>重量 (Weight g)</label>
          <input
            name="weight_g"
            type="number"
            value={formData.weight_g}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label className={labelClass}>價格 (Price TWD)</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label className={labelClass}>列印時間 (Print Min)</label>
          <input
            name="print_time_min"
            type="number"
            value={formData.print_time_min}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label className={labelClass}>後處理時間 (Post-Process Min)</label>
          <input
            name="post_processing_time_min"
            type="number"
            value={formData.post_processing_time_min}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>產品圖片 (Product Image) <span className="text-gray-500 lowercase">(選填 Optional)</span></label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-full h-48 border-2 border-dashed border-white/10 hover:border-[#FF5722]/50 transition-colors cursor-pointer flex flex-col items-center justify-center bg-white/5 overflow-hidden"
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="text-[#FF5722] mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">更換圖片 (Change)</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <ImageIcon size={32} className="text-gray-600 mx-auto mb-2 group-hover:text-[#FF5722] transition-colors" />
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">點擊或拖放圖片上傳</p>
                <p className="text-[10px] text-gray-600 mt-1 uppercase">JPG, PNG, WEBP (Max 5MB)</p>
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

        <div className="md:col-span-2">
          <label className={labelClass}>產品描述 (Description)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className={inputClass}
            placeholder="詳細規格與說明..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-black uppercase tracking-[0.2em] py-4 px-8 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            處理中 (PROCESSING)...
          </>
        ) : '提交產品 (SUBMIT)'}
      </button>
    </form>
  );
};

export default AdminProductForm;
