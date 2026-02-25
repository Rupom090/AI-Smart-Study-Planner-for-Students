import { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusMode() {
    // State: Setup -> Focusing -> Break -> Reflection -> Summary
    const [mode, setMode] = useState<'setup' | 'focus' | 'break' | 'reflection'>('setup');
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
    };

    const handleExitAttempt = () => {
        if (window.confirm("Leaving focus mode will pause your session. Are you sure?")) {
            setMode('reflection');
            setIsActive(false);
        }
    };

    // Progress calculation for the SVG circle
    const progress = 1 - (timeLeft / (duration * 60));
    const circumference = 2 * Math.PI * 48; // r=48

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-brand-500/30">
            <Head title={isActive ? `Focusing (${formatTime(timeLeft)})` : "Focus Mode"} />

            {/* Immersive Backgrounds with Framer Motion */}
            <motion.div
                className="absolute inset-0 -z-10"
                animate={{
                    backgroundColor: mode === 'setup' ? '#0f172a' : // slate-900 
                        mode === 'focus' ? '#020617' : // slate-950 (deepest)
                            mode === 'reflection' ? '#064e3b' : // emerald-950
                                '#0f172a'
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
            >
                {/* Grain overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>

                {/* Dynamic Ambient Blobs */}
                <AnimatePresence>
                    {mode === 'setup' && (
                        <motion.div
                            key="setup-blobs"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-brand-600/10 rounded-full blur-[120px] mix-blend-screen" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
                        </motion.div>
                    )}
                    {mode === 'focus' && (
                        <motion.div
                            key="focus-blobs"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2 }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] bg-brand-500/10 rounded-full blur-[150px]"
                            />
                        </motion.div>
                    )}
                    {mode === 'reflection' && (
                        <motion.div
                            key="reflection-blobs"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <div className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence mode="wait">
                {/* SETUP MODE */}
                {mode === 'setup' && (
                    <motion.div
                        key="setup"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.4, type: 'spring' }}
                        className="z-10 w-full max-w-md p-8 glass-panel rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <h1 className="text-4xl font-bold text-center mb-2 tracking-tight">Deep Focus</h1>
                            <p className="text-slate-400 text-center mb-10">Define your mission. Eliminate noise.</p>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Single Task Objective</label>
                                    <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => setTask(e.target.value)}
                                        placeholder="e.g., Master Dijkstra's Algorithm"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all shadow-inner"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Duration (Minutes)</label>
                                    <div className="flex gap-4">
                                        {[25, 45, 60].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setDuration(m)}
                                                className={`flex-1 py-4 rounded-2xl border font-bold text-lg transition-all duration-300 relative overflow-hidden
                                                    ${duration === m
                                                        ? 'bg-brand-500/20 border-brand-500 text-brand-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                                        : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {duration === m && (
                                                    <motion.div
                                                        layoutId="durationOutline"
                                                        className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none"
                                                    />
                                                )}
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: task ? 1.02 : 1 }}
                                    whileTap={{ scale: task ? 0.98 : 1 }}
                                    onClick={handleStart}
                                    disabled={!task}
                                    className="w-full py-4 mt-6 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800 text-white"
                                >
                                    {task && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                                    )}
                                    <span className="relative z-10">{task ? 'Enter Focus Mode' : 'Set a task to begin'}</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* FOCUS MODE */}
                {mode === 'focus' && (
                    <motion.div
                        key="focus"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="z-10 flex flex-col items-center justify-center w-full h-full flex-1"
                    >
                        {/* Task Context */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="absolute top-16 text-center max-w-2xl px-4"
                        >
                            <div className="flex items-center justify-center gap-2 mb-3 text-brand-500">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                                </span>
                                <span className="font-mono text-xs uppercase tracking-widest font-bold">Deep Work</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-medium text-white/90 truncate">{task}</h2>
                        </motion.div>

                        {/* Timer Experience */}
                        <div className="relative my-auto flex items-center justify-center">
                            {/* Outer Glow */}
                            <motion.div
                                animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-brand-500/20 rounded-full blur-[40px] z-0"
                            ></motion.div>

                            <div className="w-[320px] h-[320px] md:w-[450px] md:h-[450px] relative flex items-center justify-center z-10 glass-panel rounded-full border border-white/5 bg-slate-900/30 backdrop-blur-md">
                                {/* SVG Ring */}
                                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-xl p-4">
                                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" className="text-slate-800" fill="none" />
                                    <motion.circle
                                        cx="50" cy="50" r="48"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-brand-400"
                                        fill="none"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset: circumference * progress }}
                                        transition={{ duration: 1, ease: 'linear' }}
                                        style={{ filter: "drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))" }}
                                    />
                                </svg>

                                <div className="text-7xl md:text-[8rem] font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-2xl">
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>

                        {/* Exit Protection */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            whileHover={{ opacity: 1, scale: 1.05 }}
                            transition={{ delay: 1 }}
                            onClick={handleExitAttempt}
                            className="absolute bottom-16 group flex flex-col items-center gap-3"
                        >
                            <span className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center text-xl group-hover:bg-rose-500/20 group-hover:border-rose-500/50 group-hover:text-rose-400 transition-all duration-300">
                                ✕
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors duration-300">End Session</span>
                        </motion.button>
                    </motion.div>
                )}

                {/* REFLECTION MODE */}
                {mode === 'reflection' && (
                    <motion.div
                        key="reflection"
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className="z-10 w-full max-w-md p-8 glass-panel rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-emerald-500/30"
                            >
                                ✨
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">Session Complete.</h2>
                            <p className="text-emerald-100/60 text-center mb-8">Take a moment to process your progress.</p>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-emerald-100/80 mb-4">How focused were you?</label>
                                    <div className="relative pt-1">
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={reflection.focusScore}
                                            onChange={(e) => setReflection({ ...reflection, focusScore: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-900/50 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-emerald-100/50 mt-3">
                                        <span>Distracted</span>
                                        <span className="text-emerald-400">{reflection.focusScore}%</span>
                                        <span>Hyper Focused</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-emerald-100/80 mb-4">Did you complete the task?</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setReflection({ ...reflection, completed: true })}
                                            className={`flex-1 py-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 ${reflection.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 text-slate-400'}`}
                                        >
                                            <span className="text-xl">✅</span> Yes
                                        </button>
                                        <button
                                            onClick={() => setReflection({ ...reflection, completed: false })}
                                            className={`flex-1 py-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 ${!reflection.completed === true ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 text-slate-400'}`}
                                        >
                                            <span className="text-xl">🚧</span> No
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 mt-10">
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg text-center shadow-lg hover:bg-slate-200 transition-all hover:scale-[1.02]"
                                    >
                                        Save & Exit to Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMode('focus');
                                            setIsActive(true);
                                        }}
                                        className="w-full py-3 text-emerald-100/60 font-bold hover:text-white transition-colors"
                                    >
                                        Resume Timer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
