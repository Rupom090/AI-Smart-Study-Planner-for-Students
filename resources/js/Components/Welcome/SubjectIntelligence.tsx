
const SUBJECTS = [
    {
        title: "Data Structures",
        topics: 12,
        level: "High",
        priority: "Critical",
        tip: "Master arrays, trees, and graphs first."
    },
    {
        title: "Operating Systems",
        topics: 8,
        level: "Medium",
        priority: "High",
        tip: "Focus on process sync and scheduling."
    },
    {
        title: "Computer Networks",
        topics: 10,
        level: "Hard",
        priority: "High",
        tip: "Visualize the OSI model layers."
    },
    {
        title: "Database Systems",
        topics: 7,
        level: "Easy",
        priority: "Medium",
        tip: "Practice ample SQL queries and specific normalization forms."
    },
    {
        title: "Software Engineering",
        topics: 6,
        level: "Easy",
        priority: "Low",
        tip: "Memorize development life cycle models."
    },
    {
        title: "Discrete Mathematics",
        topics: 14,
        level: "Hard",
        priority: "Critical",
        tip: "Solve graph theory and logic daily."
    }
];

export default function SubjectIntelligence() {
    return (
        <section className="py-24 relative overflow-hidden" id="subjects">
            <div className="absolute inset-0 bg-brand-900/5 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">CSE Subject Intelligence</h2>
                    <p className="text-slate-400">We tracked the data. Here is the snapshot.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SUBJECTS.map((sub, i) => (
                        <div key={i} className="glass-card p-8 hover:border-brand-500/30 transition-all group hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">{sub.title}</h3>
                                {sub.priority === "Critical" && (
                                    <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20">CRITICAL</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-6">
                                <div>
                                    <span className="text-slate-500 block text-xs">Core Topics</span>
                                    <span className="text-white font-medium">{sub.topics}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Difficulty</span>
                                    <span className={`font-medium ${sub.level === 'Hard' ? 'text-amber-400' : 'text-emerald-400'}`}>{sub.level}</span>
                                </div>
                            </div>

                            <div className="bg-surface-950/50 rounded p-3 border border-white/5">
                                <div className="text-[10px] uppercase text-brand-400 font-bold tracking-wider mb-1">Exam Tip</div>
                                <p className="text-xs text-slate-400 leading-relaxed">"{sub.tip}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
