import { NextRequest, NextResponse } from 'next/server';
import { classifyErosion } from '@/lib/erosion-classifier';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Analyze using the classifier
        const result = await classifyErosion(buffer as any);

        if ('error' in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error processing upload:', error);
        return NextResponse.json(
            { error: 'Internal server error processing image' },
            { status: 500 }
        );
    }
}
