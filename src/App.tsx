import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Plus,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  ChevronRight,
  Briefcase,
  Calendar,
  BarChart3,
  Edit2,
  Trash2,
  Settings,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Tag,
  User,
  Paperclip,
  AlertTriangle,
  CheckSquare,
  Layers,
  PlusCircle,
  Sparkles,
  Maximize2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  History,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useAppStore, Task, Project, Message } from './store/useAppStore';
import { supabase } from './lib/supabase';
import { chatWithLocalModel, parseTaskFromPrompt } from './lib/localAi';
import Auth from './components/Auth';

export default function App() {
  const {
    tasks, setEditingTask,
    projects,
    totalHours,
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    isRefreshing, setIsRefreshing,
    activeTab, setActiveTab,
    isModalOpen, setIsModalOpen,
    isProjectModalOpen, setIsProjectModalOpen,
    isTimeLogModalOpen, setIsTimeLogModalOpen,
    editingTask,
    editingProject, setEditingProject,
    selectedTaskIdForTimeLog, setSelectedTaskIdForTimeLog,
    isSettingsModalOpen, setIsSettingsModalOpen,
    isThroneModalOpen, setIsThroneModalOpen,
    isDarkMode, toggleDarkMode,
    userProfile, setUserProfile,
    user, isAdmin,
    geminiApiKey, setGeminiApiKey,
    useLocalModel, setUseLocalModel,
    localModelUrl, setLocalModelUrl,
    formData, setFormData,
    projectFormData, setProjectFormData,
    timeLogFormData, setTimeLogFormData,
    isNavOpen, setIsNavOpen,
    isSidebarOpen, setIsSidebarOpen,
    inviteUser, resetUserPassword, toggleUserAdmin,
    initializeAuth, signOut,
    fetchData
  } = useAppStore();

  const [inviteEmail, setInviteEmail] = useState('');
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [isAdminPanelLoading, setIsAdminPanelLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiTaskPrompt, setAiTaskPrompt] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = initializeAuth();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [initializeAuth]);

  useEffect(() => {
    // Fetch profiles whenever the task modal or throne modal opens (or on initial admin check)
    if (isModalOpen || (isThroneModalOpen && isAdmin)) {
      fetchProfiles();
    }
  }, [isModalOpen, isThroneModalOpen, isAdmin]);

  const fetchProfiles = async () => {
    setIsAdminPanelLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('full_name');
    if (!error) setAllProfiles(data || []);
    setIsAdminPanelLoading(false);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const { error } = await inviteUser(inviteEmail);
    if (!error) {
      alert('Invitation (Magic Link) sent!');
      setInviteEmail('');
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  const handleMagicFill = async () => {
    if (!aiTaskPrompt.trim()) return;
    setIsLoading(true);
    try {
      const parsed = await parseTaskFromPrompt(aiTaskPrompt, localModelUrl);
      if (parsed) {
        setFormData(prev => ({
          ...prev,
          ...parsed,
          subtasks: parsed.subtasks || prev.subtasks,
          tags: parsed.tags || prev.tags
        }));
        setAiTaskPrompt('');
      }
    } catch (e) {
      console.error('Magic Fill failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata;
      if (metadata?.full_name && userProfile.name === 'Guest User') {
        setUserProfile({ name: metadata.full_name });
      }
    }
  }, [user, setUserProfile, userProfile.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpenModal = (task?: Task) => {
    if (projects.length === 0) {
      alert("You must create a project first before adding a task. Ask the Work Agent to create a project for you.");
      return;
    }

    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        project_id: task.project_id,
        priority: task.priority,
        estimated_hours: task.estimated_hours,
        status: task.status,
        due_date: task.due_date || '',
        start_date: task.start_date || '',
        assignee_id: task.assignee_id || '',
        subtasks: task.subtasks || [],
        tags: task.tags || [],
        is_private: task.is_private || false,
        budget: task.budget || 0
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        project_id: projects[0]?.id || 0,
        priority: 'medium',
        estimated_hours: 0,
        status: 'todo',
        due_date: '',
        start_date: '',
        assignee_id: user?.id || '',
        subtasks: [],
        tags: [],
        is_private: false,
        budget: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenProjectModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setProjectFormData({
        name: project.name,
        description: project.description,
        status: project.status
      });
    } else {
      setEditingProject(null);
      setProjectFormData({ name: '', description: '', status: 'active' });
    }
    setIsProjectModalOpen(true);
  };

  const handleOpenTimeLogModal = (taskId: number) => {
    setSelectedTaskIdForTimeLog(taskId);
    setTimeLogFormData({ hours: 0, date: new Date().toISOString().split('T')[0] });
    setIsTimeLogModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (formData.project_id === 0) {
      alert("A valid project must be selected.");
      return;
    }

    try {
      let res;
      if (editingTask) {
        res = await supabase.from('tasks').update(formData).eq('id', editingTask.id);
      } else {
        res = await supabase.from('tasks').insert([formData]);
      }

      if (!res.error) {
        if (!addAnother) {
          setIsModalOpen(false);
        } else {
          // Reset for next task
          setFormData(prev => ({ ...prev, title: '', description: '', subtasks: [] }));
        }
        fetchData();
      } else {
        alert(`Error: ${res.error.message}`);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (!res.error) fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.name.trim()) {
      alert("Project name is required.");
      return;
    }

    try {
      let res;
      if (editingProject) {
        res = await supabase.from('projects').update(projectFormData).eq('id', editingProject.id);
      } else {
        res = await supabase.from('projects').insert([projectFormData]);
      }

      if (!res.error) {
        setIsProjectModalOpen(false);
        fetchData();
      } else {
        alert(`Error: ${res.error.message}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) return;
    try {
      const res = await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      await supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('project_id', id).is('deleted_at', null);
      if (!res.error) fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleSaveTimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskIdForTimeLog || timeLogFormData.hours <= 0) {
      alert("Valid hours are required.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await supabase.from('time_logs').insert([{
        task_id: selectedTaskIdForTimeLog,
        hours: timeLogFormData.hours,
        date: timeLogFormData.date
      }]);

      if (!res.error) {
        setIsTimeLogModalOpen(false);
        setIsRefreshing(true);
        await fetchData();
        setTimeout(() => setIsRefreshing(false), 1000);
      } else {
        alert(`Error: ${res.error.message}`);
      }
    } catch (error) {
      console.error('Error logging time:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (useLocalModel) {
        // Send the entire message history to the local model to retain context
        const responseText = await chatWithLocalModel(
          [...messages, { role: 'user', content: userMessage }],
          localModelUrl
        );
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      } else {
        // Cloud route (Gemini via Serverless endpoint)
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      }

      // Show visual refresh cue
      setIsRefreshing(true);
      await fetchData();
      setTimeout(() => setIsRefreshing(false), 1000);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
      case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
      default: return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
    }
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-[#0A0A0B] text-gray-100' : 'bg-[#F8F9FA] text-[#1A1A1A]'} font-sans overflow-hidden transition-colors duration-300`}>
      <div className="flex w-full h-full bg-inherit">
        {/* Sidebar */}
        <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'} border-r flex flex-col transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:inset-0
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between`}>
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xl">
              <img src={isDarkMode ? "/Taskion Logo 192px invert.png" : "/Taskion Logo 192px.png"} className="w-8 h-8 object-contain" alt="Taskion" />
              <span className={isDarkMode ? 'text-white' : 'text-indigo-600'}>Taskion</span>
            </div>
            <button onClick={() => setIsNavOpen(false)} className={`lg:hidden p-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Plus size={20} className="rotate-45" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsNavOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50')}`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => { setActiveTab('tasks'); setIsNavOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tasks' ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50')}`}
            >
              <CheckCircle2 size={20} />
              <span className="font-medium">My Tasks</span>
            </button>
            <button
              onClick={() => { setActiveTab('reports'); setIsNavOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50')}`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Intelligence</span>
            </button>
          </nav>

          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <button
              onClick={() => { setIsSettingsModalOpen(true); setIsNavOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50'} mb-4`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => { setIsThroneModalOpen(true); setIsNavOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isDarkMode ? 'text-indigo-400 hover:bg-gray-800' : 'text-indigo-600 hover:bg-indigo-50'} mb-4`}
              >
                <Shield size={20} />
                <span className="font-medium">Throne</span>
              </button>
            )}

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20">
              <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Pro Plan</p>
              <p className="text-sm font-bold mb-3">AI Insights Active</p>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4"></div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'} mt-4 font-bold text-sm`}
            >
              <ArrowRight className="rotate-180" size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className={`h-16 ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-4 sm:px-8 transition-colors duration-300`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNavOpen(true)}
                className={`lg:hidden p-2 ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-all`}
              >
                <LayoutDashboard size={20} />
              </button>
              <h2 className={`text-lg font-semibold capitalize hidden sm:block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeTab}</h2>
              {activeTab === 'tasks' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenProjectModal()}
                    className={`flex items-center gap-2 ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} border px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm`}
                  >
                    <Briefcase size={16} />
                    Projects
                  </button>
                  <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-900/20"
                  >
                    <Plus size={16} />
                    New Task
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {isRefreshing && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-30"
                  >
                    <Loader2 size={12} className="animate-spin" />
                    Agent updated tasks
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User Profile Section */}
              <div className={`flex items-center gap-3 pr-4 border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-2">
                    {isAdmin && (
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                        Admin
                      </span>
                    )}
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.name}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Productivity Pro</p>
                </div>
                <div className={`w-10 h-10 rounded-xl border-2 ${isDarkMode ? 'border-indigo-500/30' : 'border-white'} bg-gray-200 overflow-hidden shadow-sm`}>
                  <img src={userProfile.avatar_url || `https://picsum.photos/seed/${userProfile.name}/40/40`} alt="user" referrerPolicy="no-referrer" />
                </div>
              </div>

              <button
                onClick={() => toggleDarkMode()}
                className={`p-2 ${isDarkMode ? 'text-amber-400 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'} rounded-lg transition-all`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <TrendingUp size={20} /> : <LayoutDashboard size={20} />}
                {/* Using TrendingUp as a temporary sun icon for now, will replace with proper Lucide icons if available or stay with layout icons */}
              </button>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`lg:hidden p-2 ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-all`}
              >
                <MessageSquare size={20} />
              </button>
              <div className="flex -space-x-2 hidden md:flex">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-[#121214]' : 'border-white'} bg-gray-200 overflow-hidden`}>
                    <img src={`https://picsum.photos/seed/${i + 10}/32/32`} alt="user" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => alert('No new notifications')}
                className={`p-2 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                <AlertCircle size={20} />
              </button>
            </div>
          </header>

          <div className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-[#0A0A0B]' : 'bg-[#F8F9FA]'}`}>
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-lg`}>
                        <Clock size={20} />
                      </div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Hours</h3>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : ''}`}>{totalHours}h</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm`}>
                    {(() => {
                      const now = new Date();
                      const startOfWeek = new Date(now);
                      startOfWeek.setHours(0, 0, 0, 0);
                      startOfWeek.setDate(now.getDate() - now.getDay());
                      const endOfWeek = new Date(startOfWeek);
                      endOfWeek.setDate(startOfWeek.getDate() + 7);
                      const dueThisWeek = (Array.isArray(tasks) ? tasks : []).filter(t => {
                        if (!t.due_date) return false;
                        const due = new Date(t.due_date);
                        return due >= startOfWeek && due < endOfWeek && t.status !== 'done';
                      }).length;
                      const isOverdue = dueThisWeek > 5;
                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'} rounded-lg`}>
                              <CalendarDays size={20} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOverdue ? 'text-red-500 bg-red-500/10' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'}`}>
                              {isOverdue ? 'Busy' : 'On Track'}
                            </span>
                          </div>
                          <h3 className="text-gray-500 text-sm font-medium">Due This Week</h3>
                          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : ''}`}>{dueThisWeek} Tasks</p>
                        </>
                      );
                    })()}
                  </div>
                  <div className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'} rounded-lg`}>
                        <CheckCircle2 size={20} />
                      </div>
                      <span className="text-xs font-medium text-gray-400">Target: 10</span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Tasks Completed</h3>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : ''}`}>{(Array.isArray(tasks) ? tasks : []).filter(t => t.status === 'done').length}</p>
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'} rounded-2xl border shadow-sm overflow-hidden`}>
                  <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-50'} flex items-center justify-between`}>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Tasks</h3>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="text-indigo-500 text-sm font-medium hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-50'}`}>
                    {(Array.isArray(tasks) ? tasks : []).slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenModal(task)}
                        className={`${isDarkMode ? 'hover:bg-gray-800/10' : 'hover:bg-gray-50'} p-4 transition-colors flex items-center justify-between group cursor-pointer`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{task.title}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Briefcase size={12} /> {task.project_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No tasks found. Use the AI agent to create one!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="relative">
                <AnimatePresence>
                  {isRefreshing && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-30"
                    >
                      <Loader2 size={12} className="animate-spin" />
                      Agent updated tasks
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 mt-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                  {(Array.isArray(tasks) ? tasks : []).map(task => (
                    <motion.div
                      layout
                      key={task.id}
                      className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group relative`}
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(task);
                          }}
                          className={`p-1.5 ${isDarkMode ? 'text-gray-500 hover:text-indigo-400 hover:bg-gray-800' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'} rounded-lg transition-all cursor-pointer`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className={`p-1.5 ${isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-gray-800' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} rounded-lg transition-all cursor-pointer`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 pr-12`}>{task.title}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2 mb-4`}>{task.description}</p>
                      <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{task.estimated_hours}h est.</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTimeLogModal(task.id);
                            }}
                            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-medium cursor-pointer"
                          >
                            <Plus size={12} /> Log Time
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === 'done' ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') :
                            task.status === 'in_progress' ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') :
                              (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600')
                            }`}>
                            {task.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <div className={`w-16 h-16 ${isDarkMode ? 'bg-gray-800 text-gray-700' : 'bg-gray-50 text-gray-300'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>No tasks yet</h3>
                      <p className="text-gray-500 mb-6">Start by creating your first task manually or via AI.</p>
                      <button
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
                      >
                        Create Task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'} p-8 rounded-3xl border shadow-xl relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp size={120} />
                  </div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Performance Intelligence</h3>
                  <p className="text-gray-500 mb-8">AI-generated insights based on your recent activity.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Total Productivity</h4>
                        <p className="text-4xl font-bold text-indigo-500 mb-6">{totalHours} Hours</p>

                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Skill Growth</h4>
                        <div className="space-y-4">
                          {[
                            { name: 'System Architecture', value: 85, color: 'bg-indigo-500' },
                            { name: 'Frontend Engineering', value: 70, color: 'bg-purple-500' },
                            { name: 'AI Integration', value: 92, color: 'bg-blue-500' }
                          ].map(skill => (
                            <div key={skill.name}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : ''}`}>{skill.name}</span>
                                <span className="text-gray-500">{skill.value}%</span>
                              </div>
                              <div className={`h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                                <div className={`h-full ${skill.color}`} style={{ width: `${skill.value}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} rounded-2xl p-6 border`}>
                      <h4 className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-900'} font-bold mb-4 flex items-center gap-2`}>
                        <AlertCircle size={18} />
                        AI Recommendation
                      </h4>
                      <p className={`${isDarkMode ? 'text-indigo-300/80' : 'text-indigo-700'} text-sm leading-relaxed`}>
                        You've spent 65% of your time on "Project Atlas" this week. Your deep work ratio is exceptionally high (4.2h avg). Consider scheduling a review for the "Internal Tools" backlog to prevent bottlenecks.
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setInput('Generate a full performance report for me.');
                          setIsSidebarOpen(true);
                        }}
                        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Generate Full Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* AI Agent Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className={`fixed inset-y-0 right-0 lg:relative w-80 sm:w-96 ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'} border-l flex flex-col shadow-2xl z-40 transition-colors duration-300`}
            >
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800 bg-[#1A1A1C]/50' : 'border-gray-100 bg-gray-50/50'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Work Agent</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20'
                      : `${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-gray-300' : 'bg-white border-gray-100 text-gray-700'} border rounded-tl-none shadow-sm`
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`${isDarkMode ? 'bg-[#1A1A1C] border-gray-800' : 'bg-white border-gray-100'} border p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2`}>
                      <Loader2 size={16} className="animate-spin text-indigo-600" />
                      <span className="text-xs text-gray-400 font-medium">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className={`p-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me to create a task..."
                    className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'} border rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-2 bottom-2 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <p className="text-[10px] text-gray-500 text-center mt-4 font-medium uppercase tracking-widest">
                  Powered by Yukime
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        {/* Task Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white'} w-full max-w-2xl rounded-[32px] shadow-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]`}
              >
                {/* AI Assist Header */}
                <div className={`p-4 ${isDarkMode ? 'bg-[#1A1A1C] border-b border-gray-800' : 'bg-indigo-50 border-b border-indigo-100'} sticky top-0 z-20`}>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                    <input
                      type="text"
                      value={aiTaskPrompt}
                      onChange={(e) => setAiTaskPrompt(e.target.value)}
                      placeholder="AI Quick Fill: 'Design landing page by Friday, priority high...'"
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm border-2 transition-all ${isDarkMode ? 'bg-[#0A0A0B] border-gray-800 focus:border-indigo-500 text-white' : 'bg-white border-transparent focus:border-indigo-500 text-gray-900 shadow-sm'}`}
                    />
                    <button
                      type="button"
                      onClick={handleMagicFill}
                      disabled={isLoading || !aiTaskPrompt.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={14} /> : 'Magic Fill'}
                    </button>
                  </div>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className={`text-2xl font-black italic tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                      <PlusCircle className="text-indigo-500" />
                      {editingTask ? 'Manifest Task' : 'New Objective'}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Priority / Status Badges here if needed */}
                    </div>
                  </div>

                  <form onSubmit={handleSaveTask} className="space-y-8">
                    {/* 🟢 1. Core Fields */}
                    <section className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Title</label>
                        <input
                          required
                          type="text"
                          value={formData.title}
                          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-100 text-gray-900'} border-2 rounded-2xl px-5 py-3.5 text-base font-medium focus:border-indigo-500 outline-none transition-all`}
                          placeholder="Enter task title..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Workspace / Project</label>
                          <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <select
                              value={formData.project_id}
                              onChange={e => setFormData(prev => ({ ...prev, project_id: parseInt(e.target.value) }))}
                              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 appearance-none transition-all ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-500'}`}
                            >
                              {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Assignee</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <select
                              value={formData.assignee_id}
                              onChange={e => setFormData(prev => ({ ...prev, assignee_id: e.target.value }))}
                              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 appearance-none transition-all ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-500'}`}
                            >
                              <option value="">Select Citizen...</option>
                              {allProfiles.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Priority</label>
                          <div className="flex gap-2">
                            {['low', 'medium', 'high', 'urgent'].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, priority: p as any }))}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.priority === p
                                  ? (p === 'urgent' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20')
                                  : (isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-gray-500 hover:border-indigo-500' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300')
                                  }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Status</label>
                          <div className="relative group">
                            <select
                              value={formData.status}
                              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                              className={`w-full pl-5 pr-4 py-3 rounded-2xl border-2 appearance-none transition-all ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-500'}`}
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                              <option value="blocked">Blocked</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Intel / Description</label>
                        <textarea
                          value={formData.description}
                          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-100'} border-2 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none transition-all min-h-[120px] resize-none font-sans leading-relaxed`}
                          placeholder="What needs to be done? Use Markdown if needed..."
                        />
                      </div>
                    </section>

                    {/* ⏱️ 2. Time & Scheduling */}
                    <section className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3 mb-6">
                        <Clock className="text-indigo-500" size={18} />
                        <h4 className={`text-sm font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Timeline & Logistics</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                            className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-white' : 'bg-gray-50 border-gray-100'} border-2 rounded-xl px-4 py-3 text-xs focus:border-indigo-500 transition-all`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Due Date</label>
                          <input
                            type="date"
                            value={formData.due_date}
                            onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                            className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-white' : 'bg-gray-50 border-gray-100'} border-2 rounded-xl px-4 py-3 text-xs focus:border-indigo-500 transition-all`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Estimate (Hrs)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={formData.estimated_hours || ''}
                            onChange={e => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                            placeholder="Hours..."
                            className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 text-white' : 'bg-gray-50 border-gray-100'} border-2 rounded-xl px-4 py-3 text-xs focus:border-indigo-500 transition-all`}
                          />
                        </div>
                      </div>
                    </section>

                    {/* 🧱 3. Task Structure (Subtasks) */}
                    <section className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <CheckSquare className="text-indigo-500" size={18} />
                          <h4 className={`text-sm font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sub-Objectives</h4>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md">
                          {formData.subtasks.length} Items
                        </span>
                      </div>

                      <div className="space-y-3">
                        {formData.subtasks.map((st, idx) => (
                          <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${isDarkMode ? 'bg-[#0A0A0B] border-gray-800' : 'bg-white border-gray-100'}`}>
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => {
                                const updated = [...formData.subtasks];
                                updated[idx].completed = !updated[idx].completed;
                                setFormData(prev => ({ ...prev, subtasks: updated }));
                              }}
                              className="w-4 h-4 rounded-md border-2 border-indigo-500 text-indigo-600 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              value={st.title}
                              onChange={(e) => {
                                const updated = [...formData.subtasks];
                                updated[idx].title = e.target.value;
                                setFormData(prev => ({ ...prev, subtasks: updated }));
                              }}
                              className={`flex-1 bg-transparent border-none outline-none text-sm ${st.completed ? 'line-through opacity-50' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, subtasks: prev.subtasks.filter((_, i) => i !== idx) }))}
                              className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg"
                            >
                              <Plus className="rotate-45" size={14} />
                            </button>
                          </div>
                        ))}
                        <div className="relative">
                          <PlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                          <input
                            type="text"
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newSubtask.trim()) {
                                e.preventDefault();
                                setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, { title: newSubtask.trim(), completed: false }] }));
                                setNewSubtask('');
                              }
                            }}
                            placeholder="Add sub-objective and press Enter..."
                            className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-dashed transition-all ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 focus:border-indigo-500 hover:border-gray-700 text-white' : 'bg-gray-50 border-gray-200 focus:border-indigo-500 hover:border-gray-300 text-gray-900'}`}
                          />
                        </div>
                      </div>
                    </section>

                    {/* ⚙️ 8. Advanced Options (Collapsible) */}
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800 hover:bg-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Settings size={16} />
                          <span className="text-xs font-black uppercase tracking-widest">Advanced Recon & Budget</span>
                        </div>
                        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 space-y-6 border-x-2 border-b-2 border-gray-100 dark:border-gray-800 rounded-b-2xl">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Dependencies (IDs)</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 102, 105"
                                    value={formData.dependencies?.join(', ') || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, dependencies: e.target.value.split(',').map(t => parseInt(t.trim())).filter(n => !isNaN(n)) }))}
                                    className={`w-full ${isDarkMode ? 'bg-[#0A0A0B] border-gray-800 text-white' : 'bg-white border-gray-100'} border-2 rounded-xl px-4 py-3 text-sm`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Budget ($)</label>
                                  <input
                                    type="number"
                                    value={formData.budget || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                                    className={`w-full ${isDarkMode ? 'bg-[#0A0A0B] border-gray-800 text-white' : 'bg-white border-gray-100'} border-2 rounded-xl px-4 py-3 text-sm`}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-4 pt-6">
                                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_private: !prev.is_private }))}>
                                  <div className={`w-10 h-6 rounded-full transition-all relative ${formData.is_private ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_private ? 'left-5' : 'left-1'}`} />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Private Objective</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Direct Tags (Comma separated)</label>
                                <input
                                  type="text"
                                  placeholder="design, high-priority, q3"
                                  value={formData.tags.join(', ')}
                                  onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                                  className={`w-full ${isDarkMode ? 'bg-[#0A0A0B] border-gray-800 text-white' : 'bg-white border-gray-100'} border-2 rounded-xl px-4 py-3 text-sm`}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 🎯 9. Action Buttons */}
                    <div className="flex gap-4 pt-8 pb-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className={`px-6 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all`}
                      >
                        Abort
                      </button>

                      {!editingTask && (
                        <button
                          type="button"
                          onClick={(e) => handleSaveTask(e, true)}
                          className={`px-6 ${isDarkMode ? 'bg-gray-800 border-2 border-indigo-500/30 hover:border-indigo-500 text-indigo-400' : 'bg-indigo-50 border-2 border-indigo-200 text-indigo-600'} py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2`}
                        >
                          <PlusCircle size={16} />
                          Add Another
                        </button>
                      )}

                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3"
                      >
                        {editingTask ? <History size={20} /> : <PlusCircle size={20} />}
                        {editingTask ? 'Commit Updates' : 'Manifest Task'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Project Modal */}
        <AnimatePresence>
          {isProjectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsProjectModalOpen(false)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white'} w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden`}
              >
                <div className="p-8">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                    {editingProject ? 'Edit Project' : 'Create New Project'}
                  </h3>

                  {editingProject && (
                    <div className="mb-6 flex justify-end">
                      <button
                        onClick={() => handleDeleteProject(editingProject.id)}
                        className="text-red-600 text-sm font-bold flex items-center gap-1 hover:text-red-700"
                      >
                        <Trash2 size={14} /> Delete Entire Project
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSaveProject} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Project Name</label>
                      <input
                        required
                        type="text"
                        value={projectFormData.name}
                        onChange={e => setProjectFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'} rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                        placeholder="e.g. Marketing Q3"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                      <textarea
                        value={projectFormData.description}
                        onChange={e => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                        className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'} rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-24 resize-none`}
                        placeholder="Project details..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsProjectModalOpen(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        {editingProject ? 'Save Changes' : 'Create Project'}
                      </button>
                    </div>
                  </form>

                  {!editingProject && projects.length > 0 && (
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <h4 className="text-sm font-bold text-gray-900 mb-4">Existing Projects</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {projects.map(p => (
                          <div key={p.id} className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-[#1A1A1C] border-gray-800' : 'bg-gray-50 border-gray-100'} rounded-xl border`}>
                            <div>
                              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.description}</p>
                            </div>
                            <button
                              onClick={() => handleOpenProjectModal(p)}
                              className="text-indigo-600 text-xs font-bold hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Time Log Modal */}
        <AnimatePresence>
          {isTimeLogModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsTimeLogModalOpen(false)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white'} w-full max-w-sm rounded-3xl shadow-2xl relative z-10 overflow-hidden`}
              >
                <div className="p-8">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-2`}>
                    <Clock size={20} className="text-indigo-500" /> Log Time
                  </h3>
                  <form onSubmit={handleSaveTimeLog} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Hours Spent</label>
                      <input
                        required
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={timeLogFormData.hours || ''}
                        onChange={e => setTimeLogFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                        className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'} rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
                      <input
                        required
                        type="date"
                        value={timeLogFormData.date}
                        onChange={e => setTimeLogFormData(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'} rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsTimeLogModalOpen(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save Time'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSettingsModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'} w-full max-w-sm rounded-3xl border shadow-2xl relative z-10 overflow-hidden`}
              >
                <div className="p-8">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-2`}>
                    <Settings size={20} className="text-indigo-500" /> Settings
                  </h3>
                  <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-widest`}>Profile</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Display Name</label>
                          <input
                            type="text"
                            value={userProfile.name}
                            onChange={e => setUserProfile({ name: e.target.value })}
                            className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'} border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Avatar URL</label>
                          <input
                            type="url"
                            value={userProfile.avatar_url || ''}
                            onChange={e => setUserProfile({ avatar_url: e.target.value })}
                            placeholder="https://example.com/photo.jpg"
                            className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'} border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dark Mode</p>
                        <p className="text-xs text-gray-500">Toggle dark theme</p>
                      </div>
                      <button
                        onClick={() => toggleDarkMode()}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={e => setUserProfile({ name: e.target.value })}
                          className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'} border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Avatar URL</label>
                        <input
                          type="url"
                          value={userProfile.avatar_url || ''}
                          onChange={e => setUserProfile({ avatar_url: e.target.value })}
                          placeholder="https://example.com/avatar.png"
                          className={`w-full ${isDarkMode ? 'bg-[#1A1A1C] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'} border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 my-4"></div>

                    <div className="pt-4">
                      <button
                        onClick={() => setIsSettingsModalOpen(false)}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Throne Admin Modal */}
        <AnimatePresence>
          {isThroneModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsThroneModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`${isDarkMode ? 'bg-[#0F0F11] border-indigo-500/20' : 'bg-white border-gray-100'} w-full max-w-2xl rounded-3xl border shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] relative z-10 overflow-hidden max-h-[90vh] flex flex-col`}
              >
                <div className="p-8 overflow-y-auto">
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8 flex items-center gap-3 italic tracking-tight`}>
                    <Shield size={28} className="text-indigo-500 fill-indigo-500/10" /> THRONE
                  </h3>

                  <div className="space-y-10">
                    {/* Model & AI Config */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                        <h4 className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-[0.2em]`}>Intelligence Core</h4>
                      </div>

                      <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/50 border-indigo-100'} border space-y-6`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Use Local Model</p>
                            <p className="text-xs text-gray-500 italic">Bypass Gemini Cloud for privacy</p>
                          </div>
                          <button
                            onClick={() => setUseLocalModel(!useLocalModel)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${useLocalModel ? 'bg-indigo-600 shadow-[0_0_15px_-3px_rgba(79,70,229,0.6)]' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useLocalModel ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {useLocalModel ? (
                          <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-indigo-500/70 uppercase tracking-widest ml-1">Local Server Endpoint</label>
                            <input
                              type="url"
                              value={localModelUrl}
                              onChange={e => setLocalModelUrl(e.target.value)}
                              placeholder="http://localhost:1234/v1"
                              className={`w-full ${isDarkMode ? 'bg-[#161618] border-gray-800 text-white' : 'bg-white border-gray-200'} border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono`}
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-indigo-500/70 uppercase tracking-widest ml-1">Gemini API Key</label>
                            <div className="relative">
                              <input
                                type="password"
                                value={geminiApiKey}
                                onChange={e => setGeminiApiKey(e.target.value)}
                                placeholder="Enter API key..."
                                className={`w-full ${isDarkMode ? 'bg-[#161618] border-gray-800 text-white' : 'bg-white border-gray-200'} border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono`}
                              />
                              <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
                            </div>
                            <p className="text-[10px] text-gray-500 px-1">Keys are stored locally and never shared with Rickel Industries.</p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* User Management */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                        <h4 className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-[0.2em]`}>User Nexus</h4>
                      </div>

                      <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-100'} border space-y-6`}>
                        <form onSubmit={handleInviteUser} className="flex gap-2">
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder="Collaborator's email..."
                            className={`flex-1 ${isDarkMode ? 'bg-[#161618] border-gray-800 text-white' : 'bg-white border-gray-200'} border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                          />
                          <button
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap"
                          >
                            Send Magic Link
                          </button>
                        </form>

                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Active Citizens</p>
                          <div className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-100'} max-h-[200px] overflow-y-auto pr-2`}>
                            {isAdminPanelLoading ? (
                              <div className="py-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-indigo-500" />
                                <span className="text-xs italic">Summoning profiles...</span>
                              </div>
                            ) : (
                              allProfiles.map(p => (
                                <div key={p.id} className="py-3 flex items-center justify-between group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200 overflow-hidden ring-2 ring-indigo-500/0 group-hover:ring-indigo-500/20 transition-all">
                                      <img src={p.avatar_url || `https://picsum.photos/seed/${p.full_name}/32/32`} alt="" />
                                    </div>
                                    <div>
                                      <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{p.full_name || 'Incognito'}</p>
                                      <p className="text-[10px] text-gray-500 font-mono opacity-60">ID: {p.id.slice(0, 8)}...</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      title="Reset Password"
                                      onClick={() => resetUserPassword(p.email).then(() => alert('Reset link sent to ' + p.email))}
                                      className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'text-gray-500 hover:text-amber-400 hover:bg-amber-400/10' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                    >
                                      <Mail size={14} />
                                    </button>
                                    <button
                                      onClick={() => toggleUserAdmin(p.id, p.is_admin).then(() => fetchProfiles())}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${p.is_admin ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400'}`}
                                    >
                                      {p.is_admin ? 'Admin' : 'Make Admin'}
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* User Tokens Placeholder */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Citizen Tokens</p>
                              <p className="text-[10px] text-gray-500 italic">Manage API access for users</p>
                            </div>
                            <button className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-500 hover:text-white transition-all">
                              Generate All
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="mt-12">
                    <button
                      onClick={() => setIsThroneModalOpen(false)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20 text-sm"
                    >
                      Exit Throne
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div >
    </div >
  );
}
