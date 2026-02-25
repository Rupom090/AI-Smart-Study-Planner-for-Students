import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareText, Send, Loader2, FileText, ChevronRight, Bot, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export default function DocumentChat({ auth, subjects, activeMaterial }: PageProps<{ subjects: any[], activeMaterial: any }>) {
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(activeMaterial?.id || null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    // We flatten the materials from subjects for the dropdown
    const allMaterials = subjects.flatMap(s =>
        s.topics.flatMap((t: any) => t.study_materials)
    ).filter(Boolean);

    const activeDoc = allMaterials.find(m => m.id === selectedMaterialId) || activeMaterial;

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedMaterialId) return;

        const userMsg = input.trim();
        setInput('');

        const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
        setMessages(newHistory);
        setIsThinking(true);

        try {
            const response = await fetch('/api/v1/document-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    material_id: selectedMaterialId,
                    message: userMsg,
                    history: messages // pass previous history
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get a response.');
            }

            setMessages([...newHistory, { role: 'assistant', content: data.reply }]);
        } catch (err: any) {
            setMessages([...newHistory, { role: 'assistant', content: `**Error:** ${err.message}` }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Auto add a greeting if a document is selected and chat is empty
    useEffect(() => {
        if (selectedMaterialId && messages.length === 0 && activeDoc) {
            setMessages([
                { role: 'assistant', content: `Hi! I've read your document **"${activeDoc.title}"**. What would you like to know about it?` }
            ]);
        }
    }, [selectedMaterialId, activeDoc]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Chat with Document - Studley AI" />

            <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen">
                {/* Header Area */}
                <div className="flex-none p-6 md:px-10 border-b border-surface-200 dark:border-surface-800 bg-white/50 dark:bg-studley-dark/50 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                <MessageSquareText size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Chat with Document</h1>
                                <p className="text-sm text-slate-500">Ask questions and discuss your study materials with AI.</p>
                            </div>
                        </motion.div>

                        {/* Document Selector */}
                        <div className="md:w-72">
                            <select
                                value={selectedMaterialId || ''}
                                onChange={(e) => {
                                    setSelectedMaterialId(Number(e.target.value));
                                    setMessages([]); // Reset chat when doc changes
                                }}
                                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-slate-900 dark:text-white rounded-xl focus:ring-brand-500 focus:border-brand-500 shadow-sm transition-shadow"
                            >
                                <option value="" disabled>Select a document to chat about...</option>
                                {allMaterials.map((mat: any) => (
                                    <option key={mat.id} value={mat.id}>{mat.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 overflow-hidden relative bg-slate-50/30 dark:bg-black/10">
                    {!selectedMaterialId ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
                                <FileText size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select a Document</h2>
                            <p className="text-slate-500 max-w-md">
                                Choose a document from the dropdown above to start asking questions, summarizing content, or testing your knowledge.
                            </p>
                            {allMaterials.length === 0 && (
                                <Link
                                    href={route('dashboard')}
                                    className="mt-6 flex items-center gap-2 text-brand-600 font-medium hover:underline"
                                >
                                    Go upload a document first <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                                                ? 'bg-brand-600 text-white'
                                                : 'bg-purple-600 text-white'
                                            }`}>
                                            {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
                                                ? 'bg-brand-600 text-white rounded-tr-sm'
                                                : 'bg-white dark:bg-surface-800 text-slate-900 dark:text-white border border-surface-200 dark:border-surface-700 rounded-tl-sm'
                                            }`}>
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-50">
                                                {msg.role === 'user' ? (
                                                    <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                                                ) : (
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {isThinking && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                                            <Loader2 size={16} className="text-purple-500 animate-spin" />
                                            <span className="text-sm text-slate-500 font-medium">Reading document...</span>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 md:p-6 bg-white/80 dark:bg-studley-dark/80 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800">
                                <form onSubmit={handleSend} className="relative flex items-end gap-2">
                                    <div className="relative flex-1 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all overflow-hidden">
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend(e);
                                                }
                                            }}
                                            placeholder={`Ask a question about "${activeDoc?.title || 'the document'}"...`}
                                            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 resize-none py-4 px-5 max-h-32 min-h-[56px]"
                                            rows={1}
                                            disabled={isThinking}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isThinking}
                                        className="h-14 w-14 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={20} className="ml-1" />
                                    </button>
                                </form>
                                <div className="text-center mt-2">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Press Enter to send, Shift+Enter for new line</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
