'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, MapPin, Loader2, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import CameraCapture from '@/components/forms/CameraCapture';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { db, storage, auth } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { openDB } from 'idb';
import Link from 'next/link';

export default function CameraPage() {
    const router = useRouter();
    const { latitude, longitude } = useGeolocation();
    const isOffline = useOfflineStatus();

    // Steps: selection -> camera (optional) -> details
    const [step, setStep] = useState<'selection' | 'camera' | 'details'>('selection');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);

    const handleCapture = (capturedFile: File) => {
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        setStep('details');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setLoading(true);
        setStatusMsg('Analyzing image...');

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);

            const response = await fetch("/api/analyze-erosion", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Analysis failed:", data.error);
                // Continue to details even if analysis fails, but warn user?
            } else {
                setAiAnalysis(data);
                // Pre-fill description with analysis
                const analysisText = `AI Analysis: ${data.prediction}\nConfidence: ${(data.confidence * 100).toFixed(1)}%\nSoil: ${data.soil_analysis.type} (${data.soil_analysis.color})\nReasoning: ${data.reasoning.join(', ')}`;
                setDescription(analysisText);
            }
        } catch (err) {
            console.error("Analysis error:", err);
        } finally {
            setLoading(false);
            setStatusMsg('');
            setStep('details');
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        if (!auth.currentUser && !isOffline) {
            alert("You seem to be logged out. Please sign in again.");
            router.push('/signin');
            return;
        }

        setLoading(true);
        setStatusMsg('Initializing...');

        try {
            let imageUrl = null;
            const reportData = {
                description,
                latitude: latitude || 0,
                longitude: longitude || 0,
                timestamp: new Date().toISOString(),
                status: 'pending',
                userId: auth.currentUser?.uid || 'anonymous',
                userEmail: auth.currentUser?.email || 'anonymous',
                aiAnalysis: aiAnalysis || null // Store AI result if available
            };

            if (isOffline) {
                setStatusMsg('Saving locally...');
                const db1 = await openDB('erosion-reports', 1);
                await db1.add('reports', { ...reportData, file, synced: false });
                alert('Saved offline!');
            } else {
                // Upload
                setStatusMsg('Uploading image (Timeout: 60s)...');
                console.log("Starting upload to bucket:", storage.app.options.storageBucket);

                try {
                    const fileExt = file.name.split('.').pop() || 'jpg';
                    const fileName = `${Date.now()}_${auth.currentUser?.uid || 'anon'}.${fileExt}`;
                    const storageRef = ref(storage, `reports/${fileName}`);

                    // Timeout: 60 seconds
                    const timeout = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Upload timed out (60s)")), 60000)
                    );

                    const snapshot: any = await Promise.race([
                        uploadBytes(storageRef, file),
                        timeout
                    ]);

                    imageUrl = await getDownloadURL(snapshot.ref);
                    console.log("Upload success, URL:", imageUrl);

                } catch (uploadError: any) {
                    console.error("Upload failed:", uploadError);
                    alert(`Image upload failed: ${uploadError.message}. Saving report text only.`);
                }

                setStatusMsg('Saving details...');
                await addDoc(collection(db, 'reports'), {
                    ...reportData,
                    imageUrl,
                    synced: true
                });
            }

            setStatusMsg('Success! Redirecting...');
            alert('Report Submitted!');
            window.location.href = '/dashboard/reporter';

        } catch (error: any) {
            console.error("Submit error:", error);
            alert(`Critical Error: ${error.message}`);
            setLoading(false);
            setStatusMsg('Error. Tap submit to retry.');
        }
    };

    if (step === 'selection') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col p-6">
                <div className="mb-6">
                    <Link href="/dashboard/reporter">
                        <Button variant="ghost" className="-ml-3 text-slate-600">
                            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 mt-4">New Report</h1>
                    <p className="text-slate-500">Choose how you want to capture the erosion.</p>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-6 max-w-md mx-auto w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-slate-600 font-medium">{statusMsg || 'Processing...'}</p>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep('camera')}
                                className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-primary hover:shadow-md transition-all group"
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                    <Camera className="w-8 h-8 text-blue-600" />
                                </div>
                                <span className="text-lg font-bold text-slate-800">Live Camera</span>
                                <span className="text-sm text-slate-500 mt-1">Take a photo now</span>
                            </button>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all group">
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                                        <Upload className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <span className="text-lg font-bold text-slate-800">Upload File</span>
                                    <span className="text-sm text-slate-500 mt-1">Select from Gallery</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (step === 'camera') {
        return (
            <div className="h-[100dvh] bg-black relative flex flex-col">
                <div className="absolute top-4 left-4 z-50">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={() => setStep('selection')}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </div>

                <div className="flex-1 relative">
                    <CameraCapture
                        onCapture={handleCapture}
                        onCancel={() => setStep('selection')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => setStep('selection')} disabled={loading}>
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
                <h1 className="ml-2 text-lg font-bold text-slate-800">Add Details</h1>
            </div>

            <div className="p-4 space-y-6 flex-1">
                <div className="h-64 w-full bg-slate-200 rounded-2xl overflow-hidden shadow-md relative group">
                    {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {latitude ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Locating...'}
                    </div>
                </div>

                {aiAnalysis && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900 text-sm">AI Analysis Result</h3>
                                <p className="text-xs text-blue-700 mt-1">
                                    <span className="font-semibold">{aiAnalysis.prediction}</span> ({(aiAnalysis.confidence * 100).toFixed(0)}% confidence)
                                </p>
                                <p className="text-[10px] text-blue-600 mt-1">
                                    Detected {aiAnalysis.soil_analysis.type}. {aiAnalysis.reasoning[0]}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What kind of erosion is this?"
                            className="w-full p-4 rounded-xl border border-slate-200 shadow-sm bg-white text-slate-900 placeholder:text-slate-400 min-h-[120px] focus:ring-2 focus:ring-primary focus:outline-none"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <Button
                    size="lg"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 text-lg font-medium"
                    onClick={handleSubmit}
                    disabled={loading || !description}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {statusMsg || 'Submitting...'}
                        </>
                    ) : (
                        <>
                            Submit Report <Check className="ml-2 w-5 h-5" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
