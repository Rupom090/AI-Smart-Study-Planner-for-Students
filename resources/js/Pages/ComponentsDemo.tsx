import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import LoadingSpinner from '@/Components/LoadingSpinner';
import LoadingSkeleton from '@/Components/LoadingSkeleton';
import EmptyState from '@/Components/EmptyState';
import ThemeToggle from '@/Components/ThemeToggle';
import { showToast } from '@/lib/toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import ExportService from '@/Services/ExportService';

export default function ComponentsDemo({ auth }: PageProps) {
    const [loading, setLoading] = useState(false);
    const [showSkeletons, setShowSkeletons] = useState(false);
    const { trackClick } = useAnalytics('Components Demo');

    const handleToastSuccess = () => {
        trackClick('toast-success-demo');
        showToast.success('This is a success message!');
    };

    const handleToastError = () => {
        trackClick('toast-error-demo');
        showToast.error('This is an error message!');
    };

    const handleToastPromise = () => {
        trackClick('toast-promise-demo');
        const promise = new Promise((resolve) => setTimeout(resolve, 2000));
        showToast.promise(promise, {
            loading: 'Processing...',
            success: 'Operation completed!',
            error: 'Operation failed!',
        });
    };

    const handleExportDemo = async () => {
        trackClick('export-demo');
        try {
            await ExportService.exportFiles({ format: 'csv' });
        } catch (error) {
            // Error already handled by ExportService
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        UI Components Demo
                    </h2>
                    <ThemeToggle />
                </div>
            }
        >
            <Head title="Components Demo" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Loading Spinners */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Loading Spinners
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <LoadingSpinner size="sm" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Small</p>
                            </div>
                            <div className="text-center">
                                <LoadingSpinner size="md" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Medium</p>
                            </div>
                            <div className="text-center">
                                <LoadingSpinner size="lg" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Large</p>
                            </div>
                            <div className="text-center bg-gray-800 p-4 rounded">
                                <LoadingSpinner size="md" color="white" />
                                <p className="text-sm text-gray-300 mt-2">White</p>
                            </div>
                        </div>
                    </div>

                    {/* Loading Skeletons */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Loading Skeletons
                            </h3>
                            <button
                                onClick={() => setShowSkeletons(!showSkeletons)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                {showSkeletons ? 'Hide' : 'Show'} Skeletons
                            </button>
                        </div>

                        {showSkeletons && (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Text Skeleton</p>
                                    <LoadingSkeleton variant="text" count={3} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Circular Skeleton</p>
                                    <LoadingSkeleton variant="circular" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rectangular Skeleton</p>
                                    <LoadingSkeleton variant="rectangular" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Card Skeleton</p>
                                    <LoadingSkeleton variant="card" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Toast Notifications */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Toast Notifications
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleToastSuccess}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Success Toast
                            </button>
                            <button
                                onClick={handleToastError}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Error Toast
                            </button>
                            <button
                                onClick={handleToastPromise}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Promise Toast
                            </button>
                        </div>
                    </div>

                    {/* Empty States */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Empty States
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EmptyState
                                icon={
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                }
                                title="No files found"
                                description="Upload your first file to get started"
                                action={{
                                    label: 'Upload File',
                                    onClick: () => showToast.success('Upload clicked!'),
                                }}
                            />
                            <EmptyState
                                icon={
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                }
                                title="No notifications"
                                description="You're all caught up! Check back later for updates."
                            />
                        </div>
                    </div>

                    {/* Export Demo */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Data Export
                        </h3>
                        <button
                            onClick={handleExportDemo}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Files
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
