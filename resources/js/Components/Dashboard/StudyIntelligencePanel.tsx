
import { Link } from '@inertiajs/react';

interface Props {
    search: {
        weeklyFocusScore: number;
        studyMinutesLastWeek: number;
        strongestSubject: string;
        weakestSubject: string;
        nextExam: {
            name: string;
            daysLeft: number;
            date: string;
        } | null;
    };
}

export default function StudyIntelligencePanel({ stats }: { stats: Props['search'] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Focus Score */}
            <div className="glass-card p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-brand-500/20"></div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Weekly Focus Score</h3>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{stats.weeklyFocusScore}%</span>
                    <span className={`text-sm mb-1 ${stats.weeklyFocusScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {stats.weeklyFocusScore >= 80 ? 'Excellent' : 'Needs Work'}
                    </span>
                </div>
                <div className="w-full bg-surface-700 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${stats.weeklyFocusScore >= 80 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                        style={{ width: `${stats.weeklyFocusScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Study Time */}
            <div className="glass-card p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-purple-500/20"></div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Study Time (Last 7 Days)</h3>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{Math.floor(stats.studyMinutesLastWeek / 60)}<span className="text-base text-slate-500 ml-1">h</span></span>
                    <span className="text-4xl font-bold text-white">{stats.studyMinutesLastWeek % 60}<span className="text-base text-slate-500 ml-1">m</span></span>
                </div>
                <p className="text-xs text-slate-500 mt-4">Keep consistent for best results.</p>
            </div>

            {/* Subject Analysis */}
            <div className="glass-card p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/20"></div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Performance Analysis</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Strongest</span>
                        <span className="text-sm font-bold text-emerald-400">{stats.strongestSubject}</span>
                    </div>
                    <div className="w-full bg-surface-700 h-px"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Weakest</span>
                        <span className="text-sm font-bold text-rose-400">{stats.weakestSubject}</span>
                    </div>
                </div>
            </div>

            {/* Exam Countdown */}
            <div className="glass-card p-6 relative overflow-hidden group border-l-4 border-l-rose-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-rose-500/20"></div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Next Exam</h3>
                {stats.nextExam ? (
                    <>
                        <div className="text-3xl font-bold text-white truncate">{stats.nextExam.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-mono text-rose-400 font-bold">{stats.nextExam.daysLeft}</span>
                            <span className="text-sm text-slate-400">Days Left</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Date: {stats.nextExam.date}</p>
                    </>
                ) : (
                    <div className="h-full flex items-center text-slate-500 text-sm italic">
                        No upcoming exams scheduled.
                    </div>
                )}
            </div>
        </div>
    );
}
