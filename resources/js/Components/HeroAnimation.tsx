import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/WebDesignIllustration.json';

export default function HeroAnimation() {
    return (
        <div className="w-full max-w-lg lg:max-w-2xl mx-auto flex items-center justify-center relative">
            <div className="absolute inset-0 bg-brand-500/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen scale-75 animate-pulse-slow -z-10" />
            <Lottie
                animationData={animationData}
                loop={true}
                style={{ width: '100%', height: 'auto' }}
                className="filter drop-shadow-2xl"
            />
        </div>
    );
}
