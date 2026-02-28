import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface Task {
    id: number;
    title: string;
    description: string;
    project_id: number;
    project_name?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in_progress' | 'done' | 'blocked';
    estimated_hours: number;
    due_date?: string;
    start_date?: string;
    assignee_id?: string;
    subtasks?: { title: string; completed: boolean }[];
    dependencies?: number[];
    tags?: string[];
    attachments?: any[];
    watchers?: string[];
    repeat_config?: any;
    is_private?: boolean;
    budget?: number;
    cost?: number;
    location?: any;
    created_at: string;
}

export interface Project {
    id: number;
    name: string;
    description: string;
    status: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AppState {
    // Global Data
    tasks: Task[];
    projects: Project[];
    totalHours: number;
    messages: Message[];

    // UI State
    input: string;
    isLoading: boolean;
    isRefreshing: boolean;
    activeTab: 'dashboard' | 'tasks' | 'reports';

    // Modals & Editing
    isModalOpen: boolean;
    isProjectModalOpen: boolean;
    isTimeLogModalOpen: boolean;
    isSettingsModalOpen: boolean;
    isThroneModalOpen: boolean;
    isDarkMode: boolean;
    userProfile: {
        name: string;
        avatar_url: string | null;
    };
    user: any | null; // From Supabase Auth
    isAdmin: boolean;
    geminiApiKey: string;
    useLocalModel: boolean;
    localModelUrl: string;
    editingTask: Task | null;
    editingProject: Project | null;
    selectedTaskIdForTimeLog: number | null;

    // Forms
    formData: {
        title: string;
        description: string;
        project_id: number;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        estimated_hours: number;
        status: 'todo' | 'in_progress' | 'done' | 'blocked';
        due_date: string;
        start_date: string;
        assignee_id: string;
        subtasks: { title: string; completed: boolean }[];
        tags: string[];
        dependencies: number[];
        is_private: boolean;
        budget: number;
    };
    projectFormData: {
        name: string;
        description: string;
        status: string;
    };
    timeLogFormData: {
        hours: number;
        date: string;
    };

    // Nav
    isNavOpen: boolean;
    isSidebarOpen: boolean;

    // Actions
    setTasks: (tasks: Task[]) => void;
    setProjects: (projects: Project[]) => void;
    setTotalHours: (hours: number) => void;
    setMessages: (updater: Message[] | ((prev: Message[]) => Message[])) => void;
    setInput: (input: string) => void;
    setIsLoading: (isLoading: boolean) => void;
    setIsRefreshing: (isRefreshing: boolean) => void;
    setActiveTab: (tab: 'dashboard' | 'tasks' | 'reports') => void;
    setIsModalOpen: (isOpen: boolean) => void;
    setIsProjectModalOpen: (isOpen: boolean) => void;
    setIsTimeLogModalOpen: (isOpen: boolean) => void;
    setIsSettingsModalOpen: (isOpen: boolean) => void;
    setIsThroneModalOpen: (isOpen: boolean) => void;
    toggleDarkMode: () => void;
    setUserProfile: (profile: Partial<AppState['userProfile']>) => void;
    setUser: (user: any | null) => void;
    setGeminiApiKey: (key: string) => void;
    setUseLocalModel: (useLocal: boolean) => void;
    setLocalModelUrl: (url: string) => void;
    setEditingTask: (task: Task | null) => void;
    setEditingProject: (project: Project | null) => void;
    setSelectedTaskIdForTimeLog: (id: number | null) => void;
    setFormData: (updater: Partial<AppState['formData']> | ((prev: AppState['formData']) => AppState['formData'])) => void;
    setProjectFormData: (updater: Partial<AppState['projectFormData']> | ((prev: AppState['projectFormData']) => AppState['projectFormData'])) => void;
    setTimeLogFormData: (updater: Partial<AppState['timeLogFormData']> | ((prev: AppState['timeLogFormData']) => AppState['timeLogFormData'])) => void;
    setIsNavOpen: (isOpen: boolean) => void;
    setIsSidebarOpen: (isOpen: boolean) => void;

    // Thunks / Async Actions
    fetchData: () => Promise<void>;
    initializeAuth: () => (() => void);
    signOut: () => Promise<void>;

    // Admin Actions
    inviteUser: (email: string) => Promise<{ error: any }>;
    resetUserPassword: (email: string) => Promise<{ error: any }>;
    toggleUserAdmin: (userId: string, currentStatus: boolean) => Promise<{ error: any }>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            tasks: [],
            projects: [],
            totalHours: 0,
            messages: [
                { role: 'assistant', content: 'Hello! I am your Work Intelligence Agent. How can I help you manage your tasks today?' }
            ],
            input: '',
            isLoading: false,
            isRefreshing: false,
            activeTab: 'dashboard',

            isModalOpen: false,
            isProjectModalOpen: false,
            isTimeLogModalOpen: false,
            isSettingsModalOpen: false,
            isThroneModalOpen: false,
            isDarkMode: true,
            userProfile: {
                name: 'Guest User',
                avatar_url: null
            },
            user: null,
            isAdmin: false,
            geminiApiKey: '',
            useLocalModel: true,
            localModelUrl: 'https://tea.rickelindustries.co.ke/',
            editingTask: null,
            editingProject: null,
            selectedTaskIdForTimeLog: null,

            formData: {
                title: '',
                description: '',
                project_id: 0,
                priority: 'medium',
                status: 'todo',
                estimated_hours: 0,
                due_date: '',
                start_date: '',
                assignee_id: '',
                subtasks: [],
                tags: [],
                dependencies: [],
                is_private: false,
                budget: 0
            },
            projectFormData: {
                name: '',
                description: '',
                status: 'active'
            },
            timeLogFormData: {
                hours: 0,
                date: new Date().toISOString().split('T')[0]
            },

            isNavOpen: false,
            isSidebarOpen: true,

            setTasks: (tasks) => set({ tasks }),
            setProjects: (projects) => set({ projects }),
            setTotalHours: (totalHours) => set({ totalHours }),
            setMessages: (updater) => set((state) => ({
                messages: typeof updater === 'function' ? updater(state.messages) : updater
            })),
            setInput: (input) => set({ input }),
            setIsLoading: (isLoading) => set({ isLoading }),
            setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
            setActiveTab: (activeTab) => set({ activeTab }),
            setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
            setIsProjectModalOpen: (isProjectModalOpen) => set({ isProjectModalOpen }),
            setIsTimeLogModalOpen: (isTimeLogModalOpen) => set({ isTimeLogModalOpen }),
            setIsSettingsModalOpen: (isSettingsModalOpen) => set({ isSettingsModalOpen }),
            setIsThroneModalOpen: (isThroneModalOpen) => set({ isThroneModalOpen }),
            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
            setUserProfile: (profile) => set((state) => ({
                userProfile: { ...state.userProfile, ...profile }
            })),
            setUser: async (user) => {
                set({ user });
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                    if (profile) {
                        set({
                            userProfile: {
                                name: profile.full_name || 'Guest User',
                                avatar_url: profile.avatar_url
                            },
                            isAdmin: profile.is_admin || false
                        });
                    }
                } else {
                    set({ isAdmin: false });
                }
            },
            setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
            setUseLocalModel: (useLocalModel) => set({ useLocalModel }),
            setLocalModelUrl: (localModelUrl) => set({ localModelUrl }),
            setEditingTask: (editingTask) => set({ editingTask }),
            setEditingProject: (editingProject) => set({ editingProject }),
            setSelectedTaskIdForTimeLog: (selectedTaskIdForTimeLog) => set({ selectedTaskIdForTimeLog }),

