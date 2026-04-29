import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useRef, useEffect } from 'react';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import { puterChat, parseJsonFromAi, MODELS, getUserFriendlyAiError } from '@/Utils/puterAI';

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

interface File {
    id: string;
    filename: string;
    original_name: string;
    url: string;
    mime_type: string;
    size: number;
}

interface Material {
    id: string;
    title: string;
    ai_analysis: Analysis | null;
    content_extracted: string;
    created_at: string;
    document_type: string;
    file: File;
    subject: {
        id: string;
        name: string;
    } | null;
}

interface Props extends PageProps {
    material: Material;
    messages: Message[];
}

export default function Show({ auth, material, messages }: Props) {
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const [showExtractedText, setShowExtractedText] = useState(false);
    const [localAnalysis, setLocalAnalysis] = useState<Analysis | null>(material.ai_analysis);
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const hasLegacyUnavailableAnalysis =
        typeof localAnalysis?.summary === 'string' &&
        localAnalysis.summary.toLowerCase().includes('key missing');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const generateAnalysisOnFly = async () => {
        setIsGeneratingAnalysis(true);
        setAnalysisError(null);

        try {
            // Further reduce payload size to stay well under Puter.js free tier limits
            const safeText = material.content_extracted ? material.content_extracted.substring(0, 4000) : "No text available.";

            const prompt = `You are an expert tutor. Analyze the following document text and provide a JSON response EXACTLY in this format:
{
    "summary": "A 2-3 sentence summary of the entire document.",
    "key_topics": ["Topic 1", "Topic 2"],
    "important_questions": ["A key question?"]
}

DOCUMENT TEXT:
${safeText}`;

            const responseText = await puterChat(prompt, { model: MODELS.DOCUMENT, max_tokens: 700 });
            const parsedPayload = parseJsonFromAi(responseText);
            const parsedResult = {
                summary: (parsedPayload?.summary ?? '').toString().trim(),
                key_topics: Array.isArray(parsedPayload?.key_topics)
                    ? parsedPayload.key_topics.map((item: any) => String(item)).filter((item: string) => item.trim().length > 0)
                    : [],
                important_questions: Array.isArray(parsedPayload?.important_questions)
                    ? parsedPayload.important_questions.map((item: any) => String(item)).filter((item: string) => item.trim().length > 0)
                    : [],
            } as Analysis;

            if (!parsedResult.summary) {
                throw new Error('Invalid analysis structure returned from AI.');
            }

            setLocalAnalysis(parsedResult);

            // Save to database silently
            await window.axios.patch(route('materials.analysis.update', material.id), parsedResult);
        } catch (err: any) {
            console.error("Analysis Generation Error:", err);
            setAnalysisError(getUserFriendlyAiError(err, 'Smart analysis is temporarily unavailable. Please refresh and try again.'));
        } finally {
            setIsGeneratingAnalysis(false);
        }
    };

    useEffect(() => {
        setLocalMessages(messages);
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (
            (!localAnalysis || hasLegacyUnavailableAnalysis) &&
            material.content_extracted &&
            !isGeneratingAnalysis
        ) {
            generateAnalysisOnFly();
        }
    }, [material.content_extracted, hasLegacyUnavailableAnalysis, isGeneratingAnalysis, localAnalysis]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessageContent = data.message.trim();
        if (!userMessageContent || processing || isGeneratingAnalysis) return;

        // Optimistically add user message to UI
        const optimisticUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessageContent,
            created_at: new Date().toISOString()
        };
        setLocalMessages(prev => [...prev, optimisticUserMsg]);
        setData('message', '');

        try {
            // Save User Message to Database
            await window.axios.post(route('materials.chat', material.id), {
                role: 'user',
                content: userMessageContent
            });

            // Prepare Chat History for Puter
            // To ensure we don't hit Puter.js payload limits, we will send a single formatted string prompt instead of an array of objects
            const safeDocText = material.content_extracted ? material.content_extracted.substring(0, 4000) : "No text available.";

            let structuredPrompt = `You are an expert, helpful tutor. Act as an interactive guide for the student. Answer questions strictly based on the following document context.\n\nDOCUMENT CONTEXT:\n${safeDocText}\n\n`;

            // Add latest history (up to 4 messages to save space)
            const recentHistory = localMessages.slice(-4);
            if (recentHistory.length > 0) {
                structuredPrompt += "PREVIOUS CONVERSATION HISTORY:\n";
                recentHistory.forEach(msg => {
                    structuredPrompt += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`;
                });
            }

            structuredPrompt += `\nNEW QUESTION FROM STUDENT:\n${userMessageContent}\n\nYOUR ANSWER:`;

            // Call shared Puter helper for consistent auth + response parsing
            const assistantContent = await puterChat(structuredPrompt, { model: MODELS.DEFAULT, max_tokens: 900 });

            // Save Assistant Message to Database
            const savedAssistantMsg = await window.axios.post(route('materials.chat', material.id), {
                role: 'assistant',
                content: assistantContent
            });

            // Add to UI
            setLocalMessages(prev => [...prev, savedAssistantMsg.data.message]);

        } catch (error) {
            console.error("Chat Error:", error);
            // Fallback error message
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: getUserFriendlyAiError(error, 'I could not generate a response right now. Please try asking again in a moment.'),
                created_at: new Date().toISOString()
            };
            setLocalMessages(prev => [...prev, errorMsg]);
        }
    };

    // Using localAnalysis instead of material.ai_analysis
    // const analysis = material.ai_analysis;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-bold leading-tight text-white flex items-center gap-3">
                    <Link
                        href={material.subject ? route('materials.index', material.subject.id) : route('folders.index')}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        Back
                    </Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-brand-400">{material.subject ? material.subject.name : 'Folders'}</span>
                    <span className="text-slate-600">/</span>
                    <span className="truncate max-w-md">{material.title}</span>
                </h2>
            }
        >
            <Head title={`Chat - ${material.title}`} />

            <div className="h-screen flex flex-col overflow-hidden max-w-7xl mx-auto w-full">

                {/* PDF Viewer Section */}
                <div className="flex-1 overflow-hidden md:p-6 pt-6 px-6 pb-0">
                    <div className="h-full glass-panel overflow-hidden flex flex-col rounded-t-lg md:rounded-lg">
                        <div className="p-4 border-b border-white/5 bg-surface-900/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{material.document_type === 'image' ? '🖼️' : '📄'}</span>
                                <div>
                                    <h3 className="font-semibold text-white">{material.file.original_name}</h3>
                                    <p className="text-xs text-slate-400">{(material.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <a
                                href={route('materials.file', material.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                Open Full
                            </a>
                        </div>

                        {/* PDF/Image Viewer */}
                        <div className="flex-1 overflow-hidden bg-surface-950">
                            {material.document_type === 'image' ? (
                                <img
                                    src={route('materials.file', material.id)}
                                    alt={material.title}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <iframe
                                    src={`${route('materials.file', material.id)}#toolbar=1&navpanes=0&scrollbar=1`}
                                    className="w-full h-full border-none"
                                    title={material.title}
                                    onError={(e) => {
                                        console.error('PDF iframe error:', e);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Analysis & Chat Section */}
                <div className="h-[calc(100vh-70vh)] md:h-1/2 md:p-6 px-6 pb-6 overflow-hidden flex gap-6">

                    {/* Left Panel: Analysis */}
                    <div className="w-full md:w-1/3 glass-panel overflow-y-auto custom-scrollbar p-0 hidden md:flex md:flex-col rounded-b-lg md:rounded-lg">
                        <div className="p-6 border-b border-white/5 bg-surface-900/50 sticky top-0 backdrop-blur-md z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span>🧠</span> Smart Analysis
                            </h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {isGeneratingAnalysis ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-sm font-medium text-brand-300">Generating Smart Analysis...</p>
                                    <p className="text-xs text-slate-500">AI is reading your document</p>
                                </div>
                            ) : analysisError ? (
                                <div className="text-center py-10">
                                    <p className="text-sm text-red-400 mb-3">{analysisError}</p>
                                    <button onClick={generateAnalysisOnFly} className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded">Retry Analysis</button>
                                </div>
                            ) : localAnalysis && !hasLegacyUnavailableAnalysis ? (
                                <>
                                    <div>
                                        <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">Summary</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed">{localAnalysis.summary}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">Key Concepts</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {localAnalysis.key_topics?.map((topic, i) => (
                                                <span key={i} className="px-3 py-1 bg-surface-700 text-white text-xs rounded-full border border-white/10">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">Potential Questions</h4>
                                        <ul className="space-y-3">
                                            {localAnalysis.important_questions?.map((q, i) => (
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
                    <div className="flex-1 glass-panel flex flex-col overflow-hidden rounded-b-lg md:rounded-lg relative">
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
                            <button
                                onClick={() => setShowExtractedText(!showExtractedText)}
                                className="text-xs px-3 py-1 bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 rounded transition-colors border border-white/10"
                                title="Toggle extracted text view"
                            >
                                📋 Text
                            </button>
                        </div>

                        {/* Messages or Extracted Text */}
                        {showExtractedText ? (
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-950/30">
                                <div className="text-xs text-slate-400 mb-4">Extracted text from document:</div>
                                <div className="text-sm text-slate-300 whitespace-pre-wrap max-h-full">
                                    {material.content_extracted}
                                </div>
                            </div>
                        ) : (
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
                        )}

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
            </div>
        </AuthenticatedLayout>
    );
}
