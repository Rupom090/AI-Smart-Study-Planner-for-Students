
const SUBJECTS = [
    { title: "Data Structures", topics: 12, difficulty: "Hard", weight: "High", tip: "Master arrays and trees first." },
    { title: "Operating Systems", topics: 10, difficulty: "Medium", weight: "High", tip: "Focus on Scheduling Algos." },
    { title: "Computer Networks", topics: 14, difficulty: "Medium", weight: "High", tip: "Understand OSI Model layers." },
    { title: "Database Systems", topics: 8, difficulty: "Easy", weight: "Medium", tip: "Practice Normalization." },
    { title: "Software Engineering", topics: 15, difficulty: "Easy", weight: "Low", tip: "Learn SDLC models well." },
    { title: "Discrete Math", topics: 20, difficulty: "Hard", weight: "High", tip: "Solve Logic & Graph proofs." },
];

export default function SubjectGrid() {
    return (
        <section id="subjects" className="py-20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-brand-900/10 blur-3xl rounded-full"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Master Your Core Subjects</h2>
                    <p className="text-slate-400">Everything you need to ace the semester.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SUBJECTS.map((sub, i) => (
                        <div key={i} className="glass-card p-6 hover:translate-y-1 transition-transform duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">{sub.title}</h3>
                                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${sub.difficulty === 'Hard' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                                        sub.difficulty === 'Medium' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                            'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                    }`}>
                                    {sub.difficulty}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Topics</span>
                                    <span className="text-slate-300">{sub.topics} Core Units</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Importance</span>
                                    <span className="text-brand-300">{sub.weight} Scoring</span>
                                </div>
                            </div>

                            <div className="bg-surface-800/50 p-3 rounded-lg border border-white/5 text-xs text-slate-400">
                                <span className="text-brand-500 font-bold">💡 Tip:</span> {sub.tip}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
