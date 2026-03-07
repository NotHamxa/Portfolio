import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { updateProject, deleteProject } from '@/lib/db'

async function requireAdmin(): Promise<boolean> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    return session.isAdmin === true
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    const project = await updateProject(id, body)
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(project)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const ok = await deleteProject(id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
}
