import ApplicationLogo from '@/Components/Layout/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import Lottie from 'lottie-react';
import defaultAnimationData from '../assets/LoginAnimation.json';

interface GuestLayoutProps extends PropsWithChildren {
    illustration?: any;
}

export default function Guest({ children, illustration }: GuestLayoutProps) {
    const animationData = illustration || defaultAnimationData;
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-surface-950 relative overflow-hidden p-4 sm:p-8">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-brand-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-purple-500/10 dark:bg-sky-500/10 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">

                {/* Left Side: Animation & Branding (Hidden on small screens) */}
                <div className="hidden lg:flex flex-col justify-center items-start p-8 relative">
                    <Link href="/" className="mb-12 absolute top-0 left-8">
                        <ApplicationLogo className="h-12 w-auto fill-current text-brand-600 dark:text-white drop-shadow-sm hover:scale-105 transition-transform" />
                    </Link>

                    <div className="w-full relative mt-20 flex flex-col items-center lg:items-start text-center lg:text-left">

                        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
                            Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400">Magic</span> of Learning
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl font-medium max-w-xl mb-12">
                            Join the next generation of students using intelligent planning to conquer their educational goals.
                        </p>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500/10 dark:bg-brand-500/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen w-[120%] h-[120%] animate-pulse-slow -z-10" />

                        <div className="w-full max-w-md relative z-10 drop-shadow-2xl">
                            <Lottie
                                animationData={animationData}
                                loop={true}
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="flex flex-col items-center justify-center w-full">
                    {/* Mobile Logo (Visible only on small screens) */}
                    <div className="lg:hidden mb-8">
                        <Link href="/">
                            <ApplicationLogo className="h-16 w-16 fill-current text-brand-600 dark:text-white drop-shadow-sm" />
                        </Link>
                    </div>

                    <div className="w-full sm:max-w-md px-8 py-10 bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 dark:from-white/5 to-transparent rounded-3xl pointer-events-none" />
                        <div className="relative z-10">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-6 text-slate-500 text-sm z-10 w-full text-center lg:text-left lg:left-8">
                &copy; {new Date().getFullYear()} Studley AI
            </footer>
        </div>
    );
}
