'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, MapPin } from 'lucide-react';
import CameraCapture from '@/components/forms/CameraCapture';
import { Input } from '@/components/ui/input';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { db, storage } from '@/lib/firebase/config';
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

    const handleCapture = (capturedFile: File) => {
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        setStep('details');
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);

        try {
            // ... Same logic as ReportForm ...
            // Simplified for this view:

            const reportData = {
                description,
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
                status: 'pending',
            };

            if (isOffline) {
                const db1 = await openDB('erosion-reports', 1);
                await db1.add('reports', { ...reportData, file, synced: false });
            } else {
                // Upload
                const fileExt = file.name.split('.').pop() || 'jpg';
                const fileName = `${Date.now()}_report.${fileExt}`;
                const storageRef = ref(storage, `reports/${fileName}`);

                const snapshot = await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(snapshot.ref);

                await addDoc(collection(db, 'reports'), {
                    ...reportData,
                    imageUrl,
                    synced: true
                });
            }

            router.push('/dashboard/reporter'); // Go back to dashboard after submit

        } catch (error) {
            console.error("Submit error:", error);
            // Handle error UI
        } finally {
            setLoading(false);
        }
    };

    if (step === 'camera') {
        return (
            <div className="h-screen bg-black relative flex flex-col">
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
            {/* Header */}
            <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => setStep('camera')}>
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
                <h1 className="ml-2 text-lg font-bold text-slate-800">Add Details</h1>
            </div>

            <div className="p-4 space-y-6 flex-1">
                {/* Preview */}
                <div className="h-64 w-full bg-slate-200 rounded-2xl overflow-hidden shadow-md relative">
                    {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {latitude ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Locating...'}
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What kind of erosion is this?"
                            className="w-full p-4 rounded-xl border-none shadow-sm bg-white min-h-[120px] focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-white border-t border-slate-100">
                <Button
                    size="lg"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 text-lg font-medium"
                    onClick={handleSubmit}
                    disabled={loading || !description}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                    {!loading && <Check className="ml-2 w-5 h-5" />}
                </Button>
            </div>
        </div>
    );
}
