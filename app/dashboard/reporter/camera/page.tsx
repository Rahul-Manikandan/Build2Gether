'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, MapPin, Loader2 } from 'lucide-react';
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

    const [step, setStep] = useState<'camera' | 'details'>('camera');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const handleCapture = (capturedFile: File) => {
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        setStep('details');
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
                userEmail: auth.currentUser?.email || 'anonymous'
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

    if (step === 'camera') {
        return (
            <div className="h-[100dvh] bg-black relative flex flex-col">
                <div className="absolute top-4 left-4 z-50">
                    <Link href="/dashboard/reporter">
                        <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 relative">
                    <CameraCapture
                        onCapture={handleCapture}
                        onCancel={() => router.push('/dashboard/reporter')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => setStep('camera')} disabled={loading}>
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
                <h1 className="ml-2 text-lg font-bold text-slate-800">Add Details</h1>
            </div>

            <div className="p-4 space-y-6 flex-1">
                <div className="h-64 w-full bg-slate-200 rounded-2xl overflow-hidden shadow-md relative">
                    {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {latitude ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Locating...'}
                    </div>
                </div>

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
