export default function ExamFramework() {
    return (
        <section className="py-24 bg-surface-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">How to study properly before exams</h2>
                    <p className="text-slate-400">The 4-step flow for maximum retention.</p>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    {/* Connecting Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500/0 via-brand-500/50 to-brand-500/0"></div>

                    {[
                        { step: "01", title: "Understand the Syllabus", desc: "Don't study blindly. Know exactly what matters." },
                        { step: "02", title: "Break into Daily Targets", desc: "Small goals are easier to hit than big ones." },
                        { step: "03", title: "Revise using Active Recall", desc: "Don't just read. Test yourself immediately." },
                        { step: "04", title: "Test with Past Questions", desc: "The best predictor of the future is the past." },
                    ].map((item, i) => (
                        <div key={i} className={`flex flex-col md:flex-row gap-8 items-center mb-12 relative ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="w-full md:w-1/2"></div>

                            {/* Center Node */}
                            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-surface-900 border-2 border-brand-500/50 text-brand-400 font-bold text-xs z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                {item.step}
                            </div>

                            <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 text-left'}`}>
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
