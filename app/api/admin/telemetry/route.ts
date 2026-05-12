import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { getEvents, getProjectStats } from '@/lib/telemetry'

export async function GET(req: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    if (!session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const project = searchParams.get('project') || undefined
    const limit = Number(searchParams.get('limit')) || 500

    const [stats, events] = await Promise.all([
        getProjectStats(),
        getEvents(project, limit),
    ])

    return NextResponse.json({ stats, events })
}
