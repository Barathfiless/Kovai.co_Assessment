import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Github,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex overflow-hidden">
      {/* Left side: Image & Content */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/auth_side_image.png" 
            alt="Data Sync" 
            className="w-full h-full object-cover opacity-60 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex items-center space-x-2">
          <Link to="/" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">D</Link>
          <span className="text-2xl font-bold font-outfit tracking-tight">Docu<span className="text-blue-500">Sync</span></span>
        </div>

        <div className="relative z-10 space-y-8 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck size={12} />
              <span>Standard Encryption v3</span>
            </div>
            <h2 className="text-5xl font-extrabold font-outfit leading-tight mb-6">
              Accelerate your <br />
              <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">knowledge</span> delivery.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              "DocuSync has revolutionized our technical documentation workflow, saving us hundreds of hours in manual formatting."
            </p>
          </motion.div>

          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-slate-800" />
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium">+ 2,500 teams already onboard</p>
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-xs flex items-center space-x-6">
          <span>© 2026 DocuSync Enterprise</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>v2.4.0-stable</span>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 bg-slate-900/10 relative">
        {/* Back Link */}
        <Link 
          to="/" 
          className="absolute top-8 left-8 lg:left-12 flex items-center space-x-2 text-slate-500 hover:text-white transition-colors text-sm font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-extrabold font-outfit mb-2">
              {isLogin ? "Welcome Back" : "Create Enterprise Account"}
            </h1>
            <p className="text-slate-500 font-medium">
              {isLogin ? "Enter your credentials to access the migration engine." : "Start your 30-day free trial. No credit card required."}
            </p>
          </div>

          <div className="space-y-4">
            <button className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center space-x-3 transition-all font-bold text-slate-300">
              <Github size={20} />
              <span>Continue with GitHub</span>
            </button>
            
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <span className="relative px-4 text-xs font-bold text-slate-600 bg-[#0f172a] uppercase tracking-widest">or email</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-white"
                      placeholder="John Carter"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-white"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  {isLogin && <a href="#" className="text-xs font-bold text-blue-500 hover:text-blue-400 tracking-wide uppercase transition-colors">Forgot?</a>}
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-extrabold text-white transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <span>{isLogin ? "Secure Login" : "Create Account"}</span>
                <ChevronRight size={18} />
              </button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-sm font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"} <br /><br />
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="px-6 py-2 rounded-full border border-slate-700 hover:border-blue-500/50 text-slate-300 hover:text-blue-400 transition-all text-xs font-bold uppercase tracking-widest"
            >
              {isLogin ? "Join the Waitlist" : "Login to Console"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
