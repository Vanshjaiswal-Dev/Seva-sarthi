/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProviderStore } from '../store/useProviderStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLanguageStore } from '../store/useLanguageStore';
import { allCategories, getCategoryItems } from '../lib/constants';

function ProCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-5 animate-pulse">
      <div className="w-full sm:w-48 h-48 rounded-xl bg-slate-100" />
      <div className="flex-grow py-2 space-y-4 flex flex-col justify-between">
        <div><div className="h-6 w-48 bg-slate-100 rounded mb-2" /><div className="h-4 w-32 bg-slate-100 rounded" /></div>
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="flex justify-between items-end mt-4">
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
          <div className="flex gap-2"><div className="h-10 w-24 bg-slate-100 rounded-xl" /><div className="h-10 w-24 bg-slate-100 rounded-xl" /></div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDiscovery() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuthStore();
  const { services, loading: isLoading, fetchServices } = useProviderStore();
  const { t } = useLanguageStore();

  // State from navigation
  const navState = location.state || {};

  const [searchTerm, setSearchTerm] = useState(navState.query || '');
  const [dbCategoryFilter, setDbCategoryFilter] = useState(navState.dbCategory || '');
  const [keywordsFilter, setKeywordsFilter] = useState(navState.keywords || []);
  const [displayName, setDisplayName] = useState(navState.displayName || '');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('relevance');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Sync state when navigation changes
  useEffect(() => {
    if (navState.dbCategory) {
      setDbCategoryFilter(navState.dbCategory);
      setKeywordsFilter(navState.keywords || []);
      setDisplayName(navState.displayName || '');
      setSearchTerm('');
    }
    if (navState.query) {
      setSearchTerm(navState.query);
      setDbCategoryFilter('');
      setKeywordsFilter([]);
      setDisplayName('');
    }
  }, [navState.dbCategory, navState.query, navState.displayName]);

  const handleBookNow = (svc) => {
    const proId = svc.providerId?._id || svc.providerId;
    navigate(currentUser ? '/booking' : '/auth', {
      state: { providerId: proId, serviceId: svc._id, basePrice: svc.basePrice, serviceName: svc.name }
    });
  };
  const handleViewProfile = (proId) => navigate(currentUser ? `/provider/${proId}` : '/auth');

  const clearFilters = () => {
    setSearchTerm(''); setDbCategoryFilter(''); setKeywordsFilter([]); setDisplayName('');
    setMaxPrice(5000); setMinRating(0); setSortBy('relevance');
    // Clear navigation state
    window.history.replaceState({}, document.title);
  };

  /* ── INDUSTRY-LEVEL FILTERING ── */
  const filteredServices = useMemo(() => {
    let results = services.filter(svc => {
      const nameText = (svc.name || '').toLowerCase();
      const descText = (svc.description || '').toLowerCase();
      const proNameText = (svc.providerId?.name || '').toLowerCase();
      const catText = (svc.category || '').toLowerCase();

      // 1. DB Category filter (hard match)
      if (dbCategoryFilter) {
        if (svc.category !== dbCategoryFilter) return false;
      }

      // 2. Keyword filter (soft match within DB category)
      if (keywordsFilter.length > 0 && dbCategoryFilter) {
        const hasKeywordMatch = keywordsFilter.some(kw =>
          nameText.includes(kw.toLowerCase()) || descText.includes(kw.toLowerCase())
        );
        // Only apply keyword filtering for broad categories
        const broadCategories = ['Appliance Repair', 'Professional Cleaning', 'Home Maintenance'];
        if (broadCategories.includes(dbCategoryFilter) && !hasKeywordMatch) {
          return false;
        }
      }

      // 3. Text search (fuzzy across all fields)
      if (searchTerm.trim()) {
        const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 1);
        if (words.length > 0) {
          const matchesAny = words.some(word =>
            nameText.includes(word) ||
            descText.includes(word) ||
            proNameText.includes(word) ||
            catText.includes(word)
          );
          if (!matchesAny) return false;
        }
      }

      // 4. Price filter
      if (svc.basePrice > maxPrice) return false;

      // 5. Rating filter
      if ((svc.rating || 5) < minRating) return false;

      return true;
    });

    // If keyword filter returned 0 results but we have a DB category, fall back to showing all in that category
    if (results.length === 0 && dbCategoryFilter && keywordsFilter.length > 0) {
      results = services.filter(svc => {
        if (svc.category !== dbCategoryFilter) return false;
        if (svc.basePrice > maxPrice) return false;
        if ((svc.rating || 5) < minRating) return false;
        return true;
      });
    }

    // Sort
    const sorted = [...results];
    if (sortBy === 'lowestPrice') sorted.sort((a, b) => a.basePrice - b.basePrice);
    if (sortBy === 'highestPrice') sorted.sort((a, b) => b.basePrice - a.basePrice);
    if (sortBy === 'highestRated') sorted.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return sorted;
  }, [services, searchTerm, dbCategoryFilter, keywordsFilter, maxPrice, minRating, sortBy]);

  const isFiltered = searchTerm || dbCategoryFilter;
  const pageTitle = displayName
    ? `${displayName} Services`
    : dbCategoryFilter
      ? `${dbCategoryFilter} Services`
      : searchTerm
        ? `Results for "${searchTerm}"`
        : 'Explore Services';

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Search */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-slate-900 tracking-tight">
                {pageTitle}
              </h1>
              {isFiltered && (
                <button onClick={clearFilters} className="mt-2 text-sm font-semibold text-amber-600 hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to all categories
                </button>
              )}
            </div>
            <div className="relative w-full md:w-[450px]">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                <span className="material-symbols-outlined pl-4 text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Search for services or professionals..."
                  className="flex-grow px-3 py-3 bg-transparent border-none focus:ring-0 text-slate-800 font-medium text-sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value) { setDbCategoryFilter(''); setKeywordsFilter([]); setDisplayName(''); } }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="p-1 mr-1 text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                )}
                <button className="bg-slate-900 text-white px-5 py-3 font-bold text-sm hover:bg-slate-800 transition-colors">Search</button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Landing View (no filters active) */}
        {!isFiltered ? (
          <div className="space-y-12">
            {allCategories.map((cat) => {
              const items = getCategoryItems(cat);
              return (
                <div key={cat.id} className="bg-white p-7 rounded-2xl border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">{cat.title}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => { setDbCategoryFilter(item.dbCategory); setKeywordsFilter(item.keywords); setDisplayName(item.name); }}
                        className="flex flex-col items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="w-[80px] h-[80px] bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-amber-300 group-hover:bg-amber-50 transition-all">
                          <span className="material-symbols-outlined text-[32px] text-slate-500 group-hover:text-amber-600 transition-colors">{item.icon}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 text-center leading-tight max-w-[100px] group-hover:text-amber-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Filtered Results View */
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-amber-600 text-lg">tune</span> Filters</h3>
                  <button onClick={clearFilters} className="text-xs font-bold text-amber-600 hover:underline">Clear All</button>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">Sort By</h4>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 focus:border-amber-500 outline-none cursor-pointer">
                    <option value="relevance">Relevance</option>
                    <option value="highestRated">Highest Rated</option>
                    <option value="lowestPrice">Lowest Price</option>
                    <option value="highestPrice">Highest Price</option>
                  </select>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider flex justify-between">
                    <span>Max Price</span><span className="text-amber-600">₹{maxPrice}</span>
                  </h4>
                  <input type="range" min="200" max="5000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-600" />
                  <div className="flex justify-between mt-1.5 text-[10px] font-bold text-slate-400"><span>₹200</span><span>₹5000+</span></div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">Rating</h4>
                  <div className="space-y-1.5">
                    {[4, 3].map(rating => (
                      <button key={rating} onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all border ${minRating === rating ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-200'}`}>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {rating}.0 & Above
                        </span>
                        {minRating === rating && <span className="material-symbols-outlined text-sm">check_circle</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-grow">
              <div className="mb-5">
                <p className="text-slate-500 font-medium text-sm">{filteredServices.length} professionals found</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <AnimatePresence>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <ProCardSkeleton key={`sk-${i}`} />)
                  ) : (
                    filteredServices.map((svc) => {
                      const proName = svc.providerId?.name || 'Expert';
                      const avatar = svc.providerId?.avatar || `https://ui-avatars.com/api/?name=${proName}&background=F59E0B&color=fff`;
                      const providerIdStr = svc.providerId?._id || svc.providerId;

                      return (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key={svc._id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 group hover:shadow-lg transition-shadow duration-300">
                          <div className="flex flex-col sm:flex-row gap-5 h-full">
                            <div className="relative w-full sm:w-44 h-44 sm:h-auto flex-shrink-0 overflow-hidden rounded-xl cursor-pointer" onClick={() => handleViewProfile(providerIdStr)}>
                              <img src={svc.image || avatar} alt={svc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                              <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-amber-400 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-[11px] font-bold text-slate-800">{svc.rating || '4.8'}</span>
                              </div>
                            </div>
                            <div className="flex flex-col flex-grow">
                              <div className="mb-1.5">
                                <h3 onClick={() => handleViewProfile(providerIdStr)} className="text-lg font-extrabold text-slate-900 cursor-pointer hover:text-amber-600 transition-colors leading-tight mb-0.5">{svc.name}</h3>
                                <p className="text-slate-500 text-xs font-medium">By {proName}</p>
                              </div>
                              <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-3 flex-grow">{svc.description}</p>
                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Starts at</span>
                                  <span className="text-xl font-black text-slate-900">₹{svc.basePrice || 299}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleViewProfile(providerIdStr)} className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">View Profile</button>
                                  <button onClick={() => handleBookNow(svc)} className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-amber-600 transition-colors">Book Now</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>

                {!isLoading && filteredServices.length === 0 && (
                  <div className="col-span-full py-20 bg-white rounded-2xl border border-slate-200 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined text-3xl text-slate-400">search_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No professionals found</h3>
                    <p className="text-slate-500 max-w-md mb-5 text-sm">We couldn't find any services matching your criteria. Try adjusting your filters.</p>
                    <button onClick={clearFilters} className="px-6 py-2.5 bg-amber-50 text-amber-700 font-bold rounded-lg hover:bg-amber-100 transition-colors text-sm">Clear all filters</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
