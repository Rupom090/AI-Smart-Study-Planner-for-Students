
export default function StudyFlow() {
    return (
        <section className="py-20 bg-surface-950/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">How to Study Properly Before Exams</h2>
                    <p className="text-slate-400">A proven framework for high GPAs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { step: "01", title: "Understand Syllabus", desc: "Know exactly what topics are in scope. Don't waste time on out-of-syllabus chapters." },
                        { step: "02", title: "Daily Targets", desc: "Break big subjects into small, focused 45-minute micro-tasks." },
                        { step: "03", title: "Active Recall", desc: "Close the book. Explain the concept out loud. That's how memory works." },
                        { step: "04", title: "Past Questions", desc: "Solve last 5 years' papers. 70% of questions are repeated patterns." },
                    ].map((item, i) => (
                        <div key={i} className="relative">
                            <div className="text-6xl font-black text-white/5 absolute -top-4 -left-4 z-0 pointer-events-none">{item.step}</div>
                            <div className="relative z-10 p-6">
                                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                            {i < 3 && <div className="hidden md:block absolute top-1/2 right-0 w-8 h-px bg-white/10 -mr-12"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
