/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useLocationStore } from '../store/useLocationStore';
import { motion } from 'framer-motion';
import VoiceSearch from '../components/VoiceSearch';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  })
};

const services = [
  { icon: 'bolt', labelKey: 'cat_electrician', color: 'bg-amber-50 text-amber-600' },
  { icon: 'plumbing', labelKey: 'cat_plumber', color: 'bg-blue-50 text-blue-600' },
  { icon: 'cleaning_services', labelKey: 'cat_cleaning', color: 'bg-emerald-50 text-emerald-600' },
  { icon: 'carpenter', labelKey: 'cat_carpenter', color: 'bg-orange-50 text-orange-600' },
  { icon: 'ac_unit', labelKey: 'cat_ac_repair', color: 'bg-cyan-50 text-cyan-600' },
  { icon: 'imagesearch_roller', labelKey: 'cat_painting', color: 'bg-purple-50 text-purple-600' },
  { icon: 'pest_control', labelKey: 'cat_pest_control', color: 'bg-red-50 text-red-600' },
  { icon: 'yard', labelKey: 'cat_gardening', color: 'bg-lime-50 text-lime-600' },
];

const stepsData = [
  { icon: 'search_hands_free', titleKey: 'hiw_step1_title', descKey: 'hiw_step1_desc' },
  { icon: 'calendar_month', titleKey: 'hiw_step2_title', descKey: 'hiw_step2_desc' },
  { icon: 'verified_user', titleKey: 'hiw_step3_title', descKey: 'hiw_step3_desc' },
];

const providers = [
  { name: 'Rajesh K.', roleKey: 'role_electrical_specialist', rating: 4.9, price: '₹499/hr',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop',
    badgeKeys: ['badge_fast_response', 'badge_verified'] },
  { name: 'Anita S.', roleKey: 'role_deep_cleaning', rating: 5.0, price: '₹349/hr',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
    badgeKeys: ['badge_eco_friendly', 'badge_premium'] },
  { name: 'Vikram S.', roleKey: 'role_master_plumber', rating: 4.8, price: '₹599/hr',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop',
    badgeKeys: ['badge_priority', 'badge_15yr_exp'] },
];

const toolsData = [
  { icon: 'construction', titleKey: 'tool_power', descKey: 'tool_power_desc' },
  { icon: 'home_repair_service', titleKey: 'tool_hand', descKey: 'tool_hand_desc' },
  { icon: 'deck', titleKey: 'tool_outdoor', descKey: 'tool_outdoor_desc' },
  { icon: 'cleaning_bucket', titleKey: 'tool_cleaning', descKey: 'tool_cleaning_desc' },
];

