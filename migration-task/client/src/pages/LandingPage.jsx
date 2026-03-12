import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  BarChart3, 
  Globe2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    {
      icon: <Zap className="text-blue-400" />,
      title: "Real-time Streaming",
      description: "Watch your documents migrate in real-time with our advanced SSE-powered streaming technology."
    },
    {
      icon: <Layers className="text-indigo-400" />,
      title: "Format Preservation",
      description: "Complex tables, code blocks, and nested lists are preserved with perfection during the conversion."
    },
    {
      icon: <ShieldCheck className="text-emerald-400" />,
      title: "Enterprise Security",
      description: "Direct-to-API migration ensures your sensitive documentation never touches unauthorized storage."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">D</div>
            <span className="text-2xl font-bold font-outfit tracking-tight">Docu<span className="text-blue-500">Sync</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-white transition-colors">Documentation</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth" className="text-sm font-medium hover:text-white transition-colors">Login</Link>
            <Link 
              to="/auth" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Zap size={14} />
              <span>Version 2.4 is now live</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold font-outfit leading-tight mb-6">
              The Enterprise <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Migrator SDK.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-lg">
              Unlock seamless document synchronization between Microsoft Word and Document360. Built for speed, precision, and security.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/auth" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/25 group"
              >
                <span>Start Migration Now</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all border border-slate-700">
                <Globe2 size={20} />
                <span>View Demo Site</span>
              </button>
            </div>
            
            <div className="mt-12 flex items-center space-x-6 grayscale opacity-50">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Trusted by</span>
              <div className="h-6 w-24 bg-slate-700/50 rounded" />
              <div className="h-6 w-24 bg-slate-700/50 rounded" />
              <div className="h-6 w-24 bg-slate-700/50 rounded" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/20 bg-slate-900">
              <img 
                src="/landing_hero_image.png" 
                alt="DocuSync Platform" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60" />
            </div>
            
            {/* Stats Card Overlay */}
            <div className="absolute -bottom-10 -left-10 z-20 glass-card p-6 rounded-2xl border border-white/10 hidden md:block">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-xs text-slate-500 font-medium">Precision Accuracy</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold font-outfit mb-4">Precision-Engineered Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to handle complex technical documentation at scale.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-10 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group"
              >
                <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {React.cloneElement(feature.icon, { size: 28 })}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-slate-500 text-sm">
          <div className="flex items-center space-x-4">
            <span className="font-bold font-outfit text-slate-300">DocuSync Enterprise</span>
            <span>|</span>
            <span>© 2026 </span>
          </div>
          <div className="flex items-center space-x-8">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
