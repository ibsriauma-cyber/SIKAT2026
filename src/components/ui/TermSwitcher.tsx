import React, { useState, useEffect, useRef } from 'react';
import { remoteStorage } from '../../lib/remoteStorage';
import { ChevronDown } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

export function TermSwitcher() {
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [isTermMenuOpen, setIsTermMenuOpen] = useState(false);
  const termMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    async function loadTerms() {
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
            remoteStorage.setItem('selectedAcademicTermId', active.id);
          } else if (parsedTerms.length > 0) {
            setSelectedTermId(parsedTerms[0].id);
            remoteStorage.setItem('selectedAcademicTermId', parsedTerms[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load academic terms", e);
      }
    }
    loadTerms();
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (termMenuRef.current && !termMenuRef.current.contains(event.target as Node)) {
        setIsTermMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activeTerm = terms.find(t => t.id === selectedTermId) || terms.find(t => t.isActive) || terms[0];

  if (!activeTerm) return null;

  return (
    <div className="relative inline-block" ref={termMenuRef}>
      <button
        onClick={() => setIsTermMenuOpen(!isTermMenuOpen)}
        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[10px] text-blue-700 font-black py-1 px-3 rounded-lg transition-all shadow-sm cursor-pointer select-none active:scale-95"
      >
        <span>SMT {activeTerm.semester} {activeTerm.year?.split('/')[0]}</span>
        <ChevronDown className={`w-3 h-3 text-blue-600 transition-transform duration-200 ${isTermMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isTermMenuOpen && terms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-xl shadow-lg py-1 z-50 origin-top-left overflow-hidden"
          >
            {terms.map((term) => {
              const isSelected = term.id === selectedTermId;
              return (
                <button
                  key={term.id}
                  onClick={() => {
                    setSelectedTermId(term.id);
                    remoteStorage.setItem('selectedAcademicTermId', term.id);
                    setIsTermMenuOpen(false);
                    window.location.reload();
                  }}
                  className={`w-full text-left px-3.5 py-2 text-[10px] font-bold transition-colors flex items-center justify-between ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-700 font-extrabold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>Semester {term.semester} {term.year} {term.isActive ? '(Aktif)' : ''}</span>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
