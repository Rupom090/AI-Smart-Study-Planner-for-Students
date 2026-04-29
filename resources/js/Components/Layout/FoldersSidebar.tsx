import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderClosed, FileText, Image as ImageIcon, Search, Calendar, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

interface Material {
    id: string;
    title: string;
    document_type: string;
    created_at: string;
    subject?: {
        id: string;
        name: string;
    };
}

interface FoldersSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FoldersSidebar({ isOpen, onClose }: FoldersSidebarProps) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMaterials();
        }
    }, [isOpen]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('folders.api'));
            setMaterials(response.data);
        } catch (error) {
            console.error('Failed to fetch materials', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    };

    const getIcon = (type: string) => {
        if (type === 'image') return <ImageIcon className="text-blue-500" size={20} />;
        return <FileText className="text-emerald-500" size={20} />;
    };

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-white dark:bg-studley-dark border-l border-slate-200 dark:border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
                                    <FolderClosed size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Materials</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-6 pb-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search your repository..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white transition-all text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3">
                            {loading ? (
                                // Loading Skeletons
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-white/5 animate-pulse">
                                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/10" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : filteredMaterials.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FolderClosed size={24} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium">No materials found.</p>
                                    {searchQuery ? (
                                        <p className="text-sm text-slate-500 mt-1">Try a different search term.</p>
                                    ) : (
                                        <p className="text-sm text-slate-500 mt-1">Upload files on your dashboard.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredMaterials.map((material, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={material.id}
                                            className="group relative flex items-center gap-4 p-3 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-brand-200 dark:hover:border-brand-500/30 rounded-xl transition-all cursor-pointer"
                                        >
                                            <div className="p-2.5 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5">
                                                {getIcon(material.document_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                    {material.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 -ml-0.5">
                                                    {material.subject && (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded border border-brand-200 dark:border-brand-500/20 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 truncate max-w-[100px]">
                                                            {material.subject.name}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Calendar size={10} />
                                                        {formatDate(material.created_at)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Link href={route('materials.show', material.id)} className="absolute inset-0 z-10">
                                                <span className="sr-only">View Component</span>
                                            </Link>

                                            <div className="mr-2 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-brand-500 transition-all">
                                                <ChevronRight size={18} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer area linking to full page */}
                        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                            <Link
                                href={route('folders.index')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-studley-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-white/20 transition-all group"
                                onClick={onClose}
                            >
                                <Search size={16} className="group-hover:scale-110 transition-transform" />
                                Explore Full Repository
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
