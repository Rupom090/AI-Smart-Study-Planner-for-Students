import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Search, FolderOpen, Calendar, ChevronRight, Upload } from 'lucide-react';

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

export default function FoldersIndex({ auth, materials = [] }: PageProps<{ materials: Material[] }>) {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    };

    const getIcon = (type: string) => {
        if (type === 'image') return <ImageIcon className="text-blue-500" size={24} />;
        return <FileText className="text-emerald-500" size={24} />;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-white leading-tight">All Folders & Materials</h2>}
        >
            <Head title="All Materials" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">File Repository</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Every document, image, and note you've uploaded across all subjects.</p>
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
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="group relative flex flex-col p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:shadow-xl hover:border-brand-500/30 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-white dark:bg-studley-dark rounded-lg shadow-sm">
                                            {getIcon(material.document_type)}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                        {material.title}
                                    </h3>

                                    <div className="mt-auto pt-4 flex flex-col gap-2">
                                        {material.subject && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-md w-fit">
                                                <FolderOpen size={12} />
                                                <span className="truncate max-w-[120px]">{material.subject.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                            <Calendar size={12} className="mr-1" />
                                            {formatDate(material.created_at)}
                                        </div>
                                    </div>

                                    {/* Action Link Overlay */}
                                    <Link
                                        href={route('materials.show', material.id)}
                                        className="absolute inset-0 z-10"
                                    >
                                        <span className="sr-only">View Material</span>
                                    </Link>

                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                                            <ChevronRight size={16} />
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your repository is empty</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                                Upload documents, images, and notes to your subjects to see them all organized here.
                            </p>
                            <Link href={route('file-upload')} className="btn-primary inline-flex items-center gap-2">
                                <Upload size={18} />
                                Upload an assignment
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
