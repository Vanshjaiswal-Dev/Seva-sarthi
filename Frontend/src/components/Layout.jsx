/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useLocationStore } from '../store/useLocationStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const { currentUser, logout } = useAuthStore();
  const { language, toggleLanguage, setLanguage, t } = useLanguageStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [manualCity, setManualCity] = useState('');
  
  const { city, setCity, detectLocation, isLocating } = useLocationStore();
  
  const notifRef = useRef(null);

  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/auth';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowNotifications(false);
    setShowLanguagePicker(false);
  }, [location.pathname]);

  // Click outside to close notifications and location picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.location-picker')) {
        setShowLocationPicker(false);
      }
      if (!event.target.closest('.language-picker')) {
        setShowLanguagePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-brand'
        : 'text-slate-500 hover:text-brand'
    }`;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Session Warning Modal is now handled globally in SessionManager */}

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-nav py-3'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <Link
              to="/"
              className="flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img src="/logo.svg" alt="Seva Sarthi Logo" className="h-14 sm:h-16 w-auto drop-shadow-sm" />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8 bg-surface/50 px-6 py-2 rounded-full border border-slate-200/50 backdrop-blur-md shadow-sm">
              <NavLink className={linkClass} to="/services">{t('nav_services')}</NavLink>
              <NavLink className={linkClass} to="/rentals">{t('nav_rentals')}</NavLink>
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Location Picker */}
              <div className="relative location-picker">
                <button 
                  onClick={() => { setShowLocationPicker(!showLocationPicker); setManualCity(city); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-brand transition-colors max-w-[150px]"
                  title={city || 'Set Location'}
                >
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  <span className="truncate">{city || 'Location'}</span>
                </button>
                
                <AnimatePresence>
                  {showLocationPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute -right-2 sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-72 glass-panel rounded-2xl p-4 origin-top-right z-50 bg-surface shadow-lg border border-slate-200"
                    >
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('nav_your_location')}</h4>
                      
                      <button 
                        onClick={() => { detectLocation(); setShowLocationPicker(false); }} 
                        className="w-full flex items-center justify-center gap-2 btn-secondary !py-2.5 !rounded-xl mb-4 text-sm"
                        disabled={isLocating}
                      >
                        <span className="material-symbols-outlined text-[18px]">{isLocating ? 'sync' : 'my_location'}</span>
                        {isLocating ? t('nav_detecting') : t('nav_auto_detect')}
                      </button>

                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-2 text-slate-400 text-xs font-semibold">{t('nav_or')}</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); setCity(manualCity); setShowLocationPicker(false); }} className="mt-2">
                        <input 
                          type="text" 
                          placeholder={t('nav_enter_city')} 
                          value={manualCity}
                          onChange={(e) => setManualCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2 mb-2 focus:outline-none focus:border-brand"
                        />
                        <button type="submit" className="w-full btn-brand !py-2 !rounded-xl text-sm" disabled={!manualCity.trim()}>
                          {t('nav_set_city')}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Switcher */}
              <div className="relative language-picker border-l border-slate-200/60 pl-4">
                <button 
                  onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-brand transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">language</span>
                  {language === 'en' ? 'English' : 'हिन्दी'}
                </button>
                
                <AnimatePresence>
                  {showLanguagePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-40 glass-panel rounded-2xl p-2 origin-top-right z-50 bg-surface shadow-lg border border-slate-200"
                    >
                      <button onClick={() => { setLanguage('en'); setShowLanguagePicker(false); }} className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${language === 'en' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`}>English</button>
                      <button onClick={() => { setLanguage('hi'); setShowLanguagePicker(false); }} className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition-colors mt-1 ${language === 'hi' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`}>हिन्दी (Hindi)</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-brand transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-surface animate-pulse"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -right-2 sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 glass-panel rounded-2xl overflow-hidden origin-top-right z-50 shadow-lg border border-slate-200"
                    >
                      <div className="p-4 border-b border-slate-200/50 flex items-center justify-between bg-surface/80">
                        <h3 className="font-bold text-brand">{t('notifications')}</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-accent-dark font-semibold hover:underline">{t('nav_mark_all_read')}</button>
                        )}
                      </div>
                      <div className="max-h-[320px] overflow-y-auto custom-scrollbar bg-surface/60">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">{t('no_notifications')}</div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => markAsRead(notif.id)}
                              className={`p-4 border-b border-slate-100/50 hover:bg-slate-50/80 cursor-pointer transition-colors ${notif.read ? 'opacity-70' : 'bg-slate-50/50'}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm font-semibold ${notif.read ? 'text-slate-600' : 'text-brand'}`}>{notif.title}</h4>
                                {!notif.read && <span className="w-2 h-2 rounded-full bg-accent mt-1.5"></span>}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] font-medium text-slate-400">{notif.time}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200/60">
                  <Link
                    to={currentUser.dashboard}
                    className="text-sm font-semibold text-brand hover:text-accent-dark transition-colors px-4 py-2 rounded-xl hover:bg-slate-100"
                  >
                    {t('nav_dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-semibold text-slate-500 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    {t('nav_logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="btn-primary text-sm !px-5 !py-2.5 !rounded-xl"
                >
                  {t('nav_login')}
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="relative language-picker">
                 <button onClick={() => setShowLanguagePicker(!showLanguagePicker)} className="p-2 text-sm font-bold text-slate-600 flex items-center gap-1">
                   <span className="material-symbols-outlined text-lg">language</span>
                 </button>
                 <AnimatePresence>
                  {showLanguagePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-32 glass-panel rounded-xl p-2 origin-top-right z-50 bg-surface shadow-lg border border-slate-200"
                    >
                      <button onClick={() => { setLanguage('en'); setShowLanguagePicker(false); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${language === 'en' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`}>English</button>
                      <button onClick={() => { setLanguage('hi'); setShowLanguagePicker(false); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold mt-1 ${language === 'hi' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`}>हिन्दी</button>
                    </motion.div>
                  )}
                 </AnimatePresence>
              </div>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-3 -mr-2 rounded-xl text-brand hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[26px]">{mobileOpen ? 'close' : 'menu_open'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass-panel border-t-0 rounded-b-3xl overflow-hidden absolute top-full left-0 w-full"
            >
              <div className="p-4 space-y-2">
                <NavLink className="block px-4 py-3.5 rounded-2xl text-sm font-semibold text-brand hover:bg-slate-100 transition-colors" to="/services">{t('nav_services')}</NavLink>
                <NavLink className="block px-4 py-3.5 rounded-2xl text-sm font-semibold text-brand hover:bg-slate-100 transition-colors" to="/rentals">{t('nav_rentals')}</NavLink>
                {currentUser ? (
                  <>
                    <Link className="block px-4 py-3.5 rounded-2xl text-sm font-semibold text-accent-dark bg-accent/10" to={currentUser.dashboard}>{t('nav_dashboard')}</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3.5 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50">{t('nav_logout')}</button>
                  </>
                ) : (
                  <Link className="block px-4 py-3.5 mt-4 rounded-2xl text-sm font-semibold text-brand bg-accent text-center" to="/auth">{t('nav_login')}</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <div className="pt-20 flex-1 flex flex-col">{children}</div>

      {/* Footer */}
      {!isAuth && (
        <footer className="bg-surface border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <Link to="/" className="inline-block mb-6 transition-transform hover:scale-[1.02]">
                  <img src="/logo.svg" alt="Seva Sarthi Logo" className="h-16 w-auto drop-shadow-sm" />
                </Link>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {t('footer_desc')}
                </p>
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-accent/10 hover:text-accent-dark transition-all border border-slate-100">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-accent/10 hover:text-accent-dark transition-all border border-slate-100">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </button>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold text-brand font-headline mb-5 text-sm uppercase tracking-widest">{t('footer_company')}</h4>
                <ul className="space-y-4">
                  <li><a className="text-slate-500 hover:text-brand font-medium text-sm transition-colors flex items-center gap-2" href="#">{t('footer_about')}</a></li>
                  <li><a className="text-slate-500 hover:text-brand font-medium text-sm transition-colors flex items-center gap-2" href="#">{t('footer_careers')} <span className="badge badge-accent">{t('footer_hiring')}</span></a></li>
                  <li><Link className="text-slate-500 hover:text-brand font-medium text-sm transition-colors flex items-center gap-2" to="/provider/auth">{t('footer_partner')}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-brand font-headline mb-5 text-sm uppercase tracking-widest">{t('footer_services')}</h4>
                <ul className="space-y-4">
                  <li><a className="text-slate-500 hover:text-brand font-medium text-sm transition-colors" href="#">{t('footer_plumbing')}</a></li>
                  <li><a className="text-slate-500 hover:text-brand font-medium text-sm transition-colors" href="#">{t('footer_electrician')}</a></li>
                  <li><a className="text-slate-500 hover:text-brand font-medium text-sm transition-colors" href="#">{t('footer_deep_cleaning')}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-brand font-headline mb-5 text-sm uppercase tracking-widest">{t('footer_support')}</h4>
                <ul className="space-y-4">
                  <li><a className="text-slate-500 hover:text-brand font-medium text-sm transition-colors" href="#">{t('footer_help')}</a></li>
                  <li><a className="text-slate-500 hover:text-brand font-medium text-sm transition-colors" href="#">{t('footer_terms')}</a></li>
                  <li><a className="text-slate-500 hover:text-brand font-medium text-sm transition-colors" href="#">{t('footer_privacy')}</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-400">{t('footer_copyright')}</p>
              <p className="text-sm font-medium text-slate-400 flex items-center gap-1">{t('footer_made_in')} <span className="text-base">🇮🇳</span></p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
