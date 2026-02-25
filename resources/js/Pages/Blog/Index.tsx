import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { motion } from 'framer-motion';

export default function BlogIndex({ auth }: PageProps) {
    const posts = [
        {
            slug: 'how-to-study-effectively',
            title: "How to Study Effectively for Finals",
            desc: "Proven strategies backed by science to maximize your retention. Learn about active recall, spaced repetition, and the Pomodoro technique.",
            date: "Oct 12, 2025",
            readTime: "5 min read",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
            category: "Study Tips"
        },
        {
            slug: 'ultimate-note-taking-guide',
            title: "The Ultimate Guide to Note Taking",
            desc: "Learn the Cornell method, mapping, and other top note-taking systems to keep your thoughts organized.",
            date: "Sep 28, 2025",
            readTime: "7 min read",
            image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
            category: "Productivity"
        },
        {
            slug: 'ai-in-education',
            title: "AI in Education: A Student's Guide",
            desc: "How to ethically use AI tools to enhance your learning without compromising academic integrity.",
            date: "Sep 15, 2025",
            readTime: "4 min read",
            image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
            category: "Technology"
        },
        {
            slug: 'mental-health-students',
            title: "Balancing Academics and Mental Health",
            desc: "Tips for avoiding burnout and maintaining a healthy work-life balance during the school year.",
            date: "Aug 30, 2025",
            readTime: "6 min read",
            image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
            category: "Wellness"
        },
        {
            slug: 'best-study-apps-2026',
            title: "Top 10 Study Apps for 2026",
            desc: "A curated list of the best applications to boost your productivity and grades this year.",
            date: "Aug 15, 2025",
            readTime: "8 min read",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
            category: "Tools"
        },
        {
            slug: 'exam-day-prep',
            title: "The Morning of the Exam: Checklist",
            desc: "Everything you need to do on the big day to ensure you perform at your absolute best.",
            date: "Jul 20, 2025",
            readTime: "3 min read",
            image: "https://images.unsplash.com/photo-1456324504439-367cee101252?auto=format&fit=crop&w=800&q=80",
            category: "Exam Prep"
        }
    ];

    return (
        <>
            <Head title="Blog - Studley AI" />

            <div className="min-h-screen bg-white dark:bg-studley-dark text-slate-900 dark:text-studley-gray font-sans selection:bg-brand-500/30">

                {/* Navbar */}
                <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 dark:bg-studley-dark/80 backdrop-blur-md border-b border-transparent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            {/* Logo */}
                            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xl group-hover:bg-brand-500 transition-colors">
                                    S
                                </div>
                                <span className="font-bold text-xl tracking-tight">Studley AI</span>
                            </Link>

                            {/* Nav Links (Desktop) */}
                            <div className="hidden md:flex space-x-8">
                                <Link href="/#features" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</Link>
                                <Link href="/blog" className="text-sm font-medium text-brand-600 dark:text-brand-400 transition-colors">Blog</Link>
                            </div>

                            {/* CTAs */}
                            <div className="flex items-center gap-4">
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

                <main className="pt-32 pb-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-block py-1 px-3 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-bold mb-4"
                            >
                                The Studley Blog
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
                            >
                                Latest insights on learning, <br className="hidden md:block" />
                                productivity, and exams.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-slate-600 dark:text-slate-400"
                            >
                                Tips, strategies, and guides to help you achieve your academic goals.
                            </motion.p>
                        </div>

                        {/* Featured Post */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="mb-16"
                        >
                            <div className="relative rounded-3xl overflow-hidden aspect-[21/9] group cursor-pointer">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
                                    alt="Featured"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
                                    <span className="inline-block py-1 px-3 rounded-full bg-brand-600 text-white text-xs font-bold mb-4">
                                        Featured
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-brand-300 transition-colors">
                                        The Science of Learning: How Our Brains Actually Absorb Information
                                    </h2>
                                    <div className="flex items-center gap-4 text-slate-300 text-sm">
                                        <span>Oct 15, 2025</span>
                                        <span>•</span>
                                        <span>Dr. Alice Chen</span>
                                        <span>•</span>
                                        <span>10 min read</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 mb-12 justify-center">
                            {['All Posts', 'Study Tips', 'Productivity', 'Technology', 'Wellness', 'Tools', 'Exam Prep'].map((filter, idx) => (
                                <button
                                    key={idx}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${idx === 0
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent'
                                        : 'bg-transparent border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Posts Grid */}
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {posts.map((post, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                                    }}
                                    whileHover={{ scale: 1.05, translateY: -5 }}
                                    className="group cursor-pointer flex flex-col h-full"
                                >
                                    <div className="rounded-2xl overflow-hidden mb-5 border border-slate-200 dark:border-white/10 relative aspect-[3/2] bg-slate-100 dark:bg-white/5">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg text-xs font-bold shadow-sm">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                            <span>{post.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{post.readTime}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                                            {post.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Load More */}
                        <div className="mt-16 text-center">
                            <button className="px-8 py-3 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-bold">
                                Load More Articles
                            </button>
                        </div>
                    </div>
                </main >

                {/* Footer */}
                < footer className="py-12 border-t border-slate-200 dark:border-white/10" >
                    <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
                        <p>© {new Date().getFullYear()} Studley AI Clone. All rights reserved.</p>
                    </div>
                </footer >
            </div >
        </>
    );
}
