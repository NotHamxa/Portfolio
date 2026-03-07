import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/db'

export async function GET() {
    const projects = await getProjects()
    return NextResponse.json(projects)
}
