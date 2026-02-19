"use client";

import { useState } from "react";
import Image from "next/image";

export default function AnalyzePage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);
        setResult(null);

        if (selectedFile) {
            if (!selectedFile.type.startsWith("image/")) {
                setError("Please upload a valid image file.");
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("/api/analyze-erosion", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to analyze image");
            }

            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Soil Erosion Analysis Tool</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Soil Image
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {preview && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-4 w-full">Image Preview</h2>
                    <div className="relative w-full h-64 md:h-80">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-contain rounded-md"
                        />
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className={`mt-6 px-6 py-2 rounded-full font-bold text-white transition-colors w-full md:w-auto
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
                    >
                        {loading ? "Analyzing..." : "Analyze Image"}
                    </button>
                </div>
            )}

            {result && (
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Analysis Results</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <span className="block text-sm text-gray-500 uppercase tracking-wide">Prediction</span>
                                <span className="text-xl font-bold text-blue-900">{result.prediction}</span>
                            </div>

                            <div>
                                <span className="block text-sm text-gray-500 uppercase tracking-wide">Confidence</span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{ width: `${result.confidence * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{(result.confidence * 100).toFixed(1)}%</span>
                            </div>

                            <div>
                                <span className="block text-sm text-gray-500 uppercase tracking-wide">Soil Analysis</span>
                                <p className="font-medium text-gray-800">{result.soil_analysis.type}</p>
                                <p className="text-sm text-gray-600">Color: {result.soil_analysis.color}</p>
                            </div>
                        </div>

                        <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                            <h3 className="font-semibold text-gray-700">Detailed Metrics</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex justify-between">
                                    <span>Vegetation Coverage:</span>
                                    <span className="font-mono font-bold">{(result.metrics.vegetation * 100).toFixed(1)}%</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Dark/Shadow Areas:</span>
                                    <span className="font-mono font-bold">{(result.metrics.darkness * 100).toFixed(1)}%</span>
                                </li>
                            </ul>

                            {result.reasoning && result.reasoning.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-700 mb-2">Reasoning</h3>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        {result.reasoning.map((r: string, idx: number) => (
                                            <li key={idx}>{r}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
