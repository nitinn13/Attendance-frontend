import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComingSoon(): React.JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (email.trim()) {
      // Handle your subscription logic here
      setSubmitted(true);
      setEmail('');
    }
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center p-6 font-sans antialiased selection:bg-blue-500 selection:text-white relative overflow-hidden">
      
      {/* Animated Decorative Background Blur blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" 
        />
        <motion.div 
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-70" 
        />
      </div>

      {/* Main Content */}
      <motion.main 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl text-center my-auto z-10 py-12"
      >
        {/* Badge */}
        <motion.span 
          variants={fadeInUp}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 mb-6 uppercase tracking-wider"
        >
          Under Construction
        </motion.span>

        {/* Heading */}
        <motion.h1 
          variants={fadeInUp}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6"
        >
          Something big is <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">
            on the horizon.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p 
          variants={fadeInUp}
          className="text-base md:text-lg text-slate-500 max-w-md mx-auto mb-10 leading-relaxed"
        >
          We're crafting a brand new digital experience. Sign up below to get early access and exclusive updates when we launch.
        </motion.p>

        {/* Subscription Form Box */}
        <motion.div 
          variants={fadeInUp}
          className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 max-w-md mx-auto min-h-[64px] flex items-center"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                key="form"
                onSubmit={handleSubmit} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row gap-2 w-full"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 text-slate-700 placeholder-slate-400 bg-transparent rounded-xl focus:outline-none text-sm"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 text-white font-medium text-sm px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 whitespace-nowrap"
                >
                  Notify Me
                </motion.button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-2 px-4 w-full text-center flex items-center justify-center gap-2 text-emerald-600 font-medium text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You're on the list! We'll be in touch soon.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.main>

    </div>
  );
}