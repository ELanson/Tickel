import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type ArtworkStatus =
    | 'Concept & Draft' | 'Internal Review' | 'Client Review' | 'Client Approved' | 'Approved for Print'
    | 'Print Queue' | 'Printing' | 'Finishing' | 'Quality Check' | 'Ready for Dispatch'
    | 'Packed' | 'Dispatched' | 'Received by Installer'
    | 'Installation Scheduled' | 'Installation In Progress' | 'Installation Completed' | 'Manager Approval' | 'Project Completed'
    | 'On Hold' | 'Reprint Required' | 'Cancelled';

export interface Project {
    id: string;
    name: string;
    client_name: string;
    client_contact?: string;
    deadline?: string;
    status: 'active' | 'archived' | 'completed';
    created_at: string;
}

export interface Artwork {
    id: string;
    project_id: string;
    title: string;
    dimensions?: string;
    material?: string;
    quantity: number;
    status: ArtworkStatus;
    priority: 'Critical' | 'High' | 'Normal' | 'Low';
    deadline?: string;
    created_at: string;
    lat?: number;
    lng?: number;
    location_name?: string;
}

export interface WorkflowStore {
    projects: Project[];
    artworks: Artwork[];
    isLoading: boolean;
    workflowActiveTab: 'dashboard' | 'jobs' | 'inbox' | 'calendar' | 'reports' | 'portfolio' | 'project_detail' | 'settings';
    activeProjectId: string | null;

    // Actions
    setWorkflowActiveTab: (tab: 'dashboard' | 'jobs' | 'inbox' | 'calendar' | 'reports' | 'portfolio' | 'project_detail' | 'settings') => void;
    setActiveProjectId: (id: string | null) => void;
    fetchProjects: () => Promise<void>;
    fetchArtworksByProject: (projectId: string) => Promise<void>;
    addProject: (project: Partial<Project>) => Promise<void>;
    addArtwork: (artwork: Partial<Artwork>) => Promise<void>;
    transitionArtworkStatus: (artworkId: string, newStatus: ArtworkStatus, notes?: string) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowStore>()(
    persist(
        (set, get) => ({
            projects: [
                { id: 'wp1', name: 'Nairobi Airport Branding', client_name: 'Kenya Airways', status: 'active', created_at: new Date().toISOString() },
                { id: 'wp2', name: 'Mombasa Trade Fair 2026', client_name: 'Mombasa County', status: 'active', created_at: new Date().toISOString() },
                { id: 'wp3', name: 'Atlas Cloud Expo Booth', client_name: 'Atlas Cloud', status: 'active', created_at: new Date().toISOString() }
            ],
            artworks: [
                { id: 'wa1', project_id: 'wp1', title: 'Main Terminal Banners', status: 'Concept & Draft', priority: 'High', quantity: 4, dimensions: '4000x1500mm', material: 'Vinyl Matte', created_at: new Date().toISOString(), lat: -1.3192, lng: 36.9275, location_name: 'JKIA Terminal 1A' },
                { id: 'wa2', project_id: 'wp1', title: 'Directional Signage', status: 'Client Review', priority: 'Normal', quantity: 12, dimensions: '600x600mm', material: 'PVC Board', created_at: new Date().toISOString(), lat: -1.3195, lng: 36.9272, location_name: 'JKIA Terminal 1A' },
                { id: 'wa3', project_id: 'wp2', title: 'County Entrance Arch', status: 'Print Queue', priority: 'Critical', quantity: 1, dimensions: '8000x3000mm', material: 'Contravision', created_at: new Date().toISOString(), lat: -4.0435, lng: 39.6682, location_name: 'Mombasa Showground' },
                { id: 'wa4', project_id: 'wp3', title: 'Interactive Totem Display', status: 'Approved for Print', priority: 'High', quantity: 2, dimensions: '1000x2000mm', material: 'Acrylic Backlit', created_at: new Date().toISOString(), lat: -1.2728, lng: 36.8065, location_name: 'KICC Tsavo Ballroom' }
            ],
            isLoading: false,
            workflowActiveTab: 'dashboard',
            activeProjectId: null,

            setWorkflowActiveTab: (tab) => set({ workflowActiveTab: tab }),
            setActiveProjectId: (id) => set({ activeProjectId: id }),

            fetchProjects: async () => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase
                        .from('workflow_projects')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (!error && data && data.length > 0) {
                        set({ projects: data as Project[] });
                    }
                } catch (e) {
                    console.warn('Supabase fetch failed, sticking with mock data');
                }
                set({ isLoading: false });
            },

            fetchArtworksByProject: async (projectId: string) => {
                set({ isLoading: true });
                const { data, error } = await supabase
                    .from('workflow_jobs')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    set({ artworks: data as Artwork[] });
                }
                set({ isLoading: false });
            },

            addProject: async (project) => {
                const { data, error } = await supabase
                    .from('workflow_projects')
                    .insert([project])
                    .select();

                if (!error && data) {
                    set({ projects: [data[0] as Project, ...get().projects] });
                }
            },

            addArtwork: async (artwork) => {
                const { data, error } = await supabase
                    .from('workflow_jobs')
                    .insert([artwork])
                    .select();

                if (!error && data) {
                    set({ artworks: [data[0] as Artwork, ...get().artworks] });
                }
            },

            transitionArtworkStatus: async (artworkId, newStatus, notes) => {
                // 1. Update status
                const { error: updateError } = await supabase
                    .from('workflow_jobs')
                    .update({ status: newStatus, updated_at: new Date().toISOString() })
                    .eq('id', artworkId);

                if (updateError) return;

                // 2. Log the change
                const artwork = get().artworks.find(a => a.id === artworkId);
                await supabase.from('workflow_logs').insert([{
                    job_id: artworkId,
                    previous_state: artwork?.status,
                    new_state: newStatus,
                    notes: notes
                }]);

                // 3. Update local state
                set({
                    artworks: get().artworks.map(a =>
                        a.id === artworkId ? { ...a, status: newStatus } : a
                    )
                });
            }
        }), {
        name: 'workflow-storage',
        partialize: (state) => ({ workflowActiveTab: state.workflowActiveTab })
    }));
