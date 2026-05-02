/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToolStore } from '../store/useToolStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLanguageStore } from '../store/useLanguageStore';

const RENTALS_STORAGE_KEY = 'sevaSarthi.rentals.v1';

// Mock tools removed. Handled by backend.

const categories = ["All", "Hand Tools", "Power Tools", "Construction", "Gardening"];

// --- slide-in Cart Drawer ---
function CartDrawer({ tool, onClose, onConfirm }) {
  const [days, setDays] = useState(1);
  const [step, setStep] = useState(1); // 1: Configure, 2: Details, 3: Review, 4: Success

  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    // Lock background scroll while drawer is open
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const drawerScrollEl = scrollRef.current;

    // Hard block background scrolling for trackpad gestures (Chrome)
    const blockWindowWheel = (e) => {
      const t = e.target;
      const inside = drawerScrollEl && t instanceof Node && drawerScrollEl.contains(t);
      if (!inside) {
        e.preventDefault();
        return;
      }
      // If inside but would overscroll, prevent so remaining delta can't go to page.
      const deltaY = e.deltaY;
      const atTop = drawerScrollEl.scrollTop <= 0;
      const atBottom = Math.ceil(drawerScrollEl.scrollTop + drawerScrollEl.clientHeight) >= drawerScrollEl.scrollHeight;
      if ((atTop && deltaY < 0) || (atBottom && deltaY > 0)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', blockWindowWheel, { passive: false, capture: true });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener('wheel', blockWindowWheel, { capture: true });
    };
  }, []);

  const [details, setDetails] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: 'Pune',
    pincode: '',
    deliveryDate: '',
    deliveryWindow: '10:00 - 12:00',
    idType: 'Aadhaar',
    idNumber: '',
    notes: '',
    agreeTerms: false,
    agreeDepositHold: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const subtotal = tool.dailyRate * days;
  const deliveryFee = 99;
  const tax = Math.round(subtotal * 0.05);
  const refundableDeposit = Math.max(500, Math.round(subtotal * 0.4));
  const total = subtotal + deliveryFee + tax;

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const updateDetails = (patch) => {
    setDetails((prev) => ({ ...prev, ...patch }));
  };

  const validateDetails = () => {
    const e = {};

    if (!details.fullName.trim()) e.fullName = 'Required';
    if (!/^[6-9]\d{9}$/.test(details.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';

    if (!details.addressLine1.trim()) e.addressLine1 = 'Required';
    if (!details.city.trim()) e.city = 'Required';
    if (!/^\d{6}$/.test(details.pincode.trim())) e.pincode = 'Enter a valid 6-digit PIN code';

    if (!details.deliveryDate) e.deliveryDate = 'Select a delivery date';

    if (!details.idNumber.trim()) e.idNumber = 'Required';

    if (!details.agreeTerms) e.agreeTerms = 'You must accept terms';
    if (!details.agreeDepositHold) e.agreeDepositHold = 'Deposit acknowledgement required';

    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceedFromDetails = () => {
    if (!validateDetails()) {
      toast.error('Please fill the required details.');
      return;
    }
    setStep(3);
  };

  const handleProcessPayment = () => {
    // mock payment + order creation
    setStep(4);
    setTimeout(() => {
      onConfirm({
        toolId: tool.id,
        toolName: tool.name,
        days,
        total,
        refundableDeposit,
        details,
        createdAt: new Date().toISOString(),
      });
    }, 2200);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
      />
      <motion.div 
        id="tool-rental-drawer"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800">
            {step === 1
              ? 'Configure Rental'
              : step === 2
                ? 'Delivery & Verification'
                : step === 3
                  ? 'Review & Confirm'
                  : 'Receipt'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/*
          IMPORTANT: Make this inner div the only scroll container.
          This avoids wheel scrolling the page when the drawer content is lock-step with a fixed footer.
        */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto overscroll-contain">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
              <div className="flex gap-4 mb-8">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {tool.image ? (
                    <img src={tool.image} alt={tool.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl">construction</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{tool.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">Available Now</p>
                  <span className="inline-block px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg border border-teal-100">
                    ₹{tool.dailyRate} / day
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <label className="block font-bold text-slate-800 mb-4">Rental Duration</label>
                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  <button onClick={() => setDays(Math.max(1, days - 1))} className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center font-bold text-xl text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-all">-</button>
                  <div className="text-center">
                    <span className="text-2xl font-black text-slate-800 block">{days}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Day{days > 1 ? 's' : ''}</span>
                  </div>
                  <button onClick={() => setDays(Math.min(30, days + 1))} className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center font-bold text-xl text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-all">+</button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Base Rate (₹{tool.dailyRate} × {days})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Standard Delivery</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Estimated Taxes</span>
                  <span>₹{tax}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center pb-1">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-black text-teal-600">₹{total}</span>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-500">verified_user</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Security deposit required</p>
                    <p className="text-xs text-slate-500 font-medium">A refundable deposit is held to cover damage / missing parts. You’ll see it in the next step.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6">
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex items-start gap-4">
                <span className="material-symbols-outlined text-teal-600 mt-0.5">local_shipping</span>
                <div>
                  <h4 className="font-bold text-teal-900 mb-1">Fast delivery scheduling</h4>
                  <p className="text-sm text-teal-700/80">Choose a delivery date and time window. Our agent will verify ID at handover.</p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-black text-slate-900 mb-3">Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full name</label>
                    <input
                      value={details.fullName}
                      onChange={(e) => updateDetails({ fullName: e.target.value })}
                      className={`mt-2 w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ${fieldErrors.fullName ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="e.g. Rahul Sharma"
                      type="text"
                      autoComplete="name"
                    />
                    {fieldErrors.fullName && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile</label>
                    <input
                      value={details.phone}
                      onChange={(e) => updateDetails({ phone: e.target.value })}
                      className={`mt-2 w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ${fieldErrors.phone ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="10-digit number"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                    {fieldErrors.phone && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-black text-slate-900 mb-3">Delivery address</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address line 1</label>
                    <input
                      value={details.addressLine1}
                      onChange={(e) => updateDetails({ addressLine1: e.target.value })}
                      className={`mt-2 w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ${fieldErrors.addressLine1 ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="House / Flat / Street"
                      type="text"
                      autoComplete="address-line1"
                    />
                    {fieldErrors.addressLine1 && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.addressLine1}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address line 2 (optional)</label>
                    <input
                      value={details.addressLine2}
                      onChange={(e) => updateDetails({ addressLine2: e.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                      placeholder="Area / Building"
                      type="text"
                      autoComplete="address-line2"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                      <input
                        value={details.city}
                        onChange={(e) => updateDetails({ city: e.target.value })}
                        className={`mt-2 w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ${fieldErrors.city ? 'border-rose-300' : 'border-slate-200'}`}
                        placeholder="City"
                        type="text"
                        autoComplete="address-level2"
                      />
                      {fieldErrors.city && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.city}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PIN code</label>
                      <input
                        value={details.pincode}
                        onChange={(e) => updateDetails({ pincode: e.target.value })}
                        className={`mt-2 w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ${fieldErrors.pincode ? 'border-rose-300' : 'border-slate-200'}`}
                        placeholder="6 digits"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                      />
                      {fieldErrors.pincode && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.pincode}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Landmark (optional)</label>
                    <input
                      value={details.landmark}
                      onChange={(e) => updateDetails({ landmark: e.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                      placeholder="e.g. Near City Mall"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h4 className="font-black text-slate-900 mb-3">Delivery schedule</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery date</label>
                    <input
                      value={details.deliveryDate}
                      onChange={(e) => updateDetails({ deliveryDate: e.target.value })}
                      min={minDate}
                      className={`mt-2 w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ${fieldErrors.deliveryDate ? 'border-rose-300' : 'border-slate-200'}`}
                      type="date"
                    />
                    {fieldErrors.deliveryDate && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.deliveryDate}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time window</label>
                    <select
                      value={details.deliveryWindow}
                      onChange={(e) => updateDetails({ deliveryWindow: e.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                    >
                      <option>08:00 - 10:00</option>
                      <option>10:00 - 12:00</option>
                      <option>12:00 - 14:00</option>
                      <option>14:00 - 16:00</option>
                      <option>16:00 - 18:00</option>
                      <option>18:00 - 20:00</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div>
                <h4 className="font-black text-slate-900 mb-3">ID verification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID type</label>
                    <select
                      value={details.idType}
                      onChange={(e) => updateDetails({ idType: e.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                    >
                      <option>Aadhaar</option>
                      <option>PAN</option>
                      <option>Driving License</option>
                      <option>Passport</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID number</label>
                    <input
                      value={details.idNumber}
                      onChange={(e) => updateDetails({ idNumber: e.target.value })}
                      className={`mt-2 w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ${fieldErrors.idNumber ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="Enter ID number"
                      type="text"
                    />
                    {fieldErrors.idNumber && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.idNumber}</p>}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">ID is verified at delivery pickup. We do not store sensitive documents in this demo.</p>
              </div>

              {/* Notes + agreements */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery notes (optional)</label>
                <textarea
                  value={details.notes}
                  onChange={(e) => updateDetails({ notes: e.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none"
                  rows={3}
                  placeholder="Gate code, entry instructions, etc."
                />
              </div>

              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <input
                    checked={details.agreeDepositHold}
                    onChange={(e) => updateDetails({ agreeDepositHold: e.target.checked })}
                    type="checkbox"
                    className="mt-1 w-4 h-4 accent-teal-600"
                  />
                  <div className="text-sm">
                    <p className="font-bold text-slate-800">Refundable deposit acknowledgement</p>
                    <p className="text-slate-500 font-medium">I understand a refundable deposit of <span className="font-black text-slate-800">₹{refundableDeposit}</span> will be held and released after return inspection.</p>
                    {fieldErrors.agreeDepositHold && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.agreeDepositHold}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    checked={details.agreeTerms}
                    onChange={(e) => updateDetails({ agreeTerms: e.target.checked })}
                    type="checkbox"
                    className="mt-1 w-4 h-4 accent-teal-600"
                  />
                  <div className="text-sm">
                    <p className="font-bold text-slate-800">Terms & damage policy</p>
                    <p className="text-slate-500 font-medium">I accept rental terms, safe usage policy, and agree to pay for damage beyond normal wear.</p>
                    {fieldErrors.agreeTerms && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.agreeTerms}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h4 className="font-black text-slate-900 mb-3">Order summary</h4>
                <div className="space-y-2 text-sm font-medium text-slate-600">
                  <div className="flex justify-between"><span>Tool</span><span className="font-bold text-slate-800">{tool.name}</span></div>
                  <div className="flex justify-between"><span>Duration</span><span className="font-bold text-slate-800">{days} day{days > 1 ? 's' : ''}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span className="font-bold text-slate-800">{details.deliveryDate} ({details.deliveryWindow})</span></div>
                  <div className="flex justify-between"><span>Address</span><span className="font-bold text-slate-800 text-right">{details.addressLine1}{details.addressLine2 ? `, ${details.addressLine2}` : ''}, {details.city} - {details.pincode}</span></div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Base (₹{tool.dailyRate} × {days})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Delivery</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Taxes</span>
                  <span>₹{tax}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center pb-1">
                  <span className="font-bold text-slate-800">Payable now</span>
                  <span className="text-2xl font-black text-teal-600">₹{total}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Refundable deposit (held)</span>
                  <span>₹{refundableDeposit}</span>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-teal-600 mt-0.5">info</span>
                <p className="text-sm text-teal-800/90 font-medium">In production, payment and deposit are handled via a payment gateway with KYC-safe flows. This demo uses mock confirmation.</p>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }} className="p-10 flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex justify-center items-center mb-6">
                <span className="material-symbols-outlined text-teal-600 text-6xl">verified</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Rental Confirmed</h3>
              <p className="text-slate-500 font-medium mb-8">We’re scheduling delivery. Track updates in your dashboard.</p>
              
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.2, ease: "linear" }} className="h-full bg-teal-500"></motion.div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Redirecting</p>
            </motion.div>
          )}
        </div>

        {step < 4 && (
          <div className="p-6 border-t border-slate-100 bg-white space-y-3">
            {step === 3 && (
              <button
                onClick={() => setStep(2)}
                className="w-full bg-white border border-slate-200 text-slate-800 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Edit details
              </button>
            )}

            <button 
              onClick={step === 1 ? () => setStep(2) : step === 2 ? handleProceedFromDetails : handleProcessPayment}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              {step === 1 ? 'Continue' : step === 2 ? 'Review order' : `Confirm & Pay ₹${total}`}
              <span className="material-symbols-outlined text-lg">{step === 1 ? 'arrow_forward' : step === 2 ? 'fact_check' : 'lock'}</span>
            </button>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed text-center">
              By confirming, you agree to the rental terms and policies. This is a demo checkout (mock payment).
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}

// --- UI helpers (skeletons / states) ---
function ToolCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col border border-slate-200/60 shadow-sm animate-pulse">
      <div className="h-48 w-full rounded-2xl mb-5 bg-slate-100" />
      <div className="flex flex-col flex-grow">
        <div className="h-5 w-3/4 bg-slate-100 rounded mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-24 bg-slate-100 rounded" />
          <div className="h-6 w-16 bg-slate-100 rounded" />
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-5/6 bg-slate-100 rounded" />
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="h-7 w-20 bg-slate-100 rounded mb-2" />
            <div className="h-3 w-10 bg-slate-100 rounded" />
          </div>
          <div className="h-10 w-28 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ToolRentalPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { tools, loading: isLoading, error: loadError, fetchTools, createRental } = useToolStore();
  const { t } = useLanguageStore();
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("relevance");
  const [condition, setCondition] = useState("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  React.useEffect(() => {
    fetchTools(activeCategory);
  }, [activeCategory, fetchTools]);

  const filteredTools = useMemo(() => {
    const base = tools.filter(tool => {
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        tool.name.toLowerCase().includes(q) ||
        (tool.description && tool.description.toLowerCase().includes(q));
      
      const matchesPrice = (tool.dailyRate || 0) <= maxPrice;
      const matchesCondition = condition === "All" || tool.condition === condition;
      const matchesAvailability = !onlyAvailable || tool.status === 'available';

      return matchesCategory && matchesSearch && matchesPrice && matchesCondition && matchesAvailability;
    });

    const sorted = [...base];
    if (sortBy === "priceLowHigh") sorted.sort((a, b) => a.dailyRate - b.dailyRate);
    if (sortBy === "priceHighLow") sorted.sort((a, b) => b.dailyRate - a.dailyRate);
    // Note: If rating exists in data, we could sort by rating. For now, stick to price and relevance.
    return sorted;
  }, [tools, activeCategory, searchQuery, maxPrice, condition, onlyAvailable, sortBy]);

  const removeFilter = (type, value) => {
    if (type === 'search') setSearchQuery('');
    if (type === 'category') setActiveCategory('All');
    if (type === 'price') setMaxPrice(10000);
    if (type === 'condition') setCondition('All');
    if (type === 'availability') setOnlyAvailable(false);
  };

  const handleClearFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setMaxPrice(10000);
    setSortBy('relevance');
    setCondition('All');
    setOnlyAvailable(false);
    toast('Filters cleared', { icon: '🔄' });
  };

  const hasActiveFilters = searchQuery.trim().length > 0 || activeCategory !== 'All' || maxPrice < 10000 || condition !== 'All' || onlyAvailable || sortBy !== 'relevance';

  const handleRetryLoad = () => {
    fetchTools(activeCategory);
  };

  const handleRentNow = (tool) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    setSelectedTool(tool);
  };

  const handleConfirmed = async (rentalData) => {
    if (rentalData && currentUser) {
      try {
        await createRental({
          toolId: rentalData.toolId,
          days: rentalData.days,
          deliveryDetails: rentalData.details
        });
        toast.success(`Rental confirmed: ${rentalData.toolName}`);
        setSelectedTool(null);
        navigate('/user/dashboard');
      } catch (err) {
        toast.error('Failed to create rental.');
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedTool && (
          <CartDrawer tool={selectedTool} onClose={() => setSelectedTool(null)} onConfirm={handleConfirmed} />
        )}
      </AnimatePresence>

      <div className="min-h-screen pt-8 pb-20 px-4 sm:px-8">
        <main className="max-w-[1440px] mx-auto">

          <header className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-brand mb-3">Tool Depot</h1>
                <p className="text-slate-500 font-medium text-lg max-w-xl">Commercial-grade equipment delivered instantly to your door. Rent by the day, week, or month.</p>
              </div>
              
              {/* Industry Level Search Bar */}
              <div className="relative w-full md:w-[450px] group">
                <div className="flex items-center bg-white border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-teal-600 transition-all shadow-sm group-hover:shadow-md">
                  <span className="material-symbols-outlined pl-4 text-slate-400 group-focus-within:text-teal-600">search</span>
                  <input 
                    type="text" 
                    placeholder={t('tr_search_placeholder')} 
                    className="flex-grow px-3 py-3.5 bg-transparent border-none focus:ring-0 text-slate-800 font-medium"
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 mr-1 text-slate-400 hover:text-slate-600">
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
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">{t('sd_active_filters')}:</span>
                {searchQuery && (
                  <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                    {t('sd_search')}: {searchQuery}
                    <button onClick={() => removeFilter('search')} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                )}
                {activeCategory !== 'All' && (
                  <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                    {activeCategory}
                    <button onClick={() => removeFilter('category')} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                )}
                {maxPrice < 10000 && (
                  <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                    Under ₹{maxPrice}
                    <button onClick={() => removeFilter('price')} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                )}
                {condition !== 'All' && (
                  <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                    {condition}
                    <button onClick={() => removeFilter('condition')} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                )}
                {onlyAvailable && (
                  <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                    {t('tr_in_stock')}
                    <button onClick={() => removeFilter('availability')} className="hover:text-teal-900"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                )}
                <button onClick={handleClearFilters} className="text-xs font-bold text-teal-600 hover:underline px-2">{t('sd_clear_all')}</button>
              </div>
            )}
          </header>

          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Sidebar Categories & Filters */}
            <aside className="w-full lg:w-72 flex-shrink-0">
               <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-card lg:sticky lg:top-28 space-y-8">
                 <div>
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-teal-600 text-lg">filter_list</span>
                     {t('tr_equipment_types')}
                   </h3>
                   <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
                     {categories.map(cat => (
                       <button
                         key={cat}
                         onClick={() => setActiveCategory(cat)}
                         className={`px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all flex items-center justify-between group flex-shrink-0 whitespace-nowrap ${activeCategory === cat ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20' : 'text-slate-600 hover:bg-slate-50'}`}>
                         {cat}
                         <span className={`material-symbols-outlined text-sm transition-opacity hidden lg:block ${activeCategory === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>chevron_right</span>
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Price Filter */}
                 <div>
                   <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">payments</span>{t('tr_max_budget')}</h3>
                   <input type="range" min="100" max="10000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-600" />
                   <div className="flex justify-between mt-2 text-xs font-bold text-slate-500"><span>₹100</span><span className="text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">Up to ₹{maxPrice}</span></div>
                 </div>

                 {/* Condition Filter */}
                 <div>
                   <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">verified</span>{t('tr_condition')}</h3>
                   <div className="flex flex-wrap gap-2">
                     {["All", "Like New", "Excellent", "Good"].map(cond => (
                       <button key={cond} onClick={() => setCondition(cond)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${condition === cond ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>
                         {cond}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Sort & Availability */}
                 <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">event_available</span>{t('tr_in_stock')}</h3>
                      <button onClick={() => setOnlyAvailable(!onlyAvailable)} className={`w-10 h-5 rounded-full transition-colors relative ${onlyAvailable ? 'bg-teal-600' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${onlyAvailable ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-teal-600 text-lg">sort</span>{t('sd_sort_by')}</h3>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:border-teal-500 focus:ring-0 outline-none cursor-pointer">
                        <option value="relevance">{t('tr_relevance')}</option>
                        <option value="priceLowHigh">{t('tr_price_low_high')}</option>
                        <option value="priceHighLow">{t('tr_price_high_low')}</option>
                      </select>
                    </div>
                 </div>

                 {/* Delivery Banner */}
                 <div className="mt-8 bg-gradient-to-br from-brand to-brand-light p-6 rounded-3xl text-white relative overflow-hidden shadow-lg hidden lg:block">
                    <span className="material-symbols-outlined text-teal-400 text-3xl mb-2 relative z-10">bolt</span>
                    <h4 className="font-bold mb-1 relative z-10 text-lg">Turbo Delivery</h4>
                    <p className="text-xs text-slate-300 font-medium relative z-10 leading-relaxed">Hardware delivered to site in under 60 minutes. Pro-grade speed.</p>
                    <div className="absolute -right-4 -bottom-4 opacity-10"><span className="material-symbols-outlined text-[100px]">local_shipping</span></div>
                 </div>
               </div>
            </aside>

            {/* Grid */}
            <section className="flex-grow">
              {loadError ? (
                <div className="bg-white rounded-[2rem] border border-rose-200 p-10 text-center">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex justify-center items-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-rose-600 text-3xl">error</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mb-2">Couldn’t load tools</p>
                  <p className="text-slate-600 font-medium mb-6">{loadError}</p>
                  <button
                    onClick={handleRetryLoad}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Retry
                  </button>
                </div>
              ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, idx) => <ToolCardSkeleton key={idx} />)
                  ) : (
                    <AnimatePresence>
                      {filteredTools.map(tool => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          key={tool.id} 
                          className="bg-white rounded-2xl p-4 flex flex-col group border border-slate-200/60 shadow-card card-hover transition-all duration-300"
                        >
                          <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-5 bg-slate-100">
                            {tool.images?.[0] ? (
                              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={tool.name} src={tool.images[0]} />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-5xl">construction</span>
                                <span className="text-xs font-bold uppercase tracking-wider">No image</span>
                              </div>
                            )}
                            {tool.condition === 'Like New' && (
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm border border-slate-100">
                                <span className="material-symbols-outlined text-teal-600 text-[14px]">new_releases</span>
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Premium</span>
                              </div>
                            )}
                            <div className={`absolute bottom-3 right-3 px-2 py-1 rounded border shadow-sm text-xs font-bold ${tool.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              {tool.status}
                            </div>
                          </div>
                          
                          <div className="flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-teal-600 transition-colors cursor-pointer">{tool.name}</h3>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-4">
                              <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                                <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 5.0
                              </span>
                            </div>

                            <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">{tool.description}</p>
                            
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-auto pt-4 border-t border-slate-100 gap-4">
                              <div>
                              <span className="text-2xl font-extrabold text-teal-600">₹{tool.dailyRate}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">/ day</span>
                              </div>
                              
                              <button 
                                disabled={tool.status !== 'available'}
                                onClick={() => handleRentNow(tool)} 
                                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1 active:scale-95 ${
                                  tool.status === 'available' 
                                    ? 'bg-slate-900 text-white hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/30' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">{tool.status === 'available' ? 'shopping_bag' : 'event_busy'}</span>
                                {tool.status === 'available' ? 'Rent Now' : 'Reserved'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}

                  {!isLoading && filteredTools.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex justify-center items-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">search_off</span>
                      </div>
                      <p className="text-2xl font-extrabold text-slate-800 mb-2">No tools match your filters</p>
                      <p className="text-slate-500 font-medium mb-6">Try a different keyword or reset filters to see everything.</p>
                      <button
                        onClick={handleClearFilters}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-lg">filter_alt_off</span>
                        Clear filters
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </section>
          </div>

          {/* New Premium Footer Section with Toast Actions */}
          <div className="mt-20 p-12 bg-slate-900 rounded-3xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold font-jakarta text-white mb-2">Can't find the right tool?</h2>
              <p className="text-slate-400 leading-relaxed max-w-lg font-medium">Our tactical inventory updates every hour. Request a specific professional tool and we'll track it down for you.</p>
            </div>
            <div className="relative z-10 flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => toast.success('Tactical request submitted! Tracking your tool...')} 
                className="bg-teal-500 text-teal-950 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-teal-400 transition-all active:scale-[0.97]"
              >
                Request a Tool
              </button>
              <button 
                onClick={() => toast('Redirecting to provider HQ...', { icon: '🤝' })} 
                className="bg-white/5 text-white px-8 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-colors"
              >
                Become a Provider
              </button>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