export default function LandingPage() {
  const { currentUser } = useAuthStore();
  const { t, language } = useLanguageStore();
  const navigate = useNavigate();
  const { city, detectLocation } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [homeOffers, setHomeOffers] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Auto-detect location if city is empty and we haven't asked recently
    if (!city && !sessionStorage.getItem('locationPrompted')) {
      sessionStorage.setItem('locationPrompted', 'true');
      // Adding a small delay for better UX
      setTimeout(() => {
        detectLocation();
      }, 2000);
    }
    
    // Fetch Offers
    const fetchOffers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/coupons/home');
        const data = await res.json();
        if (data.success) {
          setHomeOffers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch offers');
      }
    };
    fetchOffers();
  }, [city, detectLocation]);

  const handleSearch = (query) => {
    navigate('/services', { state: { query } });
  };
  
  const handleBookClick = () => navigate(currentUser ? '/booking' : '/auth');
  const handleRentClick = () => navigate(currentUser ? '/rentals' : '/auth');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-32 md:pb-40">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3" />
        
        <div className="section-container text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-slate-200/60 shadow-sm mb-10">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-bold text-brand uppercase tracking-wider">{t('hero_badge')}</span>
          </motion.div>
          
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-headline tracking-tight text-brand leading-[1.1] mb-6">
            {t('hero_title')} {city ? `${language === 'hi' ? 'में' : 'in'} ${city}` : ''}
          </motion.h1>
          
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            {t('hero_subtitle')}
          </motion.p>
          
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="relative z-20">
            <VoiceSearch onSearch={handleSearch} placeholder={t('search_placeholder')} />
          </motion.div>
          
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-500 font-bold">
            <span className="text-slate-400">{t('popular')}</span>
            {['electrician', 'plumber', 'cleaning'].map(s=>(
              <span key={s} onClick={() => handleSearch(s)} className="cursor-pointer hover:text-brand transition-colors px-3 py-1 bg-surface rounded-lg border border-slate-200/60 shadow-sm">
                {t(s)}
              </span>
            ))}
            <span className="w-px h-5 bg-slate-300 mx-2"></span>
            <button onClick={() => navigate('/provider/auth')} className="text-accent-dark hover:text-accent font-extrabold flex items-center gap-1">
              Become a Provider <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Offers & Discounts Carousel */}
      {homeOffers.length > 0 && (
        <section className="py-12 bg-slate-50 relative overflow-hidden">
          <div className="section-container">
            <h2 className="text-2xl font-extrabold font-headline text-brand tracking-tight mb-8">Offers & discounts</h2>
            
            <div className="flex overflow-x-auto gap-6 pb-6 pt-2 custom-scrollbar snap-x snap-mandatory">
              {homeOffers.map((offer, idx) => (
                <div 
                  key={offer._id || idx} 
                  className="min-w-[280px] md:min-w-[340px] max-w-[340px] h-[180px] rounded-2xl overflow-hidden relative shrink-0 snap-center shadow-sm cursor-pointer group hover:shadow-md transition-all border border-slate-200"
                  onClick={() => offer.targetUrl ? navigate(offer.targetUrl) : null}
                >
                  <img 
                    src={offer.imageUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070'} 
                    alt={offer.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight max-w-[200px] drop-shadow-md">
                        {offer.title}
                      </h3>
                      {offer.subtitle && (
                        <p className="text-white/80 text-sm mt-1 max-w-[180px] line-clamp-2">
                          {offer.subtitle}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {!offer.isBannerOnly && offer.code && (
                          <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded border border-white/40 text-[10px] font-bold text-white uppercase tracking-wider">
                            Code: {offer.code}
                          </span>
                        )}
                        {offer.userType === 'new' && (
                          <span className="bg-purple-500/80 backdrop-blur-sm px-2 py-0.5 rounded border border-purple-400/50 text-[10px] font-bold text-white uppercase tracking-wider">
                            New Users Only
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button className="bg-white text-brand px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                      Book now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Grid */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <h2 className="section-heading">{t('section_expert_services')}</h2>
              <p className="section-subheading">{t('section_expert_services_sub')}</p>
            </div>
            <button onClick={() => navigate('/services')} className="btn-secondary !py-3">
              {t('explore_all')} <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <motion.div key={s.labelKey} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-50px"}} variants={fadeUp} custom={i*0.1}
                onClick={() => navigate('/services', {state:{category:s.labelKey}})}
                className="card card-hover cursor-pointer p-8 flex flex-col items-center gap-5 text-center group border-slate-200/50 bg-surface/50 backdrop-blur-sm">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${s.color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                  <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                </div>
                <span className="font-bold text-brand text-base tracking-wide">{t(s.labelKey)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-brand text-surface relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface via-transparent to-transparent"></div>
        <div className="section-container relative z-10 text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-surface tracking-tight leading-tight mb-4">{t('hiw_title')}</h2>
          <p className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto">{t('hiw_subtitle')}</p>
        </div>
        <div className="section-container grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative z-10">
          {stepsData.map((s, i) => (
            <motion.div key={s.titleKey} initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp} custom={i} className="text-center group">
              <div className="w-20 h-20 bg-surface/10 border border-surface/20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform duration-300 group-hover:-translate-y-2">
                <span className="material-symbols-outlined text-accent text-4xl">{s.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-surface mb-3 font-headline tracking-wide">{t(s.titleKey)}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{t(s.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Providers Highlights */}
      <section className="py-24">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="section-heading">{t('section_premium_pros')}</h2>
            <p className="section-subheading mx-auto">{t('section_premium_pros_sub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {providers.map((p, i) => (
              <motion.div key={p.name} initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp} custom={i} className="card card-hover overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={p.image} alt={p.name} loading="lazy" />
                  <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-slate-200/50">
                    <span className="material-symbols-outlined text-accent text-base" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                    <span className="text-sm font-bold text-brand">{p.rating}</span>
                  </div>
                </div>
                <div className="p-7">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold font-headline text-brand tracking-tight">{p.name}</h3>
                    <span className="text-accent-dark font-extrabold">{p.price}</span>
                  </div>
                  <p className="text-slate-500 font-medium mb-6">{t(p.roleKey)}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {p.badgeKeys.map(b=><span key={b} className="badge badge-brand">{t(b)}</span>)}
                  </div>
                  <button onClick={handleBookClick} className="w-full btn-secondary !py-3.5">{t('reserve_now')}</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Rental Highlight */}
      <section className="py-24">
        <div className="section-container">
          <div className="bg-brand rounded-[2.5rem] p-10 md:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative shadow-premium">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
            
            <div className="lg:w-1/2 relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 text-accent font-bold text-sm tracking-widest uppercase mb-8">
                <span className="material-symbols-outlined text-base">construction</span> {t('tool_section_badge')}
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-surface mb-6 leading-tight">{t('tool_section_title')} <br/>{t('tool_section_title2')}</h2>
              <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed font-medium max-w-lg">
                {t('tool_section_desc')}
              </p>
              <button onClick={handleRentClick} className="btn-accent !px-8">{t('browse_inventory')}</button>
            </div>
            
            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10 w-full">
              {toolsData.map((c, i) => (
                <div key={c.titleKey} onClick={()=>navigate('/rentals',{state:{category:t(c.titleKey)}})}
                  className={`bg-surface/5 border border-surface/10 p-7 rounded-3xl hover:bg-surface/10 transition-colors cursor-pointer backdrop-blur-sm ${i%2!==0?'translate-y-6':''}`}>
                  <span className="material-symbols-outlined text-4xl text-accent mb-5 block">{c.icon}</span>
                  <h4 className="text-surface font-bold text-lg mb-2 font-headline">{t(c.titleKey)}</h4>
                  <p className="text-slate-400 text-sm font-medium">{t(c.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="section-container text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-brand tracking-tight mb-6">{t('cta_title')}</h2>
          <p className="text-slate-500 font-medium text-lg md:text-xl mb-10 max-w-2xl mx-auto">{t('cta_subtitle')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
            <button onClick={handleBookClick} className="w-full sm:w-auto btn-primary !px-10 !py-4 text-lg">{t('cta_get_started')}</button>
            <button onClick={()=>navigate('/services')} className="w-full sm:w-auto btn-secondary !px-10 !py-4 text-lg">{t('cta_explore')}</button>
            <button onClick={()=>navigate('/provider/auth')} className="w-full sm:w-auto text-brand font-bold underline underline-offset-4 sm:ml-4 hover:text-accent transition-colors text-lg mt-4 sm:mt-0">{t('cta_join_pro')}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
