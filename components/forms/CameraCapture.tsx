'use client';

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, X } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [error, setError] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            // Convert base64 to File
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                });
        }
    }, [webcamRef, onCapture]);

    const toggleCamera = () => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
        setError(null);
        setIsLoading(true);
    };

    const handleUserMediaError = useCallback((err: string | DOMException) => {
        console.error('Camera Error:', err);
        let message = 'Could not access camera.';
        let details = '';

        if (typeof err === 'string') {
            details = err;
        } else {
            details = `${err.name}: ${err.message}`;
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                message = 'Camera permission denied. Please allow access in your browser settings.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                message = 'No camera found. Please ensure your device has a camera.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                message = 'Camera is currently in use by another application.';
            } else if (err.name === 'OverconstrainedError') {
                message = 'Camera constraints not satisfied (e.g., missing requested resolution or facing mode).';
            }
        }

        setError(message);
        setErrorDetails(details);
        setIsLoading(false);
    }, []);

    const handleUserMedia = useCallback(() => {
        console.log('Camera loaded successfully');
        setError(null);
        setErrorDetails(null);
        setIsLoading(false);
    }, []);

    const handleRetry = () => {
        setError(null);
        setErrorDetails(null);
        setIsLoading(true);
    };

    return (
        <div className="relative w-full h-[400px] bg-slate-900 rounded-lg overflow-hidden flex flex-col items-center justify-center">
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="ml-2">Starting camera...</span>
                </div>
            )}

            {error ? (
                <div className="text-white text-center p-4 z-20 max-w-[90%]">
                    <p className="text-red-400 font-bold mb-2">Camera Error</p>
                    <p className="text-sm mb-2">{error}</p>
                    {errorDetails && <p className="text-xs text-slate-400 font-mono bg-black/50 p-2 rounded mb-4">{errorDetails}</p>}
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" className="text-black" onClick={handleRetry}>Retry</Button>
                        <Button variant="ghost" className="text-white hover:bg-white/20" onClick={onCancel}>Close</Button>
                    </div>
                </div>
            ) : (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        facingMode: facingMode,
                        // Removing width/height constraints to reduce OverconstrainedError risk
                    }}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            <div className="absolute top-4 right-4 z-30">
                <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/20 rounded-full">
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {!error && !isLoading && (
                <div className="absolute bottom-6 flex gap-4 items-center z-30 w-full justify-center px-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleCamera}
                        className="rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/20"
                        title="Switch Camera"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </Button>

                    <Button
                        onClick={capture}
                        className="h-16 w-16 rounded-full bg-white border-4 border-slate-200 hover:bg-slate-100 p-0 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                        title="Take Photo"
                    >
                        <div className="h-12 w-12 rounded-full bg-red-500 border-2 border-white" />
                    </Button>

                    <div className="w-10" /> {/* Spacer for balance */}
                </div>
            )}
        </div>
    );
}
