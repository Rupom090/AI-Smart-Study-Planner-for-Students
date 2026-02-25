import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import FileUpload from '@/Components/FileUpload';
import { UploadedFileResponse } from '@/Services/FileUploadService';
import { PageProps } from '@/types';

export default function FileUploadPage({ auth }: PageProps) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileResponse[]>([]);
    const [uploadMessage, setUploadMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

    const handleUploadComplete = (file: UploadedFileResponse) => {
        setUploadedFiles((prev) => [file, ...prev]);
        setUploadMessage(`File "${file.original_name}" uploaded successfully!`);
        setMessageType('success');

        // Clear message after 5 seconds
        setTimeout(() => {
            setUploadMessage('');
            setMessageType('');
        }, 5000);
    };

    const handleUploadError = (error: string) => {
        setUploadMessage(error);
        setMessageType('error');

        setTimeout(() => {
            setUploadMessage('');
            setMessageType('');
        }, 5000);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                        File Upload
                    </h2>
                </motion.div>
            }
        >
            <Head title="File Upload" />

            <div className="py-8 sm:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-4xl sm:px-6 lg:px-8"
                >
                    {uploadMessage && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`mb-8 rounded-xl p-5 border shadow-sm backdrop-blur-md ${messageType === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                                }`}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {messageType === 'success' ? (
                                        <svg className={`h-6 w-6 text-emerald-500`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className={`h-6 w-6 text-rose-500`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-bold">
                                        {uploadMessage}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="glass-panel overflow-hidden sm:rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-lg">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Upload Study Materials
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Drag and drop your PDFs, PowerPoints, images, or documents below to start generating smart flashcards and quizzes.
                            </p>
                        </div>

                        <FileUpload
                            onUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                            multiple={true}
                            useCloudinary={true}
                        />
                    </div>

                    {uploadedFiles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 glass-panel overflow-hidden sm:rounded-2xl border border-slate-200 dark:border-white/10 shadow-md p-6 sm:p-8"
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Recently Uploaded Files
                            </h3>

                            <div className="space-y-4">
                                {uploadedFiles.map((file, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={file.id}
                                        className="flex items-center justify-between p-4 glass-card border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-center space-x-5">
                                            {file.file_type === 'image' ? (
                                                <img
                                                    src={file.url}
                                                    alt={file.original_name}
                                                    className="w-14 h-14 object-cover rounded-lg shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500 dark:text-brand-400">
                                                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                    {file.original_name}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {file.formatted_size} • {new Date(file.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-slate-100 dark:bg-surface-700 text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 transition-colors shadow-sm"
                                        >
                                            View
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
