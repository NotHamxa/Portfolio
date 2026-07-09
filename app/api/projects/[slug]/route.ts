import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject, deleteProject } from '@/lib/db'
import { isApiAuthorized } from '@/lib/apiAuth'
import { ProjectType } from '@/models/projectContent'

// Read a single project (public). Returns the full document, including hidden ones.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const project = await getProject(slug)
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(project)
}

// Fields that may be set. `id` is immutable (it's the slug). `show` controls visibility.
const EDITABLE: (keyof Omit<ProjectType, 'id'>)[] = [
    'title', 'excerpt', 'date', 'logo', 'content', 'downloadUrl', 'githubUrl', 'show',
]

// Update any subset of a project's fields. Auth: Bearer PROJECT_API_SECRET (or x-api-key).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    if (!isApiAuthorized(req, 'PROJECT_API_SECRET')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const target = await getProject(slug, { fresh: true })
    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json().catch(() => null) as Record<string, unknown> | null
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

    const updates: Partial<Omit<ProjectType, 'id'>> = {}
    for (const key of EDITABLE) {
        if (key in body) (updates as Record<string, unknown>)[key] = body[key]
    }
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 })
    }

    const project = await updateProject(target.id, updates)
    return NextResponse.json({ success: true, project })
}

// Delete a project. Auth: Bearer PROJECT_API_SECRET (or x-api-key).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    if (!isApiAuthorized(req, 'PROJECT_API_SECRET')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const target = await getProject(slug, { fresh: true })
    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const ok = await deleteProject(target.id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
}
