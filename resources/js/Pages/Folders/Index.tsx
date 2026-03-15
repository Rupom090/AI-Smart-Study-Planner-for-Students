import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image as ImageIcon, FolderOpen, Calendar, ChevronRight, Upload, MoreVertical, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';
import Dropdown from '@/Components/UI/Dropdown';
import { useState } from 'react';
import axios from 'axios';

interface Material {
    id: string;
    title: string;
    document_type: string;
    created_at: string;
    file?: {
        id: string;
        filename: string;
        original_name: string;
        url: string;
        size: number;
        mime_type: string;
        file_type: string;
    };
    subject?: {
        id: string;
        name: string;
    };
}

export default function FoldersIndex({ auth, materials: initialMaterials = [] }: PageProps<{ materials: Material[] }>) {
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const startRename = (id: string, currentTitle: string) => {
        setRenamingId(id);
        setEditTitle(currentTitle);
    };

    const cancelRename = () => {
        setRenamingId(null);
        setEditTitle('');
    };

    const submitRename = async (id: string) => {
        if (!editTitle.trim()) {
            cancelRename();
            return;
        }

        setIsRenaming(true);
        try {
            await axios.patch(route('folders.update', id), { title: editTitle });
            // Update local state to reflect the rename immediately
            setMaterials(prev => prev.map(m => m.id === id ? { ...m, title: editTitle } : m));
            setRenamingId(null);
            setEditTitle('');
        } catch (err) {
            console.error('Rename failed:', err);
        } finally {
            setIsRenaming(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        setConfirmDeleteId(null);
        try {
            await axios.delete(route('folders.destroy', id));
            // Remove from local state immediately
            setMaterials(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    };

    const getIcon = (type: string) => {
        if (type === 'image') return <ImageIcon className="text-blue-500" size={24} />;
        return <FileText className="text-emerald-500" size={24} />;
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-white leading-tight">All Materials</h2>}
        >
            <Head title="All Materials" />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDeleteId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setConfirmDeleteId(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed z-[51] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-studley-dark rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                                    <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete File?</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                This will permanently delete the file and cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDeleteId)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">File Repository</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{materials.length} document{materials.length !== 1 ? 's' : ''} saved</p>
                    </div>

                    <Link
                        href={route('file-upload')}
                        className="btn-primary py-2.5 px-5 flex items-center gap-2"
                    >
                        <Upload size={18} />
                        Upload New File
                    </Link>
                </div>

                <div className="bg-white/80 dark:bg-studley-dark/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    {materials.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {materials.map((material, idx) => (
                                <motion.div
                                    key={material.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                    layout
                                    className={`group relative flex flex-col p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:shadow-xl hover:border-brand-500/30 transition-all duration-300 ${deletingId === material.id ? 'opacity-40 pointer-events-none' : ''
                                        }`}
                                >
                                    {/* Loading overlay for delete */}
                                    {deletingId === material.id && (
                                        <div className="absolute inset-0 flex items-center justify-center z-40">
                                            <Loader2 className="animate-spin text-red-500" size={24} />
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-4 relative z-20">
                                        <div className="p-3 bg-white dark:bg-studley-dark rounded-lg shadow-sm">
                                            {getIcon(material.document_type)}
                                        </div>

                                        <div className="relative z-30 ml-auto" onClick={(e) => e.stopPropagation()}>
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-white dark:bg-studley-dark border border-slate-200 dark:border-white/10 shadow-xl pointer-events-auto z-50">
                                                    <button
                                                        onClick={() => startRename(material.id, material.title)}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} />
                                                        Rename
                                                    </button>
                                                    {material.file?.url && (
                                                        <a
                                                            href={route('materials.file', material.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="w-full text-left px-4 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 flex items-center gap-2"
                                                        >
                                                            <ChevronRight size={14} />
                                                            Open file
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteClick(material.id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>

                                    {/* Title / Rename Input */}
                                    <div className="flex-1 min-h-[48px] z-20 relative">
                                        {renamingId === material.id ? (
                                            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') submitRename(material.id);
                                                        if (e.key === 'Escape') cancelRename();
                                                    }}
                                                    autoFocus
                                                    disabled={isRenaming}
                                                    className="w-full text-sm font-medium rounded-md border-brand-500/50 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-brand-500/50 dark:text-white px-2 py-1"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => submitRename(material.id)}
                                                        disabled={isRenaming}
                                                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded disabled:opacity-50"
                                                    >
                                                        {isRenaming ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                    </button>
                                                    <button onClick={cancelRename} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                {material.title}
                                            </h3>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 flex flex-col gap-1.5">
                                        {material.subject && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-md w-fit">
                                                <FolderOpen size={12} />
                                                <span className="truncate max-w-[120px]">{material.subject.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                <Calendar size={12} className="mr-1" />
                                                {formatDate(material.created_at)}
                                            </div>
                                            {material.file?.size && (
                                                <span className="text-xs text-slate-400 dark:text-slate-500">{formatSize(material.file.size)}</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FolderOpen size={32} className="text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No materials yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                                Upload documents, images, and notes to start building your repository.
                            </p>
                            <Link href={route('file-upload')} className="btn-primary inline-flex items-center gap-2">
                                <Upload size={18} />
                                Upload a file
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
