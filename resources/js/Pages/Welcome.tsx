import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import ThemeToggle from '@/Components/ThemeToggle';
import HeroAnimation from '@/Components/HeroAnimation';
import Lottie from 'lottie-react';
import robotAnimation from '@/assets/RobotAnimation.json';
import studySmarterAnimation from '@/assets/StudySmarterAnimation.json';

export default function Welcome({ auth, laravelVersion, phpVersion }: PageProps<{ laravelVersion: string, phpVersion: string }>) {
    return (
        <MainLayout>
            <Head title="Studley AI Study Tool – Ace Your Exams & Crush Your Homework" />

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 dark:bg-studley-dark/80 backdrop-blur-md border-b border-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xl">
                                S
                            </div>
                            <span className="font-bold text-xl tracking-tight">Studley AI</span>
                        </div>

                        {/* Nav Links (Desktop) */}
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
                            <Link href="/blog" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Blog</Link>
                            <Link href={route('pricing')} className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Pricing</Link>
                        </div>

                        {/* CTAs */}
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors hidden sm:block"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all transform hover:scale-105"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
                                }
                            }}
                            className="text-left max-w-2xl"
                        >
                            <motion.h1
                                variants={{
                                    hidden: { opacity: 0, x: -30 },
                                    visible: {
                                        opacity: 1,
                                        x: 0,
                                        transition: { type: "spring", stiffness: 100, damping: 20 }
                                    }
                                }}
                                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
                            >
                                Ace Your Exams & <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 animate-pulse">
                                    Crush Your Homework
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
                                }}
                                className="text-xl sm:text-2xl text-slate-800 dark:text-slate-300 mb-10 leading-relaxed"
                            >
                                Master any subject with Studley AI. Trusted by more than 1,000,000 top students. Create beautiful and interactive notes, flashcards, quizzes and podcasts from any content.
                            </motion.p>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                                }}
                                className="flex flex-col sm:flex-row gap-4 justify-start items-center"
                            >
                                <Link
                                    href={route('register')}
                                    className="relative overflow-hidden group px-8 py-4 rounded-full bg-brand-600 text-white text-lg font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.5)] w-full sm:w-auto text-center"
                                >
                                    <span className="relative z-10">Get Started for Free</span>
                                    {/* Hover Glow Effect inside button */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>
                                <Link
                                    href={route('onboarding')}
                                    className="px-8 py-4 rounded-full border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-lg font-bold hover:border-brand-500 dark:hover:border-brand-400 transition-all w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm text-center"
                                >
                                    View Onboarding Flow
                                </Link>
                            </motion.div>

                            <motion.p
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { duration: 1 } }
                                }}
                                className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide"
                            >
                                No credit card required · Free plan available
                            </motion.p>
                        </motion.div>

                        {/* Lottie Animation Column */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                            className="hidden lg:block w-full"
                        >
                            <HeroAnimation />
                        </motion.div>
                    </div>
                </div>

                {/* Background Details after removing 3D canvas */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-screen" />

            </main>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-slate-50 dark:bg-white/5 scroll-mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to study smarter</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Comprehensive tools to help you master any subject.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Animation */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="w-full drop-shadow-2xl flex justify-center lg:justify-start"
                        >
                            <div className="w-full max-w-[300px] lg:max-w-[400px] mix-blend-multiply dark:mix-blend-screen overflow-hidden rounded-3xl relative">
                                <div className="absolute inset-0 bg-white/5 dark:bg-black/5 mix-blend-overlay z-10 pointer-events-none"></div>
                                <Lottie
                                    animationData={studySmarterAnimation}
                                    loop={true}
                                    style={{ width: '100%', height: 'auto', filter: 'contrast(1.1)' }}
                                    className="dark:invert dark:hue-rotate-180"
                                />
                            </div>
                        </motion.div>

                        {/* Right: Features Grid */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 }
                                }
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center"
                        >
                            {[
                                { title: 'Upload Anything', desc: 'PDFs, Powerpoint, Youtube videos.', icon: '📄' },
                                { title: 'Interactive Notes', desc: 'Get beautiful, summarized notes.', icon: '📝' },
                                { title: 'Smart Quizzes', desc: 'Test your knowledge with AI.', icon: '🧠' },
                                { title: 'Flashcards', desc: 'Memorize terms automatically.', icon: '⚡' },
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                                    }}
                                    whileHover={{ scale: 1.05, translateY: -5 }}
                                    className="p-6 rounded-2xl bg-white dark:bg-studley-dark border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-brand-500/50 transition-all group relative overflow-hidden glass-card"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10 text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-300 drop-shadow-sm">{feature.icon}</div>
                                    <h3 className="relative z-10 text-lg font-bold mb-2">{feature.title}</h3>
                                    <p className="relative z-10 text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section id="blog" className="py-24 bg-white dark:bg-studley-dark scroll-mt-16 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="text-left"
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Latest Study Tips</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400">Guides and strategies to help you ace your exams.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="w-full drop-shadow-2xl flex justify-center lg:justify-end"
                        >
                            <div className="max-w-[280px] w-full">
                                <Lottie
                                    animationData={robotAnimation}
                                    loop={true}
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.15 }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                title: "How to Study Effectively for Finals",
                                desc: "Proven strategies backed by science to maximize your retention.",
                                date: "Oct 12, 2025",
                                readTime: "5 min read",
                                image: "https://picsum.photos/seed/study1/800/600"
                            },
                            {
                                title: "The Ultimate Guide to Note Taking",
                                desc: "Learn the Cornell method and other top note-taking systems.",
                                date: "Sep 28, 2025",
                                readTime: "7 min read",
                                image: "https://picsum.photos/seed/study2/800/600"
                            },
                            {
                                title: "AI in Education: A Student's Guide",
                                desc: "How to ethically use AI tools to enhance your learning.",
                                date: "Sep 15, 2025",
                                readTime: "4 min read",
                                image: "https://picsum.photos/seed/study3/800/600"
                            }
                        ].map((post, idx) => (
                            <motion.div
                                key={idx}
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
                                }}
                                whileHover={{ y: -8 }}
                                className="group cursor-pointer bg-white dark:bg-studley-dark rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all duration-300"
                            >
                                <div className="rounded-xl overflow-hidden mb-5 border border-slate-200 dark:border-white/10 relative">
                                    <div className="aspect-[16/9] bg-slate-100 dark:bg-white/5 overflow-hidden">
                                        <motion.img
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.4 }}
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-brand-600 dark:text-brand-400 font-medium mb-3">
                                    <span>{post.date}</span>
                                    <span>•</span>
                                    <span>{post.readTime}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">{post.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm leading-relaxed">{post.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>



            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
                    <p>© {new Date().getFullYear()} Studley AI Clone. All rights reserved.</p>
                </div>
            </footer>
        </MainLayout>
    );
}
