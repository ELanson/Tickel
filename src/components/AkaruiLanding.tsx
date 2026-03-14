import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Globe, ArrowRight, Plus, Lightbulb } from 'lucide-react';

const AkaruiLanding = ({ onNewSession, onBrainstorm }: { onNewSession: () => void, onBrainstorm: () => void }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Dynamic Mesh Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Main Content */}
      <div className="max-w-4xl w-full text-center z-10 space-y-12">
        {/* Status Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex flex-col items-center gap-2 px-6 py-2 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">System Offline: Start LM Studio</span>
          </div>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
            Localhost communication requires "Allow Insecure Content" in site settings.
          </p>
        </motion.div>

        {/* Fox Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 bg-white/60 rounded-[40px] border-2 border-white/80 backdrop-blur-3xl shadow-2xl flex items-center justify-center p-5 group hover:rotate-6 transition-transform">
            <img src="/Yukime-icon-192.png" alt="Yukime" className="w-full h-full object-contain filter grayscale opacity-80" />
          </div>
        </motion.div>

        {/* Greeting Text */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-6xl md:text-8xl font-black italic tracking-tighter"
          >
            <span className="text-[#2D1B69]">Hello, </span>
            <span className="bg-gradient-to-r from-indigo-500 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Whimsical Creator.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#6B5B95] font-bold max-w-2xl mx-auto leading-relaxed"
          >
            Chat freely with Yukime, your personal AI companion.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 px-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewSession}
            className="bg-white/40 border-2 border-white/80 backdrop-blur-3xl p-8 rounded-[40px] text-left shadow-2xl group transition-all"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Plus size={24} />
            </div>
            <h3 className="text-xl font-black text-[#2D1B69] mb-2">New Session</h3>
            <p className="text-sm text-[#6B5B95] font-medium leading-relaxed">
              Spawn a new conversation thread with your currently active local model.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBrainstorm}
            className="bg-white/40 border-2 border-white/80 backdrop-blur-3xl p-8 rounded-[40px] text-left shadow-2xl group transition-all"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Lightbulb size={24} />
            </div>
            <h3 className="text-xl font-black text-[#2D1B69] mb-2">Brainstorm Ideas</h3>
            <p className="text-sm text-[#6B5B95] font-medium leading-relaxed">
              Give me a topic, and I'll give you 10 fresh perspectives.
            </p>
          </motion.button>
        </div>

        {/* Footer Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-12 flex flex-wrap justify-center gap-8"
        >
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6B5B95]">
            <Shield size={14} className="text-teal-400" />
            100% Private
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6B5B95]">
            <Globe size={14} className="text-blue-400" />
            Adaptive
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6B5B95]">
            <Zap size={14} className="text-indigo-400" />
            Fast
          </div>
        </motion.div>

        <div className="text-[10px] text-[#6B5B95]/60 font-medium">
          Yukime 2.5 by Rickel Industries. Yukime can make mistakes. Verify important info.
        </div>
      </div>
    </div>
  );
};

export default AkaruiLanding;
