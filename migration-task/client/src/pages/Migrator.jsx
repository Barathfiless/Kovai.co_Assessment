import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Settings, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  ExternalLink,
  Download,
  Eye,
  Rocket,
  ShieldCheck,
  History as HistoryIcon,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Helper for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Migrator() {
  // Tab/Layout State
  const [activeTab, setActiveTab] = useState('upload'); // upload, history
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Migration State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState('');
  const [dryRun, setDryRun] = useState(false);
  
  const [status, setStatus] = useState('idle'); // idle, uploading, streaming, done, error
  const [jobId, setJobId] = useState(null);
  const [steps, setSteps] = useState([
    { id: 1, name: 'Parse Word Document', status: 'pending', message: 'Waiting to start...' },
    { id: 2, name: 'Generate HTML', status: 'pending', message: 'Waiting to start...' },
    { id: 3, name: 'Upload to Document360', status: 'pending', message: 'Waiting to start...' },
  ]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const eventSourceRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.docx')) {
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace('.docx', ''));
    } else {
      alert('Please select a valid .docx file');
    }
  };

  const startMigration = async () => {
    if (!file) return;

    setStatus('uploading');
    setError(null);
    setPreviewHtml('');
    setResult(null);
    setSteps(s => s.map(step => ({ ...step, status: 'pending', message: 'Waiting...' })));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (apiKey) formData.append('api_key', apiKey);
    if (projectId) formData.append('project_id', projectId);
    if (userId) formData.append('user_id', userId);
    formData.append('dry_run', dryRun.toString());

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to start migration job');

      const data = await response.json();
      setJobId(data.job_id);
      startStreaming(data.job_id);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const startStreaming = (id) => {
    setStatus('streaming');
    const es = new EventSource(`http://localhost:5000/stream/${id}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'step') {
        setSteps(prev => prev.map(step => 
          step.id === data.step 
            ? { ...step, status: data.status, message: data.message }
            : step
        ));
      } else if (data.type === 'html_preview') {
        setPreviewHtml(data.html);
      } else if (data.type === 'done') {
        setResult(data);
        setStatus('done');
        es.close();
      } else if (data.type === 'error') {
        setError(data.message);
        setStatus('error');
        es.close();
      }
    };

    es.onerror = () => {
      setError('Connection lost to server');
      setStatus('error');
      es.close();
    };
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const renderUploadContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Configuration & Upload */}
      <div className="lg:col-span-5 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Upload size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Document</h2>
          </div>

          <div className="space-y-4">
            <div 
              className={cn(
                "relative group border-2 border-dashed rounded-2xl p-8 transition-all text-center cursor-pointer",
                file ? "border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10" : "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input 
                id="file-upload"
                type="file" 
                className="hidden" 
                accept=".docx" 
                onChange={handleFileChange}
                disabled={status === 'uploading' || status === 'streaming'}
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-3">
                    <FileText size={24} />
                  </div>
                  <p className="font-medium text-slate-100 truncate max-w-full px-4">{file.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 group-hover:text-blue-600 dark:group-hover:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                    <Upload size={24} />
                  </div>
                  <p className="font-medium text-slate-300">Click to upload or drag & drop</p>
                  <p className="text-sm text-slate-500 mt-1">Microsoft Word (.docx) only</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">Article Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-3 py-2">
              <button 
                onClick={() => setDryRun(!dryRun)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  dryRun ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform",
                  dryRun ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Dry Run Mode</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">Generate HTML without uploading to API</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Settings size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">API Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">API Token</label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Document360 API Token"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">Project ID</label>
                <input 
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="Project ID"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">User ID</label>
                <input 
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User ID"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={startMigration}
            disabled={!file || status === 'uploading' || status === 'streaming'}
            className={cn(
              "w-full mt-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg",
              status === 'uploading' || status === 'streaming' 
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] text-white shadow-blue-500/20"
            )}
          >
            {status === 'idle' && (
              <>
                <span>Start Migration</span>
                <Rocket size={18} />
              </>
            )}
            {(status === 'uploading' || status === 'streaming') && (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            )}
            {status === 'done' && <span>Restart</span>}
            {status === 'error' && <span>Retry Migration</span>}
          </button>
        </motion.div>
      </div>

      {/* Progress & Preview */}
      <div className="lg:col-span-7 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl p-8"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ChevronRight size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Migration Progress</h2>
          </div>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={step.id} className="relative">
                {idx !== steps.length - 1 && (
                  <div className={cn(
                    "absolute left-[19px] top-10 w-[2px] h-10 transition-colors duration-500",
                    step.status === 'done' ? "bg-emerald-500/40" : "bg-slate-800"
                  )} />
                )}
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    "z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    step.status === 'done' ? "bg-emerald-500 border-emerald-500 text-white dark:text-[#0f172a]" : 
                    step.status === 'active' ? "bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" :
                    step.status === 'error' ? "bg-red-500 border-red-500 text-white" :
                    "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600"
                  )}>
                    {step.status === 'done' ? <CheckCircle2 size={24} /> : 
                     step.status === 'active' ? <Loader2 size={20} className="animate-spin" /> :
                     step.status === 'error' ? <AlertCircle size={24} /> :
                     <span className="text-sm font-bold">{step.id}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-bold transition-colors",
                        step.status === 'pending' ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"
                      )}>{step.name}</h3>
                      {step.status === 'done' && <span className="text-xs text-emerald-500 font-medium">COMPLETE</span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{step.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-red-400 text-sm"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4"
            >
              <div className="flex items-center space-x-3 text-emerald-400 font-bold">
                <CheckCircle2 size={24} />
                <span>Migration Successful!</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/50 dark:bg-slate-900/40 p-3 rounded-xl border border-emerald-500/10 dark:border-transparent">
                  <p className="text-slate-500 mb-1 font-medium">HTML Size</p>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400">{(result.html_size / 1024).toFixed(1)} KB</p>
                </div>
                {result.article_id && (
                  <div className="bg-white/50 dark:bg-slate-900/40 p-3 rounded-xl border border-emerald-500/10 dark:border-transparent">
                    <p className="text-slate-500 mb-1 font-medium">Article ID</p>
                    <p className="font-mono text-emerald-600 dark:text-emerald-400">{result.article_id.substring(0, 8)}...</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <a 
                  href={`http://localhost:5000/download/${jobId}`}
                  className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold shadow-sm"
                >
                  <Download size={16} className="inline mr-2" />
                  <span className="text-sm font-semibold">Download HTML</span>
                </a>
                {result.slug && (
                  <button 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <ExternalLink size={16} />
                    <span className="text-sm font-semibold text-white">View Article</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-500/20 rounded-lg text-slate-600 dark:text-slate-400">
                <Eye size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">HTML Preview</h2>
            </div>
            {previewHtml && <span className="text-xs text-slate-500 font-mono">LIVE RENDER</span>}
          </div>

          <div className="relative group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden h-[400px]">
            {previewHtml ? (
              <div 
                className="p-6 h-full overflow-y-auto prose prose-invert prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-3">
                <div className="p-4 rounded-full bg-slate-800/50">
                  <FileText size={32} />
                </div>
                <p className="text-sm font-medium">Ready to render preview</p>
              </div>
            )}
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderHistoryContent = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-8 min-h-[600px]"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <HistoryIcon size={20} />
          </div>
          <h2 className="text-xl font-bold">Migration History</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Filter history..." 
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <Filter size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-white/5">
            <tr>
              <th className="pb-4 px-2">DOCUMENT NAME</th>
              <th className="pb-4 px-2">STATUS</th>
              <th className="pb-4 px-2">DATE</th>
              <th className="pb-4 px-2">ARTICLE ID</th>
              <th className="pb-4 px-2 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-5 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-200">Release Notes v2.4.docx</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Standard Upload</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-2">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    Success
                  </span>
                </td>
                <td className="py-5 px-2 text-slate-400 text-xs">Mar 12, 2026</td>
                <td className="py-5 px-2 font-mono text-slate-500 text-xs">art_7d9e1a...</td>
                <td className="py-5 px-2 text-right">
                  <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
        <p>Showing 3 of 127 migrations</p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-slate-800 rounded-lg border border-white/5 disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 bg-slate-800 rounded-lg border border-white/10 text-white">1</button>
          <button className="px-3 py-1 hover:bg-white/5 rounded-lg transition-all">2</button>
          <button className="px-3 py-1 hover:bg-white/5 rounded-lg transition-all">3</button>
          <button className="px-3 py-1 bg-slate-800 rounded-lg border border-white/5">Next</button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`flex min-h-screen bg-canvas text-main font-sans selection:bg-blue-500/30 transition-colors duration-300`}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] dark:bg-blue-600/5" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] dark:bg-indigo-600/5" />
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      <div 
        className="flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300"
        style={{ paddingLeft: isSidebarCollapsed ? '80px' : '280px' }}
      >
        <Header 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 p-8 lg:p-12 mt-20">
          <div className="max-w-7xl mx-auto">
            {/* Header Content */}
            <div className="mb-12">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end justify-between"
              >
                <div>
                  <h1 className="text-4xl font-extrabold font-outfit mb-3 text-slate-900 dark:text-white">
                    {activeTab === 'upload' ? 'Upload Documents' : 'Migration History'}
                  </h1>
                </div>
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'upload' ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderUploadContent()}
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderHistoryContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="py-8 px-12 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs transition-colors duration-300">
          <p>© 2026 DocuSync Enterprise Workspace</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0 font-medium">
            <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">API Reference</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Security Audit</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
