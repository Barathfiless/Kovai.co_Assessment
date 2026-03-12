import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  User,
  ChevronDown,
  Mail,
  HelpCircle,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ isDarkMode, setIsDarkMode, isSidebarCollapsed }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header 
      style={{ left: isSidebarCollapsed ? '80px' : '280px' }}
      className="fixed top-0 right-0 h-20 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl flex items-center justify-between px-8 z-40 transition-all duration-300"
    >
      {/* Left side: Search Context */}
      <div className="flex items-center space-x-4">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search documents or history..." 
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/5"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/5 relative"
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#0f172a]" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 glass-card rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-2xl z-50 text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold px-1">Notifications</h3>
                  <button className="text-[10px] text-blue-500 font-bold hover:underline">Mark all as read</button>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/10 dark:border-blue-500/20">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">Upload Successful</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Article "Project Architecture" migrated successfully.</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-transparent dark:border-white/5">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">2 hours ago</p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300">New system update version 2.4.1 is available.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative ml-2">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 p-1.5 pl-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-white/5 transition-all text-slate-700 dark:text-slate-300"
          >
            <span className="text-sm font-bold hidden sm:block">John Doe</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              JD
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl z-50 text-slate-900 dark:text-white"
              >
                <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                  <p className="text-sm font-bold">John Doe</p>
                  <p className="text-[11px] text-slate-500">Platform Administrator</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-sm transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group">
                    <User size={16} className="group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    <span>My Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-sm transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group">
                    <Mail size={16} className="group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    <span>Messages</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-sm transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group">
                    <HelpCircle size={16} className="group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    <span>Support Center</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
