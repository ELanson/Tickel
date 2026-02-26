import { create } from 'zustand';

export interface Task {
    id: number;
    title: string;
    description: string;
    project_id: number;
    project_name: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'done';
    estimated_hours: number;
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
    editingTask: Task | null;
    editingProject: Project | null;
    selectedTaskIdForTimeLog: number | null;

    // Forms
    formData: {
        title: string;
        description: string;
        project_id: number;
        priority: 'low' | 'medium' | 'high';
        estimated_hours: number;
        status: 'todo' | 'in_progress' | 'done';
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
}

export const useAppStore = create<AppState>((set, get) => ({
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
    editingTask: null,
    editingProject: null,
    selectedTaskIdForTimeLog: null,

    formData: {
        title: '',
        description: '',
        project_id: 0,
        priority: 'medium',
        estimated_hours: 0,
        status: 'todo'
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
                fetch('/api/tasks'),
                fetch('/api/projects'),
                fetch('/api/metrics')
            ]);
            const tasksData = await tasksRes.json();
            const projectsData = await projectsRes.json();
            const metricsData = await metricsRes.json();

            set({
                tasks: Array.isArray(tasksData) ? tasksData : [],
                projects: Array.isArray(projectsData) ? projectsData : [],
            });

            if (metricsData && typeof metricsData.totalHours === 'number') {
                set({ totalHours: metricsData.totalHours });
            }

            // Set default project if none selected and projects exist
            const state = get();
            if (state.formData.project_id === 0 && Array.isArray(projectsData) && projectsData.length > 0) {
                set((s) => ({
                    formData: { ...s.formData, project_id: projectsData[0].id }
                }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
}));
