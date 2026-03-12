import React from 'react';
import { 
  Upload, 
  History, 
  LogOut, 
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'upload', name: 'Upload Documents', icon: <Upload size={20} /> },
  { id: 'history', name: 'Migration History', icon: <History size={20} /> },
];

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="fixed top-0 left-0 z-50 h-screen bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-white/5 flex flex-col transition-all duration-300"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex shrink-0 items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">D</div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold font-outfit tracking-tight whitespace-nowrap text-slate-900 dark:text-white"
            >
              Docu<span className="text-blue-500">Sync</span>
            </motion.span>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all group relative ${
              activeTab === item.id 
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <div className={`shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-nowrap"
              >
                {item.name}
              </motion.span>
            )}
            
            {/* Active Indicator Line */}
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeNav"
                className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" 
              />
            )}

            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <div className="absolute left-16 px-3 py-2 bg-slate-900 text-white border border-white/10 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.name}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-white/5 space-y-2">
        {!isCollapsed && (
          <div className="px-4 py-3 mb-2 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <ShieldCheck size={12} />
              <span>Enterprise Ready</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Your data is secured with AES-256 encryption.</p>
          </div>
        )}

        <button
          onClick={() => navigate('/auth')}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all group relative"
        >
          <div className="shrink-0 group-hover:rotate-12 transition-transform">
            <LogOut size={20} />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium whitespace-nowrap"
            >
              Logout
            </motion.span>
          )}
          {isCollapsed && (
            <div className="absolute left-16 px-3 py-2 bg-red-600 text-white border border-red-500/10 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Logout
            </div>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-50 shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}
