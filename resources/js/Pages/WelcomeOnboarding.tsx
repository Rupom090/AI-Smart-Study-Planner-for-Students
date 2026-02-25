import { useState, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BookOpen, Target, Sparkles, ChevronRight, GraduationCap, Briefcase, School } from 'lucide-react';

export default function WelcomeOnboarding() {
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState<string | null>(null);
    const [subject, setSubject] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const nextStep = () => {
        if (step === 2 && !goal) return; // Must select a goal
        if (step === 3 && !subject.trim()) return; // Must enter a subject
        setStep(prev => prev + 1);
    };

    const handleFinish = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // In a real app, this would post to an endpoint to save the onboarding data
        // and create the first subject. For now, we simulate user experience and redirect to dashboard.
        setTimeout(() => {
            router.get(route('dashboard'));
        }, 1500);
    };

    const goals = [
        { id: 'highschool', title: 'High School', icon: <School className="w-6 h-6" />, desc: 'Prepare for exams and quizzes' },
        { id: 'college', title: 'College/University', icon: <GraduationCap className="w-6 h-6" />, desc: 'Master deep, complex subjects' },
        { id: 'professional', title: 'Professional', icon: <Briefcase className="w-6 h-6" />, desc: 'Certifications and career growth' },
    ];

    // Variants for the multi-step form transitions
    const stepVariants: Variants = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-studley-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Head title="Welcome to Studley" />

            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-200 dark:bg-surface-800">
                <motion.div
                    className="h-full bg-gradient-to-r from-brand-500 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(step / 3) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">
                    {/* STEP 1: Welcome */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={stepVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="glass-panel p-10 md:p-14 rounded-3xl text-center"
                        >
                            <div className="w-48 h-48 mx-auto mb-8 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/5 shadow-2xl">
                                {/* Placeholder for Lottie - in a real scenario we'd use the loaded actual file */}
                                <Sparkles className="w-20 h-20 text-brand-500" strokeWidth={1.5} />
                            </div>

                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-500">Studley AI</span>
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-md mx-auto">
                                You're moments away from transforming any document into a personalized, interactive learning experience.
                            </p>

                            <button
                                onClick={nextStep}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl shadow-brand-500/25 transition-all hover:scale-105"
                            >
                                Let's get started <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: Goal Selection */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={stepVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="glass-panel p-10 md:p-14 rounded-3xl"
                        >
                            <div className="text-center mb-10">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 mb-4">
                                    <Target className="w-6 h-6" />
                                </span>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">What are you studying for?</h2>
                                <p className="text-slate-500">This helps our AI tailor its explanations to the right difficulty level.</p>
                            </div>

                            <div className="grid gap-4 mb-10">
                                {goals.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setGoal(g.id)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left ${goal === g.id
                                            ? 'border-brand-500 dark:bg-brand-500/10 bg-brand-50 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                            : 'border-surface-200 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-500/50 bg-white/50 dark:bg-surface-800'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${goal === g.id ? 'bg-brand-500 text-white shadow-md' : 'bg-surface-100 dark:bg-surface-700 text-slate-500'}`}>
                                            {g.icon}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${goal === g.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}>{g.title}</h3>
                                            <p className={`text-sm ${goal === g.id ? 'text-brand-600/80 dark:text-brand-400/80' : 'text-slate-500'}`}>{g.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-700 dark:hover:text-white font-medium px-4 py-2">
                                    Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!goal}
                                    className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold px-8 py-3 rounded-xl transition-all"
                                >
                                    Continue <ChevronRight className="w-5 h-5 -mr-1" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Create First Subject */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            variants={stepVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="glass-panel p-10 md:p-14 rounded-3xl"
                        >
                            <div className="text-center mb-10">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 mb-4">
                                    <BookOpen className="w-6 h-6" />
                                </span>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Create your first subject</h2>
                                <p className="text-slate-500">What's the main topic you want to start learning today?</p>
                            </div>

                            <form onSubmit={handleFinish} className="mb-10">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject Name</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="e.g. Intro to Biology, Calculus 101, History 205..."
                                            className="w-full bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 text-slate-900 dark:text-white rounded-xl focus:ring-0 focus:border-brand-500 transition-colors p-4 text-lg placeholder-slate-400"
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {/* Simulated additional setup details for aesthetic */}
                                    <div className="p-4 rounded-xl bg-surface-100 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 flex gap-4 items-start">
                                        <div className="mt-1 flex-shrink-0 text-brand-500">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Once set up, you'll be able to upload your syllabus or study guide to have our AI instantly generate notes and flashcards for <strong className="text-slate-900 dark:text-white">{subject || "this subject"}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </form>

                            <div className="flex justify-between items-center">
                                <button disabled={isSubmitting} onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-700 dark:hover:text-white font-medium px-4 py-2 disabled:opacity-50">
                                    Back
                                </button>
                                <button
                                    onClick={handleFinish}
                                    disabled={!subject.trim() || isSubmitting}
                                    className="relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:filter-none overflow-hidden"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Building workspace...
                                        </>
                                    ) : (
                                        <>Complete Setup <Check className="w-5 h-5 -mr-1" /></>
                                    )}

                                    {/* Shimmer effect while submitting */}
                                    {isSubmitting && (
                                        <motion.div
                                            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Temporary internal Check icon to avoid importing it from lucide if not needed at top
const Check = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
