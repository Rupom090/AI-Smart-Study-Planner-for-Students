
import { useState } from 'react';

interface CSESubjectData {
    id: string;
    name: string;
    topics: string[];
    examWeight: string;
    commonMistakes: string;
    examTip: string;
    bestRevisionOrder: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function CSESubjectBlock({ subject }: { subject: CSESubjectData }) {
    const [isOpen, setIsOpen] = useState(false);

    const getDifficultyColor = (diff: string) => {
        if (diff === 'Hard') return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
        if (diff === 'Medium') return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    };

    return (
        <div className="glass-card mb-4 overflow-hidden border border-white/5 transition-all hover:border-white/10">
            {/* Header / Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-5 flex justify-between items-center cursor-pointer bg-surface-900/40 hover:bg-surface-800/60 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg">
                        {subject.name.substring(0, 2)}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                        <p className="text-xs text-slate-400">Exam Weight: {subject.examWeight}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getDifficultyColor(subject.difficulty)}`}>
                        {subject.difficulty}
                    </span>
                    <svg
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className="p-6 bg-surface-950/30 border-t border-white/5 animate-slide-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-3">Core Topics</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {subject.topics.map((t, i) => (
                                    <span key={i} className="px-2 py-1 bg-surface-800 text-slate-300 text-xs rounded border border-white/5">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <h4 className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-3">Best Revision Order</h4>
                            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
                                {subject.bestRevisionOrder.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ol>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-rose-500/10 border-l-2 border-rose-500 p-3 rounded-r">
                                <h5 className="text-xs font-bold text-rose-400 uppercase mb-1">Common Mistake</h5>
                                <p className="text-sm text-slate-300">{subject.commonMistakes}</p>
                            </div>

                            <div className="bg-emerald-500/10 border-l-2 border-emerald-500 p-3 rounded-r">
                                <h5 className="text-xs font-bold text-emerald-400 uppercase mb-1">Exam Pro Tip</h5>
                                <p className="text-sm text-slate-300">{subject.examTip}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
