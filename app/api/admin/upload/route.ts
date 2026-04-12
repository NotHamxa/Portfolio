import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { put } from '@vercel/blob'

async function requireAdmin(): Promise<boolean> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    return session.isAdmin === true
}

export async function POST(req: NextRequest) {
    if (!await requireAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'images'

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const filename = `${folder}/${Date.now()}-${file.name}`

    const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
    })

    return NextResponse.json({ url: blob.url })
}
