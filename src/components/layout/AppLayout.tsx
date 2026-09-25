import React, { useState, useEffect, useRef } from 'react';
import { remoteStorage } from '../../lib/remoteStorage';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Role } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

import { UserAvatar } from '../ui/UserAvatar';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { App as CapacitorApp } from '@capacitor/app';

export function AppLayout() {
  const { user, logout, switchRole, updateUser } = useAuth();
  const navigate = useNavigate();
  const { isInstallable, promptInstall } = usePWAInstall();
  const location = useLocation();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isTermMenuOpen, setIsTermMenuOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      apiClient(`/notifications.php?user_id=${user.id}`)
        .then(data => {
          if (Array.isArray(data)) {
            const count = data.filter(n => !n.is_read).length;
            setUnreadNotifCount(count);
          }
        })
        .catch(err => console.error('Failed to fetch notifications', err));
    }
  }, [user?.id, location.pathname]);
  
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  const menuRef = useRef<HTMLDivElement>(null);
  const termMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadTerms() {
      if (typeof window !== 'undefined') {
        try {
          const data = await apiClient('/crud.php?table=academic_terms');
          const parsedTerms = data.map((t: any) => ({
            id: String(t.id),
            year: t.year,
            semester: t.semester,
            isActive: Boolean(t.is_active)
          }));
          setTerms(parsedTerms);
          
          const savedId = remoteStorage.getItem('selectedAcademicTermId');
          if (savedId && parsedTerms.find((t: any) => t.id === savedId)) {
            setSelectedTermId(savedId);
          } else {
            const active = parsedTerms.find((t: any) => t.isActive);
            if (active) {
              setSelectedTermId(active.id);
            } else if (parsedTerms.length > 0) {
              setSelectedTermId(parsedTerms[0].id);
            }
          }
        } catch (e) {
          console.error("Failed to load academic terms", e);
        }
      }
    }
    loadTerms();
  }, []);

  const activeTerm = terms.find(t => t.id === selectedTermId) || terms.find(t => t.isActive) || terms[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (termMenuRef.current && !termMenuRef.current.contains(event.target as Node)) {
        setIsTermMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;

    // Push state to shield back button on home page
    window.history.pushState({ isHomeGuard: true }, '');

    const handlePopState = (event: PopStateEvent) => {
      if ((window as any).__isExitingApp) return;
      setShowExitModal(true);
      window.history.pushState({ isHomeGuard: true }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);

  const handleExitApp = async () => {
    setShowExitModal(false);
    
    try {
      await CapacitorApp.exitApp();
    } catch (e) {
      console.log('Capacitor exitApp not available');
    }
    
    (window as any).__isExitingApp = true;
    
    // Back out of the history trap
    window.history.go(-2);
    
    // Fallback if history.go doesn't close the app
    setTimeout(() => {
      window.close();
      window.location.href = 'about:blank';
    }, 300);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      <Sidebar unreadNotifCount={unreadNotifCount} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {location.pathname !== '/' ? (
              <button
                onClick={() => {
                  navigate(-1);
                }}
                className="flex sm:hidden items-center space-x-1.5 text-emerald-700 hover:text-emerald-800 active:scale-95 transition-all py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider">Kembali</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 shrink-0 sm:hidden">
                <img src="/logo.png" alt="SIKAT MA AL-IHSAN Logo" className="h-9 w-auto max-w-[100px] object-contain shrink-0" />
                <div className="leading-tight">
                  <h1 className="font-black text-xs text-slate-800 tracking-wider">SIKAT MA AL-IHSAN</h1>
                  <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest">SYSTEM v1.0</p>
                </div>
              </div>
            )}
            
            <h2 className="text-sm font-bold text-slate-600 hidden sm:block">Dashboard {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative hidden sm:block">
              <input type="text" placeholder="Cari..." className="bg-slate-100 border-none rounded-full py-1.5 px-4 text-xs w-48 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
            </div>
            
            <span className="hidden sm:block h-6 w-[1px] bg-slate-200" />
            
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-4">
              <div className="flex flex-col items-end gap-1.5 text-right">
                <p className="hidden sm:block text-xs font-bold text-slate-800">{user.name}</p>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2">
                  {user.roles && user.roles.length > 1 ? (
                  <>
                    <div className="relative hidden sm:inline-block" ref={menuRef}>
                      <button
                        onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                        className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] text-emerald-700 font-black capitalize py-1 px-3 rounded-lg transition-all shadow-sm cursor-pointer select-none active:scale-95"
                      >
                        <span>Role: {user.role.replace('_', ' ')}</span>
                        <ChevronDown className={`w-3 h-3 text-emerald-600 transition-transform duration-200 ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isRoleMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200/80 rounded-xl shadow-lg py-1 z-[9999] origin-top-right overflow-hidden"
                          >
                            {(Array.isArray(user.roles) ? user.roles : [user.role]).map((r) => {
                              const isActive = user.role === r;
                              return (
                                <button
                                  key={r}
                                  onClick={() => {
                                    switchRole(r as Role);
                                    setIsRoleMenuOpen(false);
                                    navigate('/');
                                  }}
                                  className={`w-full text-left px-3.5 py-2 text-[10px] font-bold capitalize transition-colors flex items-center justify-between ${
                                    isActive 
                                      ? 'bg-emerald-50 text-emerald-700 font-extrabold' 
                                      : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{r.replace('_', ' ')}</span>
                                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <p className="hidden sm:block text-[10px] text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
                )}

                </div>
              </div>
              <div 
                className="hidden sm:block w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden relative cursor-pointer group shrink-0"
                onClick={() => document.getElementById('desktop-avatar-upload')?.click()}
                title="Ganti Foto Profil"
              >
                 <UserAvatar src={user.avatar} name={user.name} className="w-full h-full" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] text-white font-bold">Edit</span>
                 </div>
              </div>
              <input 
                type="file" 
                id="desktop-avatar-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        updateUser({ avatar: reader.result });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            
            <div className="flex items-center space-x-2 sm:pl-4 sm:border-l border-slate-200">
              {isInstallable && (
                <button
                  onClick={promptInstall}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full text-xs font-bold transition-colors mr-2 cursor-pointer"
                  title="Install Aplikasi"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              )}
              {isInstallable && (
                <button
                  onClick={promptInstall}
                  className="sm:hidden flex items-center justify-center w-8 h-8 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full transition-colors mr-1 cursor-pointer"
                  title="Install Aplikasi"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => navigate('/notifications')} className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 rounded-full border border-white text-[9px] font-bold text-white px-1">
                    {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3.5 sm:p-6 pb-24 sm:pb-6 space-y-4 sm:space-y-6">
          <Outlet />
        </div>
      </main>
      <MobileNav unreadNotifCount={unreadNotifCount} />

      {/* Exit Confirmation Dialog Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitModal(false)}
              className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Keluar dari Aplikasi?</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin keluar dari aplikasi Sistem Terpadu MAS Al-Ihsan IBS Riau?
                </p>
              </div>
              <div className="flex border-t border-slate-100 bg-slate-50 p-4 gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleExitApp}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-500/10 transition-all active:scale-95 cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
                  <LogOut className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Keluar dari Akun?</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin keluar dari sesi ini? Anda harus login kembali untuk mengakses aplikasi.
                </p>
              </div>
              <div className="flex border-t border-slate-100 bg-slate-50 p-4 gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-500/10 transition-all active:scale-95 cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
