/* eslint-disable react-hooks/purity */
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

// Generate random particle configs outside component to ensure purity
const generateParticleConfigs = () =>
    Array.from({ length: 6 }, () => ({
        initialX: Math.random() * 100,
        animateXStart: Math.random() * 100,
        animateXEnd: (Math.random() * 100) + (Math.random() > 0.5 ? 5 : -5),
        duration: Math.random() * 10 + 20,
        delay: Math.random() * 5,
    }));

export const AnimatedBackground = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 50, stiffness: 400 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - 250); // Offset to center (500px width/2)
            mouseY.set(e.clientY - 250); // Offset to center (500px height/2)
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    // Use ref to store random values computed once
    const particleConfigsRef = useRef(generateParticleConfigs());
    const particleConfigs = particleConfigsRef.current;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Background: Deep Navy to Charcoal Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0E14] via-[#0E1116] to-[#12141A]" />

            {/* Global Noise Texture */}
            <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-20" />

            {/* Interactive Mouse Glow */}
            <motion.div
                style={{ x: springX, y: springY }}
                className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-40 mix-blend-screen"
            />

            {/* Ambient Glows */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[120px] mix-blend-screen"
            />

            {/* Grid Overlay */}
            <div className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                }}
            />

            {/* Floating Data Particles */}
            {particleConfigs.map((config, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 0, x: `${config.initialX}vw` }}
                    animate={{
                        opacity: [0, 1, 0],
                        y: [0, "-120vh"],
                        x: [`${config.animateXStart}vw`, `${config.animateXEnd}vw`]
                    }}
                    transition={{
                        duration: config.duration,
                        repeat: Infinity,
                        delay: config.delay,
                        ease: "linear"
                    }}
                    className="absolute w-1 h-1 bg-white/40 rounded-full blur-[1px]"
                    style={{
                        top: "100%",
                        left: 0
                    }}
                />
            ))}
        </div>
    );
};
