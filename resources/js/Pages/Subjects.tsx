import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';

interface Subject {
    id: string;
    name: string;
    exam_date: string;
    priority_level: number;
    topics: Topic[];
}

interface Topic {
    id: string;
    title: string;
    difficulty: number;
    estimated_hours: number | null;
    is_completed: boolean;
}

interface SubjectsProps extends PageProps {
    subjects: Subject[];
}

export default function Subjects({ subjects = [] }: SubjectsProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        exam_date: '',
        priority_level: 3,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Manage Subjects
                    </h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add Subject
                    </button>
                </div>
            }
        >
            <Head title="Subjects" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className="bg-white overflow-hidden shadow-sm sm:rounded-lg"
                                >
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {subject.name}
                                        </h3>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <p>📅 Exam: {new Date(subject.exam_date).toLocaleDateString()}</p>
                                            <p>⭐ Priority: {subject.priority_level}/5</p>
                                            <p>📚 Topics: {subject.topics.length}</p>
                                            <p>✅ Completed: {subject.topics.filter(t => t.is_completed).length}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t">
                                            <a
                                                href={`/subjects/${subject.id}/topics`}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Manage Topics →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center text-gray-500">
                                <p className="mb-4">No subjects yet. Add your first subject to get started!</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add Your First Subject
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Subject Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Exam Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.exam_date}
                                        onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority Level (1-5)
                                    </label>
                                    <select
                                        value={formData.priority_level}
                                        onChange={(e) => setFormData({ ...formData, priority_level: parseInt(e.target.value) })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value={1}>1 - Low</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3 - Medium</option>
                                        <option value={4}>4</option>
                                        <option value={5}>5 - High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add Subject
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
