/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { compressImageFile } from '../../lib/imageUpload';

const TOOL_CATEGORIES = ['Power Tools','Hand Tools','Construction','Gardening'];
const CONDITIONS = ['Like New','Good','Fair'];

export default function ToolModal({ onClose, onSuccess, editData }) {
  const [name, setName] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [category, setCategory] = useState(TOOL_CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setName(editData.name || '');
      setDailyRate(String(editData.dailyRate || ''));
      setCategory(editData.category || TOOL_CATEGORIES[0]);
      setCondition(editData.condition || CONDITIONS[0]);
      setDescription(editData.description || '');
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
    const toastId = 'TOOL_SAVE';
    toast.loading(editData ? 'Updating...' : 'Listing...', { id: toastId });
    try {
      const payload = { name, dailyRate: Number(dailyRate), category, condition, description, image };
      if (editData) {
        await api.put(`/tools/${editData._id}`, payload);
        toast.success('Tool updated!', { id: toastId });
      } else {
        await api.post('/tools', payload);
        toast.success('Tool listed!', { id: toastId });
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
        <motion.div onClick={e=>e.stopPropagation()} initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}}
          className="bg-surface rounded-3xl w-full max-w-2xl shadow-premium border border-slate-200/50 overflow-hidden relative my-8">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-extrabold font-headline text-brand">{editData ? 'Edit Tool' : 'List a Tool'}</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">{editData ? 'Update tool details.' : 'Earn passive income by renting out your equipment.'}</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-brand transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Equipment Name</label>
                  <input required type="text" className="input-field" placeholder="e.g. Bosch Hammer Drill" value={name} onChange={e=>setName(e.target.value)} />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Daily Rate (₹)</label>
                  <input required type="number" min="50" className="input-field" placeholder="450" value={dailyRate} onChange={e=>setDailyRate(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select className="input-field" value={category} onChange={e=>setCategory(e.target.value)}>
                    {TOOL_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Condition</label>
                  <select className="input-field" value={condition} onChange={e=>setCondition(e.target.value)}>
                    {CONDITIONS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea required rows="3" className="input-field resize-none" placeholder="Specs, accessories, etc." value={description} onChange={e=>setDescription(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tool Image</label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-full md:w-44 h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {image ? (
                      <img src={image} alt="Tool preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-3xl">photo_camera</span>
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
                    <p className="text-xs text-slate-400 font-medium">This image will be shown in the rental listing.</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <button type="submit" disabled={saving} className="w-full btn-accent !py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                  {saving ? <><span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>Processing...</> : <>{editData ? 'Update Tool' : 'List Tool for Rent'}<span className="material-symbols-outlined text-xl">rocket_launch</span></>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
