import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FilePlus, MonitorDown, Calendar as CalendarIcon, UploadCloud, Layers, FileImage, MapPin } from 'lucide-react';
import { useWorkflowStore, ArtworkStatus } from '../store/useWorkflowStore';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks for coordinate selection
const LocationPicker = ({ setLocation }: { setLocation: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            setLocation(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddJobModal = ({ isOpen, onClose }: AddJobModalProps) => {
    const { projects, addArtwork } = useWorkflowStore();

    // Section 1: Job Info
    const [projectId, setProjectId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [clientName, setClientName] = useState('');
    const [site, setSite] = useState('');
    const [lat, setLat] = useState<number | undefined>(-1.2921); // Default to Nairobi
    const [lng, setLng] = useState<number | undefined>(36.8219);
    const [showMap, setShowMap] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);

    // Section 2: Print Specs
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [unit, setUnit] = useState('mm');
    const [material, setMaterial] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [finishing, setFinishing] = useState<string[]>([]);
    const [installType, setInstallType] = useState('');

    // Section 3: Scheduling
    const [priority, setPriority] = useState<'Critical' | 'High' | 'Normal' | 'Low'>('Normal');
    const [deadline, setDeadline] = useState('');
    const [installDate, setInstallDate] = useState('');

    const finishingOptions = ['Lamination', 'Cutting', 'Mounting', 'Grommets', 'Framing'];

    const toggleFinishing = (opt: string) => {
        setFinishing(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]);
    };

    const handleLocationSearch = async (query: string) => {
        if (!query.trim()) return;
        setIsSearchingLocation(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                setLat(parseFloat(data[0].lat));
                setLng(parseFloat(data[0].lon));
                if (!showMap) setShowMap(true); // Auto-show map on precise hit
            }
        } catch (error) {
            console.error('Location search failed:', error);
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setProjectId(id);
        const p = projects.find(proj => proj.id === id);
        if (p) setClientName(p.client_name || '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addArtwork({
                project_id: projectId,
                title,
                status: 'Concept & Draft',
                priority,
                quantity,
                dimensions: `${width}x${height}${unit}`,
                material,
                deadline: deadline || undefined,
                lat,
                lng,
                location_name: site
            });
            onClose();
        } catch (error) {
            console.error("Failed to add job:", error);
        }
    };

    // Helper for rendering section headers
    const SectionHeader = ({ icon: Icon, title, desc }: any) => (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="text-indigo-400" size={16} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0A0B10] border border-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#121214] shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FilePlus className="text-indigo-500" />
                                    Add New Job
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">Initialize a job and workflow in the Design Studio</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <form id="add-job-form" onSubmit={handleSubmit} className="space-y-12">

                                {/* -----------------------------------
                                    1. Job Information
                                ----------------------------------- */}
                                <section>
                                    <SectionHeader icon={Layers} title="1. Job Information" desc="Core identity and contextual details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#121214] p-6 rounded-2xl border border-gray-800">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Project Container *</label>
                                            <select
                                                required value={projectId} onChange={handleProjectChange}
                                                className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                            >
                                                <option value="" disabled>Select Project...</option>
                                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Job Title *</label>
                                            <input
                                                type="text" required value={title} onChange={e => setTitle(e.target.value)}
                                                placeholder="e.g. Main Terminal Banner"
                                                className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Client (Auto-filled)</label>
                                            <input
                                                type="text" value={clientName} readOnly
                                                className="w-full bg-[#1a1c1d]/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="block text-sm font-bold text-gray-400">Site / Location</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMap(!showMap)}
                                                    className={`text-xs font-bold flex items-center gap-1 transition-colors ${showMap ? 'text-indigo-400' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    <MapPin size={12} /> {showMap ? 'Hide Map' : 'Select on Map'}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={site}
                                                    onChange={e => setSite(e.target.value)}
                                                    onBlur={() => handleLocationSearch(site)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLocationSearch(site); } }}
                                                    placeholder="Type a location name (e.g. KICC, Nairobi) and press Enter/Click away to locate..."
                                                    className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none mb-3 pr-10"
                                                />
                                                {isSearchingLocation && (
                                                    <div className="absolute right-3 top-3.5 flex items-center justify-center">
                                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                            {showMap && (
                                                <div className="h-[250px] rounded-xl border border-gray-800 overflow-hidden bg-[#1a1c1d] relative">
                                                    <MapContainer key={`${lat}-${lng}`} center={[lat || -1.2921, lng || 36.8219]} zoom={14} className="w-full h-full">
                                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                                        <LocationPicker setLocation={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
                                                        <Marker position={[lat || -1.2921, lng || 36.8219]} />
                                                    </MapContainer>
                                                </div>
                                            )}
                                            {showMap && lat && lng && (
                                                <p className="text-xs text-gray-500 mt-2 font-mono">Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Description / Notes</label>
                                            <textarea
                                                rows={3} value={description} onChange={e => setDescription(e.target.value)}
                                                placeholder="Special instructions or notes for the team..."
                                                className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* -----------------------------------
                                    2. Print Specifications
                                ----------------------------------- */}
                                <section>
                                    <SectionHeader icon={MonitorDown} title="2. Print Specifications" desc="Technical details crucial for production" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#121214] p-6 rounded-2xl border border-gray-800">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Dimensions</label>
                                            <div className="flex gap-2">
                                                <input type="number" placeholder="W" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-3 py-3 text-white focus:border-indigo-500 outline-none" />
                                                <span className="flex items-center text-gray-500">x</span>
                                                <input type="number" placeholder="H" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-3 py-3 text-white focus:border-indigo-500 outline-none" />
                                                <select value={unit} onChange={e => setUnit(e.target.value)} className="w-20 bg-[#1a1c1d] border border-gray-800 rounded-xl px-2 py-3 text-white outline-none">
                                                    <option>mm</option><option>cm</option><option>m</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Material</label>
                                            <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500">
                                                <option value="" disabled>Select Material...</option>
                                                <option>Vinyl Matte</option><option>PVC Board</option><option>Acrylic</option>
                                                <option>Fabric Banner</option><option>Backlit Film</option>
                                                <option>Contravision</option><option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Quantity</label>
                                            <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Installation Type</label>
                                            <select value={installType} onChange={e => setInstallType(e.target.value)} className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500">
                                                <option value="" disabled>Optional...</option>
                                                <option>Wall mount</option><option>Hanging</option><option>Stand mount</option>
                                                <option>Window vinyl</option><option>Floor graphic</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-400 mb-3">Finishing (Multi-select)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {finishingOptions.map(opt => (
                                                    <button
                                                        key={opt} type="button" onClick={() => toggleFinishing(opt)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${finishing.includes(opt) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#1a1c1d] border-gray-800 text-gray-400 hover:text-white'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* -----------------------------------
                                    3. Scheduling
                                ----------------------------------- */}
                                <section>
                                    <SectionHeader icon={CalendarIcon} title="3. Scheduling" desc="Prioritization and critical timelines" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#121214] p-6 rounded-2xl border border-gray-800">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Priority Level</label>
                                            <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500">
                                                <option value="Critical">Critical</option>
                                                <option value="High">High</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Deadline</label>
                                            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none [&::-webkit-calendar-picker-indicator]:invert" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Installation Date</label>
                                            <input type="date" value={installDate} onChange={e => setInstallDate(e.target.value)} className="w-full bg-[#1a1c1d] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none [&::-webkit-calendar-picker-indicator]:invert" />
                                        </div>
                                    </div>
                                </section>

                                {/* -----------------------------------
                                    4. Attachments
                                ----------------------------------- */}
                                <section>
                                    <SectionHeader icon={FileImage} title="4. File Attachments" desc="Source files and mockups (.ai, .psd, .pdf, .png)" />
                                    <div className="border-2 border-dashed border-gray-800 bg-[#121214] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500/50 hover:bg-[#1a1c1d] transition-colors">
                                        <UploadCloud size={48} className="text-gray-600 mb-4" />
                                        <h4 className="text-white font-bold mb-1">Upload Files</h4>
                                        <p className="text-sm text-gray-500 mb-4">Drag & drop files here, or click to select</p>
                                        <button type="button" className="px-5 py-2 rounded-xl bg-gray-800 text-white font-medium text-sm hover:bg-gray-700">Browse Files</button>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2 text-center">Files will be securely stored in the R2 bucket: projects/&#123;project_id&#125;/studio/drafts</p>
                                </section>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-800 bg-[#121214] flex justify-end gap-3 shrink-0">
                            <button onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-800 text-gray-300 font-bold hover:bg-gray-800 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="add-job-form" className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20">
                                Create Job
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
