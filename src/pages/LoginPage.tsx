import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Key, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError('登入失敗，請檢查您的電子郵件或密碼。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,87,34,0.05),transparent_70%)]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF5722] to-transparent"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4 border border-neutral-700 shadow-inner">
            <Lock className="text-[#FF5722]" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider">管理員登入</h1>
          <p className="text-neutral-500 mt-2 text-sm uppercase tracking-widest">系統管理介面</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-neutral-400 text-sm font-medium ml-1">電子郵件</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#FF5722] transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400 text-sm font-medium ml-1">密碼</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#FF5722] transition-colors">
                <Key size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF5722] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#F4511E] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(255,87,34,0.3)] hover:shadow-[0_6px_20px_rgba(255,87,34,0.4)]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>登入中...</span>
              </>
            ) : (
              <span>登入</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
