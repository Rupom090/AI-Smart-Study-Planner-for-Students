import { useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';
import { LayoutDashboard, CheckSquare, FileText, Smartphone, Search, Menu, X, ChevronDown, FolderClosed, Layers, MessageSquareText, LogOut, UserCircle2 } from 'lucide-react';
import Dropdown from '@/Components/UI/Dropdown';
import ThemeToggle from '@/Components/Layout/ThemeToggle';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/Components/Layout/GlobalSearch';
import FoldersSidebar from '@/Components/Layout/FoldersSidebar';
import { ToastProvider } from '@/Components/UI/Toast';
import { ErrorBoundary } from '@/Components/UI/ErrorBoundary';

const PAGE_TITLES: Record<string, string> = {
    dashboard: 'Dashboard',
    solve: 'AI Solver',
    'paper-grader': 'Paper Grader',
    flashcards: 'Flashcards',
    'document-chat': 'Document Chat',
    'profile.edit': 'Profile Settings',
};

function getPageTitle(): string {
    for (const [routeName, label] of Object.entries(PAGE_TITLES)) {
        if (route().current(routeName)) return label;
    }
    return 'Studley';
}

function AuthenticatedLayout({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isFoldersOpen, setIsFoldersOpen] = useState(false);

    return (
        <div className="h-screen w-screen overflow-hidden bg-white dark:bg-studley-dark text-slate-900 dark:text-studley-gray font-sans selection:bg-brand-500/30 flex">

            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex flex-col w-64 h-full shrink-0 z-50 bg-white/60 dark:bg-studley-dark/60 backdrop-blur-xl border-r border-brand-200/50 dark:border-white/10 transition-colors duration-300">
                {/* Logo */}
                <div className="h-16 flex items-center px-6">
                    <Link href="/" className="flex items-center gap-2.5 text-brand-600 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md shadow-brand-500/30 shrink-0">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 1L9.5 5.5H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 5.5H6.5L8 1Z" fill="white" fillOpacity="0.95" />
                            </svg>
                        </div>
                        Studley
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                    <Link
                        href={route('dashboard')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${route().current('dashboard')
                            ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02]'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <Link
                        href={route('solve')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${route().current('solve')
                            ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02]'
                            }`}
                    >
                        <CheckSquare size={20} />
                        Solve
                    </Link>

                    <Link
                        href={route('paper-grader')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${route().current('paper-grader')
                            ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02]'
                            }`}
                    >
                        <FileText size={20} />
                        Paper Grader
                    </Link>

                    <Link
                        href={route('flashcards')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${route().current('flashcards')
                            ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02]'
                            }`}
                    >
                        <Layers size={20} />
                        Flashcards
                    </Link>

                    <Link
                        href={route('document-chat')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${route().current('document-chat')
                            ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02]'
                            }`}
                    >
                        <MessageSquareText size={20} />
                        Document Chat
                    </Link>

                    {/* Divider */}
                    <div className="my-2 border-t border-slate-200/50 dark:border-white/5" />

                    <Link
                        href={route('profile.edit')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${route().current('profile.edit')
                            ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02]'
                            }`}
                    >
                        <UserCircle2 size={20} />
                        Profile
                    </Link>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-brand-200/50 dark:border-white/10">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all outline-none">
                                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                                </div>
                                <ChevronDown size={16} className="text-slate-400" />
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content contentClasses="py-1 bg-white dark:bg-studley-dark border border-slate-200 dark:border-white/10 shadow-xl">
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {showingNavigationDropdown && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowingNavigationDropdown(false)}></div>
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-studley-dark shadow-xl transform transition-transform duration-300 lg:hidden ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5">
                    <Link href="/" className="flex items-center gap-2.5 text-brand-600 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md shadow-brand-500/30 shrink-0">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 1L9.5 5.5H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 5.5H6.5L8 1Z" fill="white" fillOpacity="0.95" />
                            </svg>
                        </div>
                        Studley
                    </Link>
                    <button onClick={() => setShowingNavigationDropdown(false)} className="text-slate-500 dark:text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    <Link
                        href={route('dashboard')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${route().current('dashboard')
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => setShowingNavigationDropdown(false)}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    {/* Repeated items for mobile... */}

                    <Link
                        href={route('solve')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${route().current('solve')
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => setShowingNavigationDropdown(false)}
                    >
                        <CheckSquare size={20} />
                        Solve
                    </Link>

                    <Link
                        href={route('paper-grader')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${route().current('paper-grader')
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => setShowingNavigationDropdown(false)}
                    >
                        <FileText size={20} />
                        Paper Grader
                    </Link>

                    <Link
                        href={route('flashcards')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${route().current('flashcards')
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => setShowingNavigationDropdown(false)}
                    >
                        <Layers size={20} />
                        Flashcards
                    </Link>

                    <Link
                        href={route('document-chat')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${route().current('document-chat')
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => setShowingNavigationDropdown(false)}
                    >
                        <MessageSquareText size={20} />
                        Document Chat
                    </Link>

                    <div className="my-2 border-t border-slate-200 dark:border-white/5" />

                    <Link
                        href={route('profile.edit')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${route().current('profile.edit')
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => setShowingNavigationDropdown(false)}
                    >
                        <UserCircle2 size={20} />
                        Profile
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                            <Link href={route('logout')} method="post" as="button" className="text-xs text-brand-500 hover:text-brand-400">
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-slate-50/50 dark:bg-studley-dark/95 transition-colors duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white/80 dark:bg-studley-dark/80 backdrop-blur-xl border-b border-brand-200/50 dark:border-white/10 px-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setShowingNavigationDropdown(true)} className="text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">{getPageTitle()}</span>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href={route('logout')} method="post" as="button" className="text-slate-500 dark:text-slate-400 hover:text-red-500">
                            <LogOut size={20} />
                        </Link>
                    </div>
                </header>

                {/* Top Bar for Desktop (Helpers & Global Search) */}
                <header className="hidden lg:flex h-16 items-center justify-between px-8 gap-6 sticky top-0 z-30 bg-white/70 dark:bg-studley-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5">
                    {/* Active Page Title */}
                    <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {getPageTitle()}
                    </span>

                    <div className="flex items-center gap-6 ml-auto">
                        <GlobalSearch />
                        <button
                            onClick={() => setIsFoldersOpen(true)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors outline-none cursor-pointer text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400`}
                        >
                            <FolderClosed size={18} />
                            Folders
                        </button>
                        <ThemeToggle />
                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>
                        <Link
                            href={route('profile.edit')}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors outline-none cursor-pointer ${
                                route().current('profile.edit')
                                    ? 'text-brand-600 dark:text-brand-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400'
                            }`}
                        >
                            <UserCircle2 size={18} />
                            Profile
                        </Link>
                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex items-center gap-2 text-sm font-medium transition-colors outline-none cursor-pointer text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <LogOut size={18} />
                            Log Out
                        </Link>
                    </div>
                </header>

                {/* Main Slot with Framer Motion Page Transitions */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={usePage().url}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex-1 w-full"
                    >
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </motion.main>
                </AnimatePresence>
            </div>

            <FoldersSidebar
                isOpen={isFoldersOpen}
                onClose={() => setIsFoldersOpen(false)}
            />
        </div>
    );
}

export default function Authenticated(props: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    return (
        <ToastProvider>
            <AuthenticatedLayout {...props} />
        </ToastProvider>
    );
}
