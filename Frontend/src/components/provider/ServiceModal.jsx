/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { compressImageFile } from '../../lib/imageUpload';

const SERVICE_CATEGORIES = [
  'Home Maintenance','Professional Cleaning','Electrical Works',
  'Gardening & Landscaping','Plumbing','Pest Control',
  'Painting','Carpentry','Appliance Repair','Personal Care',
];
const ICONS = [
  'home_repair_service','cleaning_services','electrical_services',
  'yard','plumbing','pest_control','format_paint',
  'handyman','build','spa',
];

export default function ServiceModal({ onClose, onSuccess, editData }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [basePrice, setBasePrice] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setName(editData.name || '');
      setCategory(editData.category || SERVICE_CATEGORIES[0]);
      setBasePrice(String(editData.basePrice || ''));
      setDescription(editData.description || '');
      setIcon(editData.icon || ICONS[0]);
      setImage(editData.image || '');
    } else {
      setImage('');
    }
  }, [editData]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
      setImage(compressed);
    } catch (err) {
      toast.error(err.message || 'Failed to process image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = 'SVC_SAVE';
    toast.loading(editData ? 'Updating...' : 'Creating...', { id: toastId });
    try {
      const payload = { name, category, basePrice: Number(basePrice), description, icon, image };
      if (editData) {
        await api.put(`/services/${editData._id}`, payload);
        toast.success('Service updated!', { id: toastId });
      } else {
        await api.post('/services', payload);
        toast.success('Service created!', { id: toastId });
      }
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed', { id: toastId });
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
        className="fixed inset-0 bg-brand-dark/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div onClick={e=>e.stopPropagation()} initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
          className="bg-surface rounded-3xl w-full max-w-2xl shadow-premium border border-slate-200/50 overflow-hidden relative my-8">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-extrabold font-headline text-brand">{editData ? 'Edit Service' : 'Add New Service'}</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">{editData ? 'Update your service details.' : 'Offer a new service to customers.'}</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-brand transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Service Name</label>
                  <input required type="text" className="input-field" placeholder="e.g. Deep Home Cleaning" value={name} onChange={e=>setName(e.target.value)} />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Base Price (₹)</label>
                  <input required type="number" min="50" className="input-field" placeholder="500" value={basePrice} onChange={e=>setBasePrice(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select className="input-field" value={category} onChange={e=>setCategory(e.target.value)}>
                    {SERVICE_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(ic=>(
                      <button type="button" key={ic} onClick={()=>setIcon(ic)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${icon===ic?'bg-accent/20 border-accent text-accent-dark':'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                        <span className="material-symbols-outlined text-lg">{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea rows="3" className="input-field resize-none" placeholder="Describe your service..." value={description} onChange={e=>setDescription(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Service Image</label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-full md:w-44 h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {image ? (
                      <img src={image} alt="Service preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-3xl">image</span>
                        <span className="text-xs font-semibold">No image selected</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                      <span className="material-symbols-outlined text-lg">upload</span>
                      Upload image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                        Remove image
                      </button>
                    )}
                    <p className="text-xs text-slate-400 font-medium">This image will be shown on the service card.</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <button type="submit" disabled={saving} className="w-full btn-accent !py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                  {saving ? <><span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>Saving...</> : <>{editData ? 'Update Service' : 'Add Service'}<span className="material-symbols-outlined text-xl">check_circle</span></>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
