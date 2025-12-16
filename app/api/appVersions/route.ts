import { NextResponse } from 'next/server';

export async function GET() {
    const data = {
        "Volt":0
    };

    return NextResponse.json(data);
}