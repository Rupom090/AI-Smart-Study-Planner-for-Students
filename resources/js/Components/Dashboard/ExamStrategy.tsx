export default function ExamStrategy() {
    return (
        <div className="glass-panel p-6 mb-8 border-l-4 border-l-purple-500">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>⚔️</span> Exam Mode Activated
            </h3>

            <div className="space-y-4">
                <div className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">1</div>
                    <div>
                        <h4 className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">Start with the structure</h4>
                        <p className="text-sm text-slate-400">For theory answers: Definition {'->'} Example {'->'} Diagram {'->'} Explanation {'->'} Key Point Summary. Examiners love this.</p>
                    </div>
                </div>

                <div className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">2</div>
                    <div>
                        <h4 className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">Time Management</h4>
                        <p className="text-sm text-slate-400">Calculate minutes per mark (e.g., 1.5 mins per mark). If you get stuck for {'>'}2 mins, SKIP IT. Come back later.</p>
                    </div>
                </div>

                <div className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">3</div>
                    <div>
                        <h4 className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">Brain block?</h4>
                        <p className="text-sm text-slate-400">Forgot an answer? Close your eyes, take 3 deep breaths, and visualize where you studied it. Context cues help recall.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
