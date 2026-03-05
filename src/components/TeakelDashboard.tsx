import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Scan, Table, BarChart3, Settings, ArrowLeft,
    Globe, FileUp, Camera, MapPin, Phone, Mail, Link,
    User, Briefcase, Filter, ChevronRight, Download,
    Activity, Shield, Plus, Sparkles, Loader2, X,
    Trash2, CheckCircle2, AlertCircle, Eye
} from 'lucide-react';
import { useAppStore, Lead } from '../store/useAppStore';

// --- Shared Components ---
const TeakelSidebarItem = ({ icon: Icon, label, active, onClick, badge }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#1a1c1d] text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'} group`}
    >
        <div className="flex items-center gap-3">
            <Icon size={18} className={active ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-400'} />
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </div>
        {badge && (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase">{badge}</span>
        )}
    </button>
);

// --- Yuki-Search Module ---
const YukiSearch = () => {
    const { isDarkMode } = useAppStore();
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsSearching(true);
        // Simulate search
        setTimeout(() => setIsSearching(false), 2000);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-12 text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 overflow-hidden p-4">
                    <img src={isDarkMode ? "/TICKEL Logo 192px invert.png" : "/TICKEL Logo 192px.png"} className="w-full h-full object-contain" alt="Tickel" />
                </div>
                <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Yuki-Search</h2>
                <p className="text-gray-500 font-medium">AI-powered web scraping and lead discovery</p>
            </div>

            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`relative flex items-center p-4 rounded-3xl border ${isDarkMode ? 'bg-[#121214] border-gray-800 focus-within:border-emerald-500/50' : 'bg-white border-gray-200 focus-within:border-emerald-500/50'} shadow-2xl transition-all duration-500`}>
                    <Search className="text-gray-500 ml-2" size={24} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Describe your perfect customer or let Leadd hunt..."
                        className="flex-1 bg-transparent px-4 py-3 text-lg focus:outline-none placeholder:text-gray-600 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/40 disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {isSearching ? 'Hunting...' : 'Hunt leads'}
                    </button>
                </div>
            </form>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'}`}>
                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">Popular Sources</h4>
                    <div className="space-y-3">
                        {['Google Business Pages', 'LinkedIn Results', 'Indeed Job Postings', 'Crunchbase Profiles'].map(s => (
                            <div key={s} className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'}`}>
                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">Precision Filters</h4>
                    <div className="flex flex-wrap gap-2">
                        {['Industry', 'Revenue', 'Headcount', 'Location', 'Keywords', 'Role'].map(f => (
                            <span key={f} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-600'}`}>
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Yuki-Vision Module ---
const YukiVision = () => {
    const { isDarkMode, addLead } = useAppStore();
    const [isScanning, setIsScanning] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsScanning(true);
        // Simulate Gemini Extraction
        setTimeout(() => {
            addLead({
                name: 'Sophia Brown',
                email: 'sophia@infinititech.labs',
                phone: '+1 (555) 123-4567',
                company: 'InfinitiTech Labs',
                role: 'Technology Innovation Manager',
                website: 'www.infinititech.labs',
                address: 'Cambridge, Massachusetts, USA',
                source: 'vision'
            });
            setIsScanning(false);
            if (fileRef.current) fileRef.current.value = '';
        }, 3000);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
            <div className="mb-12">
                <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Yuki-Vision</h2>
                <p className="text-gray-500 font-medium">Scan business cards and IDs for instant lead extraction</p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center p-12 transition-all cursor-pointer group ${isDarkMode ? 'bg-gray-800/20 border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-500/5' : 'bg-gray-50 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'}`}
                >
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all ${isDarkMode ? 'bg-gray-800 text-gray-500 group-hover:bg-emerald-500/20 group-hover:text-emerald-400' : 'bg-white text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-500 shadow-xl shadow-black/5'}`}>
                        {isScanning ? <Loader2 size={32} className="animate-spin" /> : <FileUp size={32} />}
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Cards</p>
                        <p className="text-sm text-gray-500 font-medium">Drag & drop or click to upload</p>
                    </div>
                    <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>

                <div
                    className={`border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center p-12 transition-all cursor-pointer group ${isDarkMode ? 'bg-gray-800/20 border-gray-700 hover:border-indigo-500/50 hover:bg-indigo-500/5' : 'bg-gray-50 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}`}
                >
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all ${isDarkMode ? 'bg-gray-800 text-gray-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-400' : 'bg-white text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 shadow-xl shadow-black/5'}`}>
                        <Camera size={32} />
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Scan with Camera</p>
                        <p className="text-sm text-gray-500 font-medium">Use your webcam for live scanning</p>
                    </div>
                </div>
            </div>

            <div className={`mt-12 p-6 rounded-3xl border flex items-center gap-6 ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>Bulk Processing Available</h4>
                    <p className="text-xs text-indigo-500 font-medium">Upload a folder of business cards and let Yukime process them in parallel.</p>
                </div>
            </div>
        </div>
    );
};

// --- Leads List Module ---
const LeadsList = () => {
    const { isDarkMode, leads } = useAppStore();
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    return (
        <div className="h-full flex flex-col">
            <div className="p-8 pb-4 flex items-center justify-between">
                <div>
                    <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Global Leads Repository</h2>
                    <p className="text-gray-500 text-sm font-medium">{leads.length} total records from all sources</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className={`p-2.5 rounded-xl border ${isDarkMode ? 'border-gray-800 bg-gray-800/30 text-gray-400 hover:text-white' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-900'} transition-all`}>
                        <Filter size={18} />
                    </button>
                    <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/40">
                        <Plus size={18} />
                        New Lead
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-[#121214] border-gray-800 shadow-2xl shadow-black/40' : 'bg-white border-gray-200 shadow-xl shadow-black/5'}`}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Company</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Source</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/20 dark:divide-gray-100/5">
                                {leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-bold italic">No leads found. Start hunting or scanning!</td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            onClick={() => setSelectedLead(lead)}
                                            className={`group cursor-pointer transition-colors ${selectedLead?.id === lead.id ? (isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-50') : (isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50')}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-gray-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                    <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{lead.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-500">{lead.company}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-500">{lead.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${lead.source === 'vision' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold">
                                                    <Activity size={12} />
                                                    Active
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedLead && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className={`w-96 border-l flex flex-col shrink-0 ${isDarkMode ? 'bg-[#0D0D0E] border-gray-800' : 'bg-gray-50 border-gray-200'} shadow-2xl`}
                        >
                            <div className="p-6 border-b flex items-center justify-between">
                                <h4 className={`font-black uppercase tracking-widest text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Details</h4>
                                <button onClick={() => setSelectedLead(null)} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-20 h-20 rounded-3xl mb-4 flex items-center justify-center text-2xl font-black ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {selectedLead.name.charAt(0)}
                                    </div>
                                    <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedLead.name}</h3>
                                    <p className="text-emerald-500 text-xs font-black uppercase tracking-widest mt-1">{selectedLead.role}</p>
                                </div>

                                <div className="space-y-4">
                                    <DetailItem icon={Briefcase} label="Company" value={selectedLead.company} isDarkMode={isDarkMode} />
                                    <DetailItem icon={Mail} label="Email" value={selectedLead.email} isDarkMode={isDarkMode} />
                                    <DetailItem icon={Phone} label="Phone" value={selectedLead.phone} isDarkMode={isDarkMode} />
                                    <DetailItem icon={Link} label="Website" value={selectedLead.website} isDarkMode={isDarkMode} />
                                    <DetailItem icon={MapPin} label="Location" value={selectedLead.address} isDarkMode={isDarkMode} />
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <button className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/40">
                                        Send Email
                                    </button>
                                    <button className={`flex-1 py-3 rounded-2xl font-bold text-xs border ${isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-100'} transition-all`}>
                                        Export vCard
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, isDarkMode }: any) => (
    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800/30 border-gray-800' : 'bg-white border-gray-100'}`}>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
            <Icon size={14} className="text-emerald-500" />
            <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{value || 'Not provided'}</p>
        </div>
    </div>
);

// --- Main Dashboard Component ---
export const TeakelDashboard: React.FC = () => {
    const { isDarkMode, teakelActiveTab, setTeakelActiveTab, setActiveTab, userProfile } = useAppStore();

    const isGlobalAdmin = userProfile?.global_role === 'Global Admin';

    return (
        <div className="fixed inset-0 z-[100] flex bg-[#0A0A0B] text-white overflow-hidden">
            {!isGlobalAdmin && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`relative z-20 max-w-lg w-full p-12 rounded-[40px] border text-center ${isDarkMode ? 'bg-[#121214]/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-md shadow-2xl`}
                    >
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 p-5 overflow-hidden">
                            <img src={isDarkMode ? "/TICKEL Logo 192px invert.png" : "/TICKEL Logo 192px.png"} className="w-full h-full object-contain animate-pulse" alt="Tickel" />
                        </div>
                        <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>
                            Module Under Development
                        </h2>
                        <p className={`text-lg font-medium mb-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                            Tea is currently being brewed. We're refining the AI intelligence for your workspace.
                            <br /><br />
                            Coming soon.
                        </p>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-center gap-2 mb-6 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                <Shield size={14} className="text-gray-600" />
                                <span>Regards Tickel Dev Team at Rickel Industries</span>
                            </div>
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/40 text-sm flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Teakel Sidebar */}
            <aside className={`w-72 shrink-0 flex flex-col border-r ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200 text-gray-900'}`}>
                {/* Brand Header */}
                <div className="p-8 mb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 p-2 overflow-hidden">
                            <img src="/TICKEL Logo 192px invert.png" className="w-full h-full object-contain" alt="Tickel" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">Teakel</h1>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">By Rickel Industries</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <TeakelSidebarItem
                        icon={Search}
                        label="Yuki-Search"
                        active={teakelActiveTab === 'search'}
                        onClick={() => setTeakelActiveTab('search')}
                        badge="AI"
                    />
                    <TeakelSidebarItem
                        icon={Scan}
                        label="Yuki-Vision"
                        active={teakelActiveTab === 'vision'}
                        onClick={() => setTeakelActiveTab('vision')}
                    />
                    <TeakelSidebarItem
                        icon={Table}
                        label="Leads List"
                        active={teakelActiveTab === 'list'}
                        onClick={() => setTeakelActiveTab('list')}
                    />
                    <TeakelSidebarItem
                        icon={BarChart3}
                        label="Reports"
                        active={teakelActiveTab === 'reports'}
                        onClick={() => setTeakelActiveTab('reports')}
                    />

                    <div className={`my-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`} />

                    <TeakelSidebarItem
                        icon={Settings}
                        label="Settings"
                        active={teakelActiveTab === 'settings'}
                        onClick={() => setTeakelActiveTab('settings')}
                    />
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'} mt-12 overflow-hidden relative group`}
                    >
                        <ArrowLeft size={18} />
                        <span className="font-bold text-sm tracking-tight">Back to Main</span>
                    </button>
                </nav>

                <div className="p-6 mt-auto">
                    <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-[#1a1c1d] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Secure</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold leading-tight">All leads represent verified business data and scanned resources.</p>
                    </div>
                </div>
            </aside>

            {/* Teakel Content Area */}
            <main className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#0A0A0B]' : 'bg-gray-50'}`}>
                {/* Sub-header for Mobile/Tablet or Module Context */}
                <header className={`h-16 border-b flex items-center justify-between px-8 ${isDarkMode ? 'bg-[#121214] border-gray-800/60' : 'bg-white border-gray-200/60'}`}>
                    <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Yukime Intelligence Stream</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </header>

                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={teakelActiveTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {teakelActiveTab === 'search' && <YukiSearch />}
                            {teakelActiveTab === 'vision' && <YukiVision />}
                            {teakelActiveTab === 'list' && <LeadsList />}
                            {teakelActiveTab === 'reports' && (
                                <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 bg-gray-800/20 rounded-full flex items-center justify-center mb-6 text-gray-600">
                                        <BarChart3 size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 text-gray-400">Advanced Reports Coming Soon</h3>
                                    <p className="text-gray-600 font-medium max-w-sm">Detailed lead conversion and source analytics are being prepared for your organization.</p>
                                </div>
                            )}
                            {teakelActiveTab === 'settings' && (
                                <div className="p-12 max-w-2xl mx-auto">
                                    <h3 className={`text-2xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Teakel Settings</h3>
                                    <div className="space-y-6">
                                        <SettingsToggle
                                            label="Allow Yukime to use Lead data"
                                            description="Permit AI to incorporate lead intelligence into overall Rickel Industries reports."
                                            checked={true}
                                            isDarkMode={isDarkMode}
                                        />
                                        <SettingsToggle
                                            label="Automated LinkedIn Scraping"
                                            description="Automatically attempt to enrich Vision leads with LinkedIn bio data."
                                            checked={false}
                                            isDarkMode={isDarkMode}
                                        />
                                        <SettingsToggle
                                            label="External vCard Sync"
                                            description="Sync all Vision-scanned leads to your workspace-wide contact list."
                                            checked={true}
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Global Overlay for Loading/Process */}
            <AnimatePresence>
                {/* Potential global Teakel overlays can go here */}
            </AnimatePresence>
        </div>
    );
};

const SettingsToggle = ({ label, description, checked, isDarkMode }: any) => (
    <div className={`p-6 rounded-3xl border flex items-center justify-between ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div>
            <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</h4>
            <p className="text-xs text-gray-500 font-medium mt-1">{description}</p>
        </div>
        <div className={`w-12 h-6 rounded-full p-1 transition-all ${checked ? 'bg-emerald-600' : 'bg-gray-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    </div>
);
