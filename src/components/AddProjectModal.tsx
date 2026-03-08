import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddProjectModal = ({ isOpen, onClose }: AddProjectModalProps) => {
    const { addProject } = useWorkflowStore();
    const [name, setName] = useState('');
    const [clientName, setClientName] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !clientName) return;

        addProject({
            name,
            client_name: clientName,
            deadline: deadline || undefined,
            status: 'active'
        });

        // Reset forms
        setName('');
        setClientName('');
        setDeadline('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0A0B10] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#121214]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                    <FolderPlus className="text-indigo-400" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Create Project Container</h2>
                                    <p className="text-xs text-gray-400 mt-1">Initialize a new project environment</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="add-project-form" onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Project Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Mall Signage Campaign"
                                        className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Client Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        placeholder="e.g. Mombasa County"
                                        className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Target Deadline</label>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                        className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-800 bg-[#121214] flex justify-end gap-3 shrink-0">
                            <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-800 text-gray-300 font-bold hover:bg-gray-800 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="add-project-form" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20">
                                Create Project
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
