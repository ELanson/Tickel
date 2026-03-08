import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Layers, Printer, Truck, Settings, Plus, Search, Filter,
    ChevronRight, Clock, CheckCircle2, AlertCircle, FileText, MoreVertical,
    X, Calendar as CalendarIcon, Target, ArrowLeft, Shield, LayoutDashboard,
    Inbox, PieChart, FolderOpen, User, Bell, MapPin, Lock, Sparkles
} from 'lucide-react';
import { useWorkflowStore, ArtworkStatus, Project as ProjectType, Artwork as ArtworkType } from '../store/useWorkflowStore';
import { useAppStore } from '../store/useAppStore';
import { AddJobModal } from './AddJobModal';
import { AddProjectModal } from './AddProjectModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WorkflowTeaser = () => {
    return (
        <div className="flex-1 h-full flex items-center justify-center p-8 bg-[#0A0B10] relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full text-center z-10 space-y-8">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#1a1c1d] to-[#121214] border border-gray-800 rounded-3xl flex items-center justify-center shadow-2xl">
                            <Layers className="text-indigo-500" size={40} />
                        </div>
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-[#0A0B10]">
                            <Lock className="text-white" size={14} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 shadow-2xl bg-gradient-to-br from-[#121214]/80 to-[#0A0B10]/80 p-10 rounded-3xl border border-gray-800/50 backdrop-blur-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles size={14} />
                        Active Development
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-400 pb-2">
                        TICKEL Production Suite
                    </h1>

                    <div className="py-4">
                        <p className="text-lg text-gray-300 font-medium leading-relaxed">
                            The future of end-to-end operations is almost here.
                        </p>
                        <p className="text-gray-400 mt-2 leading-relaxed">
                            Seamlessly connect the Design Studio, Production Floor, and Site Application teams. Eliminate operational dead zones, track jobs state-by-state in real-time, and gain absolute visibility into your entire creative pipeline.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800/50 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 mb-3">
                            <div className="w-full h-full bg-[#121214] rounded-full flex items-center justify-center border-2 border-transparent">
                                <span className="text-white font-bold text-xs">TD</span>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                            Currently being forged by <span className="text-indigo-400 font-bold">Tickel Dev</span> at Rickel Industries.
                        </p>
                        <button onClick={() => useAppStore.getState().setActiveTab('dashboard')} className="mt-6 px-6 py-2 rounded-xl bg-[#1a1c1d] border border-gray-800 text-white text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <ArrowLeft size={16} /> Back to Hub
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center p-3'} py-3 rounded-xl transition-all ${active ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'} group`}
    >
        <Icon size={18} className={active ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-400'} />
        {isOpen && <span className="ml-3 text-sm tracking-tight">{label}</span>}
    </button>
);

const ProjectShortcut = ({ project, active, onClick, isOpen }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center p-3'} py-2 rounded-xl transition-all ${active ? 'bg-gray-800/50 text-white' : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'}`}
    >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 from-indigo-500 to-purple-600">
            <span className="text-white text-[10px] font-bold">{project.name.charAt(0)}</span>
        </div>
        {isOpen && <span className="ml-3 text-sm truncate">{project.name}</span>}
    </button>
);

