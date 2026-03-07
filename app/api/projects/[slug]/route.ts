import { NextResponse } from 'next/server'
import { getProject } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const project = await getProject(slug)
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(project)
}
