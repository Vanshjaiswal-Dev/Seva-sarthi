/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProviderStore } from '../store/useProviderStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLanguageStore } from '../store/useLanguageStore';

// Mock removed. Real data fetched via useProviderStore.
const allCategories = [
  { key: 'sd_home_maintenance', value: 'Home Maintenance' },
  { key: 'sd_prof_cleaning', value: 'Professional Cleaning' },
  { key: 'sd_electrical_works', value: 'Electrical Works' },
  { key: 'sd_gardening_landscaping', value: 'Gardening & Landscaping' }
];

const categoryTranslationMap = {
  'Home Maintenance': 'sd_home_maintenance',
  'Professional Cleaning': 'sd_prof_cleaning',
  'Electrical Works': 'sd_electrical_works',
  'Gardening & Landscaping': 'sd_gardening_landscaping',
  'Electrician': 'cat_electrician',
  'Plumber': 'cat_plumber',
  'Cleaning': 'cat_cleaning',
  'Carpenter': 'cat_carpenter',
  'AC Repair': 'cat_ac_repair',
  'Painting': 'cat_painting',
  'Pest Control': 'cat_pest_control',
  'Gardening': 'cat_gardening',
};

function ProCardSkeleton() {
  return (
    <div className="card p-4 flex flex-col sm:flex-row gap-5 animate-pulse">
      <div className="w-full sm:w-44 h-44 rounded-xl bg-slate-100" />
      <div className="flex-grow py-1 space-y-3">
        <div className="h-5 w-40 bg-slate-100 rounded" />
        <div className="h-4 w-64 bg-slate-100 rounded" />
        <div className="flex gap-2"><div className="h-6 w-20 bg-slate-100 rounded" /><div className="h-6 w-20 bg-slate-100 rounded" /></div>
        <div className="flex gap-4 mt-auto pt-4"><div className="h-10 w-24 bg-slate-100 rounded-xl" /><div className="h-10 w-24 bg-slate-100 rounded-xl" /></div>
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
  const [searchTerm, setSearchTerm] = useState(location.state?.query || '');
  const [selectedCategories, setSelectedCategories] = useState(
    location.state?.category ? [location.state.category] : []
  );
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('relevance');
  const [minRating, setMinRating] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchServices(); // fetch all on mount
  }, [fetchServices]);

  const handleBookNow = (svc) => {
    const proId = svc.providerId?._id || svc.providerId;
    navigate(currentUser ? '/booking' : '/auth', { 
      state: { 
        providerId: proId, 
        serviceId: svc._id,
        basePrice: svc.basePrice,
        serviceName: svc.name
      } 
    });
  };
  const handleViewProfile = (proId) => navigate(currentUser ? `/provider/${proId}` : '/auth');

  const clearFilters = () => { setSearchTerm(''); setSelectedCategories([]); setMaxPrice(5000); setMinRating(0); setSortBy('relevance'); toast('Filters cleared', { icon: '🔄' }); };
  const hasActiveFilters = searchTerm.trim().length > 0 || selectedCategories.length > 0 || maxPrice < 5000 || minRating > 0 || sortBy !== 'relevance';

  const toggleCategory = (catValue) => {
    setSelectedCategories(prev => prev.includes(catValue) ? prev.filter(c => c !== catValue) : [...prev, catValue]);
  };

  const removeFilter = (type, value) => {
    if (type === 'search') setSearchTerm('');
    if (type === 'category') setSelectedCategories(prev => prev.filter(c => c !== value));
    if (type === 'price') setMaxPrice(5000);
    if (type === 'rating') setMinRating(0);
  };

  const filteredServices = useMemo(() => {
    const base = services.filter(svc => {
      const nameText = (svc.name || '').toLowerCase();
      const proNameText = (svc.providerId?.name || '').toLowerCase();
      const catText = (svc.category || '').toLowerCase();
      
      const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      
      let matchSearch = true;
      if (searchWords.length > 0) {
        matchSearch = searchWords.some(word => 
          nameText.includes(word) || proNameText.includes(word) || catText.includes(word)
        );
      }
      
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(svc.category);
      const matchPrice = svc.basePrice <= maxPrice;
      const matchRating = (svc.rating || 5) >= minRating;
      return matchSearch && matchCategory && matchPrice && matchRating;
    });

    const sorted = [...base];
    if (sortBy === 'lowestPrice') sorted.sort((a, b) => a.basePrice - b.basePrice);
    if (sortBy === 'highestPrice') sorted.sort((a, b) => b.basePrice - a.basePrice);
    if (sortBy === 'highestRated') sorted.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return sorted;
  }, [services, searchTerm, selectedCategories, maxPrice, minRating, sortBy]);

  return (
    <div className="min-h-screen pt-8 pb-20">
      <main className="section-container">
        {/* Top Header & Search Area */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="section-heading !text-3xl lg:!text-4xl">{t('sd_top_services')}</h1>
              <p className="section-subheading !mt-1 !text-base">{isLoading ? t('sd_loading') : `${filteredServices.length} ${t('sd_services_available')}`}</p>
            </div>

            {/* Industry Level Search Bar */}
            <div className="relative w-full md:w-[450px] group">
              <div className="flex items-center bg-white border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-teal-600 transition-all shadow-sm group-hover:shadow-md">
                <span className="material-symbols-outlined pl-4 text-slate-400 group-focus-within:text-teal-600">search</span>
                <input 
                  type="text" 
                  placeholder={t('sd_search_placeholder')} 
                  className="flex-grow px-3 py-3.5 bg-transparent border-none focus:ring-0 text-slate-800 font-medium"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="p-1 mr-1 text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                )}
                <button className="bg-teal-600 text-white px-5 py-3.5 font-bold hover:bg-teal-700 transition-colors">
                  {t('sd_search')}
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">{t('sd_active_filters')}:</span>
              {searchTerm && (
                <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                  {t('sd_search')}: {searchTerm}
                  <button onClick={() => removeFilter('search')} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              )}
              {selectedCategories.map(cat => (
                <div key={cat} className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                  {cat}
                  <button onClick={() => removeFilter('category', cat)} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              ))}
              {maxPrice < 5000 && (
                <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                  Under ₹{maxPrice}
                  <button onClick={() => removeFilter('price')} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              )}
              {minRating > 0 && (
                <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                  {minRating}+ Stars
                  <button onClick={() => removeFilter('rating')} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              )}
              <button onClick={clearFilters} className="text-xs font-bold text-teal-600 hover:underline px-2">Clear All</button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
            <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
              <span className="font-bold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600">tune</span> {t('sd_filters')}</span>
              <span className="material-symbols-outlined text-slate-500">{isMobileFiltersOpen ? 'expand_less' : 'expand_more'}</span>
            </div>
            <div className={`space-y-5 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="card p-6 sticky top-24">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('sd_filters_label')}</p>
                <button onClick={clearFilters} disabled={!hasActiveFilters} className="text-xs font-bold text-teal-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:underline">{t('sd_clear_all')}</button>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">category</span>{t('sd_categories')}</h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(cat => (
                    <button key={cat.value} onClick={() => toggleCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${selectedCategories.includes(cat.value) ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>
                      {t(cat.key)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">payments</span>{t('sd_max_budget')}</h3>
                <input type="range" min="200" max="5000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-600" />
                <div className="flex justify-between mt-2 text-xs font-bold text-slate-500"><span>₹200</span><span className="text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">Up to ₹{maxPrice}</span></div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">star</span>{t('sd_rating')}</h3>
                <div className="space-y-2">
                  {[4, 3, 2].map(rating => (
                    <button 
                      key={rating} 
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border ${minRating === rating ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-200'}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: `'FILL' ${i < rating ? 1 : 0}` }}>star</span>
                          ))}
                        </div>
                        & Above
                      </span>
                      {minRating === rating && <span className="material-symbols-outlined text-sm">check_circle</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">sort</span>{t('sd_sort_by')}</h3>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:border-teal-500 focus:ring-0 outline-none cursor-pointer">
                  <option value="relevance">{t('sd_sort_relevance')}</option>
                  <option value="highestRated">{t('sd_sort_highest')}</option>
                  <option value="lowestPrice">{t('sd_sort_lowest')}</option>
                  <option value="highestPrice">{t('sd_sort_highest_price')}</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">schedule</span>{t('sd_availability')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 shadow-sm">{t('sd_today')}</button>
                  <button className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">{t('sd_tomorrow')}</button>
                </div>
              </div>
            </div>
            
            <div className="bg-teal-600 p-6 rounded-3xl text-white relative overflow-hidden shadow-lg">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-amber-300">workspace_premium</span><h4 className="font-bold">{t('sd_seva_guaranteed')}</h4></div>
                <p className="text-xs text-teal-100/90 leading-relaxed font-medium">{t('sd_seva_guaranteed_desc')}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10"><span className="material-symbols-outlined text-[80px]">verified_user</span></div>
            </div>
            </div>
          </aside>

          {/* Main Grid */}
          <section className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h1 className="section-heading !text-2xl lg:!text-3xl">{t('sd_top_services')}</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">{isLoading ? t('sd_loading') : `${filteredServices.length} ${t('sd_services_in_area')}`}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-auto">
              <span className="material-symbols-outlined text-slate-400 text-sm hidden sm:block">sort</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border-none text-slate-800 text-sm font-semibold focus:ring-0 cursor-pointer outline-none w-full sm:w-auto">
                <option value="relevance">{t('sd_sort_relevance')}</option>
                <option value="highestRated">{t('sd_sort_highest')}</option>
                <option value="lowestPrice">{t('sd_sort_lowest')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <AnimatePresence>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <ProCardSkeleton key={`sk-${i}`} />)
              ) : (
                filteredServices.map((svc) => {
                  const proName = svc.providerId?.name || 'Expert';
                  const avatar = svc.providerId?.avatar || `https://ui-avatars.com/api/?name=${proName}&background=0D8B8B&color=fff`;
                  const providerIdStr = svc.providerId?._id || svc.providerId;
                  
                  return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }} key={svc._id}
                    className="card card-hover p-4 group"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 h-full">
                      <div className="relative w-full sm:w-40 lg:w-44 h-40 sm:h-auto sm:min-h-[190px] flex-shrink-0 overflow-hidden rounded-2xl cursor-pointer" onClick={() => handleViewProfile(providerIdStr)}>
                        <img src={svc.image || avatar} alt={svc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-slate-200">
                          <span className="material-symbols-outlined text-teal-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{svc.icon || 'home_repair_service'}</span>
                          <span className="text-[11px] font-semibold text-slate-700">
                            {categoryTranslationMap[svc.category] ? t(categoryTranslationMap[svc.category]) : svc.category}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex flex-1 flex-col py-1">
                        <div className="flex flex-col gap-2">
                          <h3
                            onClick={() => handleViewProfile(providerIdStr)}
                            className="text-lg sm:text-xl font-extrabold text-slate-900 cursor-pointer hover:text-teal-600 transition-colors leading-tight break-words"
                          >
                            {svc.name}
                          </h3>
                          <p className="text-slate-600 text-sm">{t('sd_by')} <span className="font-semibold text-slate-700 break-words">{proName}</span></p>
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{svc.description}</p>
                        </div>

                        <div className="mt-3 mb-3 h-px bg-slate-200/80" />

                        <div className="mt-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                          <div className="rounded-2xl bg-teal-50 border border-teal-100 px-4 py-2.5 w-fit">
                            <span className="text-[11px] tracking-wide uppercase text-teal-700/80 block">{t('sd_from')}</span>
                            <span className="text-2xl font-extrabold text-teal-700 leading-none">&#8377;{svc.basePrice || 299}</span>
                          </div>

                          <div className="flex flex-col gap-2 w-[104px] sm:w-[112px] flex-shrink-0">
                            <button
                              onClick={() => handleViewProfile(providerIdStr)}
                              className="btn-secondary !px-2.5 !py-2 !text-xs leading-tight w-full"
                            >
                              {t('sd_profile')}
                            </button>
                            <button
                              onClick={() => handleBookNow(svc)}
                              className="btn-primary !px-2.5 !py-2 !text-xs leading-tight w-full"
                            >
                              {t('sd_book_now')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )})
              )}
            </AnimatePresence>

            {!isLoading && filteredServices.length === 0 && (
              <div className="col-span-full py-16 text-center card flex flex-col items-center border-dashed">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><span className="material-symbols-outlined text-3xl text-slate-400">search_off</span></div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t('sd_no_services')}</h3>
                <p className="text-slate-500 text-sm max-w-sm">{t('sd_no_services_hint')}</p>
                <button onClick={clearFilters} className="mt-4 text-teal-600 font-semibold text-sm px-4 py-2 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">{t('sd_clear_filters')}</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
    </div>
  );
}

