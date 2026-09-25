import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { KeyRound, User as UserIcon, Eye, EyeOff, X } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

export function Login() {
  
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus('loading');
    
    try {
      await apiClient('/request_reset.php', {
        method: 'POST',
        body: JSON.stringify({ username: forgotUsername })
      });
      setForgotStatus('success');
    } catch (err) {
      console.error(err);
      setForgotStatus('success'); // Still show success so user isn't alarmed
    }
  };

  const closeForgotModal = () => {
  
    setShowForgotModal(false);
    setTimeout(() => {
      setForgotStatus('idle');
      setForgotUsername('');
    }, 300);
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient('/login.php', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (response.status === 'success' && response.user) {
        login(response.user.id.toString(), response.user);
        setLoading(false);
        return;
      } else {
        setError(response.message || 'Username atau password salah');
        setLoading(false);
        return;
      }
    } catch (apiError) {
      console.warn("API Login failed", apiError);
      setError('Terjadi kesalahan pada server. Coba lagi nanti.');
    }
    setLoading(false);
  };

  return (
    <>
    <div className="h-[100dvh] flex items-center justify-center bg-slate-100 md:p-4 font-sans text-slate-800 overflow-hidden">
      <div className="w-full h-full md:h-auto md:max-w-4xl md:w-full bg-white md:rounded-3xl md:shadow-xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Side (Top on Mobile) - Green Background */}
        <div className="w-full h-[55%] md:h-auto md:w-1/2 bg-[#126442] text-white p-4 md:p-12 flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-20%] left-[-10%] w-64 h-64 rounded-full bg-white blur-3xl"></div>
             <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 rounded-full bg-white blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center mt-0">
            <div className="w-20 md:w-28 lg:w-36 my-1 md:my-2">
              <img src="/logo.png" alt="Logo MAS Al-Ihsan" className="w-full h-auto object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            </div>
            
            <h2 className="text-base md:text-2xl font-bold mb-1 md:mb-4">Keutamaan Menuntut Ilmu</h2>
            
            <div className="hidden md:block mb-2 md:mb-6">
              <p className="text-xl md:text-3xl text-[#F2C94C]" dir="rtl" style={{ fontFamily: '"KFGQPC Uthman Taha Naskh", "Amiri Quran", "Amiri", "Traditional Arabic", serif', lineHeight: '1.7' }}>
                مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ
              </p>
            </div>
            
            <p className="text-xs md:text-base italic mb-1 md:mb-4 opacity-90 max-w-[280px] md:max-w-sm px-2">
              "Barangsiapa menempuh suatu jalan untuk menuntut ilmu, maka Allah memudahkan baginya jalan menuju surga."
            </p>
            
            <p className="text-xs md:text-sm font-bold opacity-80">(HR. Muslim)</p>
          </div>
        </div>

        {/* Right Side (Bottom on Mobile) - Login Form */}
        <div className="w-full h-[50%] md:h-auto md:w-1/2 p-6 md:p-12 bg-white flex flex-col justify-start md:justify-center absolute bottom-0 md:relative rounded-t-3xl md:rounded-none z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-none">
          
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 md:hidden"></div>
          
          <div className="mb-6 hidden md:block">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">MAS Al-Ihsan IBS</h1>
            <p className="text-sm text-emerald-600 font-semibold mt-1">Sistem Informasi Akademik Terpadu</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 text-center font-bold">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-[11px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2">Username / NIS / NIPTK</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  className="block w-full pl-10 pr-3 py-2.5 md:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none transition-all placeholder:text-slate-400"
                  placeholder="Username, NIS, atau NIPTK"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2">Password</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 md:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                 <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }} className="text-[10px] md:text-xs font-bold text-[#b49021] hover:text-[#d4aa27] transition-colors">Lupa Password?</a>
              </div>
            </div>
            
            <div className="pt-1 md:pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#126442] hover:bg-[#0e4e33] text-white font-bold py-3 md:py-3.5 px-4 rounded-xl transition-all shadow-md shadow-[#126442]/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-70 text-sm md:text-base"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Reset Password</h3>
              <button onClick={closeForgotModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              {forgotStatus === 'success' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Permintaan Terkirim!</h4>
                  <p className="text-sm text-slate-600 mb-6">
                    Permintaan reset password untuk <span className="font-semibold text-slate-800">{forgotUsername}</span> telah diteruskan ke administrator madrasah.
                  </p>
                  <div className="flex flex-col gap-3">
                    <a 
                      href={"https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20mereset%20password%20untuk%20akun%20dengan%20username/NIS%3A%20" + forgotUsername} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      Hubungi via WhatsApp
                    </a>
                    <button onClick={closeForgotModal} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all text-sm">
                      Tutup
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-slate-600 mb-2">
                    Masukkan Username atau NIS Anda. Sistem akan mengirimkan notifikasi permintaan reset password ke administrator madrasah.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Username / NIS</label>
                    <input
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none transition-all placeholder:text-slate-400"
                      placeholder="Masukkan Username / NIS Anda"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotStatus === 'loading' || !forgotUsername.trim()}
                    className="w-full bg-[#126442] hover:bg-[#0e4e33] text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-70 text-sm mt-4"
                  >
                    {forgotStatus === 'loading' ? 'Memproses...' : 'Kirim Permintaan Reset'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
