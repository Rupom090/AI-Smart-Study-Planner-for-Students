import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import SecondaryButton from '@/Components/UI/SecondaryButton';
import InputLabel from '@/Components/UI/InputLabel';
import TextInput from '@/Components/UI/TextInput';
import InputError from '@/Components/UI/InputError';
import { useState, FormEventHandler } from 'react';

interface Material {
    id: string;
    title: string;
    document_type: string;
    created_at: string;
    status: string;
    file: {
        filename: string;
        size: number;
    }
}

interface Subject {
    id: string;
    name: string;
}

interface Props extends PageProps {
    subject: Subject;
    materials: Material[];
}

export default function Index({ auth, subject, materials }: Props) {
    const [showUpload, setShowUpload] = useState(false);
    const { data, setData, post, processing, errors, reset, progress } = useForm({
        title: '',
        file: null as File | null,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('materials.store', subject.id), {
            onSuccess: () => {
                setShowUpload(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-white flex items-center gap-3">
                        <Link href={route('subjects')} className="text-slate-400 hover:text-white transition-colors">Subjects</Link>
                        <span className="text-slate-600">/</span>
                        <span>{subject.name}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-brand-400">AI Tutor</span>
                    </h2>
                    <PrimaryButton onClick={() => setShowUpload(true)}>
                        <span>📤</span> Upload Content
                    </PrimaryButton>
                </div>
            }
        >
            <Head title={`AI Tutor - ${subject.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Empty State */}
                    {materials.length === 0 && !showUpload && (
                        <div className="glass-panel p-12 text-center">
                            <div className="w-20 h-20 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                🤖
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Build Your Knowledge Base</h3>
                            <p className="text-slate-400 max-w-lg mx-auto mb-8">
                                Upload PDFs, notes, or images related to {subject.name}.
                                Our AI will analyze them, identify key topics, and generate practice questions for you to chat about.
                            </p>
                            <PrimaryButton onClick={() => setShowUpload(true)}>
                                Upload Material
                            </PrimaryButton>
                        </div>
                    )}

                    {/* Upload Modal (Inline for simplicity) */}
                    {showUpload && (
                        <div className="mb-8 glass-card p-6 border-brand-500/30 ring-1 ring-brand-500/20">
                            <h3 className="text-lg font-bold text-white mb-4">Upload Study Material</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="title" value="Title" />
                                    <TextInput
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="e.g., Chapter 4 Notes, Calculus Cheat Sheet"
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="file" value="File (PDF or Image)" />
                                    <input
                                        type="file"
                                        onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                        className="mt-1 block w-full text-sm text-slate-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-brand-600 file:text-white
                                        hover:file:bg-brand-700
                                        cursor-pointer bg-surface-900 rounded-lg border border-surface-700"
                                    />
                                    <InputError message={errors.file} className="mt-2" />
                                    {progress && (
                                        <div className="w-full bg-surface-700 rounded-full h-2.5 mt-2">
                                            <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <SecondaryButton onClick={() => setShowUpload(false)} type="button">Cancel</SecondaryButton>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Analyzing...' : 'Upload & Analyze'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Materials Grid */}
                    {materials.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {materials.map((material) => (
                                <Link
                                    key={material.id}
                                    href={route('materials.show', material.id)}
                                    className="glass-card p-6 hover:bg-surface-800/80 transition-all group border-l-4 border-l-brand-500"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-surface-800 p-2 rounded-lg text-2xl">
                                            {material.document_type === 'image' ? '🖼️' : '📄'}
                                        </div>
                                        {material.status === 'completed' ? (
                                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/20">Analyzed</span>
                                        ) : (
                                            <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-full border border-amber-500/20">Processing</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-400 transition-colors line-clamp-1">
                                        {material.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">{new Date(material.created_at).toLocaleDateString()}</p>

                                    <div className="text-xs text-brand-300 flex items-center gap-1">
                                        <span>Click to open AI Chat</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
