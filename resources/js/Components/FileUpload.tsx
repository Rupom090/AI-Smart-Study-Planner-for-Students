import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUploadService, { UploadProgress, UploadedFileResponse } from '@/Services/FileUploadService';

interface FileUploadProps {
    onUploadComplete?: (file: UploadedFileResponse) => void;
    onUploadError?: (error: string) => void;
    accept?: string;
    maxSize?: number;
    useCloudinary?: boolean;
    multiple?: boolean;
}

interface FileWithPreview {
    file: File;
    preview: string;
    progress: number;
    error?: string;
    uploaded?: UploadedFileResponse;
}

export default function FileUpload({
    onUploadComplete,
    onUploadError,
    accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf',
    maxSize = 10485760, // 10MB
    useCloudinary = true,
    multiple = false,
}: FileUploadProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            processFiles(selectedFiles);
        }
    };

    const processFiles = (selectedFiles: File[]) => {
        const filesToProcess = multiple ? selectedFiles : [selectedFiles[0]];

        const newFiles: FileWithPreview[] = filesToProcess.map((file) => {
            const validation = FileUploadService.validateFile(file);
            const preview = file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : '';

            return {
                file,
                preview,
                progress: 0,
                error: validation.valid ? undefined : validation.error,
            };
        });

        setFiles(multiple ? [...files, ...newFiles] : newFiles);

        // Auto-upload valid files
        newFiles.forEach((fileWithPreview, index) => {
            if (!fileWithPreview.error) {
                uploadFile(fileWithPreview, multiple ? files.length + index : index);
            }
        });
    };

    const uploadFile = async (fileWithPreview: FileWithPreview, index: number) => {
        setIsUploading(true);

        try {
            const uploadedFile = await FileUploadService.uploadFile(
                fileWithPreview.file,
                (progress: UploadProgress) => {
                    updateFileProgress(index, progress.percentage);
                },
                useCloudinary
            );

            updateFileUploaded(index, uploadedFile);
            onUploadComplete?.(uploadedFile);
        } catch (error: any) {
            const errorMessage = error.message || 'Upload failed';
            updateFileError(index, errorMessage);
            onUploadError?.(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const updateFileProgress = (index: number, progress: number) => {
        setFiles((prevFiles) =>
            prevFiles.map((f, i) => (i === index ? { ...f, progress } : f))
        );
    };

    const updateFileUploaded = (index: number, uploaded: UploadedFileResponse) => {
        setFiles((prevFiles) =>
            prevFiles.map((f, i) =>
                i === index ? { ...f, uploaded, progress: 100 } : f
            )
        );
    };

    const updateFileError = (index: number, error: string) => {
        setFiles((prevFiles) =>
            prevFiles.map((f, i) => (i === index ? { ...f, error, progress: 0 } : f))
        );
    };

    const removeFile = (index: number) => {
        setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer ${isDragging
                    ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-4 ring-brand-500/20'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                />

                <div className="space-y-5 pointer-events-none">
                    <motion.div
                        animate={isDragging ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
                        className="flex justify-center"
                    >
                        <div className={`p-4 rounded-full ${isDragging ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'} transition-all duration-300`}>
                            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                    </motion.div>

                    <div>
                        <span className="text-brand-600 dark:text-brand-400 font-bold text-lg">
                            Click to browse
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 text-lg"> or drag and drop</span>
                    </div>

                    <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
                        JPG, PNG, GIF, WEBP, PDF up to 10MB
                    </p>
                </div>
            </motion.div>

            {files.length > 0 && (
                <div className="mt-8 space-y-4">
                    {files.map((fileWithPreview, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={index}
                            className="glass-card border border-slate-200 dark:border-white/10 rounded-xl p-5 bg-white/50 dark:bg-surface-800/50 hover:bg-white/80 dark:hover:bg-surface-800/80 transition-all shadow-sm"
                        >
                            <div className="flex items-start space-x-5">
                                {fileWithPreview.preview ? (
                                    <img
                                        src={fileWithPreview.preview}
                                        alt="Preview"
                                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500 dark:text-brand-400">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                                        {fileWithPreview.file.name}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                        {FileUploadService.formatFileSize(
                                            fileWithPreview.file.size
                                        )}
                                    </p>

                                    {fileWithPreview.error && (
                                        <p className="text-sm font-medium text-rose-500 mt-2">
                                            {fileWithPreview.error}
                                        </p>
                                    )}

                                    {!fileWithPreview.error &&
                                        !fileWithPreview.uploaded && (
                                            <div className="mt-3">
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${fileWithPreview.progress}%` }}
                                                        className="h-full bg-gradient-to-r from-brand-500 to-purple-500 relative"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1.5s_infinite] linear"></div>
                                                    </motion.div>
                                                </div>
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 text-right">
                                                    {Math.round(fileWithPreview.progress)}%
                                                </p>
                                            </div>
                                        )}

                                    {fileWithPreview.uploaded && (
                                        <div className="flex items-center mt-3 text-emerald-500 font-medium">
                                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">Uploaded successfully</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors"
                                    title="Remove file"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
