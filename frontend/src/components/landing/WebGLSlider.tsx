'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            mesh: any;
            planeGeometry: any;
            shaderMaterial: any;
        }
    }
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform sampler2D disp;
  uniform float dispFactor;
  uniform float effectFactor;

  void main() {
    vec2 uv = vUv;
    vec4 _disp = texture2D(disp, uv);
    vec2 distortedPosition = vec2(uv.x + dispFactor * (_disp.r * effectFactor), uv.y);
    vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (_disp.r * effectFactor), uv.y);
    vec4 _texture1 = texture2D(texture1, distortedPosition);
    vec4 _texture2 = texture2D(texture2, distortedPosition2);
    vec4 finalTexture = mix(_texture1, _texture2, dispFactor);
    
    // Scanlines
    float scanline = sin(uv.y * 800.0) * 0.04;
    finalTexture.rgb -= scanline;
    
    // Vignette
    float vignette = distance(uv, vec2(0.5));
    finalTexture.rgb *= 1.0 - vignette * 0.5;

    gl_FragColor = finalTexture;
  }
`;

function SliderMesh({ currentIdx, prevIdx, progress }: { currentIdx: number, prevIdx: number, progress: number }) {
    const images = [
        '/images/slider/slide1.png',
        '/images/slider/slide2.png',
        '/images/slider/slide3.png'
    ];

    const textures = useTexture(images);
    const dispTexture = useTexture('/images/slider/disp.png');

    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.dispFactor.value = progress;
        }
    });

    const uniforms = useMemo(() => ({
        texture1: { value: textures[prevIdx] },
        texture2: { value: textures[currentIdx] },
        disp: { value: dispTexture },
        dispFactor: { value: 0 },
        effectFactor: { value: 0.1 }
    }), [prevIdx, currentIdx, textures, dispTexture]);

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.texture1.value = textures[prevIdx];
            materialRef.current.uniforms.texture2.value = textures[currentIdx];
        }
    }, [prevIdx, currentIdx, textures]);

    return (
        <mesh scale={[1.7, 1, 1]}>
            <planeGeometry args={[10, 10]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

const slides = [
    {
        title: "Casablanca Command",
        subtitle: "Sovereign AI Infrastructure",
        description: "Decentralized neural networks processing petabytes of telemetry across the African digital corridor."
    },
    {
        title: "Tactical Emulation",
        subtitle: "Advanced Threat Simulation",
        description: "Proactive adversary replication using state-of-the-art WebGL visualizations and real-time engine metrics."
    },
    {
        title: "Sentinel Oversight",
        subtitle: "Real-time Global Intel",
        description: "Unified dashboard with predictive analytics and automated response protocols for the modern enterprise."
    }
];

export function WebGLSlider() {
    const [current, setCurrent] = useState(0);
    const [prev, setPrev] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasError, setHasError] = useState(false);

    const nextSlide = () => {
        if (isAnimating) return;
        handleTransition((current + 1) % slides.length);
    };

    const prevSlide = () => {
        if (isAnimating) return;
        handleTransition((current - 1 + slides.length) % slides.length);
    };

    const handleTransition = (nextIdx: number) => {
        if (isAnimating) return;
        setPrev(current);
        setCurrent(nextIdx);

        setIsAnimating(true);
        let start = performance.now();
        const duration = 1500;

        const tick = (now: number) => {
            let time = now - start;
            let p = Math.min(time / duration, 1);
            let easeP = 1 - Math.pow(1 - p, 4); // Quartic ease out
            setProgress(easeP);
            if (p < 1) {
                requestAnimationFrame(tick);
            } else {
                setIsAnimating(false);
                setPrev(nextIdx);
                setProgress(0);
            }
        };
        requestAnimationFrame(tick);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            handleTransition((current + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [current, isAnimating]);

    if (hasError) {
        return <div className="w-full h-[600px] md:h-[800px] bg-bg-1 rounded-[48px] flex items-center justify-center text-text-3 border border-white/5 shadow-2xl">WebGL Displacement Engine Offline</div>;
    }

    return (
        <div className="relative w-full h-[600px] md:h-[800px] rounded-[48px] overflow-hidden group shadow-2xl border border-white/5 bg-bg-1">
            <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="w-full h-full bg-bg-1 animate-pulse" />}>
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 75 }}
                        onCreated={({ gl }) => {
                            gl.setClearColor(new THREE.Color('#07060B'));
                        }}
                    >
                        <SliderMesh currentIdx={current} prevIdx={prev} progress={progress} />
                    </Canvas>
                </Suspense>
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-bg-0 via-bg-0/30 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-0 via-transparent to-transparent pointer-events-none z-10" />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 md:px-24 max-w-4xl pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-p-500/10 border border-p-500/20 text-p-400 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-3xl">
                            {slides[current].subtitle}
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                            {slides[current].title.split(' ')[0]} <br />
                            <span className="text-p-400">{slides[current].title.split(' ')[1]}</span>
                        </h2>
                        <p className="text-xl text-text-2 max-w-xl font-bold opacity-60 leading-relaxed">
                            {slides[current].description}
                        </p>
                        <div className="pt-8 pointer-events-auto">
                            <button className="flex items-center gap-4 group/btn">
                                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center group-hover/btn:bg-p-400 transition-colors">
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                                <span className="text-sm font-black text-white uppercase tracking-[0.2em] group-hover/btn:text-p-400 transition-colors">Explore Intelligence</span>
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Indicators */}
            <div className="absolute bottom-12 right-12 z-20 flex items-center gap-6">
                <div className="flex items-center gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleTransition(i)}
                            className={`h-2 transition-all duration-500 rounded-full ${i === current ? 'w-12 bg-p-400' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                        />
                    ))}
                </div>
                <div className="h-10 w-px bg-white/10 mx-2" />
                <div className="flex items-center gap-4">
                    <button
                        onClick={prevSlide}
                        className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                        aria-label="Previous slide"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                        aria-label="Next slide"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
