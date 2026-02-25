import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useRef, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

interface Analysis {
    summary: string;
    key_topics: string[];
    important_questions: string[];
}

interface Material {
    id: string;
    title: string;
    ai_analysis: Analysis | null;
    content_extracted: string;
    created_at: string;
    subject: {
        id: string;
        name: string;
    }
}

interface Props extends PageProps {
    material: Material;
    messages: Message[];
}

export default function Show({ auth, material, messages }: Props) {
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        setLocalMessages(messages);
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        // Optimistic update? Maybe later. For now, rely on server response via router visit
        post(route('materials.chat', material.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            }
        });
    };

    const analysis = material.ai_analysis;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-bold leading-tight text-white flex items-center gap-3">
                    <Link href={route('materials.index', material.subject.id)} className="text-slate-400 hover:text-white transition-colors">Back</Link>
                    {/* Note: I need the subject ID to link back properly, but material has subject_id on backend, maybe pass it in props or use router history */}
                    <span className="text-slate-600">/</span>
                    <span>{material.title}</span>
                </h2>
            }
        >
            <Head title={`Chat - ${material.title}`} />

            <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto md:p-6 gap-6">

                {/* Left Panel: Analysis */}
                <div className="w-full md:w-1/3 glass-panel overflow-y-auto custom-scrollbar p-0 flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-surface-900/50 sticky top-0 backdrop-blur-md z-10">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>🧠</span> Smart Analysis
                        </h3>
                    </div>

                    <div className="p-6 space-y-6">
                        {analysis ? (
                            <>
                                <div>
                                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">Summary</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">Key Concepts</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.key_topics?.map((topic, i) => (
                                            <span key={i} className="px-3 py-1 bg-surface-700 text-white text-xs rounded-full border border-white/10">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">Potential Questions</h4>
                                    <ul className="space-y-3">
                                        {analysis.important_questions?.map((q, i) => (
                                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2 bg-surface-800/50 p-3 rounded-lg">
                                                <span className="text-brand-500 font-bold">•</span>
                                                {q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                <p>Analysis pending or not available.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Chat */}
                <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-surface-900/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-xl">
                                🎓
                            </div>
                            <div>
                                <h3 className="font-bold text-white">AI Tutor</h3>
                                <p className="text-xs text-brand-300">Ask me anything about this document</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-surface-950/30">
                        {localMessages.length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                                <p>No messages yet. Ask a question to start!</p>
                            </div>
                        )}
                        {localMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-brand-600 text-white rounded-br-none'
                                    : 'bg-surface-700 text-slate-100 rounded-bl-none'
                                    } shadow-lg`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-surface-900 border-t border-white/5">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Ask a question about this topic..."
                                className="flex-1 bg-surface-950 border-surface-700 text-white rounded-xl focus:border-brand-500 focus:ring-brand-500 py-3 px-4 shadow-inner"
                                disabled={processing}
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-12 h-12 bg-brand-500 hover:bg-brand-400 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
