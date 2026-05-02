import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocationStore } from '../store/useLocationStore';

export default function LocationModal({ onClose }) {
  const { detectLocation, searchLocation, isLocating, locationError } = useLocationStore();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleCurrentLocation = async () => {
    await detectLocation();
    // After detectLocation is called and sets state, we can close the modal
    setTimeout(() => {
      onClose();
    }, 800); // give it a brief moment to show loading if needed
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    const success = await searchLocation(query);
    setIsSearching(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-0">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Bar Area */}
        <div className="p-4 sm:p-6 pb-4">
          <form onSubmit={handleSearch} className="relative flex items-center border border-slate-200 rounded-2xl p-2 sm:p-3 shadow-sm bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all">
            <button type="button" onClick={onClose} className="p-1 sm:p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <input 
              type="text" 
              placeholder="Search for your location/society/apartment" 
              className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 text-sm sm:text-base placeholder:text-slate-400 px-3"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {isSearching && (
              <span className="material-symbols-outlined animate-spin text-brand shrink-0 pr-2">refresh</span>
            )}
          </form>
          {locationError && (
            <p className="text-red-500 text-xs mt-2 ml-2 font-medium">{locationError}</p>
          )}
        </div>

        {/* Current Location Button */}
        <div className="px-4 sm:px-6 pb-6">
          <button 
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-3 w-full p-3 sm:p-4 hover:bg-slate-50 rounded-2xl transition-colors group text-left"
          >
            <span className={`material-symbols-outlined text-purple-600 text-[24px] ${isLocating ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`}>
              {isLocating ? 'my_location' : 'gps_fixed'}
            </span>
            <span className="text-purple-600 font-bold text-sm sm:text-base">
              {isLocating ? 'Detecting your location...' : 'Use current location'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-2 w-full bg-slate-100/80"></div>

        {/* Powered By Google Footer */}
        <div className="p-4 flex justify-center items-center bg-slate-50">
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-xs font-semibold text-slate-500">powered by</span>
            {/* We use a simple SVG/text representation matching the google logo colors */}
            <div className="flex items-center font-bold text-[15px] tracking-tight">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
