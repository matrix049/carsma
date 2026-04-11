'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { createContactMessage } from '@/lib/apiServices';

export default function ContactPage() {
  const { t } = useLanguage();

  // Form state management (Task 9.1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    message: ''
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  // Form validation (Task 9.2)
  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: '',
      message: ''
    };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address';
      isValid = false;
    }

    // Validate message
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Form submission handler (Task 9.3)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await createContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim()
      });

      // Display success message
      setSuccessMessage(response.message || 'Your message has been sent successfully!');
      
      // Clear form fields on success
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      setValidationErrors({
        name: '',
        email: '',
        message: ''
      });
    } catch (error: any) {
      // Display error message on failure
      setErrorMessage(error.message || 'Failed to send message. Please try again.');
      // Maintain form data on error (don't clear)
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-40 overflow-hidden relative">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-900/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 sm:px-10 max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto flex flex-col items-center mb-24"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 mb-6">Concierge</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 text-center uppercase font-jakarta">
            {t('contact')}
          </h1>
          <div className="h-2 w-32 bg-blue-600 rounded-full mb-10 shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
          <p className="max-w-2xl text-center text-xl text-zinc-400 font-medium leading-relaxed">
            {t('contactDesc')} Sophisticated inquiry requires a dedicated response. Our curators are at your disposal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-stretch">
          
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="h-full rounded-[3.5rem] border border-zinc-800 bg-zinc-900/50 p-10 md:p-14 shadow-4xl backdrop-blur-xl">
              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 rounded-2xl bg-green-900/30 border border-green-700 px-6 py-4 text-sm text-green-400">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-6 rounded-2xl bg-red-900/30 border border-red-700 px-6 py-4 text-sm text-red-400">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Identity
                    </label>
                    <input 
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Adam Benz"
                      className={`w-full bg-zinc-950 border ${validationErrors.name ? 'border-red-600' : 'border-zinc-800'} rounded-2xl px-6 py-5 text-sm font-medium focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700`}
                    />
                    {validationErrors.name && (
                      <p className="text-xs text-red-400 ml-1">{validationErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      {t('email')}
                    </label>
                    <input 
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="adam@benz.ma"
                      className={`w-full bg-zinc-950 border ${validationErrors.email ? 'border-red-600' : 'border-zinc-800'} rounded-2xl px-6 py-5 text-sm font-medium focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700`}
                    />
                    {validationErrors.email && (
                      <p className="text-xs text-red-400 ml-1">{validationErrors.email}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                    Matter of Inquiry
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6} 
                    placeholder="Describe your vision or inquiry details..."
                    className={`w-full bg-zinc-950 border ${validationErrors.message ? 'border-red-600' : 'border-zinc-800'} rounded-2xl px-6 py-5 text-sm font-medium focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 resize-none`}
                  />
                  {validationErrors.message && (
                    <p className="text-xs text-red-400 ml-1">{validationErrors.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 py-6 text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-blue-500 shadow-3xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : t('sendMessage')}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 flex flex-col gap-8"
          >
            {[
              { label: 'Electronic Correspondence', value: 'curator@l7it.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { label: 'Direct Telecommunications', value: '+212 777 780 778', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
              { label: 'Bureau of Design', value: 'Rabat, Morocco', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="flex items-center gap-8 p-10 rounded-[3rem] border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 transition-colors group cursor-default"
              >
                <div className="h-16 w-16 flex-none rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 transition-colors group-hover:text-zinc-400">{item.label}</p>
                  <p className="text-lg font-black text-white">{item.value}</p>
                </div>
              </motion.div>
            ))}
            
            {/* Social Connection */}
            <motion.div variants={itemVariants} className="mt-8 flex gap-4">
               {['INSTAGRAM', 'BEHANCE', 'TWITTER'].map(social => (
                 <button key={social} className="flex-1 rounded-2xl border border-zinc-900 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white hover:border-zinc-700 transition-all">
                   {social}
                 </button>
               ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
