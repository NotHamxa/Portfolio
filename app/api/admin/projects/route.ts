import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { getProjects, createProject, reorderProjects } from '@/lib/db'

async function requireAdmin(): Promise<boolean> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    return session.isAdmin === true
}

export async function GET() {
    const projects = await getProjects({ fresh: true })
    return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const project = await createProject(body)
    return NextResponse.json(project)
}

export async function PATCH(req: NextRequest) {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { ids } = await req.json()
    await reorderProjects(ids)
    return NextResponse.json({ success: true })
}
