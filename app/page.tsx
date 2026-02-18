import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-slate-900">
            Soil Erosion Reporting System
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Empowering communities to monitor and report soil erosion with real-time geolocation and offline support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mx-auto">
          <Card className="hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">For Reporters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">Capture photos and location data even when offline.</p>
              <Link href="/dashboard/reporter" className="w-full block">
                <Button className="w-full bg-green-600 hover:bg-green-700">Submit Report</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">For Supervisors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">Review submissions and manage incident resolution.</p>
              <Link href="/dashboard/supervisor" className="w-full block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-sm text-slate-400 pt-12">
          <p>Built with Next.js, Firebase, and Tailwind CSS.</p>
        </div>
      </div>
    </div>
  );
}
