'use client';
import { useState, useEffect, useRef } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CameraCapture from './CameraCapture';
import { Camera, Upload, X } from 'lucide-react';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { openDB } from 'idb';

export default function ReportForm() {
    const { latitude, longitude, error: geoError } = useGeolocation();
    const isOffline = useOfflineStatus();
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean up preview URL when component unmounts or file changes
    useEffect(() => {
        return () => {
            if (previewUrl && !previewUrl.startsWith('http')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setIsCameraOpen(false);
        }
    };

    const handleCameraCapture = (capturedFile: File) => {
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        setIsCameraOpen(false);
    };

    const clearImage = () => {
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const reportData = {
                description,
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
                status: 'pending',
            };

            if (isOffline) {
                // Save to IndexedDB
                const db1 = await openDB('erosion-reports', 1, {
                    upgrade(db) {
                        if (!db.objectStoreNames.contains('reports')) {
                            db.createObjectStore('reports', { keyPath: 'id', autoIncrement: true });
                        }
                    },
                });
                // We can't store File objects directly in some browsers/IndexedDB implementations efficiently without conversion,
                // but IDB 2.0 supports it. For simplicity, we'll store it as is, assuming modern browser support.
                // If syncing later, we might need value retrieval logic.
                await db1.add('reports', { ...reportData, file, synced: false });
                setMessage('You are offline. Report saved locally and will sync later.');
            } else {
                // Upload image if exists
                let imageUrl = '';
                if (file) {
                    const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
                    await uploadBytes(storageRef, file);
                    imageUrl = await getDownloadURL(storageRef);
                }

                // Save to Firestore
                await addDoc(collection(db, 'reports'), {
                    ...reportData,
                    imageUrl,
                    synced: true
                });
                setMessage('Report submitted successfully!');
            }

            // Reset form
            setDescription('');
            clearImage();
        } catch (err) {
            console.error(err);
            setMessage('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto shadow-lg border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-800">Submit Erosion Report</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {isOffline && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 mb-4 rounded-md text-sm flex items-center">
                        <span className="mr-2">⚠️</span> You are currently offline. Reports will be saved to your device.
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                            placeholder="Describe the soil erosion details..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="text-sm bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Location</span>
                            <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">
                                {latitude ? 'GPS LOCKED' : 'SEARCHING...'}
                            </span>
                        </div>
                        <div className="text-slate-600 font-mono text-xs mt-1">
                            {latitude ? `${latitude.toFixed(6)}, ${longitude?.toFixed(6)}` : 'Fetching coordinates...'}
                        </div>
                        {geoError && <span className="text-red-500 block text-xs mt-1 font-medium">{geoError}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Photo Evidence</label>

                        {!isCameraOpen && !previewUrl && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2 border-dashed border-2 hover:bg-slate-50 hover:border-blue-400 transition-all"
                                    onClick={() => setIsCameraOpen(true)}
                                >
                                    <Camera className="h-6 w-6 text-slate-500" />
                                    <span>Take Photo</span>
                                </Button>
                                <div className="relative">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-24 flex flex-col gap-2 border-dashed border-2 hover:bg-slate-50 hover:border-blue-400 transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-6 w-6 text-slate-500" />
                                        <span>Upload File</span>
                                    </Button>
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        )}

                        {isCameraOpen && (
                            <CameraCapture
                                onCapture={handleCameraCapture}
                                onCancel={() => setIsCameraOpen(false)}
                            />
                        )}

                        {previewUrl && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8 rounded-full shadow-md"
                                        onClick={clearImage}
                                        title="Remove image"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="p-2 text-xs text-center text-slate-500 bg-white border-t border-slate-100">
                                    {file?.name}
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium shadow-md transition-all hover:translate-y-[-1px]"
                        disabled={loading || (!latitude && !isOffline)}
                    >
                        {loading ? 'Submitting Report...' : 'Submit Report'}
                    </Button>

                    {message && (
                        <div className={`p-3 rounded-md text-sm font-medium text-center animate-in fade-in slide-in-from-bottom-2 ${message.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
