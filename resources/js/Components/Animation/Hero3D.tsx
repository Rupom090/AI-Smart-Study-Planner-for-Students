import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero3D() {
    const [isLoading, setIsLoading] = useState(true);

    // We are using a premium, free community abstract 3D mesh template that matches the AI/Tech vibe.
    // It features interactive, fluid-like glowing geometries that respond to mouse movements.
    const splineSceneUrl = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";

    function onLoad() {
        setIsLoading(false);
    }

    return (
        <div className="absolute inset-0 w-full h-full -z-10 bg-studley-dark overflow-hidden">
            {/* Loading State Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center bg-studley-dark z-10"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-brand-400 font-medium tracking-widest text-sm animate-pulse">INITIATING <span className="text-white">//</span> 3D SCENE</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spline Canvas Render */}
            <div className="w-full h-full transform scale-110 lg:scale-100 opacity-80 mix-blend-screen transition-opacity duration-1000 ease-in-out cursor-crosshair">
                <Spline
                    scene={splineSceneUrl}
                    onLoad={onLoad}
                    className="w-full h-full"
                />
            </div>

            {/* Ambient Overlay Gradients to blend 3D canvas with app text */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-studley-dark/90" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-studley-dark/60" />
        </div>
    );
}
