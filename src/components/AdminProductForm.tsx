import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { Plus, X, Upload, Image as ImageIcon, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface AdminProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => Promise<void>;
  initialData?: Product | null;
  onCancel?: () => void;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    materials: '',
    weight_g: '',
    print_time_min: '',
    post_processing_time_min: '',
    price: '',
    description: '',
    isCustomizable: false,
    customizationFee: '',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        materials: (initialData.materials || []).join(', '),
        weight_g: String(initialData.weight_g || ''),
        print_time_min: String(initialData.print_time_min || ''),
        post_processing_time_min: String(initialData.post_processing_time_min || ''),
        price: String(initialData.price || ''),
        description: initialData.description || '',
        isCustomizable: initialData.isCustomizable || false,
        customizationFee: String(initialData.customizationFee || ''),
      });
      // 設置現有圖片 URLs
      const urls = initialData.images || [];
      setExistingImageUrls(urls);
      setImagePreviews(urls);
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
      name: '',
      materials: '',
      weight_g: '',
      print_time_min: '',
      post_processing_time_min: '',
      price: '',
      description: '',
      isCustomizable: false,
      customizationFee: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImageUrls([]);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
       setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);

    // 驗證文件大小（每個 < 5MB）
    const oversized = newFiles.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      alert(`以下檔案超過 5MB 限制：${oversized.map(f => f.name).join(', ')}`);
      return;
    }

    // 驗證總數量（最多 5 張）
    const totalCount = existingImageUrls.length + imageFiles.length + newFiles.length;
    if (totalCount > 5) {
      alert(`最多只能上傳 5 張圖片（目前已有 ${existingImageUrls.length + imageFiles.length} 張）`);
      return;
    }

    // 添加新文件
    setImageFiles(prev => [...prev, ...newFiles]);

    // 生成預覽
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    if (index < existingImageUrls.length) {
      // 移除現有 URL
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      // 移除新文件
      const fileIndex = index - existingImageUrls.length;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    // 更新預覽順序
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      const [moved] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, moved);
      return newPreviews;
    });

    // 同步更新 URLs 和文件
    const isFromExisting = fromIndex < existingImageUrls.length;
    const isToExisting = toIndex < existingImageUrls.length;

    if (isFromExisting && isToExisting) {
      // 兩者都是現有 URL
      setExistingImageUrls(prev => {
        const newUrls = [...prev];
        const [moved] = newUrls.splice(fromIndex, 1);
        newUrls.splice(toIndex, 0, moved);
        return newUrls;
      });
    } else if (!isFromExisting && !isToExisting) {
      // 兩者都是新文件
      const fromFileIndex = fromIndex - existingImageUrls.length;
      const toFileIndex = toIndex - existingImageUrls.length;
      setImageFiles(prev => {
        const newFiles = [...prev];
        const [moved] = newFiles.splice(fromFileIndex, 1);
        newFiles.splice(toFileIndex, 0, moved);
        return newFiles;
      });
    } else {
      // 混合情況：需要在 URL 和文件之間轉換（複雜，暫時不支持跨邊界）
      alert('請將現有圖片和新圖片分別排序');
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setUploadProgress(0);
    const uploadPromises = files.map(async (file, index) => {
      const storageRef = ref(storage, `products/${Date.now()}-${index}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setUploadProgress(prev => prev + (100 / files.length));
      return url;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 從現有 URLs 開始
      let finalImageUrls = [...existingImageUrls];

      // 並行上傳新文件
      if (imageFiles.length > 0) {
        const newUrls = await uploadImages(imageFiles);
        finalImageUrls = [...finalImageUrls, ...newUrls];
      }

      const productData: Omit<Product, 'id'> = {
        name: formData.name,
        materials: formData.materials.split(',').map(s => s.trim()).filter(Boolean),
        weight_g: Number(formData.weight_g),
        print_time_min: Number(formData.print_time_min),
        post_processing_time_min: Number(formData.post_processing_time_min),
        price: Number(formData.price),
        images: finalImageUrls,
        description: formData.description,
        isCustomizable: formData.isCustomizable,
        customizationFee: formData.customizationFee ? Number(formData.customizationFee) : 0,
      };

      await onSubmit(productData);

      if (!initialData) {
        resetForm();
        alert('產品已新增 (Product Added)');
      } else {
        alert('產品已更新 (Product Updated)');
      }
    } catch (error: any) {
      console.error(error);
      alert('上傳失敗: ' + (error.message || '未知錯誤'));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722] transition-colors font-mono text-sm";
  const labelClass = "block text-[#FF5722] text-xs font-bold uppercase tracking-widest mb-2";

  return (
    <form onSubmit={handleSubmit} className="bg-black/40 border border-white/10 p-8 backdrop-blur-sm relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${initialData ? 'bg-blue-500' : 'bg-[#FF5722]'}`} />
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          {initialData ? <ImageIcon className="text-blue-500" /> : <Plus className="text-[#FF5722]" />}
          {initialData ? '編輯產品 (Edit Product)' : '新增產品 (Add Product)'}
        </h2>
        {initialData && (
          <button 
            type="button" 
            onClick={onCancel}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

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
          <label className={labelClass}>後製時間 (Post-Process Min)</label>
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

        <div className="md:col-span-2 bg-white/5 border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label htmlFor="isCustomizable" className="text-sm font-black uppercase tracking-widest text-[#FF5722] cursor-pointer block">
                開啟顏色客製化
              </label>
              <p className="text-[10px] text-gray-500 uppercase">Enable Color Customization</p>
            </div>
            <input
              type="checkbox"
              id="isCustomizable"
              name="isCustomizable"
              checked={formData.isCustomizable}
              onChange={handleChange}
              className="w-6 h-6 accent-[#FF5722] cursor-pointer"
            />
          </div>
          
          {formData.isCustomizable && (
            <div className="pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className={labelClass}>客製化加價 (Custom Fee TWD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">$</span>
                <input
                  name="customizationFee"
                  type="number"
                  value={formData.customizationFee}
                  onChange={handleChange}
                  className={`${inputClass} pl-8`}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            產品圖片 (Product Images)
            <span className="text-gray-500 lowercase ml-2">(選填 Optional, 最多 5 張)</span>
            {imagePreviews.length > 0 && (
              <span className="ml-2 text-white">{imagePreviews.length}/5</span>
            )}
          </label>

          {/* 預覽網格 */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[#FF5722]/50 transition-colors">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* 主圖標記 */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-[#FF5722] text-black text-[8px] px-2 py-0.5 font-bold uppercase tracking-widest">
                    主圖
                  </div>
                )}

                {/* 移除按鈕 */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/80 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X size={14} />
                </button>

                {/* 重排序按鈕 */}
                <div className="absolute bottom-1 left-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => reorderImages(index, index - 1)}
                      className="flex-1 bg-black/80 text-white p-1 rounded text-xs flex items-center justify-center hover:bg-[#FF5722]"
                      title="向左移動"
                    >
                      <ArrowLeft size={12} />
                    </button>
                  )}
                  {index < imagePreviews.length - 1 && (
                    <button
                      type="button"
                      onClick={() => reorderImages(index, index + 1)}
                      className="flex-1 bg-black/80 text-white p-1 rounded text-xs flex items-center justify-center hover:bg-[#FF5722]"
                      title="向右移動"
                    >
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 添加更多按鈕 */}
            {imagePreviews.length < 5 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-white/10 hover:border-[#FF5722]/50 transition-colors cursor-pointer flex flex-col items-center justify-center bg-white/5 rounded-xl group"
              >
                <Plus size={24} className="text-gray-600 group-hover:text-[#FF5722] transition-colors" />
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">新增</span>
              </div>
            )}
          </div>

          {/* 上傳提示 */}
          {imagePreviews.length === 0 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-white/10 hover:border-[#FF5722]/50 transition-colors cursor-pointer flex flex-col items-center justify-center bg-white/5 rounded-xl group"
            >
              <ImageIcon size={32} className="text-gray-600 mb-2 group-hover:text-[#FF5722] transition-colors" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">點擊上傳圖片</p>
              <p className="text-[10px] text-gray-600 mt-1 uppercase">JPG, PNG, WEBP · 每張最大 5MB · 最多 5 張</p>
            </div>
          )}

          {/* 上傳進度條 */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-3 bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
              <div
                className="bg-[#FF5722] h-full transition-all duration-300 flex items-center justify-center text-[8px] font-bold text-black"
                style={{ width: `${uploadProgress}%` }}
              >
                {Math.round(uploadProgress)}%
              </div>
            </div>
          )}

          {/* 隱藏的文件輸入 - 添加 multiple */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesChange}
            className="hidden"
            accept="image/*"
            multiple
          />
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

      <div className="flex gap-4 mt-8">
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] py-4 px-8 border border-white/10 transition-all"
          >
            取消 (CANCEL)
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`flex-[2] ${initialData ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#FF5722] hover:bg-[#FF5722]/90'} text-white font-black uppercase tracking-[0.2em] py-4 px-8 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {uploadProgress > 0 ? (
                <>上傳中 {Math.round(uploadProgress)}%...</>
              ) : (
                <>處理中 (PROCESSING)...</>
              )}
            </>
          ) : (
            <>
              {initialData ? <Save size={20} /> : <Plus size={20} />}
              {initialData ? '更新產品 (UPDATE)' : '提交產品 (SUBMIT)'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminProductForm;
