import { Report } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Image from 'next/image';

interface ReportCardProps {
    report: Report;
    onStatusChange?: (id: string, newStatus: Report['status']) => void;
}

export default function ReportCard({ report, onStatusChange }: ReportCardProps) {
    const handleStatusUpdate = async (newStatus: Report['status']) => {
        try {
            const reportRef = doc(db, 'reports', report.id);
            await updateDoc(reportRef, { status: newStatus });
            if (onStatusChange) {
                onStatusChange(report.id, newStatus);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 py-3 border-b border-slate-100">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">{new Date(report.timestamp).toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                        }`}>{report.status}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {report.imageUrl && (
                    <div className="relative h-48 w-full bg-slate-100 rounded-md overflow-hidden">
                        <Image src={report.imageUrl} alt="Erosion evidence" fill className="object-cover" />
                    </div>
                )}
                <div>
                    <h4 className="font-medium text-sm text-slate-900 mb-1">Description</h4>
                    <p className="text-slate-700 text-sm">{report.description}</p>
                </div>
                <div>
                    <h4 className="font-medium text-sm text-slate-900 mb-1">Location</h4>
                    <p className="text-slate-500 text-xs font-mono">
                        {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="bg-slate-50 p-3 border-t border-slate-100 flex gap-2 justify-end">
                {report.status !== 'reviewed' && report.status !== 'resolved' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('reviewed')} className="h-8 text-xs">Mark Reviewed</Button>
                )}
                {report.status !== 'resolved' && (
                    <Button variant="default" size="sm" onClick={() => handleStatusUpdate('resolved')} className="h-8 text-xs bg-green-600 hover:bg-green-700">Resolve</Button>
                )}
            </CardFooter>
        </Card>
    );
}