export const WorkflowModule = () => {
    const {
        workflowActiveTab, setWorkflowActiveTab,
        activeProjectId, setActiveProjectId,
        projects, artworks, fetchProjects, fetchArtworksByProject
    } = useWorkflowStore();
    const { setActiveTab, userProfile } = useAppStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Check if user is a Global Admin
    const isGlobalAdmin = userProfile?.global_role === 'Global Admin';

    if (!isGlobalAdmin) {
        return <WorkflowTeaser />;
    }

    const handleProjectClick = (id: string) => {
        setActiveProjectId(id);
        setWorkflowActiveTab('project_detail');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0B] font-sans">
            {/* Dark Sidebar akin to TaskVerse */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r border-gray-800/60 bg-[#0A0B10] flex flex-col transition-all duration-300 shrink-0 text-white`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20 shrink-0">
                        <CheckCircle2 size={18} className="text-white" />
                    </div>
                    {isSidebarOpen && <span className="text-xl font-bold tracking-tight">Production</span>}
                </div>

                <div className="px-4 mb-2">
                    {isSidebarOpen && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-4">Menu</span>}
                </div>

                <nav className="space-y-1 px-4 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={workflowActiveTab === 'dashboard'} onClick={() => setWorkflowActiveTab('dashboard')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={Briefcase} label="Jobs" active={workflowActiveTab === 'jobs'} onClick={() => setWorkflowActiveTab('jobs')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={Inbox} label="Inbox" active={workflowActiveTab === 'inbox'} onClick={() => setWorkflowActiveTab('inbox')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={CalendarIcon} label="Calendar" active={workflowActiveTab === 'calendar'} onClick={() => setWorkflowActiveTab('calendar')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={PieChart} label="Reports" active={workflowActiveTab === 'reports'} onClick={() => setWorkflowActiveTab('reports')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={FolderOpen} label="Portfolio" active={workflowActiveTab === 'portfolio'} onClick={() => setWorkflowActiveTab('portfolio')} isOpen={isSidebarOpen} />
                </nav>

                <div className="p-4 border-t border-gray-800/50 space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center p-3'} py-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-gray-800/50`}
                    >
                        <ArrowLeft size={18} />
                        {isSidebarOpen && <span className="ml-3 text-sm font-medium">Exit to Tickel</span>}
                    </button>
                    <button
                        onClick={() => setWorkflowActiveTab('settings')}
                        className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center p-3'} py-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-gray-800/50`}
                    >
                        <Settings size={18} />
                        {isSidebarOpen && <span className="ml-3 text-sm font-medium">Settings</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0B]">
                {/* Header */}
                <header className="h-16 border-b border-gray-800/60 flex items-center justify-between px-8 shrink-0">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-[#121214] border border-gray-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                            <User size={16} className="text-indigo-400" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={workflowActiveTab + (activeProjectId || '')}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full p-8"
                        >
                            {workflowActiveTab === 'dashboard' && <DashboardOverview artworks={artworks} projects={projects} />}
                            {workflowActiveTab === 'jobs' && <JobsView artworks={artworks} />}
                            {workflowActiveTab === 'inbox' && <InboxView />}
                            {workflowActiveTab === 'calendar' && <CalendarView projects={projects} artworks={artworks} />}
                            {workflowActiveTab === 'reports' && <ReportsView projects={projects} />}
                            {workflowActiveTab === 'portfolio' && <PortfolioView />}
                            {workflowActiveTab === 'project_detail' && <ProjectDetailView projectId={activeProjectId} projects={projects} artworks={artworks} />}
                            {workflowActiveTab === 'settings' && <div className="text-white">Settings View</div>}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// --- View Components ---

const DashboardOverview = ({ artworks, projects }: { artworks: ArtworkType[], projects: ProjectType[] }) => {
    return (
        <div className="space-y-6 w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
                    <p className="text-gray-400 text-sm">Monitor all your jobs and tasks here</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 rounded-lg bg-[#121214] border border-gray-800 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                        Share Status
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                        <Plus size={16} /> New Job
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total Jobs', value: projects.length.toString(), trend: '+12%', color: 'from-blue-500/10 to-[#121214]' },
                    { title: 'In Progress', value: artworks.filter(a => !a.status.includes('Completed')).length.toString(), trend: '-5%', color: 'from-amber-500/10 to-[#121214]' },
                    { title: 'Completed', value: artworks.filter(a => a.status.includes('Completed')).length.toString(), trend: '+20%', color: 'from-emerald-500/10 to-[#121214]' },
                    { title: 'Locations Active', value: '4', trend: 'Stable', color: 'from-purple-500/10 to-[#121214]' },
                ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl border border-gray-800 bg-gradient-to-br ${stat.color} shadow-sm`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium text-gray-400">{stat.title}</span>
                            <MoreVertical size={16} className="text-gray-600" />
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-white">{stat.value}</span>
                            <span className="text-xs font-bold text-emerald-400 mb-1">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-800 bg-[#121214]">
                    <h3 className="text-white font-bold mb-4">Recent Job Flow</h3>
                    <div className="space-y-4">
                        {artworks.slice(0, 3).map((job, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-[#1a1c1d]">
                                <div>
                                    <h4 className="text-sm font-bold text-white">{job.title}</h4>
                                    <p className="text-xs text-gray-500">{job.status} • {job.priority}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${job.status.includes('Queue') ? 'bg-orange-500/10 text-orange-500' :
                                    job.status.includes('Review') ? 'bg-indigo-500/10 text-indigo-400' :
                                        job.status.includes('Draft') ? 'bg-gray-800 text-gray-300' : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>
                                    {job.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-gray-800 bg-[#121214] flex flex-col h-full">
                    <h3 className="text-white font-bold mb-4">Job Locations</h3>
                    <div className="flex-1 rounded-xl bg-[#1a1c1d] border border-gray-800 flex items-center justify-center overflow-hidden min-h-[300px]">
                        {artworks.some(a => a.lat && a.lng) ? (
                            <MapContainer
                                center={[artworks.find(a => a.lat)?.lat || -1.2921, artworks.find(a => a.lng)?.lng || 36.8219]}
                                zoom={11}
                                className="w-full h-full"
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                {artworks.filter(a => a.lat && a.lng).map(job => (
                                    <Marker key={job.id} position={[job.lat!, job.lng!]}>
                                        <Popup className="custom-popup">
                                            <div className="text-gray-900 font-sans">
                                                <h4 className="font-bold text-sm mb-1">{job.title}</h4>
                                                <p className="text-xs text-gray-600 mb-2">{job.location_name}</p>
                                                <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                                                    {job.status}
                                                </span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        ) : (
                            <div className="text-center p-6">
                                <MapPin size={32} className="text-indigo-500 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-400">Map view of active installation sites</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const JobsView = ({ artworks }: { artworks: ArtworkType[] }) => {
    const [activeTab, setActiveTab] = useState<'studio' | 'production' | 'application'>('studio');
    const { transitionArtworkStatus } = useWorkflowStore();
    const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

    return (
        <div className="h-full flex flex-col w-full relative">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Jobs Pipeline</h2>
                    <p className="text-gray-400 text-sm">Manage work across operational departments</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsAddProjectModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-[#121214] border border-gray-800 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Create Project
                    </button>
                    <button
                        onClick={() => setIsAddJobModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={16} /> Add Job
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-8 bg-[#121214] p-1 rounded-xl w-fit border border-gray-800">
                <button
                    onClick={() => setActiveTab('studio')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'studio' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                    Design Studio
                </button>
                <button
                    onClick={() => setActiveTab('production')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'production' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                    Production Floor
                </button>
                <button
                    onClick={() => setActiveTab('application')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'application' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                    Site Application
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'studio' && <StudioJobBoard artworks={artworks} transitionStatus={transitionArtworkStatus} />}
                {activeTab === 'production' && <ProductionJobBoard artworks={artworks} transitionStatus={transitionArtworkStatus} />}
                {activeTab === 'application' && <ApplicationJobBoard artworks={artworks} transitionStatus={transitionArtworkStatus} />}
            </div>

            <AddJobModal isOpen={isAddJobModalOpen} onClose={() => setIsAddJobModalOpen(false)} />
            <AddProjectModal isOpen={isAddProjectModalOpen} onClose={() => setIsAddProjectModalOpen(false)} />
        </div>
    );
};

const KanbanColumn = ({ title, count, items, transitionStatus, nextState, bgColor = "bg-[#121214]" }: { title: string, count: number, items: ArtworkType[], transitionStatus: (artworkId: string, newStatus: string) => Promise<void>, nextState?: string, bgColor?: string }) => (
    <div className={`${bgColor} rounded-2xl p-6 border border-gray-800 min-w-[280px] flex-1 flex flex-col`}>
        <h3 className="text-sm font-bold text-white mb-4 flex justify-between items-center">
            {title}
            <span className="text-gray-500 bg-gray-800 px-2 rounded-full text-xs py-0.5">{count}</span>
        </h3>
        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {items.map((a: ArtworkType) => (
                <JobCard key={a.id} artwork={a} transitionStatus={transitionStatus} nextState={nextState} />
            ))}
        </div>
    </div>
);

const StudioJobBoard = ({ artworks, transitionStatus }: { artworks: ArtworkType[], transitionStatus: (artworkId: string, newStatus: string) => Promise<void> }) => (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
        <KanbanColumn
            title="Concept & Draft" count={artworks.filter(a => a.status === 'Concept & Draft').length}
            items={artworks.filter(a => a.status === 'Concept & Draft')} transitionStatus={transitionStatus} nextState="Internal Review"
        />
        <KanbanColumn
            title="Internal Review" count={artworks.filter(a => a.status === 'Internal Review').length}
            items={artworks.filter(a => a.status === 'Internal Review')} transitionStatus={transitionStatus} nextState="Client Review"
        />
        <KanbanColumn
            title="Client Review" count={artworks.filter(a => a.status === 'Client Review').length}
            items={artworks.filter(a => a.status === 'Client Review')} transitionStatus={transitionStatus} nextState="Client Approved"
        />
        <KanbanColumn
            title="Client Approved" count={artworks.filter(a => a.status === 'Client Approved').length}
            items={artworks.filter(a => a.status === 'Client Approved')} transitionStatus={transitionStatus} nextState="Approved for Print"
        />
        <KanbanColumn
            title="Approved for Print" count={artworks.filter(a => a.status === 'Approved for Print').length}
            items={artworks.filter(a => a.status === 'Approved for Print')} transitionStatus={transitionStatus} nextState="Print Queue"
            bgColor="bg-indigo-900/10 border-indigo-500/20"
        />
    </div>
);

const ProductionJobBoard = ({ artworks, transitionStatus }: { artworks: ArtworkType[], transitionStatus: (artworkId: string, newStatus: string) => Promise<void> }) => (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
        <KanbanColumn
            title="Print Queue" count={artworks.filter(a => a.status === 'Print Queue').length}
            items={artworks.filter(a => a.status === 'Print Queue')} transitionStatus={transitionStatus} nextState="Printing"
        />
        <KanbanColumn
            title="Printing" count={artworks.filter(a => a.status === 'Printing').length}
            items={artworks.filter(a => a.status === 'Printing')} transitionStatus={transitionStatus} nextState="Finishing"
        />
        <KanbanColumn
            title="Finishing" count={artworks.filter(a => a.status === 'Finishing').length}
            items={artworks.filter(a => a.status === 'Finishing')} transitionStatus={transitionStatus} nextState="Quality Check"
        />
        <KanbanColumn
            title="Quality Check" count={artworks.filter(a => a.status === 'Quality Check').length}
            items={artworks.filter(a => a.status === 'Quality Check')} transitionStatus={transitionStatus} nextState="Ready for Dispatch"
        />
        <KanbanColumn
            title="Ready for Dispatch" count={artworks.filter(a => a.status === 'Ready for Dispatch').length}
            items={artworks.filter(a => a.status === 'Ready for Dispatch')} transitionStatus={transitionStatus} nextState="Packed"
            bgColor="bg-orange-900/10 border-orange-500/20"
        />
    </div>
);

const ApplicationJobBoard = ({ artworks, transitionStatus }: { artworks: ArtworkType[], transitionStatus: (artworkId: string, newStatus: string) => Promise<void> }) => (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {/* Combining Logistics and Application states for UI flow */}
        <KanbanColumn
            title="Logistics (Packed/Dispatched)" count={artworks.filter(a => a.status === 'Packed' || a.status === 'Dispatched').length}
            items={artworks.filter(a => a.status === 'Packed' || a.status === 'Dispatched')} transitionStatus={transitionStatus} nextState="Received by Installer"
        />
        <KanbanColumn
            title="Site Scheduling" count={artworks.filter(a => a.status === 'Received by Installer' || a.status === 'Installation Scheduled').length}
            items={artworks.filter(a => a.status === 'Received by Installer' || a.status === 'Installation Scheduled')} transitionStatus={transitionStatus} nextState="Installation In Progress"
        />
        <KanbanColumn
            title="In Progress" count={artworks.filter(a => a.status === 'Installation In Progress').length}
            items={artworks.filter(a => a.status === 'Installation In Progress')} transitionStatus={transitionStatus} nextState="Installation Completed"
        />
        <KanbanColumn
            title="Review & Completion" count={artworks.filter(a => a.status === 'Installation Completed' || a.status === 'Manager Approval').length}
            items={artworks.filter(a => a.status === 'Installation Completed' || a.status === 'Manager Approval')} transitionStatus={transitionStatus} nextState="Project Completed"
            bgColor="bg-emerald-900/10 border-emerald-500/20"
        />
    </div>
);

const JobCard = ({ artwork, transitionStatus, nextState }: { artwork: ArtworkType, transitionStatus: (artworkId: string, newStatus: string) => Promise<void>, nextState?: string }) => (
    <div className="p-4 rounded-xl bg-[#1a1c1d] border border-gray-800 hover:border-indigo-500/50 transition-colors flex flex-col group">
        <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${artwork.priority === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                {artwork.priority}
            </span>
            <MoreVertical size={14} className="text-gray-600 cursor-pointer hover:text-white" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1 line-clamp-1" title={artwork.title}>{artwork.title}</h4>
        <p className="text-[11px] text-gray-500 mb-3">{artwork.dimensions} • {artwork.material}</p>
        <div className="flex justify-between items-center mt-auto">
            <span className="text-[10px] text-gray-500 font-medium">Qty: {artwork.quantity}</span>
            {nextState && (
                <button
                    onClick={() => transitionStatus(artwork.id, nextState)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-all shadow-md"
                    title={`Move to ${nextState}`}
                >
                    Advance
                </button>
            )}
        </div>
    </div>
);

const InboxView = () => (
    <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Inbox & Notifications</h2>
                <p className="text-gray-400 text-sm">Site updates and important broadcasts from Managers</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center gap-2">
                <Plus size={16} /> Broadcast Update
            </button>
        </div>

        <div className="flex-1 bg-[#121214] rounded-2xl border border-gray-800 p-6 overflow-y-auto">
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 rounded-xl bg-[#1a1c1d] border border-gray-800 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                            <span className="text-indigo-400 text-xs font-bold">JD</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-white">John Doe (Manager)</h4>
                                <span className="text-[10px] text-gray-500">10 mins ago</span>
                            </div>
                            <p className="text-xs text-indigo-400 font-bold mb-1">Mombasa Trade Fair 2026</p>
                            <p className="text-sm text-gray-300">Site application team alpha has arrived on site. Ensure all vinyl is unpacked carefully due to the humidity.</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const CalendarView = ({ projects, artworks }: { projects: ProjectType[], artworks: ArtworkType[] }) => {
    // Simplified Calendar layout matching the reference
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const times = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM'];

    return (
        <div className="h-full flex flex-col w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Schedule</h2>
                    <p className="text-gray-400 text-sm">Easily schedule and manage jobs by day, week, or month</p>
                </div>
                <div className="flex bg-[#121214] border border-gray-800 rounded-lg p-1">
                    {['Day', 'Week', 'Month'].map(t => (
                        <button key={t} className={`px-4 py-1.5 text-sm font-medium rounded-md ${t === 'Week' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-[#121214] rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
                <div className="grid grid-cols-8 border-b border-gray-800">
                    <div className="p-4 border-r border-gray-800 text-xs font-medium text-gray-500 text-center">Time</div>
                    {days.map(d => (
                        <div key={d} className="p-4 border-r border-gray-800 text-center">
                            <p className="text-sm font-bold text-white mb-1">{d}</p>
                            <p className="text-[10px] text-gray-500">Apr {Math.floor(Math.random() * 30) + 1}</p>
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto relative">
                    {times.map((time, i) => (
                        <div key={time} className="grid grid-cols-8 border-b border-gray-800/50 min-h-[120px]">
                            <div className="p-4 border-r border-gray-800 text-xs font-medium text-gray-500 text-center relative">
                                <span className="-mt-3 absolute inset-x-0 top-0">{time}</span>
                            </div>
                            {days.map(d => (
                                <div key={d} className="border-r border-gray-800 relative p-1">
                                    {/* Mocking a scheduled block, layout matches reference image 2 */}
                                    {Math.random() > 0.8 && (
                                        <div className="absolute inset-x-2 top-2 bottom-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 p-2 flex flex-col cursor-pointer hover:bg-indigo-500/20 transition-colors">
                                            <p className="text-xs font-bold text-indigo-400 truncate">County Entrance Arch</p>
                                            <p className="text-[10px] text-gray-400 mb-2">9:00 - 11:30 AM</p>
                                            <div className="mt-auto flex -space-x-1">
                                                <div className="w-5 h-5 rounded-full border border-indigo-900 bg-emerald-500"></div>
                                                <div className="w-5 h-5 rounded-full border border-indigo-900 bg-orange-500 flex items-center justify-center text-[8px]">+</div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1 font-medium text-center bg-gray-900/50 rounded py-0.5">High Priority</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReportsView = ({ projects }: { projects: ProjectType[] }) => (
    <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-8">Reports & Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-gray-800 bg-[#121214]">
                <h3 className="text-sm font-bold text-white mb-4">AI Workflow Recommendations</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                    Based on recent job data, turnaround time for PVC Board printing is 15% slower than optimal.
                    <strong className="text-amber-400 block mt-2">Recommendation: Schedule maintenance for Roland XR-640 or reallocate bulk PVC jobs.</strong>
                </p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-800 bg-[#121214]">
                <h3 className="text-sm font-bold text-white mb-4">Reprint Rate</h3>
                <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500">Chart rendering here...</p>
                </div>
            </div>
        </div>
    </div>
);

const PortfolioView = () => (
    <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-8">Portfolio</h2>
        <p className="text-gray-400">Past recorded jobs will be archived here.</p>
    </div>
);

const ProjectDetailView = ({ projectId, projects, artworks }: { projectId: string | null, projects: ProjectType[], artworks: ArtworkType[] }) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return <div>Project not found</div>;

    const projArtworks = artworks.filter(a => a.project_id === projectId);

    return (
        <div className="w-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Briefcase className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white leading-tight">{project.name}</h2>
                    <p className="text-sm text-gray-400">Client: {project.client_name} • Deadline: {project.deadline}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl border border-gray-800 bg-[#121214]">
                        <h3 className="text-sm font-bold text-white mb-4 flex justify-between">
                            Project Artworks
                            <button className="text-indigo-400 text-xs hover:underline">Add New</button>
                        </h3>
                        <div className="space-y-3">
                            {projArtworks.map(a => (
                                <div key={a.id} className="p-4 rounded-xl border border-gray-800 bg-[#1a1c1d] flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-white">{a.title}</p>
                                        <p className="text-[10px] text-gray-500">{a.dimensions} • {a.material}</p>
                                    </div>
                                    <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded font-bold">{a.status}</span>
                                </div>
                            ))}
                            {projArtworks.length === 0 && <p className="text-gray-500 text-sm">No artworks added yet.</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-gray-800 bg-[#121214]">
                        <h3 className="text-sm font-bold text-white mb-4">At a Glance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-[#1a1c1d] p-3 rounded-lg border border-gray-800">
                                <span className="text-xs text-gray-400">Status</span>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{project.status}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#1a1c1d] p-3 rounded-lg border border-gray-800 cursor-pointer hover:border-indigo-500/50">
                                <span className="text-xs text-gray-400 flex items-center gap-2"><PieChart size={14} /> Full Reports</span>
                                <ChevronRight size={14} className="text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
