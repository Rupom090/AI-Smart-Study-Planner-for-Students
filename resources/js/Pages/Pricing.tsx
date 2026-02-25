import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Shield } from 'lucide-react';

export default function Pricing({ auth }: PageProps) {
    const [isYearly, setIsYearly] = useState(true);

    const plans = [
        {
            name: "Basic",
            description: "Perfect for casual learners wanting smarter notes.",
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: [
                "Up to 5 AI Document Uploads / month",
                "Basic Flashcards & Notes Generation",
                "Standard Pomodoro Timer",
                "Community Support",
            ],
            icon: <Shield className="w-6 h-6 text-slate-400" />,
            buttonText: "Start for Free",
            buttonStyle: "bg-surface-700 hover:bg-surface-600 text-white",
            isPopular: false,
        },
        {
            name: "Pro",
            description: "Everything you need to study 10x faster and ace exams.",
            monthlyPrice: 15,
            yearlyPrice: 12, // $144 billed annually
            features: [
                "Unlimited AI Document Uploads",
                "Advanced AI Tutor & Explanations",
                "Smart Quiz Generation",
                "Immersive Custom Focus Modes",
                "Priority Support",
            ],
            icon: <Zap className="w-6 h-6 text-brand-400" />,
            buttonText: "Upgrade to Pro",
            buttonStyle: "bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-400 hover:to-purple-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]",
            isPopular: true,
        },
        {
            name: "Enterprise",
            description: "Advanced controls and analytics for classrooms and schools.",
            monthlyPrice: 49,
            yearlyPrice: 39, // $468 billed annually
            features: [
                "Everything in Pro",
                "Custom LLM Tuning",
                "Classroom Analytics Dashboard",
                "SAML SSO Support",
                "Dedicated Success Manager",
            ],
            icon: <Sparkles className="w-6 h-6 text-amber-400" />,
            buttonText: "Contact Sales",
            buttonStyle: "bg-surface-700 hover:bg-surface-600 text-white",
            isPopular: false,
        }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pricing" />

            <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight"
                        >
                            Study Smarter, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Not Harder.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 dark:text-slate-400 mb-10"
                        >
                            Choose the plan that fits your academic goals. Unlock unlimited AI power and secure your best grades.
                        </motion.p>

                        {/* Animated Pricing Toggle */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-center gap-4"
                        >
                            <span className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className="relative w-16 h-8 rounded-full bg-surface-800 border border-surface-700 p-1 cursor-pointer overflow-hidden shadow-inner flex"
                            >
                                <motion.div
                                    animate={{
                                        x: isYearly ? 32 : 0,
                                        backgroundColor: isYearly ? "#3b82f6" : "#64748b" // brand-500 vs slate-500
                                    }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="w-6 h-6 rounded-full shadow-md z-10"
                                />
                                {/* Glow effect behind toggle */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent pointer-events-none"></div>
                            </button>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>Yearly</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider py-1 px-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Save 20%</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                                className={`relative rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 ${plan.isPopular
                                        ? 'bg-gradient-to-b from-brand-900/40 to-surface-900 border-2 border-brand-500 shadow-[0_0_40px_rgba(59,130,246,0.15)] md:-translate-y-4 md:scale-105 z-10'
                                        : 'bg-surface-800/50 border border-surface-700 hover:border-surface-600 hover:bg-surface-800/80'
                                    }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-brand-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-3 rounded-xl ${plan.isPopular ? 'bg-brand-500/20' : 'bg-surface-700'}`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                                        <p className="text-sm text-slate-400">{plan.description}</p>
                                    </div>
                                </div>

                                <div className="mb-8 flex items-end gap-2">
                                    <span className="text-4xl font-extrabold text-white">
                                        ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                    </span>
                                    <span className="text-slate-400 font-medium mb-1">/mo</span>
                                </div>

                                <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${plan.buttonStyle}`}>
                                    {plan.buttonText}
                                </button>

                                <div className="mt-8 space-y-4">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`mt-0.5 rounded-full p-1 ${plan.isPopular ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-700 text-slate-400'}`}>
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-slate-300 font-medium leading-relaxed">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* FAQ / Trust Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-24 text-center"
                    >
                        <p className="text-slate-400 font-medium">Have questions? Contact our team at <a href="mailto:support@studley.ai" className="text-brand-400 hover:text-brand-300 underline underline-offset-4">support@studley.ai</a></p>
                    </motion.div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