            setFormData: (updater) => set((state) => ({
                formData: typeof updater === 'function' ? updater(state.formData) : { ...state.formData, ...updater }
            })),
            setProjectFormData: (updater) => set((state) => ({
                projectFormData: typeof updater === 'function' ? updater(state.projectFormData) : { ...state.projectFormData, ...updater }
            })),
            setTimeLogFormData: (updater) => set((state) => ({
                timeLogFormData: typeof updater === 'function' ? updater(state.timeLogFormData) : { ...state.timeLogFormData, ...updater }
            })),

            setIsNavOpen: (isNavOpen) => set({ isNavOpen }),
            setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

            fetchData: async () => {
                try {
                    const [tasksRes, projectsRes, metricsRes] = await Promise.all([
                        supabase.from('tasks').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
                        supabase.from('projects').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
                        supabase.from('time_logs').select('hours')
                    ]);

                    if (tasksRes.error) throw tasksRes.error;
                    if (projectsRes.error) throw projectsRes.error;
                    if (metricsRes.error) throw metricsRes.error;

                    const tasksData = tasksRes.data || [];
                    const projectsData = projectsRes.data || [];
                    const timeLogs = metricsRes.data || [];
                    const totalHours = timeLogs.reduce((sum, log) => sum + (log.hours || 0), 0);

                    set({
                        tasks: tasksData as Task[],
                        projects: projectsData as Project[],
                        totalHours: totalHours
                    });

                    // Set default project if none selected and projects exist
                    const state = get();
                    if (state.formData.project_id === 0 && Array.isArray(projectsData) && projectsData.length > 0) {
                        set((s) => ({
                            formData: { ...s.formData, project_id: projectsData[0].id }
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching data from Supabase:', error);
                }
            },
            initializeAuth: () => {
                // Initial session check
                supabase.auth.getSession().then(({ data: { session } }) => {
                    get().setUser(session?.user ?? null);
                    if (session?.user) get().fetchData();
                });

                // Listen for changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    get().setUser(session?.user ?? null);
                    if (session?.user) {
                        get().fetchData();
                    } else {
                        set({ tasks: [], projects: [], totalHours: 0 });
                    }
                });

                return () => subscription.unsubscribe();
            },
            signOut: async () => {
                await supabase.auth.signOut();
                set({ user: null, tasks: [], projects: [], totalHours: 0 });
            },

            inviteUser: async (email) => {
                return await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: window.location.origin,
                        shouldCreateUser: true
                    }
                });
            },

            resetUserPassword: async (email) => {
                return await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password',
                });
            },

            toggleUserAdmin: async (userId, currentStatus) => {
                const { error } = await supabase
                    .from('profiles')
                    .update({ is_admin: !currentStatus })
                    .eq('id', userId);
                return { error };
            }
        }),
        {
            name: 'taskion-storage',
            partialize: (state) => ({
                isDarkMode: state.isDarkMode,
                useLocalModel: state.useLocalModel,
                localModelUrl: state.localModelUrl,
                geminiApiKey: state.geminiApiKey
            })
        }
    )
);
