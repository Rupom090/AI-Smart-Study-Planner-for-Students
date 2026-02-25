
import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function FocusMode() {
    // State: Setup -> Focusing -> Break -> Reflection -> Summary
    const [mode, setMode] = useState<'setup' | 'focus' | 'break' | 'reflection' | 'summary'>('setup');
    const [task, setTask] = useState('');
    const [duration, setDuration] = useState(45); // minutes
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [isActive, setIsActive] = useState(false);
    const [reflection, setReflection] = useState({ focusScore: 50, completed: false, distraction: '' });

    // Timer Ref
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Setup
    useEffect(() => {
        setTimeLeft(duration * 60);
    }, [duration]);

    // Timer Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (mode === 'focus') setMode('break'); // Should ideally ask for reflection first? Sticking to user flow: Break then Exit or Reflection on Exit. User said "Post Focus Reflection" is powerful. Let's do Reflection after Focus ends.
            if (mode === 'focus') setMode('reflection'); // Force reflection after timer ends.
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isActive, timeLeft, mode]);

    // Helpers
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        setMode('focus');
        setIsActive(true);
        // Enter Full Screen (optional, browser restriction applies)
    };

    const handleExitAttempt = () => {
        if (window.confirm("Leaving focus mode will pause your session. Are you sure?")) {
            setMode('reflection');
            setIsActive(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-brand-500/30">
            <Head title={isActive ? `Focusing (${formatTime(timeLeft)})` : "Focus Mode"} />

            {/* Immersive Background */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${mode === 'focus' ? 'opacity-100' : 'opacity-20'}`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-brand-500/5 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-[50vh] h-[50vh] bg-indigo-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* SETUP MODE */}
            {mode === 'setup' && (
                <div className="z-10 w-full max-w-md p-8 animate-fade-in-up">
                    <h1 className="text-4xl font-bold text-center mb-2">Deep Focus</h1>
                    <p className="text-slate-400 text-center mb-10">Define your mission. Eliminate noise.</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Single Task Objective</label>
                            <input
                                type="text"
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                placeholder="e.g., Master Dijkstra's Algorithm"
                                className="w-full bg-surface-900 border-none rounded-xl p-4 text-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Duration (Minutes)</label>
                            <div className="flex gap-4">
                                {[25, 45, 60].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setDuration(m)}
                                        className={`flex-1 py-3 rounded-xl border font-bold transition-all ${duration === m ? 'bg-surface-800 border-brand-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-surface-800 text-slate-500 hover:border-surface-600'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleStart}
                            disabled={!task}
                            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-bold text-lg shadow-neon transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            Enter Focus Mode
                        </button>
                    </div>
                </div>
            )}

            {/* FOCUS MODE */}
            {mode === 'focus' && (
                <div className="z-10 flex flex-col items-center animate-fade-in-slow">
                    {/* Task Context */}
                    <div className="mb-12 text-center max-w-2xl px-4">
                        <div className="text-brand-500 font-mono text-xs uppercase tracking-widest mb-2 animate-pulse">Focus Active</div>
                        <h2 className="text-2xl md:text-3xl font-medium text-white/90">{task}</h2>
                    </div>

                    {/* Timer Experience */}
                    <div className="relative mb-16">
                        <div className="absolute inset-0 bg-brand-500/5 rounded-full blur-[60px] animate-pulse-slow"></div>
                        <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border-2 border-surface-800 flex items-center justify-center relative bg-surface-950/30 backdrop-blur-sm">
                            {/* Progress Ring (Simple) */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="2" className="text-surface-800" fill="none" />
                                <circle cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="2" className="text-brand-500 transition-all duration-1000" fill="none"
                                    strokeDasharray="1000"
                                    strokeDashoffset={1000 - (1000 * (timeLeft / (duration * 60)))}
                                />
                            </svg>

                            <div className="text-7xl md:text-9xl font-mono font-bold text-white tracking-widest tabular-nums">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>

                    {/* Exit Protection */}
                    <button
                        onClick={handleExitAttempt}
                        className="group flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity"
                    >
                        <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400 transition-colors">
                            ✕
                        </span>
                        <span className="text-xs text-white/50 group-hover:text-white transition-colors">End Session</span>
                    </button>

                    <p className="fixed bottom-8 text-xs text-slate-600 font-mono">DISTRACTION SHIELD ACTIVE</p>
                </div>
            )}

            {/* REFLECTION MODE */}
            {mode === 'reflection' && (
                <div className="z-10 w-full max-w-md p-8 animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">Session Paused.</h2>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-4">How focused were you?</label>
                            <input
                                type="range"
                                min="0" max="100"
                                value={reflection.focusScore}
                                onChange={(e) => setReflection({ ...reflection, focusScore: parseInt(e.target.value) })}
                                className="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>Distracted</span>
                                <span>Hyper Focused</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-4">Did you complete the task?</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setReflection({ ...reflection, completed: true })}
                                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${reflection.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-surface-900 border-surface-700 hover:border-surface-600'}`}
                                >
                                    <span>✅</span> Yes
                                </button>
                                <button
                                    onClick={() => setReflection({ ...reflection, completed: false })}
                                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${!reflection.completed ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-surface-900 border-surface-700 hover:border-surface-600'}`}
                                >
                                    <span>🚧</span> No
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => {
                                    setMode('focus');
                                    setIsActive(true);
                                }}
                                className="flex-1 py-3 text-slate-400 hover:text-white transition-colors"
                            >
                                Resume Timer
                            </button>
                            <Link
                                href={route('dashboard')}
                                className="flex-1 py-3 bg-white text-surface-900 rounded-lg font-bold text-center shadow-lg hover:bg-slate-200 transition-all"
                            >
                                Save & Exit
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
