import { useState } from 'react';

const TIPS = [
    {
        title: "Break Syllabus into Micro Tasks",
        content: "Don't write 'Study OS'. Write 'Read Paging mechanism (20 min)', 'Solve 3 LRU problems (15 min)'. Small wins build momentum."
    },
    {
        title: "The Ideal Study Cycle",
        content: "1. Read Concept (Use Feynman Technique). 2. Write Summary in margins. 3. Active Recall (Close book, explain out loud). 4. Solve 2 problems."
    },
    {
        title: "Active Recall for Theory",
        content: "Stop re-reading highlights. It's a waste of time. Instead, make questions from headings and answer them without looking."
    },
    {
        title: "Revising Code Subjects",
        content: "Don't memorize syntax. Understand the logic flow. Dry run the code on paper with edge cases. That's how interviews work."
    }
];

export default function SmartStudyGuide() {
    return (
        <div className="glass-panel p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🧠</span> Smart Study Guidance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TIPS.map((tip, i) => (
                    <div key={i} className="bg-surface-800/50 p-4 rounded-xl border border-white/5 hover:border-brand-500/20 transition-all">
                        <h4 className="font-bold text-brand-400 mb-2 text-sm">{tip.title}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{tip.content}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-brand-900/20 border border-brand-500/20 rounded-xl flex items-start gap-3">
                <span className="text-xl">📅</span>
                <div>
                    <h4 className="font-bold text-white text-sm mb-1">Pre-Exam Checklist</h4>
                    <p className="text-xs text-slate-400">
                        7 Days before: Finish syllabus. 3 Days before: Past papers only. Last Night: Formula sheets & light revision.
                    </p>
                </div>
            </div>
        </div>
    );
}
