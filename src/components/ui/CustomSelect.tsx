import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Search, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '-- Pilih --',
  className,
  disabled = false,
  required = false,
  searchable = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside and handle positioning
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    function updatePosition() {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        
        let style: React.CSSProperties = {
          position: 'fixed',
          left: rect.left,
          width: rect.width,
          top: rect.bottom + 4,
          zIndex: 99999,
        };
        
        // Cap the height if it gets too close to the bottom of the screen
        if (spaceBelow < 250) {
          style.maxHeight = Math.max(140, spaceBelow - 12);
        } else {
          style.maxHeight = 250;
        }
        
        setDropdownStyle(style);
      }
    }

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true); // true for capture phase to catch all scroll events
      window.addEventListener('resize', updatePosition);
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, options.length, searchable]);

  // Reset search query when dropdown opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    } else if (searchable) {
      // Focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  // Filter options based on search query
  const filteredOptions = searchQuery.trim() === ''
    ? options
    : options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const renderDropdownContent = () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={dropdownStyle}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-60"
        >
          {searchable && (
            <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Ketik untuk mencari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent border-none outline-none focus:ring-0 placeholder-slate-400 text-slate-700 font-medium"
              />
            </div>
          )}
          
          <div className="p-1 space-y-0.5 overflow-y-auto flex-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left font-medium transition-colors",
                        isSelected 
                          ? "bg-emerald-50 text-emerald-800 font-bold" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
                {searchable && searchQuery.trim() !== '' && !options.some(opt => opt.value.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelect(searchQuery.trim())}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-center font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 animate-pulse" /> Gunakan "{searchQuery.trim()}"
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-1 space-y-1">
                <div className="px-3 py-2 text-xs text-slate-400 text-center font-medium">
                  Tidak ada opsi yang cocok
                </div>
                {searchable && searchQuery.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => handleSelect(searchQuery.trim())}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-center font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 animate-pulse" /> Gunakan "{searchQuery.trim()}"
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-left",
          disabled && "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed hover:border-slate-100"
        )}
      >
        <span className={cn("truncate font-medium", !selectedOption ? "text-slate-400" : "text-slate-700 font-semibold")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5", 
            isOpen && "transform rotate-180 text-emerald-600"
          )} 
        />
      </button>

      {/* Hidden input for HTML form validation if required */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
      )}

      {/* Smooth Animated Dropdown Container inside Portal */}
      {typeof document !== 'undefined' && createPortal(
        renderDropdownContent(),
        document.body
      )}
    </div>
  );
}
