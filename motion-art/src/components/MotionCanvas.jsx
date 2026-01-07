
import React, { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const DRAG = 0.96;
const GRAVITY = -0.15; // Upward anti-gravity for fire

export default function MotionCanvas() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);

    const particles = useRef([]);
    const handLandmarkerRef = useRef(null);
    const requestRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const setup = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                if (!mounted) return;

                handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 2
                });

                startCamera();
            } catch (error) {
                console.error("Error initializing MediaPipe:", error);
                setError(error.message);
            }
        };

        setup();

        return () => {
            mounted = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            // safe cleanup for mediadpipe?
        };
    }, []);

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Browser API navigator.mediaDevices.getUserMedia not available");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1280,
                    height: 720,
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.addEventListener('loadeddata', () => {
                    setIsLoaded(true);
                    predictWebcam();
                });
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setError("Error accessing webcam: " + err.message);
        }
    };

    const createParticle = (x, y) => {
        const angle = Math.random() * Math.PI * 2;
        // Explosive burst speed
        const speed = Math.random() * 4 + 1;

        // Fire Colors: Red (0) to Yellow (50)
        // Weighted towards orange/red
        const hue = Math.random() * 50;

        return {
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1, // Slight initial upward velocity
            life: 1.0,
            decay: Math.random() * 0.03 + 0.01,
            hue: hue,
            size: Math.random() * 6 + 2,
            wobble: Math.random() * 0.2 - 0.1
        };
    };

    const predictWebcam = () => {
        if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Resize canvas to match video if needed (handling device pixel ratio is better but keep simple)
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
        }

        let startTimeMs = performance.now();

        if (video.currentTime > 0) {
            const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
                // console.log("Hands detected:", results.landmarks.length); 
                for (const landmarks of results.landmarks) {
                    // Index tip (8), Thumb tip (4), Middle tip (12), Ring tip (16), Pinky tip (20)
                    // Let's emit from all tips for fuller effect
                    const tips = [4, 8, 12, 16, 20];

                    tips.forEach(idx => {
                        const point = landmarks[idx];
                        const px = point.x * canvas.width;
                        const py = point.y * canvas.height;

                        // Emit multiple particles for density
                        for (let k = 0; k < 2; k++) {
                            particles.current.push(createParticle(px, py));
                        }
                    });
                }
            }
        }

        // Darker clear for higher contrast with fire
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'lighter'; // Additive blending makes it glow

        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= DRAG;
            p.vx += p.wobble; // Horizontal flicker
            p.vy *= DRAG;
            p.vy += GRAVITY; // Rise up
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.current.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            // High saturation, varying lightness for "hot" look
            ctx.fillStyle = `hsla(${p.hue}, 100%, ${50 + (1 - p.life) * 20}%, ${p.life})`;
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';

        requestRef.current = requestAnimationFrame(predictWebcam);
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'black', overflow: 'hidden' }}>
            {!isLoaded && !error && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', color: 'white', zIndex: 10
                }}>
                    <h2>Loading AI Vision...</h2>
                </div>
            )}

            {error && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', color: 'red', zIndex: 10, textAlign: 'center'
                }}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <p style={{ fontSize: '0.8em', color: '#ccc' }}>Please make sure your camera is allowed and not used by another application.</p>
                </div>
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    opacity: 0.05 // barely visible for reference
                }}
            />

            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Match video mirror
                }}
            />

            <div style={{
                position: 'absolute', bottom: 30, left: 30,
                color: '#888', fontFamily: 'system-ui', pointerEvents: 'none'
            }}>
                <h1>Motion Art</h1>
                <p>Move your hands to paint with light.</p>
            </div>
        </div>
    );
}
