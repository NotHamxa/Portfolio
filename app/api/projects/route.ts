import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/db'
import { isApiAuthorized } from '@/lib/apiAuth'
import { GithubRepo } from '@/models/projectContent'

// List projects. Public callers get only visible projects; an authorized caller
// (Bearer PROJECT_API_SECRET) gets ALL projects including hidden ones.
export async function GET(req: NextRequest) {
    const projects = await getProjects({ fresh: true })
    if (isApiAuthorized(req, 'PROJECT_API_SECRET')) {
        return NextResponse.json(projects)
    }
    return NextResponse.json(projects.filter(p => p.show))
}

// Create a project. Auth: Bearer PROJECT_API_SECRET (or x-api-key).
export async function POST(req: NextRequest) {
    if (!isApiAuthorized(req, 'PROJECT_API_SECRET')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null) as {
        title?: string
        excerpt?: string
        date?: string
        logo?: string | null
        content?: string
        downloadUrl?: Record<string, string> | null
        githubUrl?: GithubRepo[]
        show?: boolean
    } | null

    const title = body?.title?.trim()
    if (!title) return NextResponse.json({ error: 'Missing "title"' }, { status: 400 })

    const project = await createProject({
        title,
        excerpt: body?.excerpt ?? '',
        date: body?.date ?? '',
        logo: body?.logo ?? null,
        content: body?.content ?? '',
        downloadUrl: body?.downloadUrl ?? null,
        githubUrl: Array.isArray(body?.githubUrl) ? body!.githubUrl : [],
        show: body?.show ?? true,
    })

    return NextResponse.json({ success: true, project })
}
