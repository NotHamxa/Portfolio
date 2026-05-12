import { NextRequest, NextResponse } from 'next/server'
import { recordEvent } from '@/lib/telemetry'

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400, headers: CORS_HEADERS })
    }

    const projectName = typeof body.projectName === 'string' ? body.projectName.trim() : ''
    const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : ''
    const event = typeof body.event === 'string' ? body.event.trim() : ''
    const detail = typeof body.detail === 'string' ? body.detail : undefined

    if (!projectName || !deviceId || !event) {
        return NextResponse.json(
            { error: 'projectName, deviceId, and event are required' },
            { status: 400, headers: CORS_HEADERS }
        )
    }

    try {
        await recordEvent({
            projectName: projectName.slice(0, 200),
            deviceId: deviceId.slice(0, 200),
            event: event.slice(0, 200),
            detail: detail ? detail.slice(0, 2000) : undefined,
        })
    } catch {
        return NextResponse.json({ error: 'storage unavailable' }, { status: 500, headers: CORS_HEADERS })
    }

    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS })
}
